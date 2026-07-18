/**
 * ProfileScreen – displays the current user's profile.
 *
 * Features a toggleable "Edit Mode" where all fields become editable
 * TextInputs. Saving immediately syncs changes back to the global
 * auth state AND AsyncStorage without requiring an app restart.
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
    // Reset form back to current user values.
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
      <View style={styles.container}>
        <Text style={styles.emptyText}>No user session found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* ── Avatar ──────────────────────────────────────────── */}
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.avatarMeta}>
            <Text style={styles.avatarName}>{currentUser.fullName}</Text>
            <Text style={styles.avatarEmail}>{currentUser.email}</Text>
          </View>
        </View>

        {/* ── Edit / Cancel toggle ────────────────────────────── */}
        <View style={styles.actionRow}>
          {isEditing ? (
            <>
              <Pressable
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.saveBtn, isSubmitting && styles.disabledBtn]}
                onPress={handleSubmit(onSave)}
                disabled={isSubmitting}>
                <Text style={styles.saveBtnText}>
                  {isSubmitting ? 'Saving…' : 'Save'}
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => setIsEditing(true)}>
              <Text style={styles.editBtnText}>✎  Edit Profile</Text>
            </Pressable>
          )}
        </View>

        {/* ── Full Name ───────────────────────────────────────── */}
        <Text style={styles.label}>Full Name</Text>
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
                  style={[styles.input, errors.fullName && styles.inputError]}
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
          </>
        ) : (
          <Text style={styles.readonlyValue}>{currentUser.fullName}</Text>
        )}

        {/* ── Email ───────────────────────────────────────────── */}
        <Text style={styles.label}>Email</Text>
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
                  style={[styles.input, errors.email && styles.inputError]}
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
          </>
        ) : (
          <Text style={styles.readonlyValue}>{currentUser.email}</Text>
        )}

        {/* ── Gender ──────────────────────────────────────────── */}
        <Text style={styles.label}>Gender</Text>
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
        ) : (
          <Text style={styles.readonlyValue}>{currentUser.gender}</Text>
        )}

        {/* ── Mobile ──────────────────────────────────────────── */}
        <Text style={styles.label}>Mobile</Text>
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
                  style={[styles.input, errors.mobile && styles.inputError]}
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
          </>
        ) : (
          <Text style={styles.readonlyValue}>{currentUser.mobile}</Text>
        )}

        {/* ── Address ─────────────────────────────────────────── */}
        <Text style={styles.label}>Address</Text>
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
                    errors.address && styles.inputError,
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
              <Text style={styles.error}>{errors.address.message}</Text>
            )}
          </>
        ) : (
          <Text style={styles.readonlyValue}>{currentUser.address}</Text>
        )}

        {/* ── City ────────────────────────────────────────────── */}
        <Text style={styles.label}>City</Text>
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
                    errors.city && styles.inputError,
                  ]}
                  onPress={() => setCityDropdownOpen(prev => !prev)}>
                  <Text
                    style={
                      value ? styles.dropdownText : styles.dropdownPlaceholder
                    }>
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
        ) : (
          <Text style={styles.readonlyValue}>{currentUser.city}</Text>
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
    backgroundColor: '#0f0f1a',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  emptyText: {
    color: '#9ca3af',
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
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarMeta: {
    flex: 1,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarEmail: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
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
    backgroundColor: '#6c63ff',
  },
  editBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: '#16213e',
  },
  cancelBtnText: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#22c55e',
  },
  saveBtnText: {
    color: '#ffffff',
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
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  readonlyValue: {
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
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
