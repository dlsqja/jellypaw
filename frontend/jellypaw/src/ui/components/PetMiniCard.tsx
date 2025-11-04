import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Text } from './Text';

type PetMiniCardProps = {
  name: string;
  kind?: string;
  avatarUri?: string;
  selected?: boolean;
  onPress?: () => void;
};

export function PetMiniCard({ name, kind = '강아지', avatarUri, selected, onPress }: PetMiniCardProps) {
  return (
    <Pressable onPress={onPress} style={[S.card, selected ? S.cardSelected : S.cardDefault]}>
      <View style={{ paddingBottom: 8 }}>
        <View style={S.avatarWrap}>
          {avatarUri ? <Image source={{ uri: avatarUri }} style={S.avatar} /> : <View style={[S.avatar, { backgroundColor: '#F3F4F6' }]} />}
        </View>
      </View>
      <Text style={S.name}>{name}</Text>
      <Text style={S.kind}>{kind}</Text>
    </Pressable>
  );
}

export function AddPetCard({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[S.card, S.cardDefault, { height: 118 }]}>
      <View style={[S.avatar, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }]}>
        <View style={{ width: 24, height: 24, backgroundColor: '#6B7280', borderRadius: 2 }} />
      </View>
      <Text style={[S.name, { color: '#6B7280' }]}>추가</Text>
    </Pressable>
  );
}

const S = StyleSheet.create({
  card: { width: 94, padding: 14, borderRadius: 12, alignItems: 'center' },
  cardSelected: { backgroundColor: '#F0F7F9', borderWidth: 2, borderColor: '#6ABFB8', height: 136 },
  cardDefault: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  avatarWrap: {},
  avatar: { width: 64, height: 64, borderRadius: 9999, overflow: 'hidden' },
  name: { fontSize: 14, lineHeight: 20, color: '#111827' },
  kind: { fontSize: 11, lineHeight: 14, color: '#6B7280' },
});
