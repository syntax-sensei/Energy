import { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';

import { Brand, Radii, Spacing } from '@/constants/theme';

const OTP_LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
};

/**
 * Single hidden TextInput drives six visual boxes — supports paste + SMS autofill.
 */
export function OtpInput({ value, onChange, autoFocus = true, onComplete }: OtpInputProps) {
  const inputRef = useRef<TextInputType>(null);
  const lastCompletedRef = useRef<string | null>(null);
  const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
  const digitList = digits.split('');

  const handleChange = (text: string) => {
    const next = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(next);
    if (next.length === OTP_LENGTH && next !== lastCompletedRef.current) {
      lastCompletedRef.current = next;
      onComplete?.(next);
    }
    if (next.length < OTP_LENGTH) {
      lastCompletedRef.current = null;
    }
  };

  return (
    <View>
      <Pressable style={styles.boxes} onPress={() => inputRef.current?.focus()}>
        {Array.from({ length: OTP_LENGTH }, (_, index) => {
          const digit = digitList[index] ?? '';
          const focused = digitList.length === index;
          return (
            <View
              key={index}
              style={[styles.box, focused && styles.boxFocused, digit ? styles.boxFilled : null]}>
              <Text style={styles.digit}>{digit}</Text>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={digits}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus={autoFocus}
        maxLength={OTP_LENGTH}
        caretHidden
        style={styles.hiddenInput}
        importantForAutofill="yes"
      />
    </View>
  );
}

export { OTP_LENGTH };

const styles = StyleSheet.create({
  boxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  box: {
    flex: 1,
    aspectRatio: 0.85,
    maxWidth: 52,
    borderRadius: Radii.button,
    borderWidth: 1.5,
    borderColor: Brand.border,
    backgroundColor: Brand.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: {
    borderColor: Brand.accent,
  },
  boxFilled: {
    borderColor: Brand.onAccent,
  },
  digit: {
    color: Brand.text,
    fontSize: 22,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0.02,
    height: 1,
    width: 1,
  },
});
