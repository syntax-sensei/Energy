import { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { BoltIcon } from '@/components/map/bolt-icon';
import type { ChargingStation } from '@/types/charging-station';

type ChargerMarkerProps = {
  station: ChargingStation;
  selected?: boolean;
  onPress?: (station: ChargingStation) => void;
};

const TRACK_SETTLE_MS = 180;

const BADGE_SIZE = 36;
const BADGE_RADIUS = 12;
/**
 * Padding around the badge for shadows. Keep this tight — the Marker hit
 * target is the full wrapper rectangle (including transparent pixels).
 */
const MARKER_PAD = 10;
const MARKER_BOX = BADGE_SIZE + MARKER_PAD * 2;

const COLOR_UNSELECTED = '#1c1c1e';
const COLOR_SELECTED = '#c6f135';

/**
 * Custom map markers must stay mostly static. Animating children while
 * tracksViewChanges flips on/off (especially during camera pan/zoom) is the
 * classic cause of markers randomly blanking out on iOS/Google Maps.
 */
export const ChargerMarker = memo(function ChargerMarker({
  station,
  selected = false,
  onPress,
}: ChargerMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTracksViewChanges(true);
    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
    }
    settleTimeoutRef.current = setTimeout(() => {
      setTracksViewChanges(false);
    }, TRACK_SETTLE_MS);

    return () => {
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
    };
  }, [selected, station.id]);

  return (
    <Marker
      identifier={station.id}
      coordinate={{
        latitude: station.latitude,
        longitude: station.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={(event) => {
        event.stopPropagation?.();
        onPress?.(station);
      }}
      tracksViewChanges={tracksViewChanges}
      zIndex={selected ? 10 : 1}>
      <View style={styles.markerBox} collapsable={false}>
        <View
          style={[
            styles.badge,
            { backgroundColor: selected ? COLOR_SELECTED : COLOR_UNSELECTED },
          ]}
          collapsable={false}>
          <BoltIcon size={16} color={selected ? COLOR_UNSELECTED : '#ffffff'} />
        </View>
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  markerBox: {
    width: MARKER_BOX,
    height: MARKER_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 5,
  },
});
