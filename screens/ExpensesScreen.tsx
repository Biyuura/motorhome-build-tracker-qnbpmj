
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useExpenses } from '../hooks/useExpenses';
import { Expense } from '../types';
import SimpleBottomSheet from '../components/BottomSheet';
import CategoryPicker from '../components/CategoryPicker';
import ImagePicker from '../components/ImagePicker';
import Icon from '../components/Icon';

export default function ExpensesScreen() {
  const { expenses, addExpense, deleteExpense, getTotalExpenses } = useExpenses();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

      <SimpleBottomSheet
        isVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={commonStyles.subtitle}>Add Expense</Text>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Amount"
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
            onManageCategories={() => {
              // TODO: Navigate to category management
              console.log('Manage categories');
            }}
          />
          
          <ImagePicker
            images={receiptImages}
            onImagesChange={setReceiptImages}
            maxImages={1}
            label="Receipt Photo (Optional)"
          />
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[buttonStyles.secondary, { flex: 1, marginRight: 8 }]}
              onPress={() => setIsAddModalVisible(false)}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyles.primary, { flex: 1, marginLeft: 8 }]}
              onPress={handleAddExpense}
            >
              <Text style={{ color: colors.backgroundAlt }}>Add Expense</Text>
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
    padding: 20,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
});
