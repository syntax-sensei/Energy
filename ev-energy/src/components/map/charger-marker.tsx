import { memo, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { BoltIcon } from '@/components/map/bolt-icon';
import type { ChargingStation } from '@/types/charging-station';

type ChargerMarkerProps = {
  station: ChargingStation;
  selected?: boolean;
  onPress?: (station: ChargingStation) => void;
};

const TRACK_SETTLE_MS = Platform.OS === 'android' ? 350 : 180;

/** Visual + layout size — keep identical so Android bitmap bounds match the icon. */
const BADGE_SIZE = 28;
const BADGE_RADIUS = 9;
const ICON_SIZE = 13;

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
      style={styles.marker}
      onPress={(event) => {
        event.stopPropagation?.();
        onPress?.(station);
      }}
      tracksViewChanges={tracksViewChanges}
      zIndex={selected ? 10 : 1}>
      <View
        style={[
          styles.badge,
          { backgroundColor: selected ? COLOR_SELECTED : COLOR_UNSELECTED },
        ]}
        collapsable={false}>
        <BoltIcon size={ICON_SIZE} color={selected ? COLOR_UNSELECTED : '#ffffff'} />
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  // Explicit Marker size so Android's shadow/yoga box matches the badge bitmap.
  marker: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // iOS-only soft shadow — Android elevation draws outside the view bounds
    // and gets clipped when the marker bitmap is sized to BADGE_SIZE.
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
      },
      android: {
        elevation: 0,
      },
      default: {},
    }),
  },
});
