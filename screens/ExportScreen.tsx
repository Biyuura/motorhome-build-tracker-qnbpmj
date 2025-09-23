
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
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

  const convertImageToBase64 = async (imageUri: string): Promise<string | null> => {
    try {
      console.log('Converting image to base64:', imageUri);
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Determine the image type from the URI
      const imageType = imageUri.toLowerCase().includes('.png') ? 'png' : 'jpeg';
      return `data:image/${imageType};base64,${base64}`;
    } catch (error) {
      console.log('Error converting image to base64:', error);
      return null;
    }
  };

  const generateExpensesHTML = async (includeImages: boolean = false) => {
    const total = getTotalExpenses();
    const sortedExpenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let expenseRows = '';
    
    for (const expense of sortedExpenses) {
      let imageHtml = '';
      
      if (includeImages && expense.receiptImage) {
        console.log('Processing receipt image for expense:', expense.description);
        const base64Image = await convertImageToBase64(expense.receiptImage);
        if (base64Image) {
          imageHtml = `
            <div style="margin-top: 10px;">
              <img src="${base64Image}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;" alt="Receipt" />
            </div>
          `;
        }
      }
      
      expenseRows += `
        <tr>
          <td>
            <div>${expense.date}</div>
            <div style="font-size: 12px; color: #666;">${expense.description}</div>
            <div style="font-size: 12px; color: #666;">${expense.category}</div>
            ${imageHtml}
          </td>
          <td style="text-align: right; vertical-align: top;">
            <strong>${formatCurrency(expense.amount)}</strong>
          </td>
        </tr>
      `;
    }

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; }
            img { display: block; margin-top: 8px; }
          </style>
        </head>
        <body>
          <h1>Motorhome Build Expenses</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>Expense Details</th>
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

  const generateDiaryHTML = async (includeImages: boolean = false) => {
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let entryContent = '';
    
    for (const entry of sortedEntries) {
      let imagesHtml = '';
      
      if (includeImages && entry.images.length > 0) {
        console.log('Processing images for diary entry:', entry.title);
        const imagePromises = entry.images.map(imageUri => convertImageToBase64(imageUri));
        const base64Images = await Promise.all(imagePromises);
        
        const validImages = base64Images.filter(img => img !== null);
        if (validImages.length > 0) {
          imagesHtml = `
            <div style="margin-top: 15px;">
              <div style="font-weight: bold; margin-bottom: 10px; color: #666;">Photos:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${validImages.map(img => `
                  <img src="${img}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;" alt="Diary photo" />
                `).join('')}
              </div>
            </div>
          `;
        }
      }
      
      entryContent += `
        <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 5px;">${entry.title}</h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 10px;">${new Date(entry.date).toLocaleDateString()}</p>
          <p style="line-height: 1.6;">${entry.content.replace(/\n/g, '<br>')}</p>
          ${imagesHtml}
          ${!includeImages && entry.images.length > 0 ? `<p style="color: #666; font-size: 12px; margin-top: 10px;">📷 ${entry.images.length} photo(s) attached</p>` : ''}
        </div>
      `;
    }

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; }
            h3 { color: #333; margin-bottom: 5px; }
            img { display: inline-block; margin: 5px; }
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

  const generateCompleteHTML = async (includeImages: boolean = false) => {
    const total = getTotalExpenses();
    const sortedExpenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Generate expenses section
    let expenseRows = '';
    for (const expense of sortedExpenses) {
      let imageHtml = '';
      
      if (includeImages && expense.receiptImage) {
        console.log('Processing receipt image for complete report:', expense.description);
        const base64Image = await convertImageToBase64(expense.receiptImage);
        if (base64Image) {
          imageHtml = `
            <div style="margin-top: 10px;">
              <img src="${base64Image}" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px;" alt="Receipt" />
            </div>
          `;
        }
      }
      
      expenseRows += `
        <tr>
          <td>
            <div>${expense.date}</div>
            <div style="font-size: 12px; color: #666;">${expense.description}</div>
            <div style="font-size: 12px; color: #666;">${expense.category}</div>
            ${imageHtml}
          </td>
          <td style="text-align: right; vertical-align: top;">
            <strong>${formatCurrency(expense.amount)}</strong>
          </td>
        </tr>
      `;
    }

    // Generate diary section
    let entryContent = '';
    for (const entry of sortedEntries) {
      let imagesHtml = '';
      
      if (includeImages && entry.images.length > 0) {
        console.log('Processing images for complete report diary entry:', entry.title);
        const imagePromises = entry.images.map(imageUri => convertImageToBase64(imageUri));
        const base64Images = await Promise.all(imagePromises);
        
        const validImages = base64Images.filter(img => img !== null);
        if (validImages.length > 0) {
          imagesHtml = `
            <div style="margin-top: 15px;">
              <div style="font-weight: bold; margin-bottom: 10px; color: #666;">Photos:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${validImages.map(img => `
                  <img src="${img}" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px;" alt="Diary photo" />
                `).join('')}
              </div>
            </div>
          `;
        }
      }
      
      entryContent += `
        <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 5px;">${entry.title}</h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 10px;">${new Date(entry.date).toLocaleDateString()}</p>
          <p style="line-height: 1.6;">${entry.content.replace(/\n/g, '<br>')}</p>
          ${imagesHtml}
          ${!includeImages && entry.images.length > 0 ? `<p style="color: #666; font-size: 12px; margin-top: 10px;">📷 ${entry.images.length} photo(s) attached</p>` : ''}
        </div>
      `;
    }

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; }
            h2 { color: #333; margin-top: 40px; }
            h3 { color: #333; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; }
            .page-break { page-break-before: always; }
            img { display: inline-block; margin: 5px; }
          </style>
        </head>
        <body>
          <h1>Complete Motorhome Build Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          
          <h2>Expenses Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Expense Details</th>
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
      console.log(`Starting PDF export: ${type}, includeImages: ${includeImages}`);
      
      let html = '';
      
      switch (type) {
        case 'expenses':
          html = await generateExpensesHTML(includeImages);
          break;
        case 'diary':
          html = await generateDiaryHTML(includeImages);
          break;
        case 'complete':
          html = await generateCompleteHTML(includeImages);
          break;
      }

      console.log('Generated HTML, creating PDF...');
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      console.log('PDF created at:', uri);
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
