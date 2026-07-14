import type { ConfigContext, ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

if (!googleMapsApiKey) {
  console.warn(
    '[ev-energy] Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY. Copy .env.example to .env and add your key.',
  );
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ev-energy',
  slug: 'ev-energy',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'evenergy',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.anonymous.ev-energy',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow EV Energy to use your location to show nearby charging stations.',
      },
    ],
    [
      'react-native-maps',
      {
        iosGoogleMapsApiKey: googleMapsApiKey,
        androidGoogleMapsApiKey: googleMapsApiKey,
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
