import { memo, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

type ClusterMarkerProps = {
  clusterId: number;
  count: number;
  latitude: number;
  longitude: number;
  onPress?: (clusterId: number, latitude: number, longitude: number) => void;
};

/** Match ChargerMarker size so cluster + charger pins share the same footprint. */
const BADGE_SIZE = 28;
const BADGE_RADIUS = 9;
const TRACK_SETTLE_MS = Platform.OS === 'android' ? 350 : 100;

/** Selected-charger lime — used as a ring so green reads on the light map. */
const ACCENT_GREEN = '#c6f135';
/** Darker green for the count — readable on white (light lime washes out as text). */
const COUNT_COLOR = '#3f6f00';
const BADGE_BG = '#ffffff';

/**
 * Numbered cluster bubble (white + green count).
 * Layout size equals visual size — no outer pad — so Android bitmap bounds match.
 */
export const ClusterMarker = memo(function ClusterMarker({
  clusterId,
  count,
  latitude,
  longitude,
  onPress,
}: ClusterMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    settleTimeoutRef.current = setTimeout(() => {
      setTracksViewChanges(false);
    }, TRACK_SETTLE_MS);
    return () => {
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
    };
  }, []);

  const label = count > 99 ? '99+' : String(count);

  return (
    <Marker
      identifier={`cluster-${clusterId}`}
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      style={styles.marker}
      tracksViewChanges={tracksViewChanges}
      zIndex={count}
      onPress={(event) => {
        event.stopPropagation?.();
        onPress?.(clusterId, latitude, longitude);
      }}>
      <View style={styles.badge} collapsable={false}>
        <Text style={styles.count} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  marker: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_RADIUS,
    backgroundColor: BADGE_BG,
    borderWidth: 2,
    borderColor: ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  count: {
    color: COUNT_COLOR,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
});
