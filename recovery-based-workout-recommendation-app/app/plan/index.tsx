// app/plan/index.tsx
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTemplateStore } from '../../store/templateStore';

export default function TemplateListScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { templates, loadTemplates, deleteTemplate, isLoading } = useTemplateStore();

  useEffect(() => {
    if (user?.id) {
      loadTemplates(user.id);
    }
  }, [user?.id]);

  const handleCreateNew = () => {
    router.push('/plan/edit');
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/plan/edit?id=${templateId}` as any);
  };

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${templateName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTemplate(templateId);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Page Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout Templates</Text>
        <Text style={styles.subtitle}>
          Create and manage your workout templates
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Create New Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
          <View style={styles.createIconContainer}>
            <Ionicons name="add-circle" size={28} color="#007AFF" />
          </View>
          <View style={styles.createTextContainer}>
            <Text style={styles.createTitle}>Create New Template</Text>
            <Text style={styles.createSubtitle}>
              Build a custom workout plan
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
        </TouchableOpacity>

        {/* Templates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Templates</Text>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#007AFF"
              style={{ marginTop: 40 }}
            />
          ) : templates.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={64} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No Templates Yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first workout template to get started
              </Text>
            </View>
          ) : (
            templates.map((template) => (
              <View key={template.id} style={styles.templateCard}>
                <TouchableOpacity
                  style={styles.templateContent}
                  onPress={() => handleEditTemplate(template.id)}
                >
                  <View style={styles.templateIcon}>
                    <Ionicons name="barbell" size={24} color="#007AFF" />
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateMeta}>
                      {template.exercises.length} exercise
                      {template.exercises.length !== 1 ? 's' : ''}
                      {template.description ? ` • ${template.description}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    handleDeleteTemplate(template.id, template.name)
                  }
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  navigationHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 17,
    color: '#FF3B30',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  createIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  createTextContainer: {
    flex: 1,
  },
  createTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  createSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#C7C7CC',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  templateContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  templateMeta: {
    fontSize: 14,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 16,
    paddingLeft: 12,
  },
});
