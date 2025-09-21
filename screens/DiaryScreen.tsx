
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useDiary } from '../hooks/useDiary';
import { DiaryEntry } from '../types';
import SimpleBottomSheet from '../components/BottomSheet';
import ImagePicker from '../components/ImagePicker';
import Icon from '../components/Icon';

export default function DiaryScreen() {
  console.log('DiaryScreen rendering...');
  
  const { entries, addEntry, deleteEntry, loading } = useDiary();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);

  console.log('DiaryScreen entries count:', entries.length);

  const handleAddEntry = async () => {
    console.log('Adding new diary entry...');
    
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content.');
      return;
    }

    try {
      const now = new Date();
      const entry: DiaryEntry = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        date: now.toISOString().split('T')[0], // YYYY-MM-DD format
        images: images || [],
        createdAt: now.toISOString(),
      };

      console.log('Creating diary entry:', entry);
      await addEntry(entry);
      
      // Reset form
      setTitle('');
      setContent('');
      setImages([]);
      setIsAddModalVisible(false);
      
      console.log('Diary entry added successfully');
    } catch (error) {
      console.log('Error adding diary entry:', error);
      Alert.alert('Error', 'Failed to add diary entry. Please try again.');
    }
  };

  const handleDeleteEntry = (entry: DiaryEntry) => {
    console.log('Deleting diary entry:', entry.id);
    
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${entry.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteEntry(entry.id);
              console.log('Diary entry deleted successfully');
            } catch (error) {
              console.log('Error deleting diary entry:', error);
              Alert.alert('Error', 'Failed to delete diary entry. Please try again.');
            }
          }
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) {
        return 'Unknown date';
      }
      
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date string:', dateString);
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.log('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, commonStyles.centerContent]}>
          <Text style={commonStyles.text}>Loading diary entries...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>Build Diary</Text>
          <TouchableOpacity
            style={[buttonStyles.primary, buttonStyles.small]}
            onPress={() => {
              console.log('Opening add diary entry modal');
              setIsAddModalVisible(true);
            }}
          >
            <Icon name="add" size={20} color={colors.backgroundAlt} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.entriesList} showsVerticalScrollIndicator={false}>
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="book-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No diary entries yet</Text>
              <Text style={commonStyles.textSecondary}>
                Start documenting your motorhome build journey
              </Text>
            </View>
          ) : (
            entries.map((entry) => (
              <View key={entry.id} style={commonStyles.card}>
                <View style={commonStyles.row}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Text style={commonStyles.textSecondary}>
                      {formatDate(entry.createdAt || entry.date)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteEntry(entry)}
                    style={styles.deleteButton}
                  >
                    <Icon name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.entryContent} numberOfLines={3}>
                  {entry.content}
                </Text>
                
                {entry.images && entry.images.length > 0 && (
                  <View style={styles.imageIndicator}>
                    <Icon name="image-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.imageCount}>
                      {entry.images.length} photo{entry.images.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <SimpleBottomSheet
        isVisible={isAddModalVisible}
        onClose={() => {
          console.log('Closing add diary entry modal');
          setIsAddModalVisible(false);
        }}
      >
        <View style={styles.modalContent}>
          <Text style={commonStyles.subtitle}>New Diary Entry</Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Entry Title"
            value={title}
            onChangeText={(text) => {
              console.log('Title changed:', text);
              setTitle(text);
            }}
            placeholderTextColor={colors.textSecondary}
          />
          
          <TextInput
            style={[commonStyles.input, styles.contentInput]}
            placeholder="What did you work on today?"
            value={content}
            onChangeText={(text) => {
              console.log('Content changed length:', text.length);
              setContent(text);
            }}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor={colors.textSecondary}
          />
          
          <ImagePicker
            images={images}
            onImagesChange={(newImages) => {
              console.log('Images changed:', newImages.length);
              setImages(newImages);
            }}
            maxImages={5}
            label="Progress Photos (Optional)"
          />
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[buttonStyles.secondary, { flex: 1, marginRight: 8 }]}
              onPress={() => {
                console.log('Canceling diary entry');
                setIsAddModalVisible(false);
              }}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyles.primary, { flex: 1, marginLeft: 8 }]}
              onPress={handleAddEntry}
            >
              <Text style={{ color: colors.backgroundAlt }}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  entriesList: {
    flex: 1,
    marginBottom: 100, // Space for tab bar
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  entryContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 12,
  },
  imageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  imageCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  contentInput: {
    height: 120,
    paddingTop: 12,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
