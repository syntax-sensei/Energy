import Svg, { Path } from 'react-native-svg';

type BoltIconProps = {
  size?: number;
  color?: string;
};

export function BoltIcon({ size = 14, color = '#1c1c1e' }: BoltIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      // Keep path strokes inside the declared size so marker bitmaps don't clip.
      style={{ width: size, height: size }}>
      <Path
        d="M13.2 2 4.5 13.2h5.4L9.6 22l9.9-12.2h-5.7L13.2 2Z"
        fill={color}
        stroke={color}
        strokeWidth={0.75}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
