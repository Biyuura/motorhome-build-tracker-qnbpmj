
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { TabName } from '../types';

interface TabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

const tabs = [
  { key: 'expenses' as TabName, label: 'Expenses', icon: 'receipt-outline' },
  { key: 'diary' as TabName, label: 'Diary', icon: 'book-outline' },
  { key: 'profile' as TabName, label: 'Vehicle', icon: 'car-outline' },
  { key: 'export' as TabName, label: 'Export', icon: 'download-outline' },
];

export default function TabBar({ activeTab, onTabPress }: TabBarProps) {
  return (
    <View style={[commonStyles.bottomTabBar, styles.container]}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <View style={styles.tabContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  commonStyles.tabButton,
                  isActive && commonStyles.tabButtonActive,
                ]}
                onPress={() => onTabPress(tab.key)}
              >
                <Icon
                  name={tab.icon as any}
                  size={24}
                  color={isActive ? colors.backgroundAlt : colors.text}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? colors.backgroundAlt : colors.text },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
