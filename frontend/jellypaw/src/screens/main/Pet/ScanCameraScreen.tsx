// src/screens/main/Pet/ScanCameraScreen.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  ActionSheetIOS,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import { palette } from '../../../ui/system/variants';
import Toast from 'react-native-toast-message';
import RNImageManipulator from 'react-native-image-manipulator';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetStackParamList } from '../../../navigation/PetNavigator';

type Props = NativeStackScreenProps<PetStackParamList, 'ScanCamera'>;

export default function ScanCameraScreen({ navigation: nav, route }: Props) {
  const insets = useSafeAreaInsets();
  const petId = route.params?.petId;
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [processedPhotoUri, setProcessedPhotoUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBack = () => {
    nav.goBack();
  };

  // 카메라 권한 요청 (Android)
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const checkResult = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (checkResult) {
          return true;
        }

        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: '카메라 권한',
          message: '사진을 촬영하기 위해 카메라 권한이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '취소',
          buttonPositive: '허용',
        });

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          Alert.alert('권한 필요', '카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.', [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동',
              onPress: () => Linking.openSettings(),
            },
          ]);
          return false;
        }
      } catch (err) {
        console.warn('카메라 권한 요청 오류:', err);
        return false;
      }
    }
    // iOS는 launchCamera가 자동으로 권한을 요청함
    return true;
  };

  // 이미지 처리 (리사이징 + 압축)
  const processImage = async (imageUri: string): Promise<string> => {
    try {
      console.log('[ScanCameraScreen] 이미지 처리 시작 (리사이징 + 압축)...');
      console.log('[ScanCameraScreen] 원본 URI:', imageUri);

      // react-native-image-manipulator 모듈 확인
      if (!RNImageManipulator || typeof RNImageManipulator.manipulate !== 'function') {
        console.warn('[ScanCameraScreen] react-native-image-manipulator 모듈이 로드되지 않았습니다. 원본 이미지를 사용합니다.');
        return imageUri;
      }

      // react-native-image-manipulator가 자동으로 EXIF orientation 처리
      // 최대 너비 1920px로 리사이징 (원본 비율 유지)
      const manipulatedImage = await RNImageManipulator.manipulate(imageUri, [{ resize: { width: 1920 } }], {
        compress: 0.8, // 80% 품질로 압축
        format: 'jpeg', // JPEG 형식으로 저장
      });

      console.log('[ScanCameraScreen] 이미지 처리 완료:', manipulatedImage.uri);
      return manipulatedImage.uri;
    } catch (compressError: any) {
      console.error('[ScanCameraScreen] 이미지 처리 실패:', compressError);
      console.error('[ScanCameraScreen] 에러 상세:', {
        message: compressError?.message,
        code: compressError?.code,
        name: compressError?.name,
      });
      // 처리 실패 시 원본 사용
      console.warn('[ScanCameraScreen] 원본 이미지를 사용합니다.');
      return imageUri;
    }
  };

  // 카메라로 촬영
  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 1.0, // 최대 품질로 촬영 (나중에 압축)
        saveToPhotos: false,
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorMessage) {
          Toast.show({
            type: 'error',
            text1: '촬영에 실패했어요.',
            text2: response.errorMessage,
          });
          return;
        }

        const imageUri = response.assets?.[0]?.uri;
        if (!imageUri) {
          Toast.show({
            type: 'error',
            text1: '이미지를 불러올 수 없어요.',
          });
          return;
        }

        try {
          setIsProcessing(true);
          console.log('[ScanCameraScreen] 촬영 완료, 이미지 URI:', imageUri);

          // 이미지 처리 (리사이징 + 압축)
          const processedUri = await processImage(imageUri);

          setPhotoUri(imageUri);
          setProcessedPhotoUri(processedUri);
        } catch (error: any) {
          console.error('[ScanCameraScreen] 이미지 처리 오류:', error);
          Toast.show({
            type: 'error',
            text1: '이미지 처리에 실패했어요.',
            text2: error?.message || '다시 시도해주세요.',
          });
        } finally {
          setIsProcessing(false);
        }
      },
    );
  };

  // 갤러리에서 선택
  const handlePickFromLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1.0, // 최대 품질로 선택 (나중에 압축)
        selectionLimit: 1,
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorMessage) {
          Toast.show({
            type: 'error',
            text1: '이미지 선택에 실패했어요.',
            text2: response.errorMessage,
          });
          return;
        }

        const imageUri = response.assets?.[0]?.uri;
        if (!imageUri) {
          Toast.show({
            type: 'error',
            text1: '이미지를 불러올 수 없어요.',
          });
          return;
        }

        try {
          setIsProcessing(true);
          console.log('[ScanCameraScreen] 이미지 선택 완료, URI:', imageUri);

          // 이미지 처리 (리사이징 + 압축)
          const processedUri = await processImage(imageUri);

          setPhotoUri(imageUri);
          setProcessedPhotoUri(processedUri);
        } catch (error: any) {
          console.error('[ScanCameraScreen] 이미지 처리 오류:', error);
          Toast.show({
            type: 'error',
            text1: '이미지 처리에 실패했어요.',
            text2: error?.message || '다시 시도해주세요.',
          });
        } finally {
          setIsProcessing(false);
        }
      },
    );
  };

  // 카메라/갤러리 선택 메뉴 표시
  const handleCapture = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '카메라로 촬영', '갤러리에서 선택'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickFromLibrary();
          }
        },
      );
    } else {
      // Android: Alert로 선택
      Alert.alert('이미지 선택', '이미지를 가져올 방법을 선택해주세요.', [
        { text: '취소', style: 'cancel' },
        { text: '카메라로 촬영', onPress: handleTakePhoto },
        { text: '갤러리에서 선택', onPress: handlePickFromLibrary },
      ]);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
    setProcessedPhotoUri(null);
  };

  const handleConfirm = () => {
    if (!photoUri) return;

    if (!petId) {
      Toast.show({ type: 'error', text1: '대상 반려동물 정보를 찾을 수 없어요.' });
      return;
    }

    // processedPhotoUri가 있으면 처리된 이미지 사용, 없으면 원본 사용
    const imageToSend = processedPhotoUri || photoUri;
    console.log('[ScanCameraScreen] 확인 버튼 클릭, 전송할 파일:', imageToSend);
    console.log('[ScanCameraScreen] 원본 파일:', photoUri);
    console.log('[ScanCameraScreen] 처리된 파일:', processedPhotoUri);
    nav.navigate('ScanLoading', { imageUri: imageToSend, petId });
  };

  return (
    <View style={S.container}>
      {/* 촬영/선택한 이미지 또는 안내 화면 */}
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={S.cameraPreview} resizeMode="contain" />
      ) : (
        <View style={S.placeholderContainer}>
          <Feather name="camera" size={64} color="rgba(255,255,255,0.5)" />
          <Text weight="semiBold" style={S.placeholderTitle}>
            비색판 스캔
          </Text>
          <Text style={S.placeholderSubtitle}>비색판과 검사 스틱을 촬영해주세요</Text>
        </View>
      )}

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

      {/* 처리 중 오버레이 */}
      {isProcessing && (
        <View style={S.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={S.processingText}>이미지 처리 중...</Text>
        </View>
      )}

      {/* 하단 버튼 영역 */}
      <View style={[S.bottomOverlay, { paddingBottom: insets.bottom + 24 }]}>
        {photoUri ? (
          <View style={S.bottomButtonsRow}>
            <TouchableOpacity onPress={handleRetake} style={S.retakeButton} activeOpacity={0.9} disabled={isProcessing}>
              <Feather name="camera" size={18} color="#fff" />
              <Text weight="medium" style={S.retakeText}>
                다시 선택
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
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  cameraPreview: { ...StyleSheet.absoluteFillObject, backgroundColor: 'black' },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    fontSize: 24,
    lineHeight: 32,
    color: '#fff',
    marginTop: 24,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
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
