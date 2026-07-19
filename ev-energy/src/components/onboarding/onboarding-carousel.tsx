import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingSlide } from '@/components/onboarding/onboarding-slide';
import { PaginationDots } from '@/components/onboarding/pagination-dots';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ONBOARDING_SLIDES, type OnboardingSlideData } from '@/constants/onboarding';
import { Brand, Spacing } from '@/constants/theme';

type OnboardingCarouselProps = {
  onGetStarted?: () => void;
  onLogIn?: () => void;
};

export function OnboardingCarousel({ onGetStarted, onLogIn }: OnboardingCarouselProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlideData>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (typeof index === 'number') {
        setActiveIndex(index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / width);
      setActiveIndex(Math.max(0, Math.min(next, ONBOARDING_SLIDES.length - 1)));
    },
    [width],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.three }]}>
      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleMomentumEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => <OnboardingSlide slide={item} width={width} />}
        style={styles.list}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Spacing.three) + Spacing.two },
        ]}>
        <PaginationDots count={ONBOARDING_SLIDES.length} activeIndex={activeIndex} />

        <PrimaryButton label="Get Started" onPress={onGetStarted} style={styles.cta} />

        <Pressable
          accessibilityRole="button"
          onPress={onLogIn}
          hitSlop={8}
          style={({ pressed }) => [styles.loginRow, pressed && styles.loginPressed]}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <Text style={styles.loginAction}>Log In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  list: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.five,
    gap: Spacing.four,
    paddingTop: Spacing.three,
  },
  cta: {
    width: '100%',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.one,
  },
  loginPressed: {
    opacity: 0.7,
  },
  loginPrompt: {
    color: Brand.textSecondary,
    fontSize: 15,
    fontWeight: '400',
  },
  loginAction: {
    color: Brand.accent,
    fontSize: 15,
    fontWeight: '700',
  },
});
