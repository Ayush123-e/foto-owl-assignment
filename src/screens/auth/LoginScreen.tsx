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
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validationRules } from '../../utils/validations';
import type { LoginScreenProps } from '../../navigation/Types';

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

        {/* Email */}
        <Controller
          control={control}
          name="email"
          rules={validationRules.email}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="john@example.com"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.email?.message}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />

        {/* Password */}
        <Controller
          control={control}
          name="password"
          rules={validationRules.password}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="Min 6 characters"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
              secureTextEntry
            />
          )}
        />

        {/* Submit */}
        <Button
          label={isSubmitting ? 'Signing In…' : 'Log In'}
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          style={{ marginTop: 12, marginBottom: 18 }}
        />

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
  link: {
    textAlign: 'center',
    fontSize: 14,
  },
  linkBold: {
    fontWeight: '600',
  },
});
