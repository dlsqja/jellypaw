// src/screens/main/Pet/ResultDetailScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../ui/components/Text';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetStackParamList } from '../../../navigation/PetNavigator';

type Props = NativeStackScreenProps<PetStackParamList, 'UrineResultDetail'>;

export default function ResultDetailScreen({ route }: Props) {
  const { analysisId, itemKey, petId } = route.params;

  return (
    <View style={S.container}>
      <Text weight="bold" style={S.title}>
        검사 항목 상세
      </Text>
      <Text>analysisId: {analysisId}</Text>
      <Text>itemKey: {itemKey}</Text>
      {/* 여기다가 단백질/케톤/pH 별 위험 질환, 권장사항, 그래프 등 나중에 구현 */}
    </View>
  );
}

const S = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
});
