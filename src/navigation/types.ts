/**
 * Navigation type definitions for the entire app.
 *
 * Every navigator and screen has explicit param-list types so that
 * `navigation.navigate(...)` is fully type-checked with zero implicit `any`.
 */

import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { PicsumImage } from '../types/picsum';

// ---------------------------------------------------------------------------
// Param Lists
// ---------------------------------------------------------------------------

/** Auth stack – shown when there is no authenticated user. */
export type AuthStackParamList = {
  LoginScreen: undefined;
  RegisterScreen: undefined;
};

/** Home stack – nested inside the Home tab. */
export type HomeStackParamList = {
  HomeScreen: undefined;
  DetailScreen: { itemId: string; image?: PicsumImage };
};

/** Bottom-tab navigator – shown when a user is authenticated. */
export type AppTabsParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  FavoritesScreen: undefined;
  ProfileScreen: undefined;
};

/** Root-level navigator that gates auth vs app. */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabsParamList>;
};

// ---------------------------------------------------------------------------
// Screen Props (typed helpers for each screen component)
// ---------------------------------------------------------------------------

// -- Auth screens -----------------------------------------------------------

export type LoginScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'LoginScreen'
>;

export type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'RegisterScreen'
>;

// -- Home stack screens -----------------------------------------------------

/** HomeScreen lives inside a Stack that is nested inside a Tab. */
export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/** DetailScreen lives inside the same nested Home stack. */
export type DetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'DetailScreen'>,
  BottomTabScreenProps<AppTabsParamList>
>;

// -- Tab screens (non-nested) -----------------------------------------------

export type FavoritesScreenProps = BottomTabScreenProps<
  AppTabsParamList,
  'FavoritesScreen'
>;

export type ProfileScreenProps = BottomTabScreenProps<
  AppTabsParamList,
  'ProfileScreen'
>;

// ---------------------------------------------------------------------------
// Global type augmentation for React Navigation
// ---------------------------------------------------------------------------

/**
 * Declare the root param list globally so that `useNavigation()` is typed
 * even without an explicit generic.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
