// src/screens/main/Pet/ScanLoadingScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text } from '../../../ui/components/Text';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetStackParamList } from '../../../navigation/PetNavigator';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { palette, theme } from '../../../ui/system/variants';

type Props = NativeStackScreenProps<PetStackParamList, 'ScanLoading'>;

export default function ScanLoadingScreen({ navigation, route }: Props) {
  const { imageUri, petId } = route.params;

  /**
   * progress: 0 → 5 를 한 사이클로 사용
   *
   * 0 ~ 1 : 1번 발바닥 깜빡임 (aqua) / 나머지 회색
   * 1 ~ 2 : 1번 고정 aqua, 2번 깜빡임 (aqua), 3번 회색
   * 2 ~ 3 : 1,2번 고정 aqua, 3번 깜빡임 (aqua)
   * 3 ~ 4 : 1,2,3번 모두 aqua 고정
   * 4 ~ 5 : 모두 회색으로 서서히 복귀
   */
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
    // 🔜 여기서 imageUri로 AI API 호출 후
    // 성공: navigation.replace('ResultSummary', { analysisId: '...', petId });
    // 실패: 에러 처리
  }, [imageUri, navigation, petId]);

  // 각 발바닥 애니메이션 (start: 깜빡이는 시작 시점 0~2)
  const getPawAnim = (start: number) => {
    const s = start === 0 ? 0.0001 : start; // inputRange 증가 조건 때문에 살짝 보정

    // 깜빡이는 구간: s ~ s+1 (중간에서 scale 최대)
    const scale = progress.interpolate({
      inputRange: [0, s, s + 0.5, s + 1, 5],
      outputRange: [1, 1, 1.15, 1, 1],
      extrapolate: 'clamp',
    });

    // aqua(위쪽 레이어)의 opacity
    const aquaOpacity = progress.interpolate({
      inputRange: [0, s, s + 0.5, s + 1, 4, 5],
      outputRange: [0, 0, 1, 1, 1, 0],
      extrapolate: 'clamp',
    });

    return { scale, aquaOpacity };
  };

  const paw1 = getPawAnim(0); // 0~1
  const paw2 = getPawAnim(1); // 1~2
  const paw3 = getPawAnim(2); // 2~3

  return (
    <View style={S.root}>
      <View style={S.card}>
        <View style={S.textBlock}>
          <Text weight="bold" style={S.title}>
            검사 결과 분석 중
          </Text>
          <Text style={S.subTitle}>잠시만 기다려주세요...</Text>
        </View>

        <View style={S.pawsRow}>
          {/* 1번 발바닥 */}
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

          {/* 2번 발바닥 */}
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

          {/* 3번 발바닥 */}
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
