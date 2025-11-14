// src/screens/main/Pet/ResultSummaryScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../ui/components/Text';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetStackParamList } from '../../../navigation/PetNavigator';

type Props = NativeStackScreenProps<PetStackParamList, 'UrineResultSummary'>;

export default function ResultSummaryScreen({ navigation, route }: Props) {
  const { analysisId, petId } = route.params;

  return (
    <View style={S.container}>
      <Text weight="bold" style={S.title}>
        소변 검사 분석 결과 (요약)
      </Text>
      <Text style={S.desc}>analysisId: {analysisId}</Text>
      {/* 여기다가 전체 건강 상태 카드, 항목 리스트, 병원 예약 버튼 등 나중에 구현 */}
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
  desc: {
    fontSize: 14,
  },
});
