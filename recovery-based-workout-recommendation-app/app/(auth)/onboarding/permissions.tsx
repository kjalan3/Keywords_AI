// app/(auth)/onboarding/permissions.tsx
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Permission = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  required: boolean;
};

const PERMISSIONS: Permission[] = [
  {
    id: 'health',
    title: 'Apple Health',
    description: 'Read HRV and sleep data to optimize your workouts',
    icon: 'heart',
    color: '#FF3B30',
    required: false,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Get reminders for rest timers and workout schedules',
    icon: 'notifications',
    color: '#007AFF',
    required: false,
  },
];

export default function PermissionsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const [grantedPermissions, setGrantedPermissions] = useState<string[]>([]);

  const requestHealthKitPermission = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'HealthKit is only available on iOS devices');
      return false;
    }

    try {
      // TODO: Implement actual HealthKit permission request
      // const AppleHealthKit = require('react-native-health');
      // const permissions = {
      //   permissions: {
      //     read: [
      //       AppleHealthKit.Constants.Permissions.HeartRateVariability,
      //       AppleHealthKit.Constants.Permissions.SleepAnalysis,
      //     ],
      //     write: [
      //       AppleHealthKit.Constants.Permissions.Steps,
      //       AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      //     ],
      //   },
      // };
      // await AppleHealthKit.initHealthKit(permissions);

      // For now, simulate success
      return true;
    } catch (error) {
      console.error('HealthKit permission error:', error);
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    try {
      // TODO: Implement actual notification permission request
      // const { status } = await Notifications.requestPermissionsAsync();
      // return status === 'granted';

      // For now, simulate success
      return true;
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  };

  const handleRequestPermissions = async () => {
    setRequestingPermissions(true);
    const granted: string[] = [];

    // Request Health permission
    const healthGranted = await requestHealthKitPermission();
    if (healthGranted) granted.push('health');

    // Request Notification permission
    const notificationGranted = await requestNotificationPermission();
    if (notificationGranted) granted.push('notifications');

    setGrantedPermissions(granted);
    setRequestingPermissions(false);

    // Save permissions to user metadata
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          permissions: granted,
          onboardingStep: 'permissions-complete',
        },
      });
    } catch (error) {
      console.error('Error saving permissions:', error);
    }
  };

  const handleContinue = async () => {
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboardingComplete: true,
          onboardingCompletedAt: new Date().toISOString(),
        },
      });
      router.replace('/(auth)/onboarding/complete');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete onboarding');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Permissions?',
      'You can enable these later in settings, but some features may be limited.',
      [
        { text: 'Go Back', style: 'cancel' },
        { text: 'Skip', style: 'destructive', onPress: handleContinue },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Enable Smart Features</Text>
        <Text style={styles.subtitle}>
          Grant permissions to unlock AI-powered recommendations and personalized insights
        </Text>

        <View style={styles.permissionsContainer}>
          {PERMISSIONS.map((permission) => {
            const isGranted = grantedPermissions.includes(permission.id);
            return (
              <View
                key={permission.id}
                style={[
                  styles.permissionCard,
                  isGranted && styles.permissionCardGranted,
                ]}
              >
                <View
                  style={[
                    styles.permissionIcon,
                    { backgroundColor: permission.color },
                  ]}
                >
                  <Ionicons name={permission.icon} size={28} color="#fff" />
                </View>
                <View style={styles.permissionContent}>
                  <View style={styles.permissionHeader}>
                    <Text style={styles.permissionTitle}>{permission.title}</Text>
                    {isGranted && (
                      <View style={styles.grantedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.grantedText}>Enabled</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.permissionDescription}>
                    {permission.description}
                  </Text>
                  {permission.required && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>REQUIRED</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Why We Need This Section */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Why we need this</Text>
            <Text style={styles.infoText}>
              HRV and sleep data help our AI determine your recovery status. This allows
              us to adjust workout intensity and prevent overtraining.
            </Text>
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={20} color="#8E8E93" />
          <Text style={styles.privacyText}>
            Your health data is private and never shared with third parties
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {grantedPermissions.length === 0 ? (
          <>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.enableButton,
                requestingPermissions && styles.enableButtonDisabled,
              ]}
              onPress={handleRequestPermissions}
              disabled={requestingPermissions}
            >
              <Text style={styles.enableButtonText}>
                {requestingPermissions ? 'Requesting...' : 'Enable All'}
              </Text>
              {!requestingPermissions && (
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
    width: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
    lineHeight: 22,
  },
  permissionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  permissionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  permissionCardGranted: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  permissionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  permissionContent: {
    flex: 1,
  },
  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  grantedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  grantedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 8,
  },
  requiredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  privacyText: {
    fontSize: 13,
    color: '#8E8E93',
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  enableButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  enableButtonDisabled: {
    opacity: 0.6,
  },
  enableButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
