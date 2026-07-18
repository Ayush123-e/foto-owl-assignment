/**
 * HomeScreen – displays a list of sample items.
 * Tapping an item navigates to DetailScreen with the item's id.
 */

import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { HomeScreenProps } from '../../navigation/types';

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

interface Item {
  id: string;
  title: string;
  description: string;
}

const SAMPLE_ITEMS: Item[] = [
  { id: '1', title: 'Sunset Photography', description: 'Golden hour tips & tricks' },
  { id: '2', title: 'Street Portraits', description: 'Capturing candid moments' },
  { id: '3', title: 'Landscape Wide Shots', description: 'Composition fundamentals' },
  { id: '4', title: 'Macro Close-ups', description: 'Exploring tiny worlds' },
  { id: '5', title: 'Night Sky Captures', description: 'Long exposure & astro' },
  { id: '6', title: 'Drone Aerials', description: 'Top-down perspectives' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomeScreen({
  navigation,
}: HomeScreenProps): React.JSX.Element {
  const renderItem = ({ item }: { item: Item }): React.JSX.Element => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('DetailScreen', { itemId: item.id })}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.description}</Text>
      <Text style={styles.cardArrow}>→</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Explore</Text>
      <FlatList
        data={SAMPLE_ITEMS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#9ca3af',
  },
  cardArrow: {
    position: 'absolute',
    right: 18,
    top: 22,
    fontSize: 20,
    color: '#6c63ff',
  },
});
