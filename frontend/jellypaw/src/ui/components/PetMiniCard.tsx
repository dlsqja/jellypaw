import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Text } from './Text';
import { palette, theme } from '../system/variants';
import Feather from 'react-native-vector-icons/Feather';


const defaultPetImage = require('../../../assets/images/pets/반려동물1.png');

type PetMiniCardProps = {
  name: string;
  species?: string;
  avatarUri?: string | null;
  selected?: boolean;
  onPress?: () => void;
};

export function PetMiniCard({ name, species = '강아지', avatarUri, selected, onPress }: PetMiniCardProps) {
  return (
    <Pressable onPress={onPress} style={[S.card, selected ? S.cardSelected : S.cardDefault]}>
      <View style={{ paddingBottom: 8 }}>
        <View style={S.avatarWrap}>
          <Image
  source={typeof avatarUri === 'string' && avatarUri.trim().length > 0
    ? { uri: avatarUri }
    : defaultPetImage}
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
      <View
        style={[
          S.avatar,
          {
            backgroundColor: '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <Feather name="plus" size={20} color={theme.text.muted} />
      </View>
      <Text style={[S.name, { color: theme.text.muted }]}>추가</Text>
    </Pressable>
  );
}

const S = StyleSheet.create({
  card: {
    width: 94,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 16,  
    height: 136,  
   },
  cardSelected: {
    backgroundColor: theme.bg.brandSubtle, // '#F0F7F9'
    borderWidth: 2,
    borderColor: theme.border.default,     // '#6ABFB8'
    height: 136,
  },
  cardDefault: {
    backgroundColor: theme.bg.surface,     // '#FFFFFF'
    borderWidth: 1,
    borderColor: theme.border.gray,        // '#E5E7EB'
  },
  avatarWrap: {},
  avatar: { width: 64, height: 64, borderRadius: 9999, overflow: 'hidden' },
  name: { fontSize: 14, lineHeight: 20, color: theme.text.primary }, // '#111827'
  species: { fontSize: 11, lineHeight: 14, color: theme.text.secondary }, // '#6B7280'
});
