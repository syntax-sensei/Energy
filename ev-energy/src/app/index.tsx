import { router } from 'expo-router';

import { EvMap } from '@/components/map/ev-map';

export default function HomeScreen() {
  return <EvMap onBack={() => router.canGoBack() && router.back()} />;
}
