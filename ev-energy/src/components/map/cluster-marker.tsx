import { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

type ClusterMarkerProps = {
  clusterId: number;
  count: number;
  latitude: number;
  longitude: number;
  onPress?: (clusterId: number, latitude: number, longitude: number) => void;
};

const BADGE_SIZE = 36;
/** Same corner radius as ChargerMarker — rounded square, not a circle. */
const BADGE_RADIUS = 12;
/** Same idea as ChargerMarker — padding so the drop shadow isn't clipped by the bitmap. */
const MARKER_PAD = 8;
const MARKER_BOX = BADGE_SIZE + MARKER_PAD * 2;

/** Selected-charger lime — used as a ring so green reads on the light map. */
const ACCENT_GREEN = '#c6f135';
/** Darker green for the count — readable on white (light lime washes out as text). */
const COUNT_COLOR = '#3f6f00';
const BADGE_BG = '#ffffff';

/**
 * Numbered cluster bubble (white + green count).
 * Tight visual badge; padded wrapper so shadow matches charger markers.
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

  // Snapshot once after mount — count text is static per cluster id/key.
  useEffect(() => {
    settleTimeoutRef.current = setTimeout(() => {
      setTracksViewChanges(false);
    }, 100);
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
      tracksViewChanges={tracksViewChanges}
      zIndex={count}
      onPress={(event) => {
        event.stopPropagation?.();
        onPress?.(clusterId, latitude, longitude);
      }}
    >
      <View style={styles.markerBox} collapsable={false}>
        <View style={styles.badge}>
          <Text style={styles.count} numberOfLines={1}>
            {label}
          </Text>
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
    backgroundColor: BADGE_BG,
    borderWidth: 2.5,
    borderColor: ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    // Match ChargerMarker badge shadow.
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 5,
  },
  count: {
    color: COUNT_COLOR,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
});
