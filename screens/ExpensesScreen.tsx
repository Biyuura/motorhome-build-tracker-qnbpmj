
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useExpenses } from '../hooks/useExpenses';
import { Expense } from '../types';
import SimpleBottomSheet from '../components/BottomSheet';
import CategoryPicker from '../components/CategoryPicker';
import CategoryManager from '../components/CategoryManager';
import ImagePicker from '../components/ImagePicker';
import Icon from '../components/Icon';

export default function ExpensesScreen() {
  const { expenses, addExpense, deleteExpense, getTotalExpenses } = useExpenses();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isCategoryManagerVisible, setIsCategoryManagerVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [receiptImages, setReceiptImages] = useState<string[]>([]);

  const handleAddExpense = async () => {
    if (!amount || !description || !category) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      description,
      category,
      date: new Date().toISOString().split('T')[0],
      receiptImage: receiptImages[0], // For now, just use the first image
      createdAt: new Date().toISOString(),
    };

    await addExpense(expense);
    
    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
    setReceiptImages([]);
    setIsAddModalVisible(false);
  };

  const handleDeleteExpense = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(expense.id) },
      ]
    );
  };

  const handleManageCategories = () => {
    console.log('Opening category manager from expenses screen');
    setIsAddModalVisible(false);
    // Add a small delay to ensure the add modal closes first
    setTimeout(() => {
      setIsCategoryManagerVisible(true);
    }, 100);
  };

  const handleCloseCategoryManager = () => {
    console.log('Closing category manager');
    setIsCategoryManagerVisible(false);
    // Reopen the add expense modal after closing category manager
    setTimeout(() => {
      setIsAddModalVisible(true);
    }, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>Expenses</Text>
          <TouchableOpacity
            style={[buttonStyles.primary, buttonStyles.small]}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Icon name="add" size={20} color={colors.backgroundAlt} />
          </TouchableOpacity>
        </View>

        <View style={[commonStyles.card, styles.summaryCard]}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(getTotalExpenses())}</Text>
        </View>

        <ScrollView style={styles.expensesList} showsVerticalScrollIndicator={false}>
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No expenses yet</Text>
              <Text style={commonStyles.textSecondary}>
                Tap the + button to add your first expense
              </Text>
            </View>
          ) : (
            expenses
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((expense) => (
                <View key={expense.id} style={commonStyles.card}>
                  <View style={commonStyles.row}>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseDescription}>{expense.description}</Text>
                      <Text style={commonStyles.textSecondary}>
                        {expense.category} • {expense.date}
                      </Text>
                    </View>
                    <View style={styles.expenseActions}>
                      <Text style={styles.expenseAmount}>
                        {formatCurrency(expense.amount)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteExpense(expense)}
                        style={styles.deleteButton}
                      >
                        <Icon name="trash-outline" size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
          )}
        </ScrollView>
      </View>

      {/* Add Expense Modal */}
      <SimpleBottomSheet
        isVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={[commonStyles.subtitle, styles.modalTitle]}>Add Expense</Text>
          
          <View style={styles.formSection}>
            <TextInput
              style={commonStyles.input}
              placeholder="Amount (€)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
            
            <TextInput
              style={commonStyles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={colors.textSecondary}
            />
            
            <CategoryPicker
              selectedCategory={category}
              onCategorySelect={setCategory}
              onManageCategories={handleManageCategories}
            />
            
            <ImagePicker
              images={receiptImages}
              onImagesChange={setReceiptImages}
              maxImages={1}
              label="Receipt Photo (Optional)"
            />
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[buttonStyles.secondary, styles.actionButton]}
              onPress={() => setIsAddModalVisible(false)}
            >
              <Text style={[buttonStyles.secondaryText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.actionButton]}
              onPress={handleAddExpense}
            >
              <Text style={[buttonStyles.primaryText, { color: colors.backgroundAlt }]}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SimpleBottomSheet>

      {/* Category Manager Modal */}
      <SimpleBottomSheet
        isVisible={isCategoryManagerVisible}
        onClose={() => setIsCategoryManagerVisible(false)}
      >
        <CategoryManager
          onClose={handleCloseCategoryManager}
        />
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
  summaryCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  expensesList: {
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
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  expenseActions: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 30,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
