// FeedWrite.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MobileLayout from '../../../components/AuthLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import BackHeader from '../../../ui/components/BackHeader';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../../navigation/MainStackNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'SelectCategory'>;

// 카테고리 목록
const categories = [
  {
    id: 1,
    name: '일상',
    icon: 'calendar-blank-outline',
    iconFamily: 'MaterialCommunityIcons',
  },
  {
    id: 2,
    name: '건강',
    icon: 'cards-heart-outline',
    iconFamily: 'MaterialCommunityIcons',
  },
  {
    id: 3,
    name: '식당',
    icon: 'silverware-variant',
    iconFamily: 'MaterialCommunityIcons',
  },
  {
    id: 4,
    name: '미용',
    icon: 'content-cut',
    iconFamily: 'MaterialCommunityIcons',
  },
  {
    id: 5,
    name: '음식',
    icon: 'food',
    iconFamily: 'MaterialCommunityIcons',
  },
  {
    id: 6,
    name: '장난감',
    icon: 'game-controller-outline',
    iconFamily: 'Ionicons',
  },
  { id: 7, name: '장소', icon: 'location-outline', iconFamily: 'Ionicons' },
  {
    id: 8,
    name: '기타',
    icon: 'dots-vertical',
    iconFamily: 'MaterialCommunityIcons',
  },
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

export default function SelectCategory({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const handleCategorySelect = (categoryId: number, categoryName: string) => {
    setSelectedCategory(categoryId);
    navigation.navigate('FeedWrite', { categoryId, categoryName });
  };

  const renderIcon = (iconFamily: string, iconName: string) => {
    if (iconFamily === 'Ionicons') {
      return <Icon name={iconName} size={32} color="#FFFFFF" />;
    }
    return <MaterialCommunityIcons name={iconName} size={32} color="#FFFFFF" />;
  };

  return (
    <View style={styles.container}>
      <BackHeader title="무엇을 기록할까요?" />
      {/* 상단 헤더 */}

      {/* 메인 콘텐츠 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
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
              style={styles.categoryCard}
              onPress={() => handleCategorySelect(category.id, category.name)}
            >
              <View
                style={[
                  styles.categoryIconContainer,
                  selectedCategory === category.id &&
                    styles.categoryIconContainerSelected,
                ]}
              >
                {renderIcon(category.iconFamily, category.icon)}
              </View>
              <View style={styles.categoryLabelContainer}>
                <Text style={styles.categoryLabel}>{category.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 메뉴바 - 추후에 컴포넌트로 전환환 */}
      {/* <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
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
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  // 컴포넌트 스타일
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  // 스크롤 뷰 스타일
  scrollView: {
    flex: 1,
  },
  // 스크롤 뷰 콘텐츠 스타일
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',

    paddingVertical: 32,
    gap: 32,
  },

  // 타이틀 섹션 스타일
  titleSection: {
    width: '100%',
    height: 64,
    gap: 8,
  },
  // 타이틀 컨테이너 스타일
  titleContainer: {
    paddingBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 메인 타이틀 스타일
  mainTitle: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: '#284542',
    textAlign: 'center',
    lineHeight: 32,
  },
  // 서브타이틀 컨테이너 스타일
  subtitleContainer: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 서브타이틀 스타일
  subtitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#284542',
    textAlign: 'center',
    lineHeight: 20,
  },
  // 카테고리 그리드 스타일
  categoryGrid: {
    width: '100%',
    minHeight: 288,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  // 카테고리 카드 스타일
  categoryCard: {
    width: 64,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    alignItems: 'center',
  },
  // 카테고리 아이콘 컨테이너 스타일
  categoryIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#6ABFB8',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 선택된 카테고리 아이콘 컨테이너 스타일
  categoryIconContainerSelected: {
    backgroundColor: '#4D8983',
  },
  // 카테고리 라벨 컨테이너 스타일
  categoryLabelContainer: {
    paddingTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 카테고리 라벨 스타일
  categoryLabel: {
    fontSize: 14,
    fontFamily: 'Pretendard-Bold',
    color: '#284542',
    textAlign: 'center',
    lineHeight: 20,
  },
  // 메뉴바 스타일
  // bottomNav: {
  //   width: '100%',
  //   height: 80,
  //   paddingTop: 1,
  //   backgroundColor: 'rgba(255, 255, 255, 0.95)',
  //   borderTopWidth: 1,
  //   borderTopColor: '#E5E7EB',
  // },
  // // 메뉴바 컨테이너 스타일
  // bottomNavContent: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   paddingHorizontal: 32,
  // },
  // // 메뉴바 아이템 스타일
  // bottomNavItem: {
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // // 메뉴바 아이콘 스타일
  // bottomNavIcon: {
  //   width: 24,
  //   height: 24,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // // 메뉴바 라벨 컨테이너 스타일
  // bottomNavLabelContainer: {
  //   paddingTop: 4,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // // 메뉴바 라벨 스타일
  // bottomNavLabel: {
  //   fontSize: 12,
  //   fontWeight: '500',
  //   color: '#9CA3AF',
  //   textAlign: 'center',
  //   lineHeight: 16,
  // },
  // // 글쓰기 버튼 스타일
  //   writeButton: {
  //   width: 56,
  //   height: 56,
  //   backgroundColor: '#6EE7B7',
  //   borderRadius: 28,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   shadowColor: '#000',
  //   shadowOffset: {
  //     width: 0,
  //     height: 4,
  //   },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 6,
  //   elevation: 4,
  // },
});
