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
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validationRules } from '../../utils/validations';
import type { Gender, ProfileUpdate } from '../../context/AuthContext';
import type { ProfileScreenProps } from '../../navigation/Types';

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
        {/* Avatar & Quick Settings */}
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
          <Pressable
            style={[styles.themeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={toggleTheme}
            hitSlop={8}>
            <Text style={{ fontSize: 18, color: colors.text }}>
              {isDark ? '☀️' : '🌙'}
            </Text>
          </Pressable>
        </View>

        {/* Edit / Cancel toggle */}
        <View style={styles.actionRow}>
          {isEditing ? (
            <>
              <Button
                label="Cancel"
                onPress={handleCancel}
                variant="secondary"
                style={styles.actionBtn}
              />
              <Button
                label={isSubmitting ? 'Saving…' : 'Save'}
                onPress={handleSubmit(onSave)}
                disabled={isSubmitting}
                style={styles.actionBtn}
              />
            </>
          ) : (
            <Button
              label="✎  Edit Profile"
              onPress={() => setIsEditing(true)}
              style={styles.editBtn}
            />
          )}
        </View>

        {/* Full Name */}
        {isEditing ? (
          <Controller
            control={control}
            name="fullName"
            rules={validationRules.fullName}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.fullName?.message}
                autoCapitalize="words"
              />
            )}
          />
        ) : (
          <View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
            <Text style={[styles.readonlyValue, { color: colors.text }]}>{currentUser.fullName}</Text>
          </View>
        )}

        {/* Email */}
        {isEditing ? (
          <Controller
            control={control}
            name="email"
            rules={validationRules.email}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.email?.message}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />
        ) : (
          <View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <Text style={[styles.readonlyValue, { color: colors.text }]}>{currentUser.email}</Text>
          </View>
        )}

        {/* Gender */}
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

        {/* Mobile */}
        {isEditing ? (
          <Controller
            control={control}
            name="mobile"
            rules={validationRules.mobile}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mobile Number"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.mobile?.message}
                keyboardType="number-pad"
                maxLength={10}
              />
            )}
          />
        ) : (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Mobile</Text>
            <Text style={[styles.readonlyValue, { color: colors.text }]}>{currentUser.mobile}</Text>
          </View>
        )}

        {/* Address */}
        {isEditing ? (
          <Controller
            control={control}
            name="address"
            rules={validationRules.address}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Address"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.address?.message}
                isTextArea
              />
            )}
          />
        ) : (
          <View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Address</Text>
            <Text style={[styles.readonlyValue, { color: colors.text }]}>{currentUser.address}</Text>
          </View>
        )}

        {/* City */}
        {isEditing ? (
          <Controller
            control={control}
            name="city"
            rules={validationRules.city}
            render={({ field: { onChange, value } }) => (
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>City</Text>
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
        ) : (
          <View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>City</Text>
            <Text style={[styles.readonlyValue, { color: colors.text }]}>{currentUser.city}</Text>
          </View>
        )}

        {/* Logout */}
        <Button
          label="Log Out"
          onPress={logout}
          variant="danger"
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
  },
  editBtn: {
    flex: 1,
  },
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
  logoutBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 36,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
