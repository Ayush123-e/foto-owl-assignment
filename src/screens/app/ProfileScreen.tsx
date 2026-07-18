/**
 * ProfileScreen – displays the current user's profile with themes.
 *
 * Features a toggleable "Edit Mode" and theme switcher.
 */

import React, { useEffect, useState } from 'react';
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
import type { Gender, ProfileUpdate } from '../../context/AuthContext';
import type { ProfileScreenProps } from '../../navigation/types';

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

export default function ProfileScreen(
  _props: ProfileScreenProps,
): React.JSX.Element {
  const { currentUser, logout, updateProfile } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdate>({
    defaultValues: {
      fullName: currentUser?.fullName ?? '',
      email: currentUser?.email ?? '',
      gender: currentUser?.gender ?? 'Male',
      mobile: currentUser?.mobile ?? '',
      address: currentUser?.address ?? '',
      city: currentUser?.city ?? '',
    },
  });

  // Sync form defaults when currentUser changes (e.g. after save).
  useEffect(() => {
    if (currentUser) {
      reset({
        fullName: currentUser.fullName,
        email: currentUser.email,
        gender: currentUser.gender,
        mobile: currentUser.mobile,
        address: currentUser.address,
        city: currentUser.city,
      });
    }
  }, [currentUser, reset]);

  const onSave = async (data: ProfileUpdate): Promise<void> => {
    try {
      await updateProfile({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        gender: data.gender,
        mobile: data.mobile.trim(),
        address: data.address.trim(),
        city: data.city,
      });
      setIsEditing(false);
      setCityDropdownOpen(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update profile.';
      Alert.alert('Error', message);
    }
  };

  const handleCancel = (): void => {
    if (currentUser) {
      reset({
        fullName: currentUser.fullName,
        email: currentUser.email,
        gender: currentUser.gender,
        mobile: currentUser.mobile,
        address: currentUser.address,
        city: currentUser.city,
      });
    }
    setIsEditing(false);
    setCityDropdownOpen(false);
  };

  if (!currentUser) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No user session found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* ── Avatar & Quick Settings ─────────────────────────── */}
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.buttonText }]}>
              {currentUser.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.avatarMeta}>
            <Text style={[styles.avatarName, { color: colors.text }]}>{currentUser.fullName}</Text>
            <Text style={[styles.avatarEmail, { color: colors.textSecondary }]}>{currentUser.email}</Text>
          </View>
          {/* Quick theme toggle */}
          <Pressable
            style={[styles.themeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={toggleTheme}
            hitSlop={8}>
            <Text style={{ fontSize: 18, color: colors.text }}>
              {isDark ? '☀️' : '🌙'}
            </Text>
          </Pressable>
        </View>

        {/* ── Edit / Cancel toggle ────────────────────────────── */}
        <View style={styles.actionRow}>
          {isEditing ? (
            <>
              <Pressable
                style={[styles.actionBtn, styles.cancelBtn, { backgroundColor: colors.inputBackground }]}
                onPress={handleCancel}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.saveBtn, { backgroundColor: colors.success }, isSubmitting && styles.disabledBtn]}
                onPress={handleSubmit(onSave)}
                disabled={isSubmitting}>
                <Text style={[styles.saveBtnText, { color: colors.buttonText }]}>
                  {isSubmitting ? 'Saving…' : 'Save'}
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[styles.actionBtn, styles.editBtn, { backgroundColor: colors.primary }]}
              onPress={() => setIsEditing(true)}>
              <Text style={[styles.editBtnText, { color: colors.buttonText }]}>✎  Edit Profile</Text>
            </Pressable>
          )}
        </View>

        {/* ── Full Name ───────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
        {isEditing ? (
          <>
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
          </>
        ) : (
          <Text style={[styles.readonlyValue, { color: colors.text }]}>{currentUser.fullName}</Text>
        )}

        {/* ── Email ───────────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
        {isEditing ? (
          <>
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
          </>
        ) : (
          <Text style={[styles.readonlyValue, { color: colors.text }]}>{currentUser.email}</Text>
        )}

        {/* ── Gender ──────────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
        {isEditing ? (
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
        ) : (
          <Text style={[styles.readonlyValue, { color: colors.text }]}>{currentUser.gender}</Text>
        )}

        {/* ── Mobile ──────────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Mobile</Text>
        {isEditing ? (
          <>
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
          </>
        ) : (
          <Text style={[styles.readonlyValue, { color: colors.text }]}>{currentUser.mobile}</Text>
        )}

        {/* ── Address ─────────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Address</Text>
        {isEditing ? (
          <>
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
          </>
        ) : (
          <Text style={[styles.readonlyValue, { color: colors.text }]}>{currentUser.address}</Text>
        )}

        {/* ── City ────────────────────────────────────────────── */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>City</Text>
        {isEditing ? (
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
        ) : (
          <Text style={[styles.readonlyValue, { color: colors.text }]}>{currentUser.city}</Text>
        )}

        {/* ── Logout ──────────────────────────────────────────── */}
        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
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
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 60,
  },

  // Avatar row
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  avatarMeta: {
    flex: 1,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '700',
  },
  avatarEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // Action buttons row
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editBtn: {
    // colors.primary applied dynamically
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    // colors.inputBackground applied dynamically
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    // colors.success applied dynamically
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.6,
  },

  // Fields
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readonlyValue: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
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
    borderWidth: 1,
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

  // Logout
  logoutBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 36,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
