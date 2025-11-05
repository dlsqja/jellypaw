import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Text } from './Text';

function InfoChip({ title, caption }: { title: string; caption: string }) {
  return (
    <View style={S.chip}>
      <Text weight="semiBold" style={S.chipTitle}>{title}</Text>
      <Text style={S.chipCaption}>{caption}</Text>
    </View>
  );
}

type Props = {
  avatarUri?: string;
  name: string;
  kind: string;
  registeredAt?: string;
  age?: string;
  weight?: string;
  sex?: string;
  onEdit?: () => void;
};

export default function PetSummaryCard({ avatarUri, name, kind, registeredAt, age, weight, sex, onEdit }: Props) {
  return (
    <View style={S.card}>
      <View style={{ paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={{ uri: avatarUri ?? 'https://placehold.co/80x80' }} style={S.avatar} />
          <View style={{ paddingLeft: 16 }}>
            <Text weight="bold" style={S.title}>{name}</Text>
            <Text style={S.sub}>{kind}</Text>
            {!!registeredAt && <Text style={S.meta}>등록일: {registeredAt}</Text>}
          </View>
        </View>
      </View>

      <View style={S.chipsRow}>
        <InfoChip title={age ?? '-'} caption="나이" />
        <InfoChip title={weight ?? '-'} caption="체중" />
        <InfoChip title={sex ?? '-'} caption="성별" />
      </View>

      <Pressable onPress={onEdit} style={S.editBtn}>
        <View style={{ width: 18, height: 18, backgroundColor: '#6ABFB8', borderRadius: 2 }} />
        <Text weight="medium" style={S.editLabel}>정보 수정</Text>
      </Pressable>
    </View>
  );
}

const S = StyleSheet.create({
  card: { width: '100%', padding: 25, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  avatar: { width: 80, height: 80, borderRadius: 9999 },
  title: { fontSize: 20, lineHeight: 28, color: '#111827' },
  sub: { fontSize: 14, lineHeight: 20, color: '#4B5563' },
  meta: { fontSize: 14, lineHeight: 20, color: '#6B7280' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  chip: { width: 82, height: 61, padding: 12, backgroundColor: '#FAFAFA', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chipTitle: { fontSize: 14, lineHeight: 20, color: '#111827', textAlign: 'center' },
  chipCaption: { fontSize: 11, lineHeight: 14, color: '#4B5563', textAlign: 'center' },
  editBtn: {
    height: 38, borderRadius: 12, backgroundColor: '#F0F7F9',
    borderWidth: 1, borderColor: '#6ABFB8',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 8,
  },
  editLabel: { fontSize: 14, lineHeight: 21, color: '#6ABFB8' },
});
