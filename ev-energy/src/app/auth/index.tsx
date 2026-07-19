import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppleAuthIcon,
  EmailAuthIcon,
  GoogleAuthIcon,
  PhoneAuthIcon,
} from '@/components/auth/auth-icons';
import { AuthOptionButton } from '@/components/auth/auth-option-button';
import { BackButton } from '@/components/map/back-button';
import { Brand, Spacing } from '@/constants/theme';

export default function AuthEntryScreen() {
  const insets = useSafeAreaInsets();
  const [showMore, setShowMore] = useState(false);

  const comingSoon = (provider: string) => {
    Alert.alert(provider, `${provider} sign-in will be available soon.`);
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
      <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />

      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login or sign up to continue.</Text>
      </View>

      <View style={styles.actions}>
        <AuthOptionButton
          primary
          label="Continue with Phone"
          icon={<PhoneAuthIcon />}
          onPress={() => router.push('/auth/phone')}
        />

        <AuthOptionButton
          label="Continue with Google"
          icon={<GoogleAuthIcon />}
          onPress={() => comingSoon('Google')}
        />

        {Platform.OS === 'ios' ? (
          <AuthOptionButton
            label="Continue with Apple"
            icon={<AppleAuthIcon />}
            onPress={() => comingSoon('Apple')}
          />
        ) : null}

        {showMore ? (
          <AuthOptionButton
            label="Continue with Email"
            icon={<EmailAuthIcon />}
            onPress={() => comingSoon('Email')}
          />
        ) : (
          <Pressable
            onPress={() => setShowMore(true)}
            hitSlop={8}
            style={({ pressed }) => [styles.more, pressed && styles.pressed]}>
            <Text style={styles.moreLabel}>More options</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.legal}>
          By continuing you agree to our{' '}
          <Text style={styles.legalLink} onPress={() => comingSoon('Terms of Service')}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.legalLink} onPress={() => comingSoon('Privacy Policy')}>
            Privacy Policy
          </Text>
          .
        </Text>
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
  actions: {
    marginTop: Spacing.five,
    gap: Spacing.three,
  },
  more: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  moreLabel: {
    color: Brand.accentDark,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.four,
  },
  legal: {
    color: Brand.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  legalLink: {
    color: Brand.accent,
    fontWeight: '700',
  },
});
