import { router } from 'expo-router';

import { EvMap } from '@/components/map/ev-map';

/** Existing map experience — reachable from the auth placeholder for development. */
export default function MapScreen() {
  return <EvMap onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />;
}
