// src/screens/pet/components/HealthCheckIntroSheet.tsx

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../../ui/components/Text';
import { Button } from '../../../../ui/components/Button';
import { palette, theme } from '../../../../ui/system/variants';

interface HealthCheckIntroSheetProps {
  visible: boolean;
  onClose: () => void;
  onStartPress?: () => void;
  onRequestKitPress?: () => void;
}

export default function HealthCheckIntroSheet({
  visible,
  onClose,
  onStartPress,
  onRequestKitPress,
}: HealthCheckIntroSheetProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
      duration: 200,
      useNativeDriver: true,
    }).start(onClose);
  };

  const handleRequestKitPress = async () => {
    const KIT_REQUEST_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdp5ux6WEQkiIvguVMuu-ldhkB7uYo_1TAP3qKQ0m_fyY2-Cw/viewform?pli=1';
    
    // prop으로 전달된 핸들러가 있으면 먼저 호출
    if (onRequestKitPress) {
      onRequestKitPress();
    }
    
    // 외부 URL 열기
    try {
      const canOpen = await Linking.canOpenURL(KIT_REQUEST_URL);
      if (canOpen) {
        await Linking.openURL(KIT_REQUEST_URL);
      } else {
        console.error('[HealthCheckIntroSheet] Cannot open URL:', KIT_REQUEST_URL);
      }
    } catch (error) {
      console.error('[HealthCheckIntroSheet] Error opening URL:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
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
                    outputRange: [400, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable onPress={e => e.stopPropagation()}>
            {/* 상단 핸들바 */}
            <View style={S.handleWrap}>
              <View style={S.handle} />
            </View>

            {/* 헤더 */}
            <View style={S.headerRow}>
              <Text weight="bold" style={S.title}>
                소변검사 전
              </Text>

              <Pressable onPress={handleClose} hitSlop={8} style={S.closeButton}>
                <View style={S.closeCircle}>
                  <Feather
                    name="x"
                    size={18}
                    color={theme.text.secondary}
                  />
                </View>
              </Pressable>
            </View>

            {/* 서브타이틀 */}
            <View style={S.subtitleWrap}>
              <Text style={S.subtitle}>
                반려동물의 건강상태를 확인해보세요
              </Text>
            </View>

            {/* 메인 CTA */}
            <View style={S.mainButtonWrap}>
              <Button
                title="소변검사 시작하기"
                shape="pillSolid"
                tone="aqua"
                onPress={onStartPress}
                style={S.mainButton}
              />
            </View>

            {/* 하단 안내 + 서브 CTA */}
            <View style={S.infoBlock}>
              <Text style={S.infoText}>
                아직 검사키트가 없으세요?
              </Text>

              <Button
                title="신청하러 가기"
                shape="pillOutline"
                tone="lightAqua"
                borderTone="default"
                onPress={handleRequestKitPress}
                style={S.subButton}
                titleStyle={S.subButtonText}
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
    paddingTop: 16,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
  },
  headerRow: {
    position: 'relative',
    alignItems: 'center',
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    color: '#111827',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitleWrap: {
    paddingBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,       // p2 느낌으로 상향
    lineHeight: 24,
    color: '#525252',
  },
  mainButtonWrap: {
    paddingBottom: 24,
  },
  mainButton: {
    borderRadius: 16,
  },
  infoBlock: {
    alignItems: 'center',
    paddingTop: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#525252',
    marginBottom: 12,
  },
  subButton: {
    alignSelf: 'stretch',
    width: '100%',               
    backgroundColor: palette.aqua100,
    borderRadius: 16,
    borderColor: palette.aqua300,
  },
  subButtonText: {
    color: palette.aqua300,
    fontSize: 14,
  },
});
