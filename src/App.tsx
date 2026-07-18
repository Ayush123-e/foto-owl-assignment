/**
 * App entry point.
 *
 * Wraps the navigation tree with the AuthProvider so that
 * AppNavigator can read the global session state from AsyncStorage.
 */

import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View, useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

function AppContent(): React.JSX.Element {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6c63ff" />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AuthProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
