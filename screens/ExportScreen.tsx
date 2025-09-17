
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useExpenses } from '../hooks/useExpenses';
import { useDiary } from '../hooks/useDiary';
import Icon from '../components/Icon';

export default function ExportScreen() {
  const { expenses, getTotalExpenses } = useExpenses();
  const { entries } = useDiary();
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const generateExpensesHTML = (includeImages: boolean = false) => {
    const total = getTotalExpenses();
    const expenseRows = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(expense => `
        <tr>
          <td>${expense.date}</td>
          <td>${expense.description}</td>
          <td>${expense.category}</td>
          <td>${formatCurrency(expense.amount)}</td>
        </tr>
      `).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Motorhome Build Expenses</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${expenseRows}
            </tbody>
          </table>
          
          <div class="total">
            Total Expenses: ${formatCurrency(total)}
          </div>
        </body>
      </html>
    `;
  };

  const generateDiaryHTML = (includeImages: boolean = false) => {
    const entryContent = entries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(entry => `
        <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
          <h3>${entry.title}</h3>
          <p style="color: #666; font-size: 14px;">${new Date(entry.date).toLocaleDateString()}</p>
          <p>${entry.content.replace(/\n/g, '<br>')}</p>
          ${entry.images.length > 0 ? `<p style="color: #666; font-size: 12px;">📷 ${entry.images.length} photo(s) attached</p>` : ''}
        </div>
      `).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; }
            h3 { color: #333; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>Motorhome Build Diary</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          
          ${entryContent}
        </body>
      </html>
    `;
  };

  const generateCompleteHTML = (includeImages: boolean = false) => {
    const total = getTotalExpenses();
    const expenseRows = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(expense => `
        <tr>
          <td>${expense.date}</td>
          <td>${expense.description}</td>
          <td>${expense.category}</td>
          <td>${formatCurrency(expense.amount)}</td>
        </tr>
      `).join('');

    const entryContent = entries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(entry => `
        <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
          <h3>${entry.title}</h3>
          <p style="color: #666; font-size: 14px;">${new Date(entry.date).toLocaleDateString()}</p>
          <p>${entry.content.replace(/\n/g, '<br>')}</p>
          ${entry.images.length > 0 ? `<p style="color: #666; font-size: 12px;">📷 ${entry.images.length} photo(s) attached</p>` : ''}
        </div>
      `).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; }
            h2 { color: #333; margin-top: 40px; }
            h3 { color: #333; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <h1>Complete Motorhome Build Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          
          <h2>Expenses Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${expenseRows}
            </tbody>
          </table>
          
          <div class="total">
            Total Expenses: ${formatCurrency(total)}
          </div>
          
          <div class="page-break">
            <h2>Build Diary</h2>
            ${entryContent}
          </div>
        </body>
      </html>
    `;
  };

  const exportPDF = async (type: 'expenses' | 'diary' | 'complete', includeImages: boolean = false) => {
    try {
      setIsExporting(true);
      
      let html = '';
      
      switch (type) {
        case 'expenses':
          html = generateExpensesHTML(includeImages);
          break;
        case 'diary':
          html = generateDiaryHTML(includeImages);
          break;
        case 'complete':
          html = generateCompleteHTML(includeImages);
          break;
      }

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export Motorhome Build Report',
        });
      } else {
        Alert.alert('Success', 'PDF generated successfully!');
      }
    } catch (error) {
      console.log('Export error:', error);
      Alert.alert('Error', 'Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const showExportOptions = (type: 'expenses' | 'diary' | 'complete') => {
    Alert.alert(
      'Export Options',
      'Choose export format:',
      [
        {
          text: 'Without Images',
          onPress: () => exportPDF(type, false),
        },
        {
          text: 'With Images',
          onPress: () => exportPDF(type, true),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <Text style={commonStyles.title}>Export Data</Text>
        
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Export Options</Text>
          <Text style={commonStyles.textSecondary}>
            Generate PDF reports of your motorhome build progress and expenses.
          </Text>
        </View>

        <View style={commonStyles.card}>
          <View style={styles.exportOption}>
            <View style={styles.optionInfo}>
              <Icon name="receipt-outline" size={24} color={colors.primary} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Expenses Only</Text>
                <Text style={commonStyles.textSecondary}>
                  Export all expenses with categories and totals
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, buttonStyles.small]}
              onPress={() => showExportOptions('expenses')}
              disabled={isExporting || expenses.length === 0}
            >
              <Text style={{ color: colors.backgroundAlt }}>
                {isExporting ? 'Exporting...' : 'Export'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={commonStyles.card}>
          <View style={styles.exportOption}>
            <View style={styles.optionInfo}>
              <Icon name="book-outline" size={24} color={colors.success} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Diary Only</Text>
                <Text style={commonStyles.textSecondary}>
                  Export all diary entries with progress notes
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, buttonStyles.small]}
              onPress={() => showExportOptions('diary')}
              disabled={isExporting || entries.length === 0}
            >
              <Text style={{ color: colors.backgroundAlt }}>
                {isExporting ? 'Exporting...' : 'Export'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={commonStyles.card}>
          <View style={styles.exportOption}>
            <View style={styles.optionInfo}>
              <Icon name="document-text-outline" size={24} color={colors.warning} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Complete Report</Text>
                <Text style={commonStyles.textSecondary}>
                  Export everything: expenses, diary, and vehicle profile
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, buttonStyles.small]}
              onPress={() => showExportOptions('complete')}
              disabled={isExporting || (expenses.length === 0 && entries.length === 0)}
            >
              <Text style={{ color: colors.backgroundAlt }}>
                {isExporting ? 'Exporting...' : 'Export'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Data Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={commonStyles.text}>Total Expenses:</Text>
            <Text style={styles.summaryValue}>{expenses.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={commonStyles.text}>Diary Entries:</Text>
            <Text style={styles.summaryValue}>{entries.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={commonStyles.text}>Total Amount:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(getTotalExpenses())}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
