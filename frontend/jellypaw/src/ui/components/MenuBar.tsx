// src/ui/components/MenuBar.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from './Text';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type MenuKey = 'feed' | 'search' | 'pet' | 'mypage' | 'undefined';

const ACTIVE = '#6abfb8';
const INACTIVE = '#A3A3A3';

export default function MenuBar() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();

  // 현재 활성 탭 결정
  const getActiveKey = (): MenuKey => {
    const routeName = route.name;
    if (routeName === 'FeedStack' || routeName === 'Feed') return 'feed';
    if (routeName === 'PetStack' || routeName === 'Pets') return 'pet';
    if (routeName === 'FeedWriteStack') return 'undefined'; // write는 FAB이므로 활성 상태 없음
    if (routeName === 'MypageStack') return 'mypage';
    if (routeName === 'SearchStack') return 'search';
    return 'feed';
  };

  const activeKey = getActiveKey();
  const color = (k: MenuKey) => (activeKey === k ? ACTIVE : INACTIVE);

  // 동물관리 → PetNavigator로 이동
  const handlePetPress = () => {
    if (route.name === 'PetStack') return;
    navigation.navigate('PetStack');
  };

  // + 버튼 → FeedWriteNavigator의 SelectCategory로 이동
  const handleWritePress = () => {
    if (route.name === 'FeedWriteStack') return;
    navigation.navigate('FeedWriteStack', { screen: 'SelectCategory' });
  };

  // 피드
  const handleFeedPress = () => {
    navigation.navigate('FeedStack', { screen: 'Feed' });
  };

  // 검색 → 추후 웹뷰 구현 예정
  const handleSearchPress = () => {
    navigation.navigate('SearchStack', { screen: 'Search' });
  };

  // 내 공간 → 추후 웹뷰 구현 예정
  const handleMyPagePress = () => {
    navigation.navigate('MypageStack', { screen: 'Mypage' });
  };

  return (
    <View style={[S.wrap, { paddingBottom: insets.bottom }]}>
      <View style={S.inner}>
        {/* 피드 */}
        <TouchableOpacity
          onPress={handleFeedPress}
          style={S.menuItem}
          activeOpacity={0.7}
        >
          <Entypo name="home" size={20} color={color('feed')} />
          <Text
            weight="semiBold"
            style={[S.tabLabel, { color: color('feed') }]}
          >
            피드
          </Text>
        </TouchableOpacity>

        {/* 검색 */}
        <TouchableOpacity
          onPress={handleSearchPress}
          style={S.menuItem}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={color('search')} />
          <Text
            weight="semiBold"
            style={[S.tabLabel, { color: color('search') }]}
          >
            검색
          </Text>
        </TouchableOpacity>

        {/* + (FAB) */}
        <TouchableOpacity
          onPress={handleWritePress}
          style={S.fabContainer}
          activeOpacity={0.7}
        >
          <View style={S.fab}>
            <Feather name="plus" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* 동물관리 */}
        <TouchableOpacity
          onPress={handlePetPress}
          style={S.menuItem}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="paw" solid size={20} color={color('pet')} />
          <Text weight="semiBold" style={[S.tabLabel, { color: color('pet') }]}>
            동물관리
          </Text>
        </TouchableOpacity>

        {/* 내 공간 */}
        <TouchableOpacity
          onPress={handleMyPagePress}
          style={S.menuItem}
          activeOpacity={0.7}
        >
          <Feather name="user" size={20} color={color('mypage')} />
          <Text
            weight="semiBold"
            style={[S.tabLabel, { color: color('mypage') }]}
          >
            내 공간
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: {
    width: '100%',
    height: 80, // h-16
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // border-gray-200
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6, // 상하 패딩으로 여유 공간 확보
    paddingTop: 12,
    paddingHorizontal: 8, // 좌우 패딩 줄이면 간격이 줄어듦 (기본값보다 작게)
  },
  menuItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%', // 전체 높이 사용
    marginHorizontal: -4, // 음수 마진으로 간격 줄이기 (값을 더 줄이면 간격이 더 좁아짐)
  },
  tabLabel: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4, // gap-2 (웹에서 gap-2는 8px, 아이콘과 라벨 사이 간격)
    textAlign: 'center',
  },
  fabContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%', // 전체 높이 사용
    marginHorizontal: -4, // 음수 마진으로 간격 줄이기 (값을 더 줄이면 간격이 더 좁아짐)
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 30, // rounded-full
    backgroundColor: ACTIVE, // bg-aqua-300
    alignItems: 'center',
    justifyContent: 'center',
  },
});
