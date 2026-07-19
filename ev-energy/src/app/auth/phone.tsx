import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhoneInput } from '@/components/auth/phone-input';
import { BackButton } from '@/components/map/back-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Brand, Spacing } from '@/constants/theme';
import {
  DEFAULT_COUNTRY_CODE,
  isValidIndianMobile,
  sendOtp,
} from '@/services/auth';

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canContinue = isValidIndianMobile(phone);

  const handleContinue = async () => {
    if (!canContinue || loading) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await sendOtp(phone);
      router.push({
        pathname: '/auth/otp',
        params: { phone, countryCode: DEFAULT_COUNTRY_CODE },
      });
    } catch {
      setError('Could not send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + Spacing.three,
          paddingBottom: Math.max(insets.bottom, Spacing.three) + Spacing.two,
        },
      ]}>
      <BackButton onPress={() => router.back()} />

      <View style={styles.header}>
        <Text style={styles.title}>Enter phone number</Text>
        <Text style={styles.subtitle}>
          We'll only use your phone number to verify your account.
        </Text>
      </View>

      <View style={styles.form}>
        <PhoneInput
          countryCode={DEFAULT_COUNTRY_CODE}
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            if (error) {
              setError(null);
            }
          }}
          autoFocus
          onSubmitEditing={() => void handleContinue()}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={loading ? 'Sending…' : 'Continue'}
          onPress={() => void handleContinue()}
          disabled={!canContinue || loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
    paddingHorizontal: Spacing.five,
  },
  header: {
    marginTop: Spacing.five,
    gap: Spacing.two,
  },
  title: {
    color: Brand.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    color: Brand.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    marginTop: Spacing.five,
    gap: Spacing.two,
  },
  error: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    gap: Spacing.three,
  },
});
