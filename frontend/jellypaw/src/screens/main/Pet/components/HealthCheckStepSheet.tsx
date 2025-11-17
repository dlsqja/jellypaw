// src/screens/pet/components/HealthCheckStepSheet.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../../ui/components/Text';
import { Button } from '../../../../ui/components/Button';
import { palette, theme } from '../../../../ui/system/variants';
import Toast from 'react-native-toast-message';

interface HealthCheckStepSheetProps {
  visible: boolean;
  onClose: () => void;
  /** 마지막 단계에서 카메라 진입 등 후속 액션 */
  onCompleteScan?: () => void;
}

const STEPS = [
  {
    id: 1,
    body: '아래 단계를 따라 소변 검사를 할거예요. 단계마다 설명해 드리니 걱정하지 마세요. 쉬워요!',
    image: require('../../../../../assets/images/pets/analyze_image_1.png'),
    description:
      '애니키트의 소변검사 스틱이 있는 파우치를 열어서 소변을 묻혀 주세요. ' +
      '소변검사 스틱의 네모난 소변검사지가 충분히 적셔지도록 2-3초 정도 담가주세요.',
    nextLabel: '과잉뇨 제거',
  },
  {
    id: 2,
    body: '소변이 충분히 묻었다면, 과도한 소변을 톡톡 털어내 주세요.',
    image: require('../../../../../assets/images/pets/analyze_image_2.png'),
    description: '검사 결과가 번지지 않도록 스틱 옆면을 따라 가볍게 쳐서 과잉뇨를 제거해 주세요.',
    nextLabel: '비색판에 놓기',
  },
  {
    id: 3,
    body: '비색판 중앙에 스틱을 올려두고 색 변화를 기다려 주세요.',
    image: require('../../../../../assets/images/pets/analyze_image_3.png'),
    description: '소변검사 스틱을 비색판 가운데에 놓아 주세요. 다음 단계에서 비색판과 소변검사 스틱을 촬영할 거예요.',
    nextLabel: '비색판 스캔 시작',
  },
];

export default function HealthCheckStepSheet({ visible, onClose, onCompleteScan }: HealthCheckStepSheetProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      setStepIndex(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(onClose);
  };

  const current = STEPS[stepIndex];

  const handleNext = () => {
    const isLast = stepIndex === STEPS.length - 1;
    if (!isLast) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    if (onCompleteScan) {
      handleClose();
      onCompleteScan();
      return;
    }

    Toast.show({
      type: 'success',
      text1: '소변검사 안내를 완료했어요.',
      text2: '이제 안내에 따라 촬영을 진행해 주세요.',
    });
    handleClose();
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={S.overlay} onPress={handleClose}>
        <Animated.View
          style={[
            S.sheet,
            {
              paddingBottom: insets.bottom + 24,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [500, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={S.handleWrap}>
              <View style={S.handle} />
            </View>

            <View style={S.headerRow}>
              <View style={S.headerLeft}>
                {/* <Feather
                  name="flask"
                  size={20}
                  color={palette.aqua300}
                /> */}
                <Text weight="bold" style={S.headerTitle}>
                  소변검사 방법
                </Text>
              </View>
              <Pressable onPress={handleClose} hitSlop={8}>
                <View style={S.closeCircle}>
                  <Feather name="x" size={18} color={theme.text.secondary} />
                </View>
              </Pressable>
            </View>

            <View style={S.bodyIntroWrap}>
              <Text style={S.bodyIntro}>{current.body}</Text>
            </View>

            {/* 스텝 인디케이터 */}
            <View style={S.stepperWrap}>
              {STEPS.map((s, idx) => {
                const active = idx === stepIndex;
                return (
                  <React.Fragment key={s.id}>
                    <View style={[S.stepCircle, active && S.stepCircleActive]}>
                      <Text weight="bold" style={[S.stepCircleText, active && S.stepCircleTextActive]}>
                        {s.id}
                      </Text>
                    </View>
                    {idx < STEPS.length - 1 && <View style={S.stepBar} />}
                  </React.Fragment>
                );
              })}
            </View>

            {/* 이미지 */}
            <View style={S.imageWrap}>
              <Image source={current.image} style={S.image} resizeMode="cover" />
            </View>

            {/* 설명 */}
            <View style={S.descriptionWrap}>
              <Text style={S.description}>{current.description}</Text>
            </View>

            {/* 버튼 영역 */}
            <View style={S.buttonRow}>
              {stepIndex > 0 && <Button shape="pillOutline" tone="lightAqua" onPress={handlePrev} style={[S.button, S.prevButton]} title="이전" />}
              <Button
                shape="solid"
                tone="aqua"
                borderTone="default"
                onPress={handleNext}
                style={[S.button, stepIndex === 0 && S.buttonFull]}
                title={stepIndex === STEPS.length - 1 ? '스캔 시작' : `다음`}
              />
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const S = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: '#111827',
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyIntroWrap: {
    paddingBottom: 24,
  },
  bodyIntro: {
    fontSize: 14,
    lineHeight: 21,
    color: '#525252',
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
    gap: 8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: palette.aqua300,
  },
  stepCircleText: {
    fontSize: 14,
    color: '#A3A3A3',
  },
  stepCircleTextActive: {
    color: palette.white,
  },
  stepBar: {
    width: 32,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
  },
  imageWrap: {
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: 192,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  descriptionWrap: {
    paddingBottom: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonFull: {
    flex: 1,
  },
  prevButton: {
    backgroundColor: palette.white,
  },
  prevButtonText: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  nextButton: {
    backgroundColor: palette.aqua100,
    borderColor: palette.aqua300,
  },
  nextButtonText: {
    fontSize: 14,
    color: palette.aqua300,
  },
});
