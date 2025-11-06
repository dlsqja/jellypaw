import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Text } from './Text';
import Feather from 'react-native-vector-icons/Feather';
import { palette, theme } from '../system/variants'; // ⬅️ 추가

function InfoChip({
  title,
  caption,
}: {
  title: string | number;
  caption: string;
}) {
  return (
    <View style={S.chip}>
      <Text weight="semiBold" style={S.chipTitle}>
        {title}
      </Text>
      <Text style={S.chipCaption}>{caption}</Text>
    </View>
  );
}

type Props = {
  avatarUri?: string;
  name: string;
  kind: string;
  registeredAt?: string;
  age?: number;
  weight?: number;
  sex?: string;
  onEdit?: () => void;
};

export default function PetSummaryCard({
  avatarUri,
  name,
  kind,
  registeredAt,
  age,
  weight,
  sex,
  onEdit,
}: Props) {
  return (
    <View style={S.card}>
      <View style={{ paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: avatarUri ?? 'https://placehold.co/80x80' }}
            style={S.avatar}
          />
          <View style={{ paddingLeft: 16 }}>
            <Text weight="bold" style={S.title}>
              {name}
            </Text>
            <Text style={S.sub}>{kind}</Text>
            {!!registeredAt && (
              <Text style={S.meta}>등록일: {registeredAt}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={S.chipsRow}>
        <InfoChip title={age + '살'} caption="나이" />
        <InfoChip title={weight + 'kg'} caption="체중" />
        <InfoChip title={sex ?? '-'} caption="성별" />
      </View>

      <Pressable onPress={onEdit} style={S.editBtn}>
        <Feather name="edit-3" size={18} color={theme.border.default} />
        <Text weight="medium" style={S.editLabel}>
          정보 수정
        </Text>
      </Pressable>
    </View>
  );
}

const S = StyleSheet.create({
  card: {
    width: '100%',
    padding: 25,
    backgroundColor: theme.bg.surface, // '#FFFFFF' → 토큰
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border.gray, // '#E5E7EB' → 토큰
  },
  avatar: { width: 80, height: 80, borderRadius: 9999 },
  title: { fontSize: 20, lineHeight: 28, color: theme.text.primary }, // '#111827'
  sub: { fontSize: 14, lineHeight: 20, color: theme.text.muted }, // '#4B5563'
  meta: { fontSize: 14, lineHeight: 20, color: theme.text.secondary }, // '#6B7280'

  // 3등분 그리드 유지
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  chip: {
    flex: 1,
    minWidth: 0,
    height: 61,
    padding: 12,
    backgroundColor: theme.bg.subtle, // '#FAFAFA'
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.text.primary,
    textAlign: 'center',
  },
  chipCaption: {
    fontSize: 11,
    lineHeight: 14,
    color: theme.text.muted,
    textAlign: 'center',
  },

  editBtn: {
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.bg.brandSubtle, // '#F0F7F9'
    borderWidth: 1,
    borderColor: theme.border.default, // '#6ABFB8'
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  editLabel: { fontSize: 14, lineHeight: 21, color: theme.border.default }, // '#6ABFB8'
});
