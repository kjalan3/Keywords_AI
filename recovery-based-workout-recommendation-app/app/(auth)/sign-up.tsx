// app/(auth)/sign-up.tsx
import { useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setError('');
    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage || 'Failed to create account. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    console.log('Verify button pressed');
    console.log('Code:', code);

    if (!isLoaded) {
      Alert.alert('Error', 'Clerk is not loaded yet');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting verification...');
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      console.log('Verification attempt result:', signUpAttempt);
      console.log('Status:', signUpAttempt.status);

      // Check for complete status OR missing_requirements (which means verification succeeded)
      if (signUpAttempt.status === 'complete') {
        console.log('Status is complete, setting active session...');
        await setActive({ session: signUpAttempt.createdSessionId });
        console.log('Session active, redirecting...');

        Alert.alert('Success!', 'Account created successfully');
        router.replace('/(auth)/onboarding/welcome');
      } else if (signUpAttempt.status === 'missing_requirements') {
        // Verification succeeded but needs additional info
        // For now, just set the session active
        console.log('Missing requirements, but setting session...');
        await setActive({ session: signUpAttempt.createdSessionId });
        Alert.alert('Success!', 'Account created successfully');
        router.replace('/(auth)/onboarding/welcome');
      } else {
        console.log('Unexpected status:', signUpAttempt.status);
        console.log('Full attempt object:', JSON.stringify(signUpAttempt, null, 2));

        // Try to set session anyway if createdSessionId exists
        if (signUpAttempt.createdSessionId) {
          console.log('Found session ID, attempting to set active...');
          await setActive({ session: signUpAttempt.createdSessionId });
          Alert.alert('Success!', 'Account created successfully');
          router.replace('/(tabs)');
        } else {
          setError('Verification incomplete. Please try again.');
          Alert.alert('Error', 'Verification incomplete: ' + signUpAttempt.status);
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      console.error('Error code:', err.code);
      console.error('Error details:', JSON.stringify(err, null, 2));

      // Handle "already verified" error specifically
      if (err.errors?.[0]?.code === 'verification_already_verified' ||
        err.code === 'verification_already_verified') {
        console.log('Already verified, attempting to sign in...');

        // The user is already created, try to sign them in
        try {
          // Check if there's a session we can activate
          if (signUp.createdSessionId) {
            await setActive({ session: signUp.createdSessionId });
            Alert.alert('Success!', 'Welcome! Your account is ready.');
            router.replace('/(tabs)');
            return;
          }
        } catch (sessionErr) {
          console.error('Session activation error:', sessionErr);
        }

        // If no session, redirect to sign in
        setError('Account already verified. Please sign in.');
        Alert.alert(
          'Already Verified',
          'Your account is already verified. Please sign in.',
          [
            {
              text: 'Go to Sign In',
              onPress: () => router.replace('/(auth)/sign-in'),
            },
          ]
        );
        return;
      }

      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.message ||
        'Invalid verification code. Please try again.';
      setError(errorMessage);
      Alert.alert('Verification Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={64} color="#007AFF" />
            </View>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We sent a verification code to{'\n'}
              <Text style={styles.email}>{emailAddress}</Text>
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#c62828" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="key-outline"
                size={20}
                color="#8E8E93"
                style={styles.inputIcon}
              />
              <TextInput
                value={code}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#8E8E93"
                keyboardType="number-pad"
                maxLength={6}
                onChangeText={setCode}
                style={styles.input}
                editable={!isLoading}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
              onPress={onVerifyPress}
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify Email</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={onSignUpPress}
              disabled={isLoading}
            >
              <Text style={styles.resendButtonText}>Didn&apos;t receive code? Resend</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => setPendingVerification(false)}
              disabled={isLoading}
            >
              <Text style={styles.backLink}>← Back to Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your fitness journey today</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#c62828" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#8E8E93"
              style={styles.inputIcon}
            />
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={emailAddress}
              placeholder="Email"
              placeholderTextColor="#8E8E93"
              onChangeText={setEmailAddress}
              style={styles.input}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#8E8E93"
              style={styles.inputIcon}
            />
            <TextInput
              value={password}
              placeholder="Password (min. 8 characters)"
              placeholderTextColor="#8E8E93"
              secureTextEntry
              autoComplete="password-new"
              onChangeText={setPassword}
              style={styles.input}
              editable={!isLoading}
              onSubmitEditing={onSignUpPress}
            />
          </View>

          <View style={styles.passwordRequirements}>
            <Ionicons name="information-circle-outline" size={16} color="#8E8E93" />
            <Text style={styles.requirementsText}>
              Password must be at least 8 characters
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
            onPress={onSignUpPress}
            disabled={isLoading || !emailAddress || password.length < 8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.signUpButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity disabled={isLoading}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  email: {
    fontWeight: '600',
    color: '#007AFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    flex: 1,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1C1C1E',
  },
  passwordRequirements: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  requirementsText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  resendButton: {
    padding: 12,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  termsContainer: {
    paddingHorizontal: 4,
  },
  termsText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  signInLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});