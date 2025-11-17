// src/screens/main/Pet/ScanCameraScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, Linking, ActivityIndicator } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Camera, useCameraDevice, type CameraPermissionStatus } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import { palette } from '../../../ui/system/variants';
import Toast from 'react-native-toast-message';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetStackParamList } from '../../../navigation/PetNavigator';

type Props = NativeStackScreenProps<PetStackParamList, 'ScanCamera'>;

export default function ScanCameraScreen({ navigation: nav, route }: Props) {
  const insets = useSafeAreaInsets();

  const cameraRef = useRef<Camera | null>(null);
  const device = useCameraDevice('back');

  const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus | 'granted'>('not-determined');
  const petId = route.params?.petId;
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
        // if (finalStatus === 'denied' || finalStatus === 'restricted') {
        //   // 약간의 지연을 두어 화면이 먼저 렌더링되도록 함
        //   setTimeout(() => {
        //     if (isMounted) {
        //       Alert.alert('카메라 권한 필요', '카메라 권한이 필요합니다.\n설정에서 권한을 허용해 주세요.', [
        //         { text: '취소', style: 'cancel' },
        //         {
        //           text: '설정으로 이동',
        //           onPress: () => Linking.openSettings(),
        //         },
        //       ]);
        //     }
        //   }, 300);
        // }
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

  // 파일이 완전히 저장될 때까지 대기하는 함수
  // React Native Vision Camera의 takePhoto는 파일 저장이 완료된 후 resolve되지만,
  // 추가 안정성을 위해 약간의 지연을 둡니다
  const waitForFileReady = async (filePath: string): Promise<boolean> => {
    try {
      // takePhoto가 완료된 후에도 파일 시스템에 완전히 반영될 때까지 대기
      // 일반적으로 100-300ms면 충분하지만, 안전을 위해 500ms 대기
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

      // Image 컴포넌트가 파일을 로드할 수 있도록 추가 대기
      // 실제로는 takePhoto가 완료되면 파일이 저장되어 있지만,
      // 카메라가 비활성화되기 전에 파일이 완전히 쓰여지도록 보장
      console.log('[ScanCameraScreen] 파일 저장 대기 완료:', filePath);
      return true;
    } catch (error) {
      console.log('[ScanCameraScreen] 파일 확인 중 오류:', error);
      return false;
    }
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

    if (hasCaptured || isProcessing) return;

    try {
      setIsProcessing(true);
      console.log('[ScanCameraScreen] 촬영 시작...');

      // 사진 촬영
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      const filePath = photo.path;
      const uri = 'file://' + filePath;

      console.log('[ScanCameraScreen] takePhoto 완료, 파일 경로:', filePath);

      // 파일이 완전히 저장될 때까지 대기
      const isReady = await waitForFileReady(filePath);

      if (!isReady) {
        throw new Error('파일 저장이 완료되지 않았습니다.');
      }

      // 파일이 완전히 저장된 후에만 photoUri 설정 (카메라 비활성화)
      console.log('[ScanCameraScreen] 파일 저장 완료, photoUri 설정:', uri);
      setPhotoUri(uri);
    } catch (e: any) {
      console.error('[ScanCameraScreen] 촬영 오류:', e);
      Toast.show({
        type: 'error',
        text1: '촬영에 실패했어요.',
        text2: e?.message || '카메라 권한 또는 설정을 확인해 주세요.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => setPhotoUri(null);

  const handleConfirm = () => {
    if (!photoUri) return;

    if (!petId) {
      Toast.show({ type: 'error', text1: '대상 반려동물 정보를 찾을 수 없어요.' });
      return;
    }

    // photoUri가 설정된 시점에 이미 파일 저장이 완료된 상태이므로 바로 전송
    console.log('[ScanCameraScreen] 확인 버튼 클릭, 전송할 파일:', photoUri);
    nav.navigate('ScanLoading', { imageUri: photoUri, petId });
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
          <TouchableOpacity onPress={() => Linking.openSettings()} style={S.settingsButton}>
            <Text style={S.settingsButtonText}>설정으로 이동</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <Camera ref={cameraRef} style={S.cameraPreview} device={device} isActive={!hasCaptured && !isProcessing} photo />;
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

      {/* 처리 중 오버레이 */}
      {isProcessing && (
        <View style={S.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={S.processingText}>사진 저장 중...</Text>
        </View>
      )}

      {/* 하단 버튼 영역 - 권한이 있을 때만 표시 */}
      {hasPermission && (
        <View style={[S.bottomOverlay, { paddingBottom: insets.bottom + 24 }]}>
          {hasCaptured ? (
            <View style={S.bottomButtonsRow}>
              <TouchableOpacity onPress={handleRetake} style={S.retakeButton} activeOpacity={0.9} disabled={isProcessing}>
                <Feather name="camera" size={18} color="#fff" />
                <Text weight="medium" style={S.retakeText}>
                  다시 촬영
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleConfirm} style={S.confirmButton} activeOpacity={0.9} disabled={isProcessing}>
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
                style={[S.captureButtonOuter, isProcessing && S.captureButtonDisabled]}
                activeOpacity={0.9}
                disabled={isProcessing}
              >
                {isProcessing ? <ActivityIndicator size="small" color="#fff" /> : <View style={S.captureButtonInner} />}
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
    paddingHorizontal: 24,
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
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
});
