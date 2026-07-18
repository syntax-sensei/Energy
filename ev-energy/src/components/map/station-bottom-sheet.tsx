import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import type { ChargingStation, LatLng } from '@/types/charging-station';
import { formatDriveDistance } from '@/utils/drive-distance';
import { resolveStationBrand } from '@/utils/station-brand';
import { getDummyStationMetrics } from '@/utils/station-metrics';

type StationBottomSheetProps = {
  station: ChargingStation | null;
  userLocation: LatLng | null;
  onClose: () => void;
};

const SHEET_DURATION_MS = 280;
const ACCENT_PURPLE = '#7B61FF';
const TEXT_PRIMARY = '#000000';
const TEXT_SECONDARY = '#6B7280';
const DIVIDER = '#E8E8E8';
const CLOSE_BG = '#F0F0F0';

export function StationBottomSheet({
  station,
  userLocation,
  onClose,
}: StationBottomSheetProps) {
  const progress = useSharedValue(0);
  const [renderedStation, setRenderedStation] = useState<ChargingStation | null>(station);

  useEffect(() => {
    if (station) {
      setRenderedStation(station);
      progress.value = withTiming(1, {
        duration: SHEET_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    progress.value = withTiming(
      0,
      {
        duration: SHEET_DURATION_MS,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(setRenderedStation)(null);
        }
      },
    );
  }, [station, progress]);

  const brand = useMemo(
    () => (renderedStation ? resolveStationBrand(renderedStation.name) : null),
    [renderedStation],
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 360 }],
  }));

  if (!renderedStation || !brand) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, sheetStyle]}
      accessibilityViewIsModal>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={[styles.logoBadge, { backgroundColor: brand.color }]}>
              <Text style={styles.logoMark} numberOfLines={1}>
                {brand.mark}
              </Text>
            </View>
            <Text style={styles.brandName}>{brand.name}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close station details"
            hitSlop={10}
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, pressed && styles.closePressed]}>
            <Ionicons name="close" size={16} color="#3A3A3C" />
          </Pressable>
        </View>

        <Text style={styles.title}>{renderedStation.name}</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.address}>
            {renderedStation.address ?? 'Address unavailable'}
          </Text>
          <Text style={styles.distance}>
            {formatDriveDistance(userLocation, renderedStation)}
          </Text>
        </View>

        <View style={styles.divider} />

        <MetricsRow stationId={renderedStation.id} />
      </View>
    </Animated.View>
  );
}

function MetricsRow({ stationId }: { stationId: string }) {
  const metrics = getDummyStationMetrics(stationId);

  return (
    <View style={styles.metricsRow}>
      <View style={styles.metricsLeft}>
        <View style={styles.metricItem}>
          <ChargerCountIcon />
          <Text style={styles.metricValue}>{metrics.chargerCount}</Text>
        </View>
        <View style={styles.metricItem}>
          <PowerIcon />
          <Text style={styles.metricValue}>{metrics.powerKwh} kWh</Text>
        </View>
      </View>

      <View style={styles.amenities}>
        <Ionicons name="wifi" size={18} color={TEXT_PRIMARY} />
        <Ionicons name="cart-outline" size={18} color={TEXT_PRIMARY} />
        <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={TEXT_PRIMARY} />
        <Text style={styles.amenityExtra}>+{metrics.amenityExtraCount}</Text>
      </View>
    </View>
  );
}

function ChargerCountIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 3.5h6.5a2 2 0 0 1 2 2V14a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V3.5Z"
        stroke={TEXT_PRIMARY}
        strokeWidth={1.6}
      />
      <Path d="M9 3.5V2M13.5 3.5V2" stroke={TEXT_PRIMARY} strokeWidth={1.6} strokeLinecap="round" />
      <Path
        d="M15.5 8h2.2a1.3 1.3 0 0 1 1.3 1.3V14"
        stroke={TEXT_PRIMARY}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Circle cx={19} cy={15.5} r={1.2} fill={TEXT_PRIMARY} />
      <Path d="M11.15 7.2 8.9 11h2.05l-.55 4.2 2.85-4.7H11.2L11.15 7.2Z" fill={ACCENT_PURPLE} />
    </Svg>
  );
}

function PowerIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={TEXT_PRIMARY} strokeWidth={1.6} />
      <Path d="M12.7 6.8 9.6 12h2.2l-.6 5.2 3.7-6.2h-2.3L12.7 6.8Z" fill={ACCENT_PURPLE} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    padding: 16,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    paddingRight: 12,
  },
  logoBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  brandName: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CLOSE_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: {
    opacity: 0.7,
  },
  title: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 28,
    marginBottom: 8,
  },
  infoBlock: {
    gap: 10,
    marginBottom: 16,
  },
  address: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  distance: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricValue: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  amenities: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amenityExtra: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
