/**
 * LoginScreen – email / password login form.
 *
 * Uses react-hook-form for state and validation.
 * Credentials are verified against the @users_list in AsyncStorage.
 */

import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { LoginScreenProps } from '../../navigation/types';

// ---------------------------------------------------------------------------
// Form types
// ---------------------------------------------------------------------------

interface LoginFormData {
  email: string;
  password: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LoginScreen({
  navigation,
}: LoginScreenProps): React.JSX.Element {
  const { login } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      await login(data.email.trim(), data.password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login failed.';
      Alert.alert('Error', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Theme Toggle Button */}
      <Pressable
        style={[styles.themeToggle, { backgroundColor: colors.card }]}
        onPress={toggleTheme}
        hitSlop={8}>
        <Text style={{ fontSize: 18, color: colors.text }}>
          {isDark ? '☀️' : '🌙'}
        </Text>
      </Pressable>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue</Text>

        {/* ── Email ─────────────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: errors.email ? colors.error : colors.border,
                },
              ]}
              placeholder="john@example.com"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Text style={[styles.error, { color: colors.error }]}>{errors.email.message}</Text>
        )}

        {/* ── Password ──────────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: errors.password ? colors.error : colors.border,
                },
              ]}
              placeholder="Min 6 characters"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text style={[styles.error, { color: colors.error }]}>{errors.password.message}</Text>
        )}

        {/* ── Submit ────────────────────────────────────────────── */}
        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.primary },
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}>
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            {isSubmitting ? 'Signing In…' : 'Log In'}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('RegisterScreen')}>
          <Text style={[styles.link, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
            <Text style={[styles.linkBold, { color: colors.primary }]}>Register</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  themeToggle: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 18,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
  },
  linkBold: {
    fontWeight: '600',
  },
});
