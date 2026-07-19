import { Platform } from 'react-native';
if (typeof process.env === 'undefined') {
  process.env = {};
}
process.env.EXPO_OS = Platform.OS;

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
