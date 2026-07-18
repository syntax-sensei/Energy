import { memo, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";

import { BoltIcon } from "@/components/map/bolt-icon";
import { ChargerNameCard } from "@/components/map/charger-name-card";
import { Spacing } from "@/constants/theme";
import type { ChargingStation } from "@/types/charging-station";

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
const TRACK_CHANGES_SETTLE_MS = 120;

const BADGE_SIZE = 36;
const BADGE_RADIUS = 12;
const RIPPLE_MAX_SCALE = 2.15;
/**
 * Padding around the badge for shadows + ripples. Keep this tight — the Marker
 * hit target is the full wrapper rectangle (including transparent pixels).
 */
const MARKER_PAD = 22;
const MARKER_BOX = BADGE_SIZE + MARKER_PAD * 2;
/** Space below the label so it sits above the badge without overlapping. */
const LABEL_LIFT = BADGE_SIZE / 2 + Spacing.two;

const COLOR_UNSELECTED = "#1c1c1e";
const COLOR_SELECTED = "#c6f135";

export const ChargerMarker = memo(function ChargerMarker({
  station,
  selected = false,
  showCard = true,
  pinScale = 1,
  onPress,
}: ChargerMarkerProps) {
  const scaleAnim = useRef(new Animated.Value(pinScale)).current;
  const selectedAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const [tracksIcon, setTracksIcon] = useState(true);
  const [tracksLabel, setTracksLabel] = useState(true);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const labelSettleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    setTracksIcon(true);
    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: pinScale,
        duration: ANIM_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(selectedAnim, {
        toValue: selected ? 1 : 0,
        duration: ANIM_DURATION_MS,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (!selected) {
        settleTimeoutRef.current = setTimeout(() => {
          setTracksIcon(false);
        }, TRACK_CHANGES_SETTLE_MS);
      }
    });

    return () => {
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
    };
  }, [pinScale, selected, scaleAnim, selectedAnim]);

  useEffect(() => {
    if (!showCard) {
      return;
    }
    setTracksLabel(true);
    if (labelSettleTimeoutRef.current) {
      clearTimeout(labelSettleTimeoutRef.current);
    }
    labelSettleTimeoutRef.current = setTimeout(() => {
      setTracksLabel(false);
    }, 280);
    return () => {
      if (labelSettleTimeoutRef.current) {
        clearTimeout(labelSettleTimeoutRef.current);
      }
    };
  }, [showCard, station.id, station.name]);

  useEffect(() => {
    ripple1.setValue(0);
    ripple2.setValue(0);

    if (!selected) {
      return;
    }

    setTracksIcon(true);

    const makeRipple = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 1400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

    const loop = Animated.parallel([
      makeRipple(ripple1, 0),
      makeRipple(ripple2, 700),
    ]);
    loop.start();

    return () => {
      loop.stop();
    };
  }, [selected, ripple1, ripple2]);

  const badgeBackgroundColor = selectedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLOR_UNSELECTED, COLOR_SELECTED],
  });

  const coordinate = {
    latitude: station.latitude,
    longitude: station.longitude,
  };

  return (
    <>
      {/*
        Label is a separate non-tappable marker so its wide bubble never steals
        presses meant for the map or neighboring chargers.
      */}
      {showCard ? (
        <Marker
          identifier={`${station.id}-label`}
          coordinate={coordinate}
          anchor={{ x: 0.5, y: 1 }}
          tappable={false}
          tracksViewChanges={tracksLabel}
          zIndex={selected ? 2 : 0}
        >
          <View style={styles.labelLift} pointerEvents="none" collapsable={false}>
            <ChargerNameCard station={station} />
          </View>
        </Marker>
      ) : null}

      <Marker
        identifier={station.id}
        coordinate={coordinate}
        anchor={{ x: 0.5, y: 0.5 }}
        onPress={(event) => {
          // Prevent the map's onPress from also firing (would clear selection).
          event.stopPropagation?.();
          onPress?.(station);
        }}
        tracksViewChanges={tracksIcon || selected}
        zIndex={selected ? 3 : 1}
      >
        <Animated.View
          style={[styles.markerBox, { transform: [{ scale: scaleAnim }] }]}
          collapsable={false}
        >
          <RippleRing progress={ripple1} />
          <RippleRing progress={ripple2} />

          <Animated.View
            style={[styles.badge, { backgroundColor: badgeBackgroundColor }]}
          >
            <Animated.View
              style={[
                styles.iconLayer,
                {
                  opacity: selectedAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
              ]}
            >
              <BoltIcon size={16} color="#ffffff" />
            </Animated.View>
            <Animated.View
              style={[
                styles.iconLayer,
                styles.iconLayerOverlay,
                { opacity: selectedAnim },
              ]}
            >
              <BoltIcon size={16} color={COLOR_UNSELECTED} />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Marker>
    </>
  );
});

function RippleRing({ progress }: { progress: Animated.Value }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ripple,
        {
          opacity: progress.interpolate({
            inputRange: [0, 0.001, 0.25, 1],
            outputRange: [0, 0.45, 0.28, 0],
          }),
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, RIPPLE_MAX_SCALE],
              }),
            },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  labelLift: {
    alignItems: "center",
    // Pushes the bubble above the badge; not part of the icon hit target.
    paddingBottom: LABEL_LIFT,
  },
  markerBox: {
    width: MARKER_BOX,
    height: MARKER_BOX,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  ripple: {
    position: "absolute",
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_RADIUS + 4,
    backgroundColor: COLOR_SELECTED,
  },
  iconLayer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconLayerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
