// Step2.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import MobileLayout from '../../../components/MobilelLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Step2'>;

export default function Step2({ route }: Props) {
  const { categoryId, categoryName } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <MobileLayout style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.categoryName} weight="bold">
            {categoryName}
          </Text>
        </View>
        <View style={styles.content}>
          <Text>카테고리 ID: {categoryId}</Text>
          <Text>카테고리 이름: {categoryName}</Text>
          {/* 여기에 Step2의 실제 컨텐츠를 추가하세요 */}
        </View>
      </ScrollView>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 80,
  },
  header: {
    paddingVertical: 20,
  },
  categoryName: {
    fontSize: 20,
    color: '#111827',
  },
  content: {
    flex: 1,
    gap: 16,
  },
});
