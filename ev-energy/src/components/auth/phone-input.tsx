import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextInput as TextInputType,
} from 'react-native';

import { Brand, Radii, Spacing } from '@/constants/theme';

type PhoneInputProps = {
  countryCode?: string;
  value: string;
  onChangeText: (value: string) => void;
} & Pick<TextInputProps, 'onSubmitEditing' | 'autoFocus'>;

export const PhoneInput = forwardRef<TextInputType, PhoneInputProps>(function PhoneInput(
  { countryCode = '+91', value, onChangeText, onSubmitEditing, autoFocus },
  ref,
) {
  return (
    <View style={styles.row}>
      <View style={styles.codeBox}>
        <Text style={styles.code}>{countryCode}</Text>
      </View>
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, 10))}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        autoFocus={autoFocus}
        placeholder="Phone number"
        placeholderTextColor="#B0B0B8"
        maxLength={10}
        returnKeyType="done"
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  codeBox: {
    minHeight: 56,
    minWidth: 72,
    borderRadius: Radii.button,
    borderWidth: 1.5,
    borderColor: Brand.border,
    backgroundColor: Brand.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  code: {
    color: Brand.text,
    fontSize: 17,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    minHeight: 56,
    borderRadius: Radii.button,
    borderWidth: 1.5,
    borderColor: Brand.border,
    backgroundColor: Brand.background,
    paddingHorizontal: Spacing.three,
    color: Brand.text,
    fontSize: 17,
    fontWeight: '500',
  },
});
