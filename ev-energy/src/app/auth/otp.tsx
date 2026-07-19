import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OtpInput } from '@/components/auth/otp-input';
import { BackButton } from '@/components/map/back-button';
import { Brand, Spacing } from '@/constants/theme';
import {
  DEFAULT_COUNTRY_CODE,
  OTP_RESEND_SECONDS,
  formatPhoneDisplay,
  sendOtp,
  verifyOtp,
} from '@/services/auth';

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone?: string; countryCode?: string }>();
  const phone = typeof params.phone === 'string' ? params.phone : '';
  const countryCode =
    typeof params.countryCode === 'string' ? params.countryCode : DEFAULT_COUNTRY_CODE;

  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const handleVerify = useCallback(
    async (otp: string) => {
      if (verifyingRef.current) {
        return;
      }
      verifyingRef.current = true;
      setVerifying(true);
      setError(null);
      try {
        const result = await verifyOtp(otp);
        if (!result.ok) {
          setError(result.error ?? 'Invalid code.');
          setCode('');
          return;
        }
        router.replace('/map');
      } catch {
        setError('Verification failed. Please try again.');
        setCode('');
      } finally {
        verifyingRef.current = false;
        setVerifying(false);
      }
    },
    [],
  );

  const handleResend = async () => {
    if (secondsLeft > 0 || !phone) {
      return;
    }
    setError(null);
    setCode('');
    await sendOtp(phone);
    setSecondsLeft(OTP_RESEND_SECONDS);
  };

  const timerLabel = `00:${String(secondsLeft).padStart(2, '0')}`;
  const displayPhone = formatPhoneDisplay(countryCode, phone);

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
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{'\n'}
          <Text style={styles.phone}>{displayPhone}</Text>
        </Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [styles.changeNumber, pressed && styles.pressed]}>
          <Text style={styles.changeNumberLabel}>Change number</Text>
        </Pressable>
      </View>

      <View style={styles.otpWrap}>
        <OtpInput value={code} onChange={setCode} onComplete={(otp) => void handleVerify(otp)} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {verifying ? (
          <View style={styles.verifying}>
            <ActivityIndicator color={Brand.onAccent} />
            <Text style={styles.verifyingLabel}>Verifying…</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        {secondsLeft > 0 ? (
          <Text style={styles.timer}>
            Resend code in <Text style={styles.timerAccent}>{timerLabel}</Text>
          </Text>
        ) : (
          <Pressable
            onPress={() => void handleResend()}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.resend}>Resend code</Text>
          </Pressable>
        )}
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
  phone: {
    color: Brand.accent,
    fontWeight: '700',
  },
  changeNumber: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
  changeNumberLabel: {
    color: Brand.accentDark,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  otpWrap: {
    marginTop: Spacing.five,
    gap: Spacing.three,
  },
  error: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
  verifying: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  verifyingLabel: {
    color: Brand.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: Spacing.four,
    alignItems: 'center',
  },
  timer: {
    color: Brand.textSecondary,
    fontSize: 15,
  },
  timerAccent: {
    color: Brand.accent,
    fontWeight: '700',
  },
  resend: {
    color: Brand.accent,
    fontSize: 15,
    fontWeight: '700',
  },
});
