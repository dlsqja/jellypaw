// src/ui/components/PetMiniCard.tsx
import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Text } from './Text';
import { theme } from '../system/variants';
import Feather from 'react-native-vector-icons/Feather';

const defaultPetImage = require('../../../assets/images/pets/반려동물1.png');

type PetMiniCardProps = {
  name: string;
  species?: string;
  avatarUri?: string | null;
  selected?: boolean;
  onPress?: () => void;
};

export function PetMiniCard({
  name,
  species = '강아지',
  avatarUri,
  selected,
  onPress,
}: PetMiniCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[S.card, selected ? S.cardSelected : S.cardDefault]}
    >
      <View style={S.avatarContainer}>
        <View style={S.avatarWrap}>
          <Image
            source={
              typeof avatarUri === 'string' && avatarUri.trim().length > 0
                ? { uri: avatarUri }
                : defaultPetImage
            }
            defaultSource={defaultPetImage}
            style={S.avatar}
          />
        </View>
      </View>
      <Text style={S.name}>{name}</Text>
      <Text style={S.species}>{species}</Text>
    </Pressable>
  );
}

export function AddPetCard({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[S.card, S.cardDefault]}>
      <View style={S.avatarContainer}>
        <View style={[S.avatarWrap, { backgroundColor: '#F3F4F6' }]}>
          <Feather name="plus" size={20} color={theme.text.muted} />
        </View>
      </View>
      {/* 이름/종 라인 구조 그대로 유지해서 정렬 동일하게 */}
      <Text style={[S.name, { color: theme.text.onKakao }]}>추가</Text>
      <Text style={[S.species, { color: 'transparent' }]}></Text>
    </Pressable>
  );
}

const S = StyleSheet.create({
  card: {
    width: 94,
    height: 136,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 16,
  },
  cardSelected: {
    backgroundColor: theme.bg.brandSubtle,
    borderWidth: 2,
    borderColor: theme.border.default,
  },
  cardDefault: {
    backgroundColor: theme.bg.surface,
    borderWidth: 1,
    borderColor: theme.border.gray,
  },

  // 아바타 영역(위 여백 통일용)
  avatarContainer: {
    paddingBottom: 8,
  },

  // 원 사이즈 & 정가운데 정렬(이미지/플러스 공용)
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  name: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.text.primary,
  },
  species: {
    fontSize: 11,
    lineHeight: 14,
    color: theme.text.secondary,
  },
});
