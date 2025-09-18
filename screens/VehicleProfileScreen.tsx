
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { VehicleProfile } from '../types';
import { StorageService } from '../data/storage';
import ImagePicker from '../components/ImagePicker';
import Icon from '../components/Icon';

export default function VehicleProfileScreen() {
  const [profile, setProfile] = useState<VehicleProfile>({
    manufacturer: '',
    motorhomeManufacturer: '',
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    profileImage: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileImages, setProfileImages] = useState<string[]>([]);

  // Store input values as strings to preserve decimal input
  const [inputValues, setInputValues] = useState({
    length: '0',
    width: '0',
    height: '0',
    weight: '0',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await StorageService.getVehicleProfile();
      if (savedProfile) {
        setProfile(savedProfile);
        setProfileImages(savedProfile.profileImage ? [savedProfile.profileImage] : []);
        // Update input values to show current values
        setInputValues({
          length: savedProfile.length > 0 ? savedProfile.length.toString() : '',
          width: savedProfile.width > 0 ? savedProfile.width.toString() : '',
          height: savedProfile.height > 0 ? savedProfile.height.toString() : '',
          weight: savedProfile.weight > 0 ? savedProfile.weight.toString() : '',
        });
      } else {
        setIsEditing(true); // Start in editing mode if no profile exists
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    if (!profile.manufacturer || !profile.motorhomeManufacturer) {
      Alert.alert('Error', 'Please fill in the manufacturer fields.');
      return;
    }

    try {
      const updatedProfile = {
        ...profile,
        profileImage: profileImages[0] || '',
      };
      
      await StorageService.saveVehicleProfile(updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Vehicle profile saved successfully!');
    } catch (error) {
      console.log('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    loadProfile(); // Reload original data
    setIsEditing(false);
  };

  const updateField = (field: keyof VehicleProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateDimensionField = (field: 'length' | 'width' | 'height' | 'weight', value: string) => {
    // Update the input value immediately for display
    setInputValues(prev => ({ ...prev, [field]: value }));
    
    // Parse and update the profile value
    const numericValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numericValue)) {
      updateField(field, numericValue);
    }
  };

  const formatDimension = (value: number, unit: string) => {
    if (value <= 0) return 'Not set';
    // Format to show up to 2 decimal places, removing trailing zeros
    const formatted = value.toFixed(2).replace(/\.?0+$/, '');
    return `${formatted} ${unit}`;
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>Vehicle Profile</Text>
          {!isEditing ? (
            <TouchableOpacity
              style={[buttonStyles.primary, buttonStyles.small]}
              onPress={() => setIsEditing(true)}
            >
              <Icon name="create-outline" size={20} color={colors.backgroundAlt} />
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[buttonStyles.secondary, buttonStyles.small, { marginRight: 8 }]}
                onPress={handleCancel}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[buttonStyles.primary, buttonStyles.small]}
                onPress={handleSave}
              >
                <Text style={{ color: colors.backgroundAlt }}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={commonStyles.card}>
          {isEditing ? (
            <ImagePicker
              images={profileImages}
              onImagesChange={setProfileImages}
              maxImages={1}
              label="Vehicle Photo"
            />
          ) : (
            profileImages.length > 0 && (
              <View style={styles.profileImageContainer}>
                <Text style={styles.sectionTitle}>Vehicle Photo</Text>
                {/* Image would be displayed here */}
              </View>
            )
          )}
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Vehicle Manufacturer</Text>
            {isEditing ? (
              <TextInput
                style={commonStyles.input}
                value={profile.manufacturer}
                onChangeText={(value) => updateField('manufacturer', value)}
                placeholder="e.g., Ford, Mercedes, Iveco"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={styles.fieldValue}>
                {profile.manufacturer || 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Motorhome Manufacturer</Text>
            {isEditing ? (
              <TextInput
                style={commonStyles.input}
                value={profile.motorhomeManufacturer}
                onChangeText={(value) => updateField('motorhomeManufacturer', value)}
                placeholder="e.g., Custom Build, Winnebago"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={styles.fieldValue}>
                {profile.motorhomeManufacturer || 'Not set'}
              </Text>
            )}
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Dimensions</Text>
          
          <View style={styles.dimensionsGrid}>
            <View style={styles.dimensionItem}>
              <Text style={styles.fieldLabel}>Length (m)</Text>
              {isEditing ? (
                <TextInput
                  style={[commonStyles.input, styles.dimensionInput]}
                  value={inputValues.length}
                  onChangeText={(value) => updateDimensionField('length', value)}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {formatDimension(profile.length, 'm')}
                </Text>
              )}
            </View>

            <View style={styles.dimensionItem}>
              <Text style={styles.fieldLabel}>Width (m)</Text>
              {isEditing ? (
                <TextInput
                  style={[commonStyles.input, styles.dimensionInput]}
                  value={inputValues.width}
                  onChangeText={(value) => updateDimensionField('width', value)}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {formatDimension(profile.width, 'm')}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.dimensionsGrid}>
            <View style={styles.dimensionItem}>
              <Text style={styles.fieldLabel}>Height (m)</Text>
              {isEditing ? (
                <TextInput
                  style={[commonStyles.input, styles.dimensionInput]}
                  value={inputValues.height}
                  onChangeText={(value) => updateDimensionField('height', value)}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {formatDimension(profile.height, 'm')}
                </Text>
              )}
            </View>

            <View style={styles.dimensionItem}>
              <Text style={styles.fieldLabel}>Weight (kg)</Text>
              {isEditing ? (
                <TextInput
                  style={[commonStyles.input, styles.dimensionInput]}
                  value={inputValues.weight}
                  onChangeText={(value) => updateDimensionField('weight', value)}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {formatDimension(profile.weight, 'kg')}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  editActions: {
    flexDirection: 'row',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: 8,
  },
  dimensionsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dimensionItem: {
    flex: 1,
  },
  dimensionInput: {
    marginBottom: 0,
  },
});
