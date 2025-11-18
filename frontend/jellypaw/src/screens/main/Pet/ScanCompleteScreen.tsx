// src/screens/main/Pet/ScanCompleteScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../ui/components/Text';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetStackParamList } from '../../../navigation/PetNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { palette, theme } from '../../../ui/system/variants';
import { Button } from '../../../ui/components/Button';

type Props = NativeStackScreenProps<PetStackParamList, 'ScanComplete'>;

export default function ScanCompleteScreen({ navigation, route }: Props) {
  const { analysisId, petId } = route.params;

  const handleViewResult = () => {
    // 동물관리 화면의 건강체크 탭으로 이동
    // 먼저 현재 모달들을 모두 닫고 Pets 화면으로 이동
    navigation.getParent()?.navigate('PetStack', {
      screen: 'Pets',
      params: {
        activeTab: 'health',
        petId: petId,
      },
    });
  };

  return (
    <View style={S.root}>
      <View style={S.card}>
        <View style={S.iconCircle}>
          <Ionicons name="checkmark-circle" size={64} color={palette.aqua300} />
        </View>
        <Text weight="bold" style={S.title}>
          검사 완료
        </Text>
        <Text style={S.subTitle}>소변 검사 분석이 완료되었습니다.</Text>
        <View style={S.buttonContainer}>
          <Button
            tone="aqua"
            shape="pillSolid"
            size="default"
            title="검사 보러가기"
            onPress={handleViewResult}
          />
        </View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 256,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  iconCircle: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    color: theme.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 32,
    width: '100%',
    paddingHorizontal: 20,
  },
});

