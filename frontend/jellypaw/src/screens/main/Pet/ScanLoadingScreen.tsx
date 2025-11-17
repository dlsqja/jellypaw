// src/screens/main/Pet/ScanLoadingScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
} from 'react-native';
import { Text } from '../../../ui/components/Text';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetStackParamList } from '../../../navigation/PetNavigator';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { palette, theme } from '../../../ui/system/variants';
import { analyzeUrineTest } from '../../../services/api/pet';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<PetStackParamList, 'ScanLoading'>;

export default function ScanLoadingScreen({ navigation, route }: Props) {
  const { imageUri, petId } = route.params;
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 5,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [progress]);

  useEffect(() => {
    console.log('[사진 정보]:', imageUri, petId)
    // imageUri와 petId가 모두 있을 때만 API 호출
    if (!imageUri || !petId || isAnalyzing) {
      return;
    }

    const callAnalysisAPI = async () => {
      try {
        setIsAnalyzing(true);
        console.log('[ScanLoadingScreen] 분석 시작', { imageUri, petId });

        const result = await analyzeUrineTest(petId, imageUri);
        
        console.log('[ScanLoadingScreen] 분석 완료', result);

        // 성공 시 결과 화면으로 이동
        navigation.replace('ResultSummary', {
          analysisId: result.id,
          petId,
        });
      } catch (error: any) {
        console.error('[ScanLoadingScreen] 분석 실패', error);
        
        // 에러 처리
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          '분석 중 오류가 발생했습니다.';

        Toast.show({
          type: 'error',
          text1: '분석 실패',
          text2: errorMessage,
        });

        // 에러 발생 시 이전 화면으로 돌아가기
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } finally {
        setIsAnalyzing(false);
      }
    };

    callAnalysisAPI();
  }, [imageUri, petId, navigation, isAnalyzing]);

  const handleDevSkip = () => {
    // 개발용 더미 이동 (분석 중이 아닐 때만)
    if (!isAnalyzing) {
      navigation.replace('ResultSummary', {
        analysisId: 'dummy-analysis-id',
        petId,
      });
    }
  };

  const getPawAnim = (start: number) => {
    const s = start === 0 ? 0.0001 : start;

    const scale = progress.interpolate({
      inputRange: [0, s, s + 0.5, s + 1, 5],
      outputRange: [1, 1, 1.15, 1, 1],
      extrapolate: 'clamp',
    });

    const aquaOpacity = progress.interpolate({
      inputRange: [0, s, s + 0.5, s + 1, 4, 5],
      outputRange: [0, 0, 1, 1, 1, 0],
      extrapolate: 'clamp',
    });

    return { scale, aquaOpacity };
  };

  const paw1 = getPawAnim(0);
  const paw2 = getPawAnim(1);
  const paw3 = getPawAnim(2);

  return (
    <Pressable style={S.root} onPress={handleDevSkip}>
      {/* ⬆️ 개발 중엔 어디 눌러도 다음 화면으로 이동 */}
      <View style={S.card}>
        <View style={S.textBlock}>
          <Text weight="bold" style={S.title}>
            검사 결과 분석 중
          </Text>
          <Text style={S.subTitle}>잠시만 기다려주세요...</Text>
        </View>

        <View style={S.pawsRow}>
          <View style={S.pawWrapper}>
            <FontAwesome5 name="paw" solid size={52} color={palette.gray200} />
            <Animated.View
              pointerEvents="none"
              style={[
                S.pawOverlay,
                {
                  opacity: paw1.aquaOpacity,
                  transform: [{ scale: paw1.scale }],
                },
              ]}
            >
              <FontAwesome5
                name="paw"
                solid
                size={52}
                color={palette.aqua300}
              />
            </Animated.View>
          </View>

          <View style={S.pawWrapper}>
            <FontAwesome5 name="paw" solid size={56} color={palette.gray200} />
            <Animated.View
              pointerEvents="none"
              style={[
                S.pawOverlay,
                {
                  opacity: paw2.aquaOpacity,
                  transform: [{ scale: paw2.scale }],
                },
              ]}
            >
              <FontAwesome5
                name="paw"
                solid
                size={56}
                color={palette.aqua300}
              />
            </Animated.View>
          </View>

          <View style={S.pawWrapper}>
            <FontAwesome5 name="paw" solid size={52} color={palette.gray200} />
            <Animated.View
              pointerEvents="none"
              style={[
                S.pawOverlay,
                {
                  opacity: paw3.aquaOpacity,
                  transform: [{ scale: paw3.scale }],
                },
              ]}
            >
              <FontAwesome5
                name="paw"
                solid
                size={52}
                color={palette.aqua300}
              />
            </Animated.View>
          </View>
        </View>

        <View style={S.bottomSpacer} />
      </View>
    </Pressable>
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
  textBlock: {
    paddingBottom: 48,
    alignItems: 'center',
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
  pawsRow: {
    paddingBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawWrapper: {
    width: 70,
    height: 70,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pawOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    paddingTop: 16,
    height: 20,
    width: 256,
  },
});
