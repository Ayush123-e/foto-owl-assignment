/**
 * AppNavigator – unified navigation configuration.
 *
 * Structure:
 *   RootStack
 *   ├── Auth (AuthStack)
 *   │   ├── LoginScreen
 *   │   └── RegisterScreen
 *   └── App (AppTabs)
 *       ├── HomeTab (HomeStack)
 *       │   ├── HomeScreen
 *       │   └── DetailScreen
 *       ├── FavoritesScreen
 *       └── ProfileScreen
 *
 * Routing is driven by `useAuth().currentUser`:
 *   - `null`  → AuthStack
 *   - object  → AppTabs
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';

// Screens – Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Screens – App
import HomeScreen from '../screens/app/HomeScreen';
import DetailScreen from '../screens/app/DetailScreen';
import FavoritesScreen from '../screens/app/FavoritesScreen';
import ProfileScreen from '../screens/app/ProfileScreen';

// Types
import type {
  AuthStackParamList,
  HomeStackParamList,
  AppTabsParamList,
  RootStackParamList,
} from './types';

// ---------------------------------------------------------------------------
// Navigator instances
// ---------------------------------------------------------------------------

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<AppTabsParamList>();

// ---------------------------------------------------------------------------
// Auth Stack
// ---------------------------------------------------------------------------

function AuthStack(): React.JSX.Element {
  return (
    <AuthStackNav.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <AuthStackNav.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStackNav.Screen name="RegisterScreen" component={RegisterScreen} />
    </AuthStackNav.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Home Stack (nested inside HomeTab)
// ---------------------------------------------------------------------------

function HomeStack(): React.JSX.Element {
  return (
    <HomeStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f0f1a' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600' },
      }}>
      <HomeStackNav.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <HomeStackNav.Screen
        name="DetailScreen"
        component={DetailScreen}
        options={{ title: 'Detail' }}
      />
    </HomeStackNav.Navigator>
  );
}

// ---------------------------------------------------------------------------
// App Tabs (Bottom Tab Navigator)
// ---------------------------------------------------------------------------

function AppTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#16213e',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#6c63ff',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabIcon label="⌂" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FavoritesScreen"
        component={FavoritesScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0f0f1a' },
          headerTintColor: '#ffffff',
          title: 'Favorites',
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabIcon label="♡" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0f0f1a' },
          headerTintColor: '#ffffff',
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => (
            <TabIcon label="⚙" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Tiny text-based tab icon (avoids external icon library dependency)
// ---------------------------------------------------------------------------

import { Text } from 'react-native';

function TabIcon({ label, color }: { label: string; color: string }): React.JSX.Element {
  return <Text style={{ fontSize: 20, color }}>{label}</Text>;
}

// ---------------------------------------------------------------------------
// Root Navigator (auth-gated)
// ---------------------------------------------------------------------------

export default function AppNavigator(): React.JSX.Element {
  const { currentUser } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser === null ? (
          <RootStack.Screen name="Auth" component={AuthStack} />
        ) : (
          <RootStack.Screen name="App" component={AppTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
