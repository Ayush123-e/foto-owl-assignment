/**
 * Input – Atom Component representing a dynamic input field wrapper with error displays.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isTextArea?: boolean;
}

export function Input({
  label,
  error,
  isTextArea = false,
  style,
  ...rest
}: InputProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          isTextArea && styles.textArea,
          {
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: error ? colors.error : colors.border,
          },
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        multiline={isTextArea}
        numberOfLines={isTextArea ? 3 : undefined}
        textAlignVertical={isTextArea ? 'top' : 'center'}
        {...rest}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
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
});
