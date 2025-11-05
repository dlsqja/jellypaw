// src/ui/components/MenuBar.tsx
import React from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
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

const ACTIVE = '#6ABFB8';
const INACTIVE = '#A3A3A3';

const ROW_H = 80;
const SIDE_PAD = 32;
const ITEM_BOX = 44;   // 아이콘 앵커 박스(가로/세로)
const CENTER_W = 64;   // 플로팅 + 지름

export default function MenuBar({
  activeKey = 'feed',
  onFeedPress, onSearchPress, onPetPress, onMyPagePress, onWrite,
}: Props) {
  const { width } = useWindowDimensions();
  const contentW = Math.max(0, width - SIDE_PAD * 2);

  // 중심점(좌측 패딩부터의 거리): 1/8, 3/8, 5/8, 7/8, 9/8? → 5개라면 1/8,3/8,5/8,7/8, 즉 4등분 간격
  const c1 = SIDE_PAD + (contentW * 1) / 8; // 피드
  const c2 = SIDE_PAD + (contentW * 3) / 8; // 검색
  const c3 = SIDE_PAD + (contentW * 5) / 8; // + (정중앙)
  const c4 = SIDE_PAD + (contentW * 7) / 8; // 동물관리
  const c5 = SIDE_PAD + (contentW * 9) / 8; // 내 공간  ← (주의) 9/8은 범위를 넘어서므로 아래처럼 5개 균등은 0/4~4/4 방식이 더 깔끔

  const GAP = 20; 
  
  // 깔끔한 5등분(0~4 index): i * (contentW/4)
  const step = contentW / 4;
  const centers = [
    SIDE_PAD + step * 0, // 피드
    SIDE_PAD + step * 1, // 검색
    SIDE_PAD + step * 2, // + (정중앙)
    SIDE_PAD + step * 3, // 동물관리
    SIDE_PAD + step * 4, // 내 공간
  ];

  const color = (k: MenuKey) => (activeKey === k ? ACTIVE : INACTIVE);

  return (
    <View style={S.wrap}>
      <View style={[S.inner, { paddingHorizontal: SIDE_PAD }]}>
        {/* 피드 */}
        <Pressable
          onPress={onFeedPress}
          hitSlop={8}
          style={[S.slot, { left: centers[0] - ITEM_BOX / 2 }]}
        >
          <Entypo name="home" size={20} color={color('feed')} />
          <Text weight="semiBold" style={[S.tabLabel, { color: color('feed') }]}>피드</Text>
        </Pressable>

        {/* 검색 */}
        <Pressable
          onPress={onSearchPress}
          hitSlop={8}
          style={[S.slot, { left: centers[1] - ITEM_BOX / 2 }]}
        >
          <Ionicons name="search" size={20} color={color('search')} />
          <Text weight="semiBold" style={[S.tabLabel, { color: color('search') }]}>검색</Text>
        </Pressable>

        {/* + (FAB) */}
        <Pressable
          onPress={onWrite}
          hitSlop={8}
          android_ripple={{ color: '#ffffff22', borderless: true }}
          style={[S.fab, {
            left: centers[2] - CENTER_W / 2,
          }]}
        >
          <Feather name="plus" size={28} color="#FFFFFF" />
        </Pressable>

        {/* 동물관리 */}
        <Pressable
          onPress={onPetPress}
          hitSlop={8}
          style={[S.slot, { left: centers[3] - ITEM_BOX / 2 }]}
        >
          <FontAwesome5 name="paw" solid size={20} color={color('pet')} />
          <Text weight="semiBold" style={[S.tabLabel, { color: color('pet') }]}>동물관리</Text>
        </Pressable>

        {/* 내 공간 */}
        <Pressable
          onPress={onMyPagePress}
          hitSlop={8}
          style={[S.slot, { left: centers[4] - ITEM_BOX / 2 }]}
        >
          <Feather name="user" size={20} color={color('mypage')} />
          <Text weight="semiBold" style={[S.tabLabel, { color: color('mypage') }]}>내 공간</Text>
        </Pressable>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    zIndex: 50,
  },
  inner: {
    height: ROW_H,
    position: 'relative',   // ★ 절대배치 기준
  },
  slot: {
    position: 'absolute',
    top: (ROW_H - ITEM_BOX) / 2,   // 수직 가운데
    width: ITEM_BOX, height: ITEM_BOX,
    alignItems: 'center', justifyContent: 'center',
  },
  tabLabel: { fontSize: 12, lineHeight: 16, marginTop: 4, textAlign: 'center' },
  fab: {
    position: 'absolute',
    top: (ROW_H - CENTER_W) / 2,   // 수직 가운데
    width: CENTER_W, height: CENTER_W,
    borderRadius: CENTER_W / 2,
    backgroundColor: ACTIVE,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 10 }, shadowRadius: 15, elevation: 6,
  },
});
