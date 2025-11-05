import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';

export type TabItem = { id: string; label: string };

type Props = {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  style?: ViewStyle;
};

export default function SegmentedTabs({
  tabs,
  activeTab,
  onTabChange,
  style,
}: Props) {
  return (
    <View style={[S.wrap, style]}>
      <View style={S.container}>
        {tabs.map(tab => {
          const active = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              android_ripple={{ color: '#00000010' }}
              style={[S.item, active && S.itemActive]}
            >
              <Text
                weight={active ? 'semiBold' : 'regular'}
                style={[S.label, active ? S.labelActive : S.labelInactive]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { width: '100%' },
  container: {
    height: 46,
    backgroundColor: '#FAFAFA',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  item: {
    flex: 1,
    height: 36,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActive: { backgroundColor: '#6ABFB8' },
  label: { fontSize: 14, lineHeight: 20 },
  labelActive: { color: '#FFFFFF' },
  labelInactive: { color: '#284542' },
});
