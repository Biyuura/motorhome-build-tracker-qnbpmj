
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { Category } from '../types';
import { useCategories } from '../hooks/useCategories';
import SimpleBottomSheet from './BottomSheet';
import Icon from './Icon';

interface CategoryPickerProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onManageCategories: () => void;
}

export default function CategoryPicker({
  selectedCategory,
  onCategorySelect,
  onManageCategories,
}: CategoryPickerProps) {
  const { categories } = useCategories();
  const [isVisible, setIsVisible] = useState(false);

  const selectedCategoryData = categories.find(c => c.name === selectedCategory);

  return (
    <>
      <TouchableOpacity
        style={[commonStyles.input, styles.picker]}
        onPress={() => setIsVisible(true)}
      >
        <View style={styles.pickerContent}>
          {selectedCategoryData && (
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: selectedCategoryData.color },
              ]}
            />
          )}
          <Text style={styles.pickerText}>
            {selectedCategory || 'Select Category'}
          </Text>
          <Icon name="chevron-down" size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      <SimpleBottomSheet
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.header}>
            <Text style={commonStyles.subtitle}>Select Category</Text>
            <TouchableOpacity
              onPress={() => {
                setIsVisible(false);
                onManageCategories();
              }}
              style={styles.manageButton}
            >
              <Icon name="settings-outline" size={20} color={colors.primary} />
              <Text style={styles.manageText}>Manage</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.categoryList}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.name && styles.selectedCategory,
                ]}
                onPress={() => {
                  onCategorySelect(category.name);
                  setIsVisible(false);
                }}
              >
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: category.color },
                  ]}
                />
                <Text style={styles.categoryName}>{category.name}</Text>
                {selectedCategory === category.name && (
                  <Icon name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SimpleBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  picker: {
    marginBottom: 0,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  bottomSheetContent: {
    padding: 20,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.background,
  },
  manageText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  selectedCategory: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
});
