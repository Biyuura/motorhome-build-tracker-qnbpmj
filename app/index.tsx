
import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { commonStyles } from '../styles/commonStyles';
import { TabName } from '../types';
import TabBar from '../components/TabBar';
import ExpensesScreen from '../screens/ExpensesScreen';
import DiaryScreen from '../screens/DiaryScreen';
import VehicleProfileScreen from '../screens/VehicleProfileScreen';
import ExportScreen from '../screens/ExportScreen';

export default function MainScreen() {
  const [activeTab, setActiveTab] = useState<TabName>('expenses');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'expenses':
        return <ExpensesScreen />;
      case 'diary':
        return <DiaryScreen />;
      case 'profile':
        return <VehicleProfileScreen />;
      case 'export':
        return <ExportScreen />;
      default:
        return <ExpensesScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={commonStyles.wrapper}>
        {renderActiveScreen()}
        <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </SafeAreaProvider>
  );
}
