import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { Brand } from '@/constants/theme';
import type { OnboardingSlideId } from '@/constants/onboarding';

type IllustrationProps = {
  width?: number;
  height?: number;
};

/** Soft city skyline + EV + charger — Screen 1. */
export function FindChargeIllustration({ width = 280, height = 220 }: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 220" fill="none">
      <G opacity={0.35}>
        <Path
          d="M20 150V110h18v40M48 150V88h22v62M80 150V100h16v50M106 150V78h28v72M144 150V96h20v54M174 150V84h24v66M208 150V104h18v46M236 150V92h24v58"
          stroke={Brand.accent}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      {/* Charger pedestal */}
      <Rect x={188} y={118} width={28} height={42} rx={6} fill={Brand.accent} />
      <Rect x={196} y={98} width={12} height={22} rx={3} fill={Brand.onAccent} />
      <Path
        d="M200 104h4l-2 6h3l-5 10 1.5-7h-3l1.5-9Z"
        fill={Brand.accent}
      />
      {/* Cable */}
      <Path
        d="M188 130c-18 4-28 18-36 28"
        stroke={Brand.onAccent}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Car body */}
      <Path
        d="M48 148h108c6 0 10-4 12-9l8-22c2-6 0-10-4-13l-18-10c-4-2-8-3-12-3H78c-5 0-9 2-12 6l-14 18c-3 4-4 8-4 12v11c0 6 4 10 10 10Z"
        fill="#F4F4F6"
        stroke={Brand.onAccent}
        strokeWidth={2}
      />
      <Path
        d="M82 118h48c4 0 7 1 9 4l10 14H70l8-12c2-4 5-6 10-6Z"
        fill="#E4E4EA"
      />
      <Circle cx={78} cy={150} r={12} fill={Brand.onAccent} />
      <Circle cx={78} cy={150} r={5} fill="#F4F4F6" />
      <Circle cx={148} cy={150} r={12} fill={Brand.onAccent} />
      <Circle cx={148} cy={150} r={5} fill="#F4F4F6" />
    </Svg>
  );
}

/** Route / navigation arcs — Screen 2. */
export function PlanRouteIllustration({ width = 280, height = 220 }: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 220" fill="none">
      <Path
        d="M48 168c40-52 70-52 110 0 28 36 52 36 76 0"
        stroke="#E8E8EC"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <Path
        d="M56 160c36-46 64-46 100 0 24 32 46 32 68 0"
        stroke={Brand.accent}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray="10 12"
      />
      <Circle cx={56} cy={160} r={14} fill={Brand.onAccent} />
      <Circle cx={56} cy={160} r={6} fill={Brand.accent} />
      <Circle cx={224} cy={160} r={14} fill={Brand.accent} />
      <Path
        d="M221 155h2.5l-1.2 4h2l-3.2 6.5.9-4.5h-2L221 155Z"
        fill={Brand.onAccent}
      />
      {/* Map pin mid-route */}
      <Path
        d="M140 78c-12 0-22 9-22 21 0 16 22 35 22 35s22-19 22-35c0-12-10-21-22-21Z"
        fill={Brand.accent}
      />
      <Circle cx={140} cy={98} r={7} fill={Brand.onAccent} />
    </Svg>
  );
}

/** Charging status card vibe — Screen 3. */
export function ChargeConfidenceIllustration({
  width = 280,
  height = 220,
}: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 220" fill="none">
      <Rect
        x={50}
        y={48}
        width={180}
        height={124}
        rx={22}
        fill="#FFFFFF"
        stroke="#E8E8EC"
        strokeWidth={2}
      />
      <Rect x={72} y={72} width={56} height={56} rx={14} fill={Brand.accent} />
      <Path
        d="M97 84l-10 18h8l-3 16 14-20h-8l5-14Z"
        fill={Brand.onAccent}
      />
      <Rect x={144} y={78} width={64} height={10} rx={5} fill="#E8E8EC" />
      <Rect x={144} y={96} width={48} height={8} rx={4} fill="#F0F0F3" />
      <Rect x={72} y={144} width={136} height={12} rx={6} fill="#F0F0F3" />
      <Rect x={72} y={144} width={92} height={12} rx={6} fill={Brand.accent} />
      <Circle cx={214} cy={58} r={16} fill={Brand.accent} />
      <Path
        d="M208 58l4 4 8-9"
        stroke={Brand.onAccent}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function OnboardingIllustration({
  id,
  width,
  height,
}: IllustrationProps & { id: OnboardingSlideId }) {
  switch (id) {
    case 'find':
      return <FindChargeIllustration width={width} height={height} />;
    case 'plan':
      return <PlanRouteIllustration width={width} height={height} />;
    case 'charge':
      return <ChargeConfidenceIllustration width={width} height={height} />;
  }
}
