// src/screens/main/Pet/ScanCameraScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Camera, useCameraDevice, useCameraPermission, useCameraFormat } from 'react-native-vision-camera';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import { palette } from '../../../ui/system/variants';
import Toast from 'react-native-toast-message';
import RNImageManipulator from 'react-native-image-manipulator';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetStackParamList } from '../../../navigation/PetNavigator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PREVIEW_ASPECT_RATIO = 4 / 3; // height / width
const PREVIEW_WIDTH = SCREEN_WIDTH;
const PREVIEW_HEIGHT = SCREEN_WIDTH * PREVIEW_ASPECT_RATIO;

type Props = NativeStackScreenProps<PetStackParamList, 'ScanCamera'>;

export default function ScanCameraScreen({ navigation: nav, route }: Props) {
  const insets = useSafeAreaInsets();
  const petId = route.params?.petId;
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [processedPhotoUri, setProcessedPhotoUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  // 프리뷰와 촬영 결과의 비율을 일치시키기 위한 format 설정
  const format = useCameraFormat(device, [
    { photoAspectRatio: PREVIEW_WIDTH / PREVIEW_HEIGHT }, // 프리뷰 비율과 일치
    { photoResolution: 'max' },
  ]);

  // 카메라 권한 확인 및 요청
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // 화면 포커스 시 카메라 활성화
  useEffect(() => {
    const unsubscribe = nav.addListener('focus', () => {
      setIsActive(true);
    });
    const unsubscribeBlur = nav.addListener('blur', () => {
      setIsActive(false);
    });
    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  }, [nav]);

  const handleBack = () => {
    nav.goBack();
  };

  // 이미지 처리 (크롭 + 리사이징 + 압축)
  const processImage = async (imageUri: string, isFromCamera: boolean = false): Promise<string> => {
    try {
      console.log('[ScanCameraScreen] 이미지 처리 시작 (크롭 + 리사이징 + 압축)...');
      console.log('[ScanCameraScreen] 원본 URI:', imageUri);
      console.log('[ScanCameraScreen] 카메라 촬영 여부:', isFromCamera);

      if (!RNImageManipulator || typeof RNImageManipulator.manipulate !== 'function') {
        console.warn('[ScanCameraScreen] react-native-image-manipulator 모듈이 로드되지 않았습니다. 원본 이미지를 사용합니다.');
        return imageUri;
      }

      // 먼저 이미지 크기 정보 가져오기
      const Image = require('react-native').Image;
      const imageSize = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        Image.getSize(
          imageUri,
          (width: number, height: number) => resolve({ width, height }),
          (error: any) => reject(error),
        );
      });

      console.log('[ScanCameraScreen] 원본 이미지 크기:', imageSize);

      const TARGET_WIDTH = 1920;

      // 카메라로 촬영한 경우에만 가이드라인 영역만 크롭
      if (isFromCamera) {
        // 가이드라인 영역: top/bottom 10%, left/right 10%
        // 즉, 가이드라인 내부는 화면의 80% 너비, 80% 높이
        const guideWidthRatio = 0.8; // 80% 너비
        const guideHeightRatio = 0.8; // 80% 높이

        // 프리뷰는 resizeMode="cover"로 설정되어 있으므로,
        // 실제 이미지가 프리뷰 화면을 가득 채우도록 확대되어 있습니다.
        // 따라서 실제 이미지에서 가이드라인 영역을 계산할 때,
        // 이미지의 실제 크기와 화면 크기의 비율을 고려해야 합니다.

        const previewAspectRatio = PREVIEW_WIDTH / PREVIEW_HEIGHT;
        const imageAspectRatio = imageSize.width / imageSize.height;

        // resizeMode="cover"일 때, 이미지가 화면을 가득 채우도록 확대되므로
        // 실제 이미지에서 화면에 보이는 영역을 계산해야 합니다.
        let visibleWidth = imageSize.width;
        let visibleHeight = imageSize.height;
        let offsetX = 0;
        let offsetY = 0;

        if (imageAspectRatio > previewAspectRatio) {
          // 이미지가 더 넓음 → 상하가 잘림
          visibleWidth = imageSize.width;
          visibleHeight = Math.round(imageSize.width / previewAspectRatio);
          offsetX = 0;
          offsetY = Math.round((imageSize.height - visibleHeight) / 2);
        } else {
          // 이미지가 더 높음 → 좌우가 잘림
          visibleWidth = Math.round(imageSize.height * previewAspectRatio);
          visibleHeight = imageSize.height;
          offsetX = Math.round((imageSize.width - visibleWidth) / 2);
          offsetY = 0;
        }

        // 가이드라인 영역 계산 (화면 기준 80% 너비, 60% 높이)
        const guideAspectRatio = (PREVIEW_WIDTH * guideWidthRatio) / (PREVIEW_HEIGHT * guideHeightRatio);

        // 실제 이미지에서 가이드라인 영역 계산
        const guideWidthInImage = Math.round(visibleWidth * guideWidthRatio);
        const guideHeightInImage = Math.round(visibleHeight * guideHeightRatio);

        // 가이드라인은 화면 중앙에 위치
        const guideXInImage = offsetX + Math.round((visibleWidth - guideWidthInImage) / 2);
        const guideYInImage = offsetY + Math.round((visibleHeight - guideHeightInImage) / 2);

        // 최종 크롭 값
        let cropX = guideXInImage;
        let cropY = guideYInImage;
        let cropWidth = guideWidthInImage;
        let cropHeight = guideHeightInImage;

        // 가이드라인 비율에 맞춰 조정
        const currentGuideAspectRatio = cropWidth / cropHeight;
        if (currentGuideAspectRatio > guideAspectRatio) {
          // 현재 가이드라인이 더 넓음 → 높이를 기준으로 너비 조정
          cropHeight = cropHeight;
          cropWidth = Math.round(cropHeight * guideAspectRatio);
          cropX = guideXInImage + Math.round((guideWidthInImage - cropWidth) / 2);
        } else {
          // 현재 가이드라인이 더 높음 → 너비를 기준으로 높이 조정
          cropWidth = cropWidth;
          cropHeight = Math.round(cropWidth / guideAspectRatio);
          cropY = guideYInImage + Math.round((guideHeightInImage - cropHeight) / 2);
        }

        console.log('[ScanCameraScreen] 프리뷰 비율:', previewAspectRatio);
        console.log('[ScanCameraScreen] 이미지 비율:', imageAspectRatio);
        console.log('[ScanCameraScreen] 이미지 크기:', imageSize);
        console.log('[ScanCameraScreen] 화면에 보이는 영역:', { visibleWidth, visibleHeight, offsetX, offsetY });
        console.log('[ScanCameraScreen] 가이드라인 비율:', guideAspectRatio);
        console.log('[ScanCameraScreen] 크롭 값:', { cropX, cropY, cropWidth, cropHeight });

        // 계산된 영역으로 크롭 및 리사이징
        if (
          cropWidth > 0 &&
          cropHeight > 0 &&
          cropX >= 0 &&
          cropY >= 0 &&
          cropX + cropWidth <= imageSize.width &&
          cropY + cropHeight <= imageSize.height
        ) {
          try {
            console.log('[ScanCameraScreen] ImageManipulator로 크롭 시도...');
            const manipulatedImage = await RNImageManipulator.manipulate(
              imageUri,
              [
                {
                  crop: {
                    originX: cropX,
                    originY: cropY,
                    width: cropWidth,
                    height: cropHeight,
                  },
                },
                { resize: { width: TARGET_WIDTH } },
              ],
              {
                compress: 0.8,
                format: 'jpeg',
              },
            );
            console.log('[ScanCameraScreen] ✅ 크롭 및 리사이징 완료:', manipulatedImage.uri);

            try {
              const processedImageSize = await new Promise<{ width: number; height: number }>((resolve, reject) => {
                Image.getSize(
                  manipulatedImage.uri,
                  (width: number, height: number) => resolve({ width, height }),
                  (error: any) => reject(error),
                );
              });
              console.log('[ScanCameraScreen] 최종 이미지 크기:', processedImageSize);
            } catch (sizeError) {
              console.warn('[ScanCameraScreen] 최종 이미지 크기 확인 실패:', sizeError);
            }

            return manipulatedImage.uri;
          } catch (cropError: any) {
            console.error('[ScanCameraScreen] ImageManipulator 크롭 실패:', cropError);
            console.error('[ScanCameraScreen] 크롭 에러 상세:', {
              message: cropError?.message,
              code: cropError?.code,
              name: cropError?.name,
            });
            // 실패 시 리사이징만 적용
          }
        }
      }

      // 크롭이 없거나 실패한 경우, 전체 이미지를 리사이징만 적용
      const resizedImage = await RNImageManipulator.manipulate(
        imageUri,
        [{ resize: { width: TARGET_WIDTH } }],
        {
          compress: 0.8,
          format: 'jpeg',
        },
      );
      console.log('[ScanCameraScreen] ✅ 리사이징 완료:', resizedImage.uri);
      return resizedImage.uri;
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

  // 카메라로 촬영 (react-native-vision-camera)
  const handleTakePhoto = async () => {
    if (!hasPermission) {
      const permissionResult = await requestPermission();
      if (!permissionResult) {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.', [
          { text: '취소', style: 'cancel' },
          {
            text: '설정으로 이동',
            onPress: () => Linking.openSettings(),
          },
        ]);
        return;
      }
    }

    if (!cameraRef.current || !device) {
      Toast.show({
        type: 'error',
        text1: '카메라를 사용할 수 없어요.',
      });
      return;
    }

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      const imageUri = `file://${photo.path}`;
      console.log('[ScanCameraScreen] 촬영 완료, 이미지 URI:', imageUri);

      // 이미지 처리 (크롭 + 리사이징 + 압축) - 카메라 촬영이므로 크롭 적용
      const processedUri = await processImage(imageUri, true);

      setPhotoUri(imageUri);
      setProcessedPhotoUri(processedUri);
      setIsActive(false); // 촬영 후 카메라 비활성화
    } catch (error: any) {
      console.error('[ScanCameraScreen] 촬영 오류:', error);
      Toast.show({
        type: 'error',
        text1: '촬영에 실패했어요.',
        text2: error?.message || '다시 시도해주세요.',
      });
    } finally {
      setIsProcessing(false);
    }
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

          // 이미지 처리 (리사이징 + 압축) - 갤러리 선택이므로 크롭 없음
          const processedUri = await processImage(imageUri, false);

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

  // 갤러리 버튼 클릭
  const handleGalleryPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '갤러리에서 선택'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handlePickFromLibrary();
          }
        },
      );
    } else {
      Alert.alert('이미지 선택', '갤러리에서 이미지를 선택하시겠어요?', [
        { text: '취소', style: 'cancel' },
        { text: '갤러리에서 선택', onPress: handlePickFromLibrary },
      ]);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
    setProcessedPhotoUri(null);
    setIsActive(true); // 재촬영 시 카메라 다시 활성화
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

  // 카메라 권한이 없을 때
  if (!hasPermission) {
    return (
      <View style={S.container}>
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
        <View style={S.placeholderContainer}>
          <Feather name="camera-off" size={64} color="rgba(255,255,255,0.5)" />
          <Text weight="semiBold" style={S.placeholderTitle}>
            카메라 권한이 필요해요
          </Text>
          <Text style={S.placeholderSubtitle}>설정에서 카메라 권한을 허용해주세요</Text>
          <TouchableOpacity onPress={requestPermission} style={S.permissionButton}>
            <Text weight="medium" style={S.permissionButtonText}>
              권한 요청
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 카메라 디바이스가 없을 때
  if (!device) {
    return (
      <View style={S.container}>
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
        <View style={S.placeholderContainer}>
          <Feather name="camera-off" size={64} color="rgba(255,255,255,0.5)" />
          <Text weight="semiBold" style={S.placeholderTitle}>
            카메라를 사용할 수 없어요
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={S.container}>
      <View style={S.previewArea}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={S.capturedImage} resizeMode="cover" />
        ) : (
          <View style={S.cameraBox}>
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isActive}
              photo={true}
              format={format}
            />
            {/* 가이드라인 오버레이 */}
            <View style={S.guideOverlay} pointerEvents="none">
              <GuideLines />
            </View>
          </View>
        )}
      </View>

      {/* 상단 오버레이 */}
      <View style={[S.topOverlay, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={S.topBackButton} hitSlop={8}>
          <Feather name="x" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={S.topTitleWrap}>
          <Text weight="bold" style={S.topTitle}>
            비색판 스캔
          </Text>
          <Text style={S.topSubtitle}>검정색 마커를 가이드라인에 맞춰주세요</Text>
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
          <View style={S.bottomButtonsRow}>
            <TouchableOpacity onPress={handleGalleryPress} style={S.galleryButton} activeOpacity={0.9} disabled={isProcessing}>
              <Feather name="image" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTakePhoto}
              style={[S.captureButton, isProcessing && S.captureButtonDisabled]}
              activeOpacity={0.9}
              disabled={isProcessing}
            >
              <View style={S.captureButtonInner} />
            </TouchableOpacity>

            <View style={{ width: 40 }} />
          </View>
        )}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', alignItems: 'center' },
  previewArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
    paddingBottom: 180,
  },
  cameraBox: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  capturedImage: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    borderRadius: 24,
    backgroundColor: '#000',
  },
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
  startButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: palette.aqua300,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  startButtonDisabled: {
    opacity: 0.5,
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
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  galleryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  permissionButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: palette.aqua300,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

// 가이드라인 컴포넌트 (4개의 L자 모양)
function GuideLines() {
  const GUIDE_SIZE = 40; // L자 가이드라인 크기
  const GUIDE_THICKNESS = 3; // 선 두께
  const GUIDE_COLOR = '#00FFFF'; // 청록색 (cyan)

  return (
    <View style={guideStyles.container}>
      {/* 좌상단 L자 (┌) */}
      <View style={[guideStyles.corner, guideStyles.topLeft]}>
        <View style={[guideStyles.line, guideStyles.horizontal, { width: GUIDE_SIZE, top: 0, left: 0 }]} />
        <View style={[guideStyles.line, guideStyles.vertical, { height: GUIDE_SIZE, top: 0, left: 0 }]} />
      </View>

      {/* 우상단 L자 (┐) */}
      <View style={[guideStyles.corner, guideStyles.topRight]}>
        <View style={[guideStyles.line, guideStyles.horizontal, { width: GUIDE_SIZE, top: 0, right: 0 }]} />
        <View style={[guideStyles.line, guideStyles.vertical, { height: GUIDE_SIZE, top: 0, right: 0 }]} />
      </View>

      {/* 우하단 L자 (┘) */}
      <View style={[guideStyles.corner, guideStyles.bottomRight]}>
        <View style={[guideStyles.line, guideStyles.horizontal, { width: GUIDE_SIZE, bottom: 0, right: 0 }]} />
        <View style={[guideStyles.line, guideStyles.vertical, { height: GUIDE_SIZE, bottom: 0, right: 0 }]} />
      </View>

      {/* 좌하단 L자 (└) */}
      <View style={[guideStyles.corner, guideStyles.bottomLeft]}>
        <View style={[guideStyles.line, guideStyles.horizontal, { width: GUIDE_SIZE, bottom: 0, left: 0 }]} />
        <View style={[guideStyles.line, guideStyles.vertical, { height: GUIDE_SIZE, bottom: 0, left: 0 }]} />
      </View>
    </View>
  );
}

const guideStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  corner: {
    position: 'absolute',
  },
  topLeft: {
    top: '10%',
    left: '10%',
  },
  topRight: {
    top: '10%',
    right: '10%',
  },
  bottomRight: {
    bottom: '10%',
    right: '10%',
  },
  bottomLeft: {
    bottom: '10%',
    left: '10%',
  },
  line: {
    backgroundColor: '#00FFFF',
    position: 'absolute',
  },
  horizontal: {
    height: 3,
  },
  vertical: {
    width: 3,
  },
});
