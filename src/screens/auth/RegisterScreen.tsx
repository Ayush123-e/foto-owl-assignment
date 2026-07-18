/**
 * RegisterScreen – comprehensive registration form with themes and Atom components.
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
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validationRules } from '../../utils/validations';
import type { Gender } from '../../context/AuthContext';
import type { RegisterScreenProps } from '../../navigation/Types';

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

        {/* Full Name */}
        <Controller
          control={control}
          name="fullName"
          rules={validationRules.fullName}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.fullName?.message}
              autoCapitalize="words"
            />
          )}
        />

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

        {/* Gender (Radio) */}
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
          <Text style={[styles.errorText, { color: colors.error }]}>{errors.gender.message}</Text>
        )}

        {/* Mobile */}
        <Controller
          control={control}
          name="mobile"
          rules={validationRules.mobile}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Mobile Number"
              placeholder="9876543210"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.mobile?.message}
              keyboardType="number-pad"
              maxLength={10}
            />
          )}
        />

        {/* Address */}
        <Controller
          control={control}
          name="address"
          rules={validationRules.address}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Address"
              placeholder="123, Main Street, Area"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.address?.message}
              isTextArea
            />
          )}
        />

        {/* City (Dropdown) */}
        <Text style={[styles.label, { color: colors.text }]}>City</Text>
        <Controller
          control={control}
          name="city"
          rules={validationRules.city}
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 12 }}>
              <Pressable
                style={[
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
          <Text style={[styles.errorText, { color: colors.error }]}>{errors.city.message}</Text>
        )}

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

        {/* Confirm Password */}
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Please confirm your password',
            validate: (val: string) =>
              val === passwordValue || 'Passwords do not match',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.confirmPassword?.message}
              secureTextEntry
            />
          )}
        />

        {/* Submit */}
        <Button
          label={isSubmitting ? 'Creating Account…' : 'Register'}
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          style={{ marginTop: 24, marginBottom: 18 }}
        />

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
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
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
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  link: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  linkBold: {
    fontWeight: '600',
  },
});
