// app/(tabs)/settings.tsx
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  color?: string;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const accountSettings: SettingItem[] = [
    {
      icon: 'person-outline',
      label: 'Profile',
      value: user?.emailAddresses[0]?.emailAddress,
      onPress: () => Alert.alert('Coming Soon', 'Profile editing coming soon!'),
    },
    {
      icon: 'fitness-outline',
      label: 'Fitness Goals',
      value: 'Muscle Gain',
      onPress: () => Alert.alert('Coming Soon', 'Goal editing coming soon!'),
    },
    {
      icon: 'calendar-outline',
      label: 'Workout Plan',
      onPress: () => router.push('/plan/edit' as any),
    },
  ];

  const appSettings: SettingItem[] = [
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings coming soon!'),
    },
    {
      icon: 'heart-outline',
      label: 'Health Integration',
      value: 'Connected',
      onPress: () => Alert.alert('Coming Soon', 'Health settings coming soon!'),
    },
    {
      icon: 'color-palette-outline',
      label: 'Appearance',
      value: 'System',
      onPress: () => Alert.alert('Coming Soon', 'Theme settings coming soon!'),
    },
  ];

  const otherSettings: SettingItem[] = [
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => Alert.alert('Coming Soon', 'Support coming soon!'),
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      value: 'v1.0.0',
      onPress: () => Alert.alert('FitTrack AI', 'Version 1.0.0\n\nBuilt with React Native'),
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.label}
      style={styles.settingItem}
      onPress={item.onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, item.color && { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={22} color={item.color ? '#fff' : '#007AFF'} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingLabel}>{item.label}</Text>
          {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.userEmail}>
          {user?.emailAddresses[0]?.emailAddress}
        </Text>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          {accountSettings.map(renderSettingItem)}
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.card}>
          {appSettings.map(renderSettingItem)}
        </View>
      </View>

      {/* Other */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other</Text>
        <View style={styles.card}>
          {otherSettings.map(renderSettingItem)}
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 13,
    color: '#8E8E93',
  },
  signOutButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
