/**
 * AuthContext – global authentication state persisted with AsyncStorage.
 *
 * Storage keys:
 *   @users_list   → JSON array of all registered users (with hashed passwords)
 *   @current_user → JSON object of the active session (password stripped)
 *
 * On app launch, `loadSession()` hydrates `currentUser` from `@current_user`.
 * Registration appends to `@users_list`. Login validates against that list.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  USERS_LIST: '@users_list',
  CURRENT_USER: '@current_user',
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Gender = 'Male' | 'Female' | 'Other';

/** Full user record stored in @users_list (includes password). */
export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  gender: Gender;
  mobile: string;
  address: string;
  city: string;
  password: string;
}

/** Session user returned to the app (password stripped for security). */
export type User = Omit<StoredUser, 'password'>;

/** Data collected from the registration form. */
export interface RegisterPayload {
  fullName: string;
  email: string;
  gender: Gender;
  mobile: string;
  address: string;
  city: string;
  password: string;
}

/** Editable profile fields (subset of User). */
export type ProfileUpdate = Pick<
  User,
  'fullName' | 'email' | 'gender' | 'mobile' | 'address' | 'city'
>;

interface AuthContextValue {
  /** The currently authenticated user, or `null` when logged out. */
  currentUser: User | null;
  /** `true` while the initial session is being loaded from storage. */
  isLoading: boolean;
  /** Register a new account. Throws on duplicate email. */
  register: (data: RegisterPayload) => Promise<void>;
  /** Log in with email & password. Throws on invalid credentials. */
  login: (email: string, password: string) => Promise<void>;
  /** Sign the current user out and clear @current_user. */
  logout: () => Promise<void>;
  /** Update profile fields for the current user. Syncs to storage. */
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getUsersList(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USERS_LIST);
  if (!raw) {
    return [];
  }
  return JSON.parse(raw) as StoredUser[];
}

async function saveUsersList(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
}

function stripPassword(stored: StoredUser): User {
  const { password: _pw, ...user } = stored;
  return user;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // -- Hydrate session on mount ---------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (raw) {
          setCurrentUser(JSON.parse(raw) as User);
        }
      } catch {
        // Silently ignore corrupt storage.
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // -- Register -------------------------------------------------------------
  const register = useCallback(async (data: RegisterPayload): Promise<void> => {
    const users = await getUsersList();

    const exists = users.some(
      u => u.email.toLowerCase() === data.email.toLowerCase(),
    );
    if (exists) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      gender: data.gender,
      mobile: data.mobile,
      address: data.address,
      city: data.city,
      password: data.password,
    };

    users.push(newUser);
    await saveUsersList(users);

    // Auto-login after registration.
    const session = stripPassword(newUser);
    await AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_USER,
      JSON.stringify(session),
    );
    setCurrentUser(session);
  }, []);

  // -- Login ----------------------------------------------------------------
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const users = await getUsersList();

      const match = users.find(
        u =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );

      if (!match) {
        throw new Error('Invalid email or password.');
      }

      const session = stripPassword(match);
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(session),
      );
      setCurrentUser(session);
    },
    [],
  );

  // -- Logout ---------------------------------------------------------------
  const logout = useCallback(async (): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setCurrentUser(null);
  }, []);

  // -- Update profile -------------------------------------------------------
  const updateProfile = useCallback(
    async (updates: ProfileUpdate): Promise<void> => {
      if (!currentUser) {
        throw new Error('No active session.');
      }

      // 1) Update @users_list
      const users = await getUsersList();
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx === -1) {
        throw new Error('User not found in storage.');
      }

      users[idx] = { ...users[idx], ...updates };
      await saveUsersList(users);

      // 2) Update @current_user session (password stays stripped)
      const updatedSession: User = { ...currentUser, ...updates };
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(updatedSession),
      );
      setCurrentUser(updatedSession);
    },
    [currentUser],
  );

  // -- Memoised value -------------------------------------------------------
  const value = useMemo<AuthContextValue>(
    () => ({ currentUser, isLoading, register, login, logout, updateProfile }),
    [currentUser, isLoading, register, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the global auth state.
 * Must be called inside an `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
