import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/map/back-button';
import { ChargerMarker } from '@/components/map/charger-marker';
import { ClusterMarker } from '@/components/map/cluster-marker';
import { ThemedText } from '@/components/themed-text';
import { MapStyle } from '@/constants/map-style';
import { Spacing } from '@/constants/theme';
import { useChargerClusters } from '@/hooks/use-charger-clusters';
import { distanceMeters, fetchNearbyChargers, radiusFromRegion } from '@/services/nearby-chargers';
import type { ChargingStation } from '@/types/charging-station';

type EvMapProps = {
  onBack?: () => void;
  onStationPress?: (station: ChargingStation) => void;
};

const DEFAULT_DELTAS = {
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const SEARCH_DEBOUNCE_MS = 800;

/** Name cards only show once zoomed in this close (smaller delta = more zoomed in). */
const CARD_VISIBLE_MAX_DELTA = 0.015;
/** Pin stays full-size up to this delta, then shrinks down to MIN_PIN_SCALE while zooming out. */
const PIN_FULL_SCALE_DELTA = 0.015;
const PIN_MIN_SCALE_DELTA = 0.08;
const MIN_PIN_SCALE = 0.6;

function pinScaleForDelta(latitudeDelta: number): number {
  if (latitudeDelta <= PIN_FULL_SCALE_DELTA) {
    return 1;
  }
  if (latitudeDelta >= PIN_MIN_SCALE_DELTA) {
    return MIN_PIN_SCALE;
  }
  const t =
    (latitudeDelta - PIN_FULL_SCALE_DELTA) / (PIN_MIN_SCALE_DELTA - PIN_FULL_SCALE_DELTA);
  return 1 - t * (1 - MIN_PIN_SCALE);
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
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const skipNextRegionChange = useRef(true);
  const stationsRef = useRef<ChargingStation[]>([]);
  const lastFetchRef = useRef<{ latitude: number; longitude: number; radiusMeters: number } | null>(
    null,
  );

  const { items: clusterItems, getExpansionRegion } = useChargerClusters(stations, mapRegion);

  const latitudeDelta = mapRegion?.latitudeDelta ?? DEFAULT_DELTAS.latitudeDelta;
  const showCard = latitudeDelta <= CARD_VISIBLE_MAX_DELTA;
  const pinScale = pinScaleForDelta(latitudeDelta);

  // Selection only applies to leaves currently on the map. If the charger is
  // inside a cluster, treat it as unselected for rendering (no effect/setState).
  const activeSelectedId = useMemo(() => {
    if (!selectedId) {
      return null;
    }
    const isVisibleLeaf = clusterItems.some(
      (item) => item.kind === 'station' && item.station.id === selectedId,
    );
    return isVisibleLeaf ? selectedId : null;
  }, [clusterItems, selectedId]);

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
    };
  }, [loadChargers]);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      setMapRegion(region);

      // Ignore MapView's first region callback after mounting on the user location.
      if (skipNextRegionChange.current) {
        skipNextRegionChange.current = false;
        return;
      }

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
      setSelectedId(station.id);
      onStationPress?.(station);
    },
    [onStationPress],
  );

  const handleClusterPress = useCallback(
    (clusterId: number, latitude: number, longitude: number) => {
      setSelectedId(null);
      const nextRegion = getExpansionRegion(clusterId, latitude, longitude);
      if (!nextRegion) {
        return;
      }
      mapRef.current?.animateToRegion(nextRegion, 280);
    },
    [getExpansionRegion],
  );

  const handleMapPress = useCallback(() => {
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
        customMapStyle={MapStyle}
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

          return (
            <ChargerMarker
              key={item.station.id}
              station={item.station}
              selected={item.station.id === activeSelectedId}
              showCard={showCard}
              pinScale={pinScale}
              onPress={handleStationPress}
            />
          );
        })}
      </MapView>

      <View style={[styles.backButtonWrapper, { top: insets.top + Spacing.two }]}>
        <BackButton onPress={onBack} />
      </View>

      <LoadingPill visible={isLoadingStations} top={insets.top + Spacing.two} />
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
