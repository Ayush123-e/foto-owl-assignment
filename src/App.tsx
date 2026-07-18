/**
 * App entry point.
 *
 * Wraps the navigation tree with the AuthProvider, GalleryProvider,
 * and ThemeProvider so that all components have access to global states.
 */

import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from './context/AuthContext';
import { GalleryProvider } from './context/GalleryContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Toast } from './components/Toast';
import AppNavigator from './navigation/AppNavigator';

function AppContent(): React.JSX.Element {
  const { isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <GalleryProvider>
        <ThemeProvider>
          <AppWithTheme />
        </ThemeProvider>
      </GalleryProvider>
    </AuthProvider>
  );
}

function AppWithTheme(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />
      <AppContent />
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
