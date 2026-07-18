/**
 * DetailScreen – receives `itemId` via route params and displays it.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DetailScreenProps } from '../../navigation/types';

export default function DetailScreen({
  route,
  navigation,
}: DetailScreenProps): React.JSX.Element {
  const { itemId } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Item ID</Text>
        <Text style={styles.value}>{itemId}</Text>

        <Text style={styles.description}>
          This is the detail view for item <Text style={styles.bold}>#{itemId}</Text>.
          Replace this placeholder with real content fetched by id.
        </Text>

        <Pressable style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>← Go Back</Text>
        </Pressable>
      </View>
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
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c63ff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  value: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  bold: {
    fontWeight: '700',
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#6c63ff',
    fontWeight: '600',
    fontSize: 15,
  },
});
