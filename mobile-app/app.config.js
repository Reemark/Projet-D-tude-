const { withAppBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// In RN 0.85+, hermesc moved from react-native/sdks/hermesc/ to the hermes-compiler npm package.
// Expo's prebuild template still generates the old path, which breaks the Gradle bundle step.
const withFixHermesCommand = (config) => {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /hermesCommand\s*=\s*new File\(\["node".*?react-native\/package\.json.*?\/sdks\/hermesc\/%OS-BIN%\/hermesc"/,
      `hermesCommand = new File(["node", "--print", "require.resolve('hermes-compiler/package.json')"].execute(null, rootDir).text.trim()).getParentFile().getAbsolutePath() + "/hermesc/%OS-BIN%/hermesc"`
    );
    return config;
  });
};

// expo@56.0.x prebuild generates MainApplication.kt with ReactNativeHostWrapper, which was removed
// in expo-modules-core@56.0.18. This plugin rewrites it with the correct SDK 56 template using
// ExpoReactHostFactory. Runs synchronously (writeFileSync) so ViroReact's async readFile callback
// always reads the correct content. The // add(MyReactNativePackage()) anchor is preserved so
// ViroReact's withBranchAndroid plugin can still insert ReactViroPackage.
const withFixMainApplication = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const packageName = (config.android && config.android.package) || 'com.lootopia.mobile';
      const packagePath = packageName.replace(/\./g, '/');
      const mainAppPath = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/java',
        packagePath,
        'MainApplication.kt'
      );

      const contents =
`package ${packageName}

import android.app.Application
import android.content.res.Configuration
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ExpoReactHostFactory

class MainApplication : Application(), ReactApplication {
  override val reactHost: ReactHost by lazy {
    ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        }
    )
  }
  override fun onCreate() {
    super.onCreate()
    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }
  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
`;

      fs.mkdirSync(path.dirname(mainAppPath), { recursive: true });
      fs.writeFileSync(mainAppPath, contents, 'utf-8');
      return config;
    },
  ]);
};

module.exports = ({ config }) => {
  let cfg = withFixHermesCommand(config);
  cfg = withFixMainApplication(cfg);
  return cfg;
};
