// src/ui/components/PetSummaryCard.tsx
import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Text } from './Text';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { palette, theme } from '../system/variants';

const defaultPetImage = require('../../../assets/images/pets/반려동물1.png');

function InfoChip({ title, caption }: { title: string | number; caption: string }) {
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
  avatarUri?: string | null;
  name: string;
  kind: string;
  registeredAt?: string;
  age?: number;
  weight?: number;
  sex?: string;
  onEdit?: () => void;
};

export default function PetSummaryCard({ avatarUri, name, kind, registeredAt, age, weight, sex, onEdit }: Props) {
  const hasValidUri = typeof avatarUri === 'string' && avatarUri.trim().length > 0;
  const imageSource = hasValidUri ? { uri: avatarUri as string } : defaultPetImage;

  return (
    <View style={S.card}>
      <View style={{ paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={S.avatarContainer}>
            {hasValidUri ? (
              <Image source={imageSource} defaultSource={defaultPetImage} style={S.avatarImage} />
            ) : (
              <View style={S.avatarFallback}>
                <FontAwesome5 name="paw" solid size={32} color={palette.pink200} />
              </View>
            )}
          </View>

          <View style={{ paddingLeft: 16 }}>
            <Text weight="bold" style={S.title}>
              {name}
            </Text>
            <Text style={S.sub}>{kind}</Text>
            {!!registeredAt && <Text style={S.meta}>등록일: {registeredAt}</Text>}
          </View>
        </View>
      </View>

      <View style={S.chipsRow}>
        <InfoChip title={(age ?? 0) + '살'} caption="나이" />
        <InfoChip title={(weight ?? 0) + 'kg'} caption="체중" />
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
    backgroundColor: theme.bg.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border.gray,
  },

  // 아바타 컨테이너 (프레임)
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  // 실제 이미지용 스타일
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  // 이미지 없을 때 아이콘만 중앙 정렬 (배경색 제거됨)
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: { fontSize: 20, lineHeight: 28, color: theme.text.primary },
  sub: { fontSize: 14, lineHeight: 20, color: theme.text.muted },
  meta: { fontSize: 14, lineHeight: 20, color: theme.text.secondary },

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
    backgroundColor: theme.bg.subtle,
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
    backgroundColor: theme.bg.brandSubtle,
    borderWidth: 1,
    borderColor: theme.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  editLabel: { fontSize: 14, lineHeight: 21, color: theme.border.default },
});
