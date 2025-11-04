// FeedWrite.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MobileLayout from '../../../components/MobilelLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'FeedWrite'>;

const categories = [
  { id: 1, name: '일상', icon: 'document-text', iconFamily: 'Ionicons' },
  { id: 2, name: '건강', icon: 'medical', iconFamily: 'Ionicons' },
  { id: 3, name: '식당', icon: 'restaurant', iconFamily: 'Ionicons' },
  { id: 4, name: '미용', icon: 'sparkles', iconFamily: 'Ionicons' },
  { id: 5, name: '음식', icon: 'fast-food', iconFamily: 'Ionicons' },
  { id: 6, name: '장난감', icon: 'heart', iconFamily: 'Ionicons' },
  { id: 7, name: '장소', icon: 'location', iconFamily: 'Ionicons' },
  { id: 8, name: '기타', icon: 'ellipsis-horizontal', iconFamily: 'Ionicons' },
];

const bottomNavItems = [
  { id: 1, label: '피드', icon: 'home', iconFamily: 'Ionicons' },
  { id: 2, label: '검색', icon: 'search', iconFamily: 'Ionicons' },
  {
    id: 3,
    label: '글쓰기',
    icon: 'add-circle',
    iconFamily: 'Ionicons',
    isActive: true,
  },
  {
    id: 4,
    label: '동물관리',
    icon: 'paw',
    iconFamily: 'MaterialCommunityIcons',
  },
  { id: 5, label: '내 공간', icon: 'person', iconFamily: 'Ionicons' },
];

export default function FeedWrite({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  const handleCategorySelect = (categoryId: number, categoryName: string) => {
    setSelectedCategory(categoryId);
    navigation.navigate('Step2', { categoryId, categoryName });
  };

  return (
    <MobileLayout style={styles.container}>
      {/* 상단 헤더 */}
      <View style={[styles.topHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>무엇을 기록할까요?</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* 메인 콘텐츠 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.spacer} />

        {/* 제목 영역 */}
        <View style={styles.titleSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle} weight="bold">
              어떤 이야기를 들려주실건가요?
            </Text>
          </View>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>카테고리를 선택해주세요</Text>
          </View>
        </View>

        {/* 카테고리 그리드 */}
        <View style={styles.categoryGrid}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected,
              ]}
              onPress={() => handleCategorySelect(category.id, category.name)}
            >
              <View style={styles.categoryIconContainer}>
                {category.iconFamily === 'Ionicons' ? (
                  <Icon name={category.icon} size={32} color="#FFFFFF" />
                ) : (
                  <MaterialCommunityIcons
                    name={category.icon}
                    size={32}
                    color="#FFFFFF"
                  />
                )}
              </View>
              <View style={styles.categoryLabelContainer}>
                <Text style={styles.categoryLabel}>{category.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 하단 네비게이션 바 */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        <View style={styles.bottomNavContent}>
          {bottomNavItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.bottomNavItem}
              disabled={item.isActive}
            >
              {item.isActive ? (
                <View style={styles.writeButton}>
                  <Icon name={item.icon} size={24} color="#FFFFFF" />
                </View>
              ) : (
                <>
                  <View style={styles.bottomNavIcon}>
                    {item.iconFamily === 'Ionicons' ? (
                      <Icon name={item.icon} size={24} color="#9CA3AF" />
                    ) : (
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={24}
                        color="#9CA3AF"
                      />
                    )}
                  </View>
                  <View style={styles.bottomNavLabelContainer}>
                    <Text style={styles.bottomNavLabel}>{item.label}</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    width: '100%',
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 0.01,
    height: 0.01,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 80,
    gap: 36,
  },
  spacer: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  titleSection: {
    width: '100%',
    height: 64,
    gap: 8,
  },
  titleContainer: {
    paddingBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitleContainer: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryGrid: {
    width: '100%',
    minHeight: 288,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  categoryCard: {
    width: 64,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    alignItems: 'center',
  },
  categoryCardSelected: {
    backgroundColor: '#E5E7EB',
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#6EE7B7',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabelContainer: {
    paddingTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomNav: {
    width: '100%',
    height: 80,
    paddingTop: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomNavContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavLabelContainer: {
    paddingTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  writeButton: {
    width: 56,
    height: 56,
    backgroundColor: '#6EE7B7',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
