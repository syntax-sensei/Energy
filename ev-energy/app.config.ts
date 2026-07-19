import type { ConfigContext, ExpoConfig } from "expo/config";

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

if (!googleMapsApiKey) {
  console.warn(
    "[ev-energy] Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY. Copy .env.example to .env and add your key.",
  );
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "ev-energy",
  slug: "ev-energy",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "evenergy",
  userInterfaceStyle: "automatic",
  ios: {
    icon: "./assets/expo.icon",
    bundleIdentifier: "com.anonymous.ev-energy",
    config: {
      googleMapsApiKey,
    },
  },
  android: {
    package: "com.anonymous.evenergy",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    config: {
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Allow EV Energy to use your location to show nearby charging stations.",
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    ],
    // Must run after Expo injects Maps init — moves provideAPIKey before startReactNative
    "./plugins/with-google-maps-early-init",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    ...config.extra,
    eas: {
      projectId: "48dd7c19-ab58-491a-bb35-bbff2bbdd93f",
    },
  },
});
