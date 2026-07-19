import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { OnboardingIllustration } from '@/components/onboarding/onboarding-illustrations';
import { Brand, Spacing } from '@/constants/theme';
import type { OnboardingSlideData } from '@/constants/onboarding';

type OnboardingSlideProps = {
  slide: OnboardingSlideData;
  width: number;
};

export function OnboardingSlide({ slide, width }: OnboardingSlideProps) {
  const { height } = useWindowDimensions();
  const illustrationHeight = Math.min(240, Math.max(180, height * 0.28));

  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.copy}>
        <Text style={styles.title}>
          {slide.titleLines.map((line, lineIndex) => (
            <Text key={`${slide.id}-line-${lineIndex}`}>
              {lineIndex > 0 ? '\n' : null}
              {line.map((segment, segmentIndex) => (
                <Text
                  key={`${slide.id}-${lineIndex}-${segmentIndex}`}
                  style={segment.highlight ? styles.titleAccent : undefined}>
                  {segment.text}
                </Text>
              ))}
            </Text>
          ))}
        </Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>

      <View style={[styles.illustrationWrap, { minHeight: illustrationHeight }]}>
        <OnboardingIllustration id={slide.id} height={illustrationHeight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
  },
  copy: {
    gap: Spacing.three,
  },
  title: {
    color: Brand.text,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  titleAccent: {
    color: Brand.accent,
  },
  subtitle: {
    color: Brand.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    maxWidth: 320,
  },
  illustrationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
