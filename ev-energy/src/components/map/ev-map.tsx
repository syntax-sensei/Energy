import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/map/back-button';
import { ChargerMarker } from '@/components/map/charger-marker';
import { ClusterMarker } from '@/components/map/cluster-marker';
import { StationBottomSheet } from '@/components/map/station-bottom-sheet';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useChargerClusters } from '@/hooks/use-charger-clusters';
import { distanceMeters, fetchNearbyChargers, radiusFromRegion } from '@/services/nearby-chargers';
import type { ChargingStation, LatLng } from '@/types/charging-station';

type EvMapProps = {
  onBack?: () => void;
  onStationPress?: (station: ChargingStation) => void;
};

const DEFAULT_DELTAS = {
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const SEARCH_DEBOUNCE_MS = 800;
/** Snappy camera move — no long ease. */
const CENTER_ANIMATION_MS = 120;
/** Zoom in ~50% on select (new span = 50% of current). Always zooms in. */
const SELECT_ZOOM_FACTOR = 0.5;
/** Closest auto-zoom span on select — won't zoom in past this. */
const MIN_SELECT_DELTA = 0.01;

function selectZoomDelta(currentDelta: number): number {
  const zoomed = currentDelta * SELECT_ZOOM_FACTOR;
  if (zoomed < MIN_SELECT_DELTA) {
    // Already at/ past the floor: keep current; otherwise clamp to the floor.
    return Math.min(currentDelta, MIN_SELECT_DELTA);
  }
  return zoomed;
}

function regionFromCoords(latitude: number, longitude: number): Region {
  return {
    latitude,
    longitude,
    ...DEFAULT_DELTAS,
  };
}

/** Avoids replacing the stations array (and remounting markers) when nothing changed. */
function sameStationIds(a: ChargingStation[], b: ChargingStation[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const idsA = new Set(a.map((station) => station.id));
  return b.every((station) => idsA.has(station.id));
}

export function EvMap({ onBack, onStationPress }: EvMapProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const skipNextRegionChange = useRef(true);
  /** Marker presses often also fire MapView onPress — ignore that follow-up. */
  const ignoreNextMapPress = useRef(false);
  /**
   * While true, ignore region updates so clustering / marker list stays frozen
   * during the select pan+zoom (prevents remounts that blank custom markers).
   */
  const cameraAnimatingRef = useRef(false);
  const cameraAnimTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stationsRef = useRef<ChargingStation[]>([]);
  const lastFetchRef = useRef<{ latitude: number; longitude: number; radiusMeters: number } | null>(
    null,
  );

  const { items: clusterItems, getExpansionRegion } = useChargerClusters(stations, mapRegion);

  const selectedStation = useMemo(() => {
    if (!selectedId) {
      return null;
    }
    return stations.find((station) => station.id === selectedId) ?? null;
  }, [selectedId, stations]);

  const loadChargers = useCallback(async (region: Region, force = false) => {
    const radiusMeters = radiusFromRegion(region.latitudeDelta, region.longitudeDelta);
    const lastFetch = lastFetchRef.current;

    // Skip the request entirely if we already have chargers covering this area —
    // small pans/zooms shouldn't burn another Places API call.
    if (!force && lastFetch) {
      const moved = distanceMeters(lastFetch, region);
      const radiusGrew = radiusMeters > lastFetch.radiusMeters * 1.2;
      if (!radiusGrew && moved < lastFetch.radiusMeters * 0.4) {
        return;
      }
    }

    const requestId = ++requestIdRef.current;
    setIsLoadingStations(true);
    try {
      const results = await fetchNearbyChargers({
        latitude: region.latitude,
        longitude: region.longitude,
        radiusMeters,
      });
      if (requestId === requestIdRef.current) {
        // Keep the existing array reference (and marker identities) when the
        // set of stations hasn't actually changed — prevents markers from
        // flickering/disappearing on every debounced re-fetch.
        if (!sameStationIds(stationsRef.current, results)) {
          stationsRef.current = results;
          setStations(results);
        }
        lastFetchRef.current = { latitude: region.latitude, longitude: region.longitude, radiusMeters };
      }
    } catch (error) {
      console.warn('[EvMap] Failed to load nearby chargers', error);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoadingStations(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function resolveUserLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) {
            setLocationError('Location permission is required to show nearby chargers.');
          }
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (cancelled) {
          return;
        }

        const region = regionFromCoords(position.coords.latitude, position.coords.longitude);
        skipNextRegionChange.current = true;
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setInitialRegion(region);
        setMapRegion(region);
        void loadChargers(region, true);
      } catch (error) {
        console.warn('[EvMap] Failed to get current location', error);
        if (!cancelled) {
          setLocationError('Could not get your current location.');
        }
      }
    }

    void resolveUserLocation();

    return () => {
      cancelled = true;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (cameraAnimTimeoutRef.current) {
        clearTimeout(cameraAnimTimeoutRef.current);
      }
    };
  }, [loadChargers]);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      // Freeze clustering inputs while the select camera is moving — otherwise
      // markers remount mid-zoom and custom views often blank out.
      if (cameraAnimatingRef.current || skipNextRegionChange.current) {
        skipNextRegionChange.current = false;
        return;
      }

      setMapRegion(region);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        void loadChargers(region);
      }, SEARCH_DEBOUNCE_MS);
    },
    [loadChargers],
  );

  const handleStationPress = useCallback(
    (station: ChargingStation) => {
      ignoreNextMapPress.current = true;
      setSelectedId(station.id);
      onStationPress?.(station);

      const nextRegion: Region = {
        latitude: station.latitude,
        longitude: station.longitude,
        latitudeDelta: selectZoomDelta(
          mapRegion?.latitudeDelta ?? DEFAULT_DELTAS.latitudeDelta,
        ),
        longitudeDelta: selectZoomDelta(
          mapRegion?.longitudeDelta ?? DEFAULT_DELTAS.longitudeDelta,
        ),
      };

      cameraAnimatingRef.current = true;
      skipNextRegionChange.current = true;
      if (cameraAnimTimeoutRef.current) {
        clearTimeout(cameraAnimTimeoutRef.current);
      }

      mapRef.current?.animateToRegion(nextRegion, CENTER_ANIMATION_MS);

      // Commit the target region after the camera settles (no completion API).
      cameraAnimTimeoutRef.current = setTimeout(() => {
        cameraAnimatingRef.current = false;
        setMapRegion(nextRegion);
      }, CENTER_ANIMATION_MS + 80);
    },
    [mapRegion, onStationPress],
  );

  const handleClusterPress = useCallback(
    (clusterId: number, latitude: number, longitude: number) => {
      ignoreNextMapPress.current = true;
      setSelectedId(null);
      const nextRegion = getExpansionRegion(clusterId, latitude, longitude);
      if (!nextRegion) {
        return;
      }

      cameraAnimatingRef.current = true;
      skipNextRegionChange.current = true;
      if (cameraAnimTimeoutRef.current) {
        clearTimeout(cameraAnimTimeoutRef.current);
      }

      mapRef.current?.animateToRegion(nextRegion, 280);
      cameraAnimTimeoutRef.current = setTimeout(() => {
        cameraAnimatingRef.current = false;
        setMapRegion(nextRegion);
      }, 280 + 80);
    },
    [getExpansionRegion],
  );

  const handleMapPress = useCallback(() => {
    if (ignoreNextMapPress.current) {
      ignoreNextMapPress.current = false;
      return;
    }
    setSelectedId(null);
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.webFallbackText}>
          Google Maps preview is available on iOS and Android.
        </ThemedText>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.webFallback}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.webFallbackText}>
          {locationError}
        </ThemedText>
        <View style={[styles.backButtonWrapper, { top: insets.top + Spacing.two }]}>
          <BackButton onPress={onBack} />
        </View>
      </View>
    );
  }

  if (!initialRegion) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#1c1c1e" />
        <ThemedText type="small" themeColor="textSecondary">
          Finding your location…
        </ThemedText>
        <View style={[styles.backButtonWrapper, { top: insets.top + Spacing.two }]}>
          <BackButton onPress={onBack} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        // Temporarily disabled to diagnose blank tiles (ultra-light style can look empty).
        // customMapStyle={MapStyle}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}>
        {clusterItems.map((item) => {
          if (item.kind === 'cluster') {
            return (
              <ClusterMarker
                key={`cluster-${item.clusterId}`}
                clusterId={item.clusterId}
                count={item.count}
                latitude={item.latitude}
                longitude={item.longitude}
                onPress={handleClusterPress}
              />
            );
          }

          // Keep a stable key across select/deselect so Fabric does not remount
          // the native marker (avoids AIRGoogleMap insertReactSubview crashes).
          return (
            <ChargerMarker
              key={item.station.id}
              station={item.station}
              selected={item.station.id === selectedId}
              onPress={handleStationPress}
            />
          );
        })}
      </MapView>

      <View style={[styles.backButtonWrapper, { top: insets.top + Spacing.two }]}>
        <BackButton onPress={onBack} />
      </View>

      <LoadingPill visible={isLoadingStations} top={insets.top + Spacing.two} />

      <StationBottomSheet
        station={selectedStation}
        userLocation={userLocation}
        onClose={() => setSelectedId(null)}
      />
    </View>
  );
}

function LoadingPill({ visible, top }: { visible: boolean; top: number }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.loadingPill, { top, opacity }]}>
      <ActivityIndicator size="small" color="#1c1c1e" />
      <ThemedText type="small" style={styles.loadingPillText}>
        Updating chargers…
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: '#f5f5f5',
  },
  backButtonWrapper: {
    position: 'absolute',
    left: Spacing.three,
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    backgroundColor: '#f5f5f5',
  },
  webFallbackText: {
    textAlign: 'center',
  },
  loadingPill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: '#ffffff',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  loadingPillText: {
    color: '#1c1c1e',
  },
});
