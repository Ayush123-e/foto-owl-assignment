/**
 * Toast – lightweight cross-platform toast notification component.
 *
 * On Android, uses the native ToastAndroid API.
 * On iOS (and as a fallback), renders an animated overlay message.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
} from 'react-native';

// ---------------------------------------------------------------------------
// Native Android shortcut
// ---------------------------------------------------------------------------

export function showToast(message: string): void {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }
  // iOS: dispatch to any mounted <Toast /> component via global callback.
  if (_globalShowFn) {
    _globalShowFn(message);
  }
}

// Global callback set by the <Toast /> provider on mount (iOS only).
let _globalShowFn: ((msg: string) => void) | null = null;

// ---------------------------------------------------------------------------
// iOS Toast overlay component – mount once near root
// ---------------------------------------------------------------------------

export function Toast(): React.JSX.Element | null {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string) => {
      // Clear any existing hide timer.
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setMessage(msg);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setMessage(null));
      }, 2500);
    },
    [opacity],
  );

  // Register the global callback.
  useEffect(() => {
    _globalShowFn = show;
    return () => {
      _globalShowFn = null;
    };
  }, [show]);

  if (Platform.OS === 'android' || !message) {
    return null;
  }

  return (
    <Animated.View style={[styles.toastContainer, { opacity }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    backgroundColor: '#1a1a2eee',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#6c63ff40',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
