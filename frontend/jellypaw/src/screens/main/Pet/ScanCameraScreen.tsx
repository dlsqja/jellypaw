// src/screens/main/Pet/ScanCameraScreen.tsx

import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { RNCamera, RNCameraProps } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import { palette } from '../../../ui/system/variants';
import Toast from 'react-native-toast-message';

export default function ScanCameraScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const cameraRef = useRef<RNCamera | null>(null);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const hasCaptured = !!photoUri;

  const handleBack = () => {
    nav.goBack();
  };

  const handleCapture = async () => {
    if (!cameraRef.current) {
      Toast.show({
        type: 'error',
        text1: '카메라를 불러오지 못했어요.',
      });
      return;
    }

    if (!isCameraReady) {
      Toast.show({
        type: 'info',
        text1: '카메라 준비 중입니다.',
        text2: '잠시 후 다시 시도해 주세요.',
      });
      return;
    }

    if (hasCaptured) return;

    try {
      const res = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        pauseAfterCapture: true,
      });

      if (!res?.uri) {
        throw new Error('NO_URI');
      }

      setPhotoUri(res.uri);
    } catch (e) {
      console.log('[UrineScanCamera] capture error', e);
      Toast.show({
        type: 'error',
        text1: '촬영에 실패했어요.',
        text2: '카메라 권한 또는 설정을 확인해 주세요.',
      });
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  const handleConfirm = () => {
    Toast.show({
      type: 'success',
      text1: '이미지를 불러왔어요.',
      text2: '결과 분석을 진행합니다.',
    });
    nav.goBack();
  };

  return (
    <View style={S.container}>
      {/* 카메라 or 촬영 이미지 */}
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={S.cameraPreview} />
      ) : (
        <RNCamera
          ref={ref => {
            cameraRef.current = ref;
          }}
          style={S.cameraPreview}
          type={RNCamera.Constants.Type.back}
          captureAudio={false}
          onCameraReady={() => {
            console.log('[UrineScanCamera] camera ready');
            setIsCameraReady(true);
          }}
          onStatusChange={({
            cameraStatus,
          }: Parameters<NonNullable<RNCameraProps['onStatusChange']>>[0]) => {
            console.log('[UrineScanCamera] status:', cameraStatus);
            if (cameraStatus === 'READY') {
              setIsCameraReady(true);
            }
          }}
          onMountError={err => {
            console.log('[UrineScanCamera] mount error', err);
            Toast.show({
              type: 'error',
              text1: '카메라를 실행할 수 없어요.',
              text2: '권한 또는 기기 설정을 확인해 주세요.',
            });
          }}
          notAuthorizedView={
            <View style={S.center}>
              <Text style={S.authText}>
                카메라 권한이 필요합니다. 설정에서 허용해 주세요.
              </Text>
            </View>
          }
          pendingAuthorizationView={
            <View style={S.center}>
              <Text style={S.authText}>카메라를 준비하고 있어요…</Text>
            </View>
          }
          androidCameraPermissionOptions={{
            title: '카메라 권한이 필요합니다',
            message:
              '비색판을 촬영하기 위해 카메라 접근을 허용해 주세요.',
            buttonPositive: '허용',
            buttonNegative: '취소',
          }}
        />
      )}

      {/* 상단 오버레이 */}
      <View
        style={[
          S.topOverlay,
          { paddingTop: insets.top + 16 },
        ]}
      >
        <TouchableOpacity
          onPress={handleBack}
          style={S.topBackButton}
          hitSlop={8}
        >
          <Feather name="x" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={S.topTitleWrap}>
          <Text weight="bold" style={S.topTitle}>
            비색판 스캔
          </Text>
          <Text style={S.topSubtitle}>
            비색판과 검사 스틱을 촬영해주세요
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* 가이드 및 하단 버튼은 기존 그대로 */}
      {!hasCaptured && (
        <>
          <View style={[S.mask, S.maskTop]} />
          <View style={S.maskMiddleRow}>
            <View style={[S.mask, S.maskSide]} />
            <View style={S.guideBox}>
              <View style={[S.corner, S.cornerTL]} />
              <View style={[S.corner, S.cornerTR]} />
              <View style={[S.corner, S.cornerBL]} />
              <View style={[S.corner, S.cornerBR]} />
            </View>
            <View style={[S.mask, S.maskSide]} />
          </View>
          <View style={[S.mask, S.maskBottom]} />

          <View style={S.centerGuideTextWrap}>
            <Text weight="semiBold" style={S.centerGuideTitle}>
              비색판을 가이드라인에 맞춰주세요
            </Text>
            <Text style={S.centerGuideSubtitle}>
              검사 스틱이 비색판 중앙에 위치하도록 해 주세요
            </Text>
          </View>
        </>
      )}

      <View
        style={[
          S.bottomOverlay,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {hasCaptured ? (
          <View style={S.bottomButtonsRow}>
            <TouchableOpacity
              onPress={handleRetake}
              style={S.retakeButton}
              activeOpacity={0.9}
            >
              <Feather name="camera" size={18} color="#fff" />
              <Text weight="medium" style={S.retakeText}>
                다시 촬영
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={S.confirmButton}
              activeOpacity={0.9}
            >
              <Feather name="check" size={18} color="#fff" />
              <Text weight="medium" style={S.confirmText}>
                확인
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={S.captureRow}>
            <View style={S.captureSideIcon} />
            <TouchableOpacity
              onPress={handleCapture}
              style={S.captureButtonOuter}
              activeOpacity={0.9}
            >
              <View style={S.captureButtonInner} />
            </TouchableOpacity>
            <View style={S.captureSideIcon} />
          </View>
        )}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  cameraPreview: { ...StyleSheet.absoluteFillObject },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topBackButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitleWrap: { alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 18, lineHeight: 28, color: '#fff' },
  topSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.8)',
  },
  mask: { backgroundColor: 'rgba(0,0,0,0.4)' },
  maskTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '25%',
  },
  maskBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
  },
  maskMiddleRow: {
    position: 'absolute',
    top: '25%',
    bottom: '35%',
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  maskSide: { flex: 1 },
  guideBox: { width: 320, height: 240, alignSelf: 'center' },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#2DD4BF',
  },
  cornerTL: {
    top: -4,
    left: -4,
    borderLeftWidth: 4,
    borderTopWidth: 4,
  },
  cornerTR: {
    top: -4,
    right: -4,
    borderRightWidth: 4,
    borderTopWidth: 4,
  },
  cornerBL: {
    bottom: -4,
    left: -4,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
  },
  cornerBR: {
    bottom: -4,
    right: -4,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  centerGuideTextWrap: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centerGuideTitle: {
    fontSize: 18,
    lineHeight: 28,
    color: '#fff',
  },
  centerGuideSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 32,
    paddingTop: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  captureSideIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 24,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  retakeText: { color: '#fff', fontSize: 14, marginLeft: 8 },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: palette.aqua300,
  },
  confirmText: { color: '#fff', fontSize: 14, marginLeft: 8 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  authText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
