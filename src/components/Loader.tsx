/**
 * Loader – Atom Component representing activity indicators or loading skeletons.
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';

interface LoaderProps {
  variant?: 'spinner' | 'skeleton';
}

export function Loader({ variant = 'spinner' }: LoaderProps): React.JSX.Element {
  const { colors } = useTheme();

  if (variant === 'spinner') {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Skeleton layout matching main card structure
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.card }]}>
          <View style={[styles.skeletonImage, { backgroundColor: colors.inputBackground }]} />
          <View style={styles.skeletonFooter}>
            <View style={[styles.skeletonLine, { backgroundColor: colors.inputBackground }]} />
            <View style={[styles.skeletonLineShort, { backgroundColor: colors.inputBackground }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  skeletonCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  skeletonImage: {
    width: '100%',
    height: 220,
  },
  skeletonFooter: {
    padding: 14,
    gap: 8,
  },
  skeletonLine: {
    width: '60%',
    height: 14,
    borderRadius: 7,
  },
  skeletonLineShort: {
    width: '30%',
    height: 10,
    borderRadius: 5,
  },
});
