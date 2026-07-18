const {
  createRunOncePlugin,
  withAppDelegate,
} = require('expo/config-plugins');

/**
 * Expo's Maps config plugin inserts GMSServices.provideAPIKey before
 * `super.application(...)`, which runs *after* `startReactNative(...)`.
 * Google Maps tiles need the key before any MapView mounts — otherwise you
 * get a blank map with markers still visible.
 */
function withGoogleMapsEarlyInit(config) {
  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      return config;
    }

    let src = config.modResults.contents;
    const initBlockMatch = src.match(
      /\/\/ @generated begin react-native-maps-init[\s\S]*?\/\/ @generated end react-native-maps-init\n?/,
    );

    if (!initBlockMatch) {
      return config;
    }

    const initBlock = initBlockMatch[0];
    src = src.replace(initBlock, '');

    if (src.includes('factory.startReactNative(')) {
      src = src.replace(
        /(#if os\(iOS\) \|\| os\(tvOS\)\n)/,
        `$1${initBlock}`,
      );
    } else {
      src = src.replace(
        /(didFinishLaunchingWithOptions[^{]*\{\n)/,
        `$1${initBlock}`,
      );
    }

    config.modResults.contents = src;
    return config;
  });
}

module.exports = createRunOncePlugin(
  withGoogleMapsEarlyInit,
  'with-google-maps-early-init',
  '1.0.0',
);
