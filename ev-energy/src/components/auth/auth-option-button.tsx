import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Brand, Radii, Spacing } from '@/constants/theme';

type AuthOptionButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  /** Emphasized filled style for the primary phone path. */
  primary?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
};

export function AuthOptionButton({
  label,
  onPress,
  icon,
  primary = false,
  style,
  disabled,
}: AuthOptionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primary : styles.secondary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, primary ? styles.labelPrimary : styles.labelSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: Radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  primary: {
    backgroundColor: Brand.accent,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: Brand.background,
    borderWidth: 1.5,
    borderColor: Brand.border,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  labelPrimary: {
    color: Brand.onAccent,
    fontWeight: '700',
  },
  labelSecondary: {
    color: Brand.text,
  },
});
