/**
 * RegisterScreen – comprehensive registration form.
 *
 * Fields: Full Name, Email, Gender (radio), Mobile (10 digits),
 *         Address, City (dropdown), Password (min 6), Confirm Password.
 *
 * Uses react-hook-form for state management and inline validation.
 * On submit, calls `auth.register()` which persists to AsyncStorage.
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
      // On success, AuthContext auto-logs in → navigator switches to AppTabs.
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed.';
      Alert.alert('Error', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Fill in your details to get started</Text>

        {/* ── Full Name ─────────────────────────────────────────── */}
        <Text style={styles.label}>Full Name</Text>
        <Controller
          control={control}
          name="fullName"
          rules={{
            required: 'Full name is required',
            minLength: { value: 2, message: 'Must be at least 2 characters' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="John Doe"
              placeholderTextColor="#555"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.fullName && (
          <Text style={styles.error}>{errors.fullName.message}</Text>
        )}

        {/* ── Email ─────────────────────────────────────────────── */}
        <Text style={styles.label}>Email</Text>
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
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="john@example.com"
              placeholderTextColor="#555"
              autoCapitalize="none"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.error}>{errors.email.message}</Text>
        )}

        {/* ── Gender (Radio) ────────────────────────────────────── */}
        <Text style={styles.label}>Gender</Text>
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
                      value === option && styles.radioOuterActive,
                    ]}>
                    {value === option && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </Pressable>
              ))}
            </View>
          )}
        />
        {errors.gender && (
          <Text style={styles.error}>{errors.gender.message}</Text>
        )}

        {/* ── Mobile ────────────────────────────────────────────── */}
        <Text style={styles.label}>Mobile Number</Text>
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
              style={[styles.input, errors.mobile && styles.inputError]}
              placeholder="9876543210"
              placeholderTextColor="#555"
              keyboardType="number-pad"
              maxLength={10}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.mobile && (
          <Text style={styles.error}>{errors.mobile.message}</Text>
        )}

        {/* ── Address ───────────────────────────────────────────── */}
        <Text style={styles.label}>Address</Text>
        <Controller
          control={control}
          name="address"
          rules={{ required: 'Address is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.address && styles.inputError,
              ]}
              placeholder="123, Main Street, Area"
              placeholderTextColor="#555"
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
          <Text style={styles.error}>{errors.address.message}</Text>
        )}

        {/* ── City (Dropdown) ───────────────────────────────────── */}
        <Text style={styles.label}>City</Text>
        <Controller
          control={control}
          name="city"
          rules={{ required: 'Please select a city' }}
          render={({ field: { onChange, value } }) => (
            <View>
              <Pressable
                style={[styles.input, styles.dropdown, errors.city && styles.inputError]}
                onPress={() => setCityDropdownOpen(prev => !prev)}>
                <Text style={value ? styles.dropdownText : styles.dropdownPlaceholder}>
                  {value || 'Select a city'}
                </Text>
                <Text style={styles.dropdownArrow}>
                  {cityDropdownOpen ? '▲' : '▼'}
                </Text>
              </Pressable>
              {cityDropdownOpen && (
                <View style={styles.dropdownList}>
                  {CITY_OPTIONS.map(city => (
                    <Pressable
                      key={city}
                      style={[
                        styles.dropdownItem,
                        value === city && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        onChange(city);
                        setCityDropdownOpen(false);
                      }}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          value === city && styles.dropdownItemTextActive,
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
          <Text style={styles.error}>{errors.city.message}</Text>
        )}

        {/* ── Password ──────────────────────────────────────────── */}
        <Text style={styles.label}>Password</Text>
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
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Min 6 characters"
              placeholderTextColor="#555"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.error}>{errors.password.message}</Text>
        )}

        {/* ── Confirm Password ──────────────────────────────────── */}
        <Text style={styles.label}>Confirm Password</Text>
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
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Re-enter password"
              placeholderTextColor="#555"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword.message}</Text>
        )}

        {/* ── Submit ────────────────────────────────────────────── */}
        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}>
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Creating Account…' : 'Register'}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.link}>
            Already have an account?{' '}
            <Text style={styles.linkBold}>Log In</Text>
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
    backgroundColor: '#0f0f1a',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  error: {
    color: '#ef4444',
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
    borderColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: '#6c63ff',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6c63ff',
  },
  radioLabel: {
    color: '#d1d5db',
    fontSize: 14,
  },

  // City dropdown
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#ffffff',
    fontSize: 15,
  },
  dropdownPlaceholder: {
    color: '#555',
    fontSize: 15,
  },
  dropdownArrow: {
    color: '#9ca3af',
    fontSize: 12,
  },
  dropdownList: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  dropdownItemActive: {
    backgroundColor: '#6c63ff20',
  },
  dropdownItemText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  dropdownItemTextActive: {
    color: '#6c63ff',
    fontWeight: '600',
  },

  // Button
  button: {
    backgroundColor: '#6c63ff',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 20,
  },
  linkBold: {
    color: '#6c63ff',
    fontWeight: '600',
  },
});
