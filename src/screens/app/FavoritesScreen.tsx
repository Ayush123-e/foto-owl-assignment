/**
 * FavoritesScreen – placeholder for the Favorites tab.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { FavoritesScreenProps } from '../../navigation/types';

export default function FavoritesScreen(
  _props: FavoritesScreenProps,
): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>♡</Text>
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.subtitle}>
        Items you love will appear here.
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
