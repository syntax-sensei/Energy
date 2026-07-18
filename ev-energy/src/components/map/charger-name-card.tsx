import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Spacing } from '@/constants/theme';
import type { ChargingStation } from '@/types/charging-station';

type ChargerNameCardProps = {
  station: ChargingStation;
};

const CORNER_RADIUS = 12;
const CARET_WIDTH = 12;
const CARET_HEIGHT = 7;
/** Soft outline — follows the curved shape (native shadows are always rectangular). */
const OUTLINE = 'rgba(0, 0, 0, 0.14)';

type Size = { width: number; height: number };

/**
 * Builds one continuous speech-bubble path (rounded rect + bottom caret)
 * so the pointer is merged into the card — no seam, no separate diamond.
 */
function speechBubblePath(width: number, bodyHeight: number): string {
  const w = width;
  const h = bodyHeight;
  const r = Math.min(CORNER_RADIUS, w / 2, h / 2);
  const cx = w / 2;
  const halfCaret = CARET_WIDTH / 2;

  return [
    `M ${r} 0`,
    `H ${w - r}`,
    `Q ${w} 0 ${w} ${r}`,
    `V ${h - r}`,
    `Q ${w} ${h} ${w - r} ${h}`,
    `H ${cx + halfCaret}`,
    `L ${cx} ${h + CARET_HEIGHT}`,
    `L ${cx - halfCaret} ${h}`,
    `H ${r}`,
    `Q 0 ${h} 0 ${h - r}`,
    `V ${r}`,
    `Q 0 0 ${r} 0`,
    'Z',
  ].join(' ');
}

/**
 * Map name tooltip — single SVG bubble (title + availability + caret).
 * Uses a low-opacity stroke instead of elevation/shadow so the outline
 * follows the curve when snapshotted into a map marker bitmap.
 */
export function ChargerNameCard({ station }: ChargerNameCardProps) {
  const [size, setSize] = useState<Size>({ width: 140, height: 44 });

  const availability =
    station.availablePorts != null && station.totalPorts != null
      ? `${station.availablePorts}/${station.totalPorts} available`
      : null;

  const onBodyLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  const svgHeight = size.height + CARET_HEIGHT;

  return (
    <View style={styles.wrap} pointerEvents="none" collapsable={false}>
      <Svg
        width={size.width}
        height={svgHeight}
        style={styles.bubble}
        collapsable={false}
      >
        <Path
          d={speechBubblePath(size.width, size.height)}
          fill="#ffffff"
          stroke={OUTLINE}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </Svg>

      <View style={styles.body} onLayout={onBodyLayout} collapsable={false}>
        <Text style={styles.title} numberOfLines={1}>
          {station.name}
        </Text>
        {availability ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {availability}
          </Text>
        ) : null}
      </View>

      {/* Reserves space for the caret drawn by the SVG path. */}
      <View style={styles.caretSpace} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    maxWidth: 200,
  },
  bubble: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  body: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two + 2,
    paddingBottom: Spacing.two + 2,
    alignItems: 'center',
  },
  caretSpace: {
    height: CARET_HEIGHT,
  },
  title: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 2,
    color: '#8e8e93',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    textAlign: 'center',
  },
});
