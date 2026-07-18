/**
 * RegisterScreen – comprehensive registration form with themes.
 *
 * Fields: Full Name, Email, Gender (radio), Mobile (10 digits),
 *         Address, City (dropdown), Password (min 6), Confirm Password.
 */

import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { Gender } from '../../context/AuthContext';
import type { RegisterScreenProps } from '../../navigation/types';

// ---------------------------------------------------------------------------
// Form types
// ---------------------------------------------------------------------------

interface RegisterFormData {
  fullName: string;
  email: string;
  gender: Gender;
  mobile: string;
  address: string;
  city: string;
  password: string;
  confirmPassword: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Other'];

const CITY_OPTIONS: string[] = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RegisterScreen({
  navigation,
}: RegisterScreenProps): React.JSX.Element {
  const { register: registerUser } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      gender: 'Male',
      mobile: '',
      address: '',
      city: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      await registerUser({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        gender: data.gender,
        mobile: data.mobile.trim(),
        address: data.address.trim(),
        city: data.city,
        password: data.password,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed.';
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

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Fill in your details to get started</Text>

        {/* ── Full Name ─────────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
        <Controller
          control={control}
          name="fullName"
          rules={{
            required: 'Full name is required',
            minLength: { value: 2, message: 'Must be at least 2 characters' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: errors.fullName ? colors.error : colors.border,
                },
              ]}
              placeholder="John Doe"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.fullName && (
          <Text style={[styles.error, { color: colors.error }]}>{errors.fullName.message}</Text>
        )}

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

        {/* ── Gender (Radio) ────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
        <Controller
          control={control}
          name="gender"
          rules={{ required: 'Please select a gender' }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {GENDER_OPTIONS.map(option => (
                <Pressable
                  key={option}
                  style={styles.radioOption}
                  onPress={() => onChange(option)}>
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: colors.border },
                      value === option && { borderColor: colors.primary },
                    ]}>
                    {value === option && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                  </View>
                  <Text style={[styles.radioLabel, { color: colors.text }]}>{option}</Text>
                </Pressable>
              ))}
            </View>
          )}
        />
        {errors.gender && (
          <Text style={[styles.error, { color: colors.error }]}>{errors.gender.message}</Text>
        )}

        {/* ── Mobile ────────────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.text }]}>Mobile Number</Text>
        <Controller
          control={control}
          name="mobile"
          rules={{
            required: 'Mobile number is required',
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Must be exactly 10 digits',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: errors.mobile ? colors.error : colors.border,
                },
              ]}
              placeholder="9876543210"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={10}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.mobile && (
          <Text style={[styles.error, { color: colors.error }]}>{errors.mobile.message}</Text>
        )}

        {/* ── Address ───────────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.text }]}>Address</Text>
        <Controller
          control={control}
          name="address"
          rules={{ required: 'Address is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: errors.address ? colors.error : colors.border,
                },
              ]}
              placeholder="123, Main Street, Area"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.address && (
          <Text style={[styles.error, { color: colors.error }]}>{errors.address.message}</Text>
        )}

        {/* ── City (Dropdown) ───────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.text }]}>City</Text>
        <Controller
          control={control}
          name="city"
          rules={{ required: 'Please select a city' }}
          render={({ field: { onChange, value } }) => (
            <View>
              <Pressable
                style={[
                  styles.input,
                  styles.dropdown,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.city ? colors.error : colors.border,
                  },
                ]}
                onPress={() => setCityDropdownOpen(prev => !prev)}>
                <Text style={value ? { color: colors.text } : { color: colors.textSecondary }}>
                  {value || 'Select a city'}
                </Text>
                <Text style={[styles.dropdownArrow, { color: colors.textSecondary }]}>
                  {cityDropdownOpen ? '▲' : '▼'}
                </Text>
              </Pressable>
              {cityDropdownOpen && (
                <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {CITY_OPTIONS.map(city => (
                    <Pressable
                      key={city}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: colors.border },
                        value === city && { backgroundColor: `${colors.primary}20` },
                      ]}
                      onPress={() => {
                        onChange(city);
                        setCityDropdownOpen(false);
                      }}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: colors.text },
                          value === city && { color: colors.primary, fontWeight: '600' },
                        ]}>
                        {city}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        />
        {errors.city && (
          <Text style={[styles.error, { color: colors.error }]}>{errors.city.message}</Text>
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

        {/* ── Confirm Password ──────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Please confirm your password',
            validate: (val: string) =>
              val === passwordValue || 'Passwords do not match',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                  borderColor: errors.confirmPassword ? colors.error : colors.border,
                },
              ]}
              placeholder="Re-enter password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={[styles.error, { color: colors.error }]}>{errors.confirmPassword.message}</Text>
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
            {isSubmitting ? 'Creating Account…' : 'Register'}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={[styles.link, { color: colors.textSecondary }]}>
            Already have an account?{' '}
            <Text style={[styles.linkBold, { color: colors.primary }]}>Log In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
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
    zIndex: 10,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 110,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Radio buttons
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioLabel: {
    fontSize: 14,
  },

  // City dropdown
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownArrow: {
    fontSize: 12,
  },
  dropdownList: {
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
    borderWidth: 1,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
  },

  // Button
  button: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
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
    marginBottom: 20,
  },
  linkBold: {
    fontWeight: '600',
  },
});
