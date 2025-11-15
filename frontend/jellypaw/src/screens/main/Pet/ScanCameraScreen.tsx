// src/screens/main/Pet/ScanCameraScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Camera, useCameraDevice, type CameraPermissionStatus } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import { palette } from '../../../ui/system/variants';
import Toast from 'react-native-toast-message';

export default function ScanCameraScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();

  const cameraRef = useRef<Camera | null>(null);
  const device = useCameraDevice('back');

  const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus | 'granted'>('not-determined');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const hasCaptured = !!photoUri;

  // ✅ 권한 확인 + 요청
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // 컴포넌트가 완전히 마운트된 후 권한 확인 (Release 빌드 안정성 향상)
        await new Promise<void>((resolve) => setTimeout(resolve, 100));

        if (!isMounted) return;

        // 1) 현재 상태 조회
        const current = await Camera.getCameraPermissionStatus();
        console.log('[ScanCameraScreen] cameraPermission(get):', current);

        if (!isMounted) return;

        let finalStatus: CameraPermissionStatus = current;

        // 2) 아직 한 번도 안 물어본 상태면, 여기서 실제 요청
        if (current === 'not-determined') {
          console.log('[ScanCameraScreen] Requesting camera permission...');
          const req = await Camera.requestCameraPermission();
          console.log('[ScanCameraScreen] cameraPermission(request):', req);
          finalStatus = req;
        }

        if (!isMounted) return;

        setCameraPermission(finalStatus);

        // 권한 거부된 경우 (denied 또는 restricted)
        if (finalStatus === 'denied' || finalStatus === 'restricted') {
          // 약간의 지연을 두어 화면이 먼저 렌더링되도록 함
          setTimeout(() => {
            if (isMounted) {
              Alert.alert('카메라 권한 필요', '카메라 권한이 필요합니다.\n설정에서 권한을 허용해 주세요.', [
                { text: '취소', style: 'cancel' },
                {
                  text: '설정으로 이동',
                  onPress: () => Linking.openSettings(),
                },
              ]);
            }
          }, 300);
        }
      } catch (error) {
        console.error('[ScanCameraScreen] Permission check error:', error);
        if (isMounted) {
          setCameraPermission('denied');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // 권한이 명시적으로 허용된 경우만 true
  // react-native-vision-camera에서는 'granted'를 사용 (iOS는 'authorized'이지만 타입에는 'granted'로 통일)
  const hasPermission = cameraPermission === 'granted';

  console.log('[ScanCameraScreen] cameraPermission:', cameraPermission, 'hasPermission:', hasPermission, 'hasCaptured:', hasCaptured);
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

    if (!device || !hasPermission) {
      Toast.show({
        type: 'error',
        text1: '카메라를 사용할 수 없어요.',
        text2: '권한 또는 기기 설정을 확인해 주세요.',
      });
      return;
    }

    if (hasCaptured) return;

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      const uri = 'file://' + photo.path;
      setPhotoUri(uri);
    } catch (e) {
      console.log('[UrineScanCamera] capture error', e);
      Toast.show({
        type: 'error',
        text1: '촬영에 실패했어요.',
        text2: '카메라 권한 또는 설정을 확인해 주세요.',
      });
    }
  };

  const handleRetake = () => setPhotoUri(null);

  const handleConfirm = () => {
    if (!photoUri) return;

    // TODO: 여기서 서버 업로드 + AI 분석
    Toast.show({
      type: 'success',
      text1: '이미지를 불러왔어요.',
      text2: '결과 분석을 진행합니다.',
    });
    nav.goBack();
  };

  const renderCamera = () => {
    if (!device) {
      return (
        <View style={S.center}>
          <Text style={S.authText}>카메라 기기를 찾을 수 없어요.</Text>
        </View>
      );
    }

    if (!hasPermission) {
      return (
        <View style={S.center}>
          <Text style={S.authText}>카메라 권한이 필요합니다.{'\n'}설정에서 허용해 주세요.</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('카메라 권한 필요', '카메라 권한이 필요합니다. 설정에서 권한을 허용해 주세요.', [
                { text: '취소', style: 'cancel' },
                {
                  text: '설정으로 이동',
                  onPress: () => Linking.openSettings(),
                },
              ]);
            }}
            style={S.settingsButton}
          >
            <Text style={S.settingsButtonText}>설정으로 이동</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <Camera ref={cameraRef} style={S.cameraPreview} device={device} isActive={!hasCaptured} photo />;
  };

  return (
    <View style={S.container}>
      {/* 카메라 or 촬영 이미지 */}
      {photoUri ? <Image source={{ uri: photoUri }} style={S.cameraPreview} /> : renderCamera()}

      {/* 상단 오버레이 */}
      <View style={[S.topOverlay, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={S.topBackButton} hitSlop={8}>
          <Feather name="x" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={S.topTitleWrap}>
          <Text weight="bold" style={S.topTitle}>
            비색판 스캔
          </Text>
          <Text style={S.topSubtitle}>비색판과 검사 스틱을 촬영해주세요</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* 가이드 및 하단 버튼들은 권한이 있을 때만 표시 */}
      {!hasCaptured && hasPermission && (
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
            <Text style={S.centerGuideSubtitle}>검사 스틱이 비색판 중앙에 위치하도록 해 주세요</Text>
          </View>
        </>
      )}

      {/* 하단 버튼 영역 - 권한이 있을 때만 표시 */}
      {hasPermission && (
        <View style={[S.bottomOverlay, { paddingBottom: insets.bottom + 24 }]}>
          {hasCaptured ? (
            <View style={S.bottomButtonsRow}>
              <TouchableOpacity onPress={handleRetake} style={S.retakeButton} activeOpacity={0.9}>
                <Feather name="camera" size={18} color="#fff" />
                <Text weight="medium" style={S.retakeText}>
                  다시 촬영
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleConfirm} style={S.confirmButton} activeOpacity={0.9}>
                <Feather name="check" size={18} color="#fff" />
                <Text weight="medium" style={S.confirmText}>
                  확인
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={S.captureRow}>
              <View style={S.captureSideIcon} />
              <TouchableOpacity onPress={handleCapture} style={S.captureButtonOuter} activeOpacity={0.9}>
                <View style={S.captureButtonInner} />
              </TouchableOpacity>
              <View style={S.captureSideIcon} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  /* 네가 쓰던 스타일 그대로 복붙해도 됨 */
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
  maskTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '25%' },
  maskBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%' },
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
  cornerTL: { top: -4, left: -4, borderLeftWidth: 4, borderTopWidth: 4 },
  cornerTR: { top: -4, right: -4, borderRightWidth: 4, borderTopWidth: 4 },
  cornerBL: { bottom: -4, left: -4, borderLeftWidth: 4, borderBottomWidth: 4 },
  cornerBR: { bottom: -4, right: -4, borderRightWidth: 4, borderBottomWidth: 4 },
  centerGuideTextWrap: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centerGuideTitle: { fontSize: 18, lineHeight: 28, color: '#fff' },
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
  confirmText: { color: '#fff', fontSize: 24, marginLeft: 8 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 32,
  },
  authText: { color: '#fff', fontSize: 20, textAlign: 'center', marginBottom: 24 },
  settingsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: palette.aqua300,
    marginTop: 16,
  },
  settingsButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
