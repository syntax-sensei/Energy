import { memo, useEffect, useRef, useState } from 'react';
import { Marker } from 'react-native-maps';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { BoltIcon } from '@/components/map/bolt-icon';
import { Spacing } from '@/constants/theme';
import type { ChargingStation } from '@/types/charging-station';

type ChargerMarkerProps = {
  station: ChargingStation;
  selected?: boolean;
  /** Show the name card above the pin — only when zoomed in close enough. */
  showCard?: boolean;
  /** Shrinks the pin as the map zooms out, grows back to 1 when zoomed in. */
  pinScale?: number;
  onPress?: (station: ChargingStation) => void;
};

const ANIM_DURATION_MS = 220;
/**
 * react-native-maps snapshots marker content to a native bitmap unless
 * tracksViewChanges is on. We only flip it on for the duration of a transition
 * (never leave it permanently on) — leaving it on for many markers, or swapping
 * the marker's child view tree structurally, is what causes Fabric's
 * "Attempt to recycle a mounted view" crash.
 */
const TRACK_CHANGES_SETTLE_MS = 120;

const PIN_SIZE = 40;
const BADGE_SIZE = 32;

export const ChargerMarker = memo(function ChargerMarker({
  station,
  selected = false,
  showCard = true,
  pinScale = 1,
  onPress,
}: ChargerMarkerProps) {
  const cardAnim = useRef(new Animated.Value(showCard ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(pinScale)).current;
  const selectedAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTracksViewChanges(true);
    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
    }

    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: showCard ? 1 : 0,
        duration: ANIM_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: pinScale,
        duration: ANIM_DURATION_MS,
        useNativeDriver: true,
      }),
      // Drives backgroundColor/borderColor/borderRadius below, which the native
      // driver can't animate — must stay on the JS driver.
      Animated.timing(selectedAnim, {
        toValue: selected ? 1 : 0,
        duration: ANIM_DURATION_MS,
        useNativeDriver: false,
      }),
    ]).start(() => {
      settleTimeoutRef.current = setTimeout(() => {
        setTracksViewChanges(false);
      }, TRACK_CHANGES_SETTLE_MS);
    });

    return () => {
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
    };
  }, [showCard, pinScale, selected, cardAnim, scaleAnim, selectedAnim]);

  const pinBackgroundColor = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#1c1c1e'],
  });
  const pinBorderColor = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#d1d1d6', '#1c1c1e'],
  });
  const pinBorderRadius = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [BADGE_SIZE / 2, 2],
  });
  const pinRotate = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });
  const iconCounterRotate = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg'],
  });

  return (
    <Marker
      coordinate={{ latitude: station.latitude, longitude: station.longitude }}
      anchor={{ x: 0.5, y: 1 }}
      onPress={() => onPress?.(station)}
      tracksViewChanges={tracksViewChanges}>
      <View style={styles.wrapper}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.labelBubble,
            {
              opacity: cardAnim,
              transform: [
                { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [-4, 0] }) },
              ],
            },
          ]}>
          <Text style={styles.labelTitle} numberOfLines={1}>
            {station.name}
          </Text>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Animated.View
            style={[
              styles.pinShape,
              {
                backgroundColor: pinBackgroundColor,
                borderColor: pinBorderColor,
                borderBottomRightRadius: pinBorderRadius,
                transform: [{ rotate: pinRotate }],
              },
            ]}>
            <Animated.View style={{ transform: [{ rotate: iconCounterRotate }] }}>
              <View style={styles.iconLayer}>
                <BoltIcon size={14} color="#1c1c1e" />
              </View>
              <Animated.View
                style={[styles.iconLayer, styles.iconLayerOverlay, { opacity: selectedAnim }]}>
                <BoltIcon size={16} color="#ffffff" />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  labelBubble: {
    backgroundColor: '#ffffff',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    maxWidth: 160,
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  labelTitle: {
    color: '#1c1c1e',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  pinShape: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  iconLayer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLayerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
