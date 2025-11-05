// src/ui/components/MenuBar.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';

type MenuKey = 'feed' | 'search' | 'pet' | 'mypage';
type Props = {
  activeKey?: MenuKey;
  onFeedPress?: () => void;
  onSearchPress?: () => void;
  onPetPress?: () => void;
  onMyPagePress?: () => void;
  onWrite?: () => void;
};

const ACTIVE = '#6abfb8';
const INACTIVE = '#A3A3A3';

export default function MenuBar({
  activeKey = 'feed',
  onFeedPress,
  onSearchPress,
  onPetPress,
  onMyPagePress,
  onWrite,
}: Props) {
  const insets = useSafeAreaInsets();
  const color = (k: MenuKey) => (activeKey === k ? ACTIVE : INACTIVE);

  return (
    <View style={[S.wrap, { paddingBottom: insets.bottom }]}>
      <View style={S.inner}>
        {/* 피드 */}
        <TouchableOpacity
          onPress={onFeedPress}
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
          onPress={onSearchPress}
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
          onPress={onWrite}
          style={S.fabContainer}
          activeOpacity={0.7}
        >
          <View style={S.fab}>
            <Feather name="plus" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* 동물관리 */}
        <TouchableOpacity
          onPress={onPetPress}
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
          onPress={onMyPagePress}
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
    height: 100, // h-16
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
    width: 60,
    height: 60,
    borderRadius: 30, // rounded-full
    backgroundColor: ACTIVE, // bg-aqua-300
    alignItems: 'center',
    justifyContent: 'center',
  },
});
