import { router } from 'expo-router';

import { OnboardingCarousel } from '@/components/onboarding/onboarding-carousel';

export default function OnboardingScreen() {
  const goToAuth = () => {
    router.push('/auth');
  };

  return <OnboardingCarousel onGetStarted={goToAuth} onLogIn={goToAuth} />;
}
