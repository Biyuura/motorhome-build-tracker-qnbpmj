
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../types';
import Icon from './Icon';

interface CategoryManagerProps {
  onClose: () => void;
}

export default function CategoryManager({ onClose }: CategoryManagerProps) {
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useCategories();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [isAddingNew, setIsAddingNew] = useState(false);

  console.log('CategoryManager rendered with categories:', categories.length);
  console.log('Loading state:', loading);
  console.log('Is adding new:', isAddingNew);
  console.log('Editing category:', editingCategory?.name);

  const predefinedColors = [
    '#ef4444', '#f59e0b', '#3b82f6', '#10b981', 
    '#8b5cf6', '#f97316', '#06b6d4', '#64748b',
    '#ec4899', '#84cc16', '#f43f5e', '#14b8a6'
  ];

  const handleAddCategory = async () => {
    console.log('Adding category:', newCategoryName);
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };

    await addCategory(newCategory);
    setNewCategoryName('');
    setNewCategoryColor('#3b82f6');
    setIsAddingNew(false);
  };

  const handleUpdateCategory = async () => {
    console.log('Updating category:', editingCategory?.name, 'to:', newCategoryName);
    if (!editingCategory || !newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }

    const updatedCategory: Category = {
      ...editingCategory,
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };

    await updateCategory(updatedCategory);
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryColor('#3b82f6');
  };

  const handleDeleteCategory = (category: Category) => {
    console.log('Deleting category:', category.name);
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteCategory(category.id) 
        },
      ]
    );
  };

  const startEditing = (category: Category) => {
    console.log('Starting to edit category:', category.name);
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setIsAddingNew(false);
  };

  const cancelEditing = () => {
    console.log('Canceling edit/add');
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryColor('#3b82f6');
    setIsAddingNew(false);
  };

  const startAddingNew = () => {
    console.log('Starting to add new category');
    setIsAddingNew(true);
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryColor('#3b82f6');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={commonStyles.subtitle}>Manage Categories</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Always show the Add button prominently */}
      {!isAddingNew && !editingCategory && (
        <TouchableOpacity
          style={[buttonStyles.primary, styles.addButton]}
          onPress={startAddingNew}
        >
          <Icon name="add" size={20} color={colors.backgroundAlt} />
          <Text style={[buttonStyles.primaryText, { color: colors.backgroundAlt, marginLeft: 8 }]}>
            Add New Category
          </Text>
        </TouchableOpacity>
      )}

      {/* Form section for adding/editing */}
      {(isAddingNew || editingCategory) && (
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Category name"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            placeholderTextColor={colors.textSecondary}
            autoFocus={true}
          />

          <Text style={styles.colorLabel}>Color</Text>
          <View style={styles.colorPicker}>
            {predefinedColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newCategoryColor === color && styles.selectedColor,
                ]}
                onPress={() => setNewCategoryColor(color)}
              >
                {newCategoryColor === color && (
                  <Icon name="checkmark" size={16} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[buttonStyles.secondary, styles.actionButton]}
              onPress={cancelEditing}
            >
              <Text style={[buttonStyles.secondaryText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.actionButton]}
              onPress={editingCategory ? handleUpdateCategory : handleAddCategory}
            >
              <Text style={[buttonStyles.primaryText, { color: colors.backgroundAlt }]}>
                {editingCategory ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Categories list */}
      <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            Categories ({categories.length})
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={commonStyles.textSecondary}>Loading categories...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="folder-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No categories yet</Text>
            <Text style={commonStyles.textSecondary}>
              Add your first category to get started
            </Text>
          </View>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: category.color },
                  ]}
                />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <View style={styles.categoryActions}>
                <TouchableOpacity
                  onPress={() => startEditing(category)}
                  style={styles.actionIconButton}
                >
                  <Icon name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteCategory(category)}
                  style={styles.actionIconButton}
                >
                  <Icon name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    maxHeight: 700,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    minHeight: 48,
  },
  formSection: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: colors.text,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  categoriesList: {
    flex: 1,
  },
  listHeader: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconButton: {
    padding: 8,
  },
});
