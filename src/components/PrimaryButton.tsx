import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  fullWidth?: boolean;
  flex?: boolean;
  minWidth?: number;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  flex = false,
  minWidth,
}: Props) {
  const theme = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const pressOverlay = useRef(new Animated.Value(0)).current;
  const hasFilledBackground = variant !== 'ghost';
  const isPrimary = variant === 'primary';

  const backgroundColor =
    isPrimary
      ? theme.mode === 'dark'
        ? '#5D98FF'
        : '#2F6BFF'
      : variant === 'secondary'
        ? theme.mode === 'dark'
          ? theme.colors.surfaceAlt
          : '#EAF1FF'
        : theme.colors.surface;

  const borderColor =
    isPrimary
      ? theme.mode === 'dark'
        ? '#86B1FF'
        : '#6E98FF'
      : variant === 'secondary'
        ? theme.colors.highlightStrong
        : theme.colors.border;

  const color = isPrimary ? '#FFFFFF' : theme.colors.text;
  const overlayColor =
    theme.mode === 'dark'
      ? 'rgba(255,255,255,0.08)'
      : isPrimary
        ? 'rgba(255,255,255,0.10)'
        : 'rgba(47,107,255,0.08)';

  const wrapperStyle: ViewStyle = {
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    flex: flex ? 1 : undefined,
    minWidth,
  };

  return (
    <Animated.View
      style={[
        wrapperStyle,
        {
          transform: [
            { scale },
            {
              translateY: lift.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -2],
              }),
            },
          ],
        },
      ]}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          Animated.parallel([
            Animated.spring(scale, {
              toValue: 0.985,
              useNativeDriver: true,
              speed: 28,
              bounciness: 4,
            }),
            Animated.spring(lift, {
              toValue: 1,
              useNativeDriver: true,
              speed: 28,
              bounciness: 4,
            }),
            Animated.timing(pressOverlay, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();
        }}
        onPressOut={() => {
          Animated.parallel([
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              speed: 24,
              bounciness: 6,
            }),
            Animated.spring(lift, {
              toValue: 0,
              useNativeDriver: true,
              speed: 24,
              bounciness: 6,
            }),
            Animated.timing(pressOverlay, {
              toValue: 0,
              duration: 140,
              useNativeDriver: true,
            }),
          ]).start();
        }}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor,
            borderColor,
            opacity: disabled ? 0.5 : pressed ? 0.97 : 1,
            shadowColor: isPrimary ? theme.colors.primary : theme.colors.text,
            shadowOpacity: isPrimary ? 0.16 : hasFilledBackground ? 0.05 : 0,
            shadowRadius: hasFilledBackground ? 14 : 0,
            shadowOffset: hasFilledBackground ? { width: 0, height: 8 } : { width: 0, height: 0 },
            elevation: isPrimary ? 4 : hasFilledBackground ? 2 : 0,
            width: fullWidth || flex ? '100%' : undefined,
          },
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.innerHighlight,
            {
              backgroundColor:
                theme.mode === 'dark'
                  ? isPrimary
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(255,255,255,0.04)'
                  : isPrimary
                    ? 'rgba(255,255,255,0.14)'
                    : 'rgba(255,255,255,0.72)',
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pressOverlay,
            {
              backgroundColor: overlayColor,
              opacity: pressOverlay,
            },
          ]}
        />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  innerHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  pressOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
