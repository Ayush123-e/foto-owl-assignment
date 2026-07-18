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
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Screens – Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Screens – App (refactored structure)
import HomeScreen from '../screens/gallery/HomeScreen';
import DetailScreen from '../screens/gallery/DetailScreen';
import FavoritesScreen from '../screens/user/FavoritesScreen';
import ProfileScreen from '../screens/user/ProfileScreen';

// Types
import type {
  AuthStackParamList,
  HomeStackParamList,
  AppTabsParamList,
  RootStackParamList,
} from './Types';

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
  const { colors } = useTheme();

  return (
    <HomeStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}>
      <HomeStackNav.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Explore' }}
      />
      <HomeStackNav.Screen
        name="DetailScreen"
        component={DetailScreen}
        options={{ title: 'Details' }}
      />
    </HomeStackNav.Navigator>
  );
}

// ---------------------------------------------------------------------------
// App Tabs (Bottom Tab Navigator)
// ---------------------------------------------------------------------------

function AppTabs(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
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
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
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
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
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
// Tiny text-based tab icon
// ---------------------------------------------------------------------------

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
