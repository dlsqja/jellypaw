// FeedWrite.tsx
import React, { useState, useRef } from 'react';
import {
  DeviceEventEmitter,
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import BackHeader from '../../../ui/components/BackHeader';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PermissionsAndroid } from 'react-native';
import { Text } from '../../../ui/components/Text';
import { Button } from '../../../ui/components/Button';
import PlaceSearchModal from './PlaceSearchModal';
import type { PlaceDetails } from '../../../types/GoogleMapType';
import type { FeedWriteStackParamList } from '../../../navigation/FeedWriteNavigator';
import { createFeed, updateFeed, getFeeds } from '../../../services/api/feedWrite';
import { getRedisBoard } from '../../../services/api/redis';
import { FeedListItem } from '../../../types/main/feedList';
import type { FeedWriteRequest, FeedWritePlaceRequest } from '../../../types/main/feedWrite';
import { theme } from '../../../ui/system/variants';
import Feather from 'react-native-vector-icons/Feather';
import { VITE_IMAGE_BASE_URL } from '@env';

type Props = NativeStackScreenProps<FeedWriteStackParamList, 'FeedWrite'>;

export default function FeedWrite({ route, navigation }: Props) {
  const { categoryName, categoryValue = '', mode = 'create' } = route.params || {};

  const [boardId, setBoardId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [images, setImages] = useState<(string | number)[]>([
    // require('../../../../assets/images/pets/반려동물1.png'),
    // require('../../../../assets/images/pets/반려동물2.png'),
    // require('../../../../assets/images/pets/반려동물3.png'),
  ]);
  const [showPlaceSearchModal, setShowPlaceSearchModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pendingLocationRef = useRef<string | null>(null);
  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<string>(categoryValue || '');
  const [initialPlaceId, setInitialPlaceId] = useState<number | null>(null);
  const [originalServerImages, setOriginalServerImages] = useState<string[]>([]);

  // 카메라 권한 요청 함수
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // 먼저 현재 권한 상태 확인
        const checkResult = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);

        // 이미 권한이 허용되어 있으면 true 반환
        if (checkResult) {
          return true;
        }

        // 권한 요청
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: '카메라 권한',
          message: '사진을 촬영하기 위해 카메라 권한이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '취소',
          buttonPositive: '허용',
        });

        // 권한 상태에 따른 처리
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          Alert.alert('권한 거부됨', '카메라 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.', [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동',
              onPress: () => Linking.openSettings(),
            },
          ]);
          return false;
        } else {
          // NEVER_ASK_AGAIN인 경우
          Alert.alert('권한 필요', '카메라 권한이 필요합니다. 설정에서 카메라 권한을 허용해주세요.', [
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
        Alert.alert('오류', '카메라 권한 요청 중 오류가 발생했습니다.');
        return false;
      }
    }
    // iOS는 launchCamera가 자동으로 권한을 요청함
    return true;
  };

  // 이미지 선택 핸들러 - 카메라 촬영
  const handleTakePhoto = async () => {
    // 카메라 권한 확인 및 요청
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('권한 필요', '카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          Alert.alert('오류', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const captured = response.assets[0]?.uri;
          if (captured && images.length < 3) {
            setImages([...images, captured] as (string | number)[]);
          } else if (images.length >= 3) {
            Alert.alert('이미지는 최대 3장까지 선택할 수 있습니다.');
          }
        }
      },
    );
  };

  // 이미지 선택 핸들러 - 갤러리에서 선택
  const handlePickFromLibrary = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: 3 - images.length, // 남은 이미지 개수만큼만 선택 가능
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('오류', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const newImageUris = response.assets.map((asset) => asset.uri).filter((uri): uri is string => uri !== undefined);
        if (newImageUris.length > 0) {
          const totalImages = images.length + newImageUris.length;
          if (totalImages > 3) {
            Alert.alert('이미지는 최대 3장까지 선택할 수 있습니다.');
            setImages([...images, ...newImageUris.slice(0, 3 - images.length)] as (string | number)[]);
          } else {
            setImages([...images, ...newImageUris] as (string | number)[]);
          }
        }
      }
    });
  };

  // 이미지 선택 핸들러 - 커스텀 모달 표시
  const handleImagePicker = () => {
    setSheetOpen(true);
  };

  const closeMenu = () => {
    setSheetOpen(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePlaceSelect = (place: PlaceDetails) => {
    // 모달이 닫힌 후 상태를 업데이트하기 위해 ref에 저장
    pendingLocationRef.current = place.name || '';
    // 즉시 상태 업데이트 시도
    setLocation(place.name || '');
    setSelectedPlace(place);
  };

  // 모달이 닫힌 후 location을 다시 업데이트
  const handleModalClose = () => {
    setShowPlaceSearchModal(false);
    // 모달이 완전히 닫힌 후 location 업데이트
    const pendingLocation = pendingLocationRef.current;
    if (pendingLocation) {
      setTimeout(() => {
        // console.log('모달 닫힌 후 location 업데이트:', pendingLocation);
        setLocation(pendingLocation);
        pendingLocationRef.current = null;
      }, 100);
    }
  };

  const handleStarClick = (star: number, event: any) => {
    const locationX = event.nativeEvent?.locationX || 0;
    const buttonWidth = 40;
    const isLeftHalf = locationX < buttonWidth / 2;

    if (isLeftHalf) {
      // 왼쪽 클릭: 해당 별의 0.5로 설정
      setRating(star - 0.5);
    } else {
      // 오른쪽 클릭: 해당 별의 1.0로 설정
      setRating(star);
    }
  };

  React.useEffect(() => {
    console.log('[FeedWrite] mode =', mode);

    if (mode !== 'edit') {
      console.log('[FeedWrite] create mode init');
      setImages([
        //   require('../../../../assets/images/pets/반려동물1.png'),
        //   require('../../../../assets/images/pets/반려동물2.png'),
        //   require('../../../../assets/images/pets/반려동물3.png'),
      ]);
      return;
    }

    (async () => {
      try {
        console.log('[FeedWrite] edit mode: call getRedisBoard');
        const data = await getRedisBoard();
        console.log('[FeedWrite] getRedisBoard result', data);

        if (!data) {
          Alert.alert('알림', '수정할 게시글 정보를 찾을 수 없습니다.');
          navigation.goBack();
          return;
        }

        setBoardId(data.id);
        setTitle(data.title);
        setContent(data.content);
        setRating(data.starRating || 0);
        setOriginalServerImages(data.images || []);
        setImages((data.images || []).map((url) => `${VITE_IMAGE_BASE_URL}${url}`));
        setCategory(data.category || categoryValue || '');
        setInitialPlaceId(data.placeId ?? null);

        if (data.place) {
          setLocation(data.place.title || '');
        }
      } catch (e: any) {
        console.log('[FeedWrite] getRedisBoard failed', {
          message: e?.message,
          status: e?.response?.status,
          data: e?.response?.data,
        });
        Alert.alert('오류', '게시글 정보를 불러오지 못했어요.');
        navigation.goBack();
      }
    })();
  }, [mode, navigation]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!title.trim() || !content.trim()) return;

    try {
      setIsSubmitting(true);

      // 🔹 1) 현재 화면에 남아있는 서버 이미지들 (풀 URL → 상대 경로)
      const currentServerImagePaths = images
        .filter((u): u is string => typeof u === 'string')
        .filter((u) => u.startsWith(VITE_IMAGE_BASE_URL))
        .map((fullUrl) => fullUrl.replace(VITE_IMAGE_BASE_URL, ''));

      // 🔹 2) 새로 추가된 로컬 이미지들만 업로드 대상
      const newLocalImageUris = images
        .filter((u): u is string => typeof u === 'string')
        .filter((u) => u.startsWith('file://') || u.startsWith('content://'));

      // 🔹 3) 삭제할 이미지들 = 처음 서버에 있던 것들 - 지금 남아 있는 것들
      const removeImageUrls = mode === 'edit' ? originalServerImages.filter((orig) => !currentServerImagePaths.includes(orig)) : [];

      const boardRequest: FeedWriteRequest = {
        category,
        title: title.trim(),
        content: content.trim(),
        placeId: mode === 'edit' ? initialPlaceId : null,
        starRating: rating,
        visibility: 'PRIVATE',
        // 백엔드 BoardUpdateRequest.removeImages 와 매칭
        removeImages: removeImageUrls.length > 0 ? removeImageUrls : undefined,
      };

      const hasSelectedGooglePlace = !!selectedPlace?.place_id;

      const placeRequest: FeedWritePlaceRequest = hasSelectedGooglePlace
        ? {
            placeCode: selectedPlace?.place_id || '',
            title: selectedPlace?.name || '',
            address: selectedPlace?.address || '',
            phoneNumber: selectedPlace?.phone_number || '',
            openingHours: selectedPlace?.opening_hours?.weekday_text || [],
            link: selectedPlace?.website || '',
          }
        : {};

      if (mode === 'edit' && boardId) {
        await updateFeed(boardId, {
          ...boardRequest,
          newImages: newLocalImageUris,
          placeRequest,
        });

        DeviceEventEmitter.emit('FEED_UPDATED', { boardId });

        Alert.alert('완료', '게시글이 수정되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        await createFeed({
          ...boardRequest,
          newImages: newLocalImageUris,
          placeRequest,
        });

        let createdBoardId: number | undefined;

        try {
          const boards: FeedListItem[] = await getFeeds();
          const trimmedTitle = title.trim();
          const trimmedContent = content.trim();

          const candidate = (boards || [])
            .filter((b) => (b.title || '').trim() === trimmedTitle && (b.content || '').trim() === trimmedContent)
            .sort((a, b) => {
              const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return tb - ta; // 최신순
            })[0];

          createdBoardId = candidate?.id;
          console.log('[FeedWrite] inferred createdBoardId from list =', createdBoardId);
        } catch (e) {
          console.log('[FeedWrite] getFeeds failed', e);
        }

        Alert.alert('성공', '게시글이 작성되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              const parentNav = navigation.getParent();

              if (createdBoardId) {
                parentNav?.navigate('FeedStack', {
                  screen: 'Feed',
                  params: { boardId: createdBoardId },
                });
              } else {
                // boardId 못 찾으면 그냥 피드 메인으로
                parentNav?.navigate('FeedStack');
              }
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('오류', error?.message || '요청 처리에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <BackHeader title={mode === 'edit' ? '게시글 수정' : categoryName} />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 제목 입력 */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>제목</Text>
            </View>
            <Pressable style={styles.inputContainer} onPress={() => titleInputRef.current?.focus()}>
              <TextInput
                ref={titleInputRef}
                style={styles.input}
                placeholder="제목을 입력하세요"
                placeholderTextColor="#A3A3A3"
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />
            </Pressable>
            <View style={styles.counterContainer}>
              <Text style={styles.counter}>{title.length}/50</Text>
            </View>
          </View>

          {/* 내용 입력 */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>내용</Text>
            </View>
            <Pressable style={[styles.inputContainer, styles.textAreaContainer]} onPress={() => contentInputRef.current?.focus()}>
              <TextInput
                ref={contentInputRef}
                style={[styles.input, styles.textArea]}
                placeholder="내용을 입력하세요"
                placeholderTextColor="#A3A3A3"
                value={content}
                onChangeText={setContent}
                maxLength={500}
                multiline
                textAlignVertical="top"
              />
            </Pressable>
            <View style={styles.counterContainer}>
              <Text style={styles.counter}>{content.length}/500</Text>
            </View>
          </View>

          {/* 위치 입력 */}
          <View style={[styles.section, styles.optionalSection]}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>위치 (선택사항)</Text>
            </View>
            <TouchableOpacity style={styles.locationInputContainer} onPress={() => setShowPlaceSearchModal(true)} activeOpacity={0.7}>
              <View style={styles.locationIconContainer} pointerEvents="none">
                <Icon name="location-outline" size={20} color="#A3A3A3" />
              </View>
              <View style={[styles.inputContainer, styles.locationInputWrapper]} pointerEvents="none">
                <Text style={[styles.input, styles.locationInput, location ? { color: '#284542' } : {}]} numberOfLines={1}>
                  {location || '위치를 검색하세요'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 평점 선택 */}
          <View style={[styles.section, styles.optionalSection]}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>평점 (선택사항)</Text>
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.starsDisplay}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFullStar = rating >= star;
                  const isHalfStar = rating >= star - 0.5 && rating < star;
                  const starIconName = isFullStar ? 'star' : isHalfStar ? 'star-half' : 'star-outline';
                  const starColor = isFullStar || isHalfStar ? '#FF8585' : '#FF8585';

                  return (
                    <TouchableOpacity key={star} style={styles.starButton} onPress={(e) => handleStarClick(star, e)} activeOpacity={0.7}>
                      <Icon name={starIconName} size={32} color={starColor} />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.ratingValueContainer}>
                <Text style={styles.ratingValue}>{rating > 0 ? rating.toFixed(1) : '0.0'}</Text>
              </View>
            </View>
          </View>

          {/* 사진 선택 */}
          <View style={[styles.section, styles.optionalSection]}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>사진 선택 (최대 3장)</Text>
            </View>
            <View style={styles.imageContainer}>
              {images.length < 3 && (
                <View style={styles.imagePickerWrapper}>
                  <TouchableOpacity style={styles.imagePickerOuter} onPress={handleImagePicker}>
                    <View style={styles.imagePickerInner}>
                      <Feather name="camera" size={32} color={theme.icon.active} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imagePickerFab} onPress={handleImagePicker}>
                    <Feather name="camera" size={16} color={theme.text.onBrand} />
                  </TouchableOpacity>
                </View>
              )}
              {/* 이미지 목록 */}
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={typeof uri === 'string' ? { uri } : uri} style={styles.image} resizeMode="cover" />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveImage(index)}>
                    <Icon name="close-circle" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* 게시물 작성하기 버튼 */}
        <View style={[styles.submitButtonContainer]}>
          <Button
            title={mode === 'edit' ? '게시글 수정하기' : '게시물 작성하기'}
            onPress={handleSubmit}
            shape="pillSolid"
            tone="aqua"
            disabled={title.length === 0 || content.length === 0 || isSubmitting}
          />
        </View>
      </View>

      {/* 장소 검색 모달 */}
      <PlaceSearchModal visible={showPlaceSearchModal} onClose={handleModalClose} onPlaceSelect={handlePlaceSelect} />

      {/* 이미지 선택 커스텀 모달 */}
      <Modal transparent visible={sheetOpen} animationType="fade" presentationStyle="overFullScreen" statusBarTranslucent onRequestClose={closeMenu}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeMenu} />
          <View style={[styles.sheet, { paddingBottom: Math.max(12, insets.bottom + 6) }]}>
            <Pressable
              style={[styles.sheetItem, styles.sheetItemDivider]}
              onPress={() => {
                closeMenu();
                handleTakePhoto();
              }}
            >
              <Feather name="camera" size={18} color={theme.text.primary} />
              <View style={{ width: 8 }} />
              <Text style={{ color: theme.text.primary, fontSize: 16 }}>카메라로 촬영</Text>
            </Pressable>

            <Pressable
              style={[styles.sheetItem, styles.sheetItemDivider]}
              onPress={() => {
                closeMenu();
                handlePickFromLibrary();
              }}
            >
              <Feather name="image" size={18} color={theme.text.primary} />
              <View style={{ width: 8 }} />
              <Text style={{ color: theme.text.primary, fontSize: 16 }}>갤러리에서 선택</Text>
            </Pressable>

            <Pressable style={styles.sheetItem} onPress={closeMenu}>
              <Feather name="x" size={18} color={theme.text.muted} />
              <View style={{ width: 8 }} />
              <Text style={{ color: theme.text.muted, fontSize: 16 }}>취소</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // 컴포넌트 스타일
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // 스크롤 뷰 스타일
  scrollView: {
    flex: 1,
  },
  // 스크롤 뷰 콘텐츠 스타일
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
  },
  // 섹션 스타일
  section: {
    width: '100%',
  },
  // 선택사항 섹션 스타일 (위치, 평점, 사진 선택)
  optionalSection: {
    marginBottom: 32,
  },
  // 라벨 컨테이너 스타일
  labelContainer: {
    paddingBottom: 16,
  },
  // 라벨 스타일
  label: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
    color: '#284542',
    lineHeight: 20,
  },
  // 인풋 컨테이너 스타일
  inputContainer: {
    width: '100%',
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
  },
  // 인풋 스타일
  input: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Pretendard-Medium',
    padding: 0,
    margin: 0,
  },
  // 텍스트 에어리어 컨테이너 스타일
  textAreaContainer: {
    height: 112,
    alignItems: 'flex-start',
  },
  // 텍스트 에어리어 스타일
  textArea: {
    height: '100%',
    ...Platform.select({
      ios: {
        paddingTop: 0,
      },
      android: {
        paddingTop: 0,
      },
    }),
  },
  // 카운터 컨테이너 스타일
  counterContainer: {
    paddingTop: 4,
    alignItems: 'flex-end',
  },
  // 카운터 스타일
  counter: {
    fontSize: 12,
    color: '#A3A3A3',
    lineHeight: 16,
  },
  // 위치 입력 컨테이너 스타일
  locationInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  // 위치 입력 컨테이너 스타일
  locationInputWrapper: {
    flex: 1,
    paddingLeft: 48,
  },
  // 위치 아이콘 컨테이너 스타일
  locationIconContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 위치 입력 스타일
  locationInput: {
    paddingLeft: 0,
    flex: 1,
  },
  // 평점 컨테이너 스타일
  ratingContainer: {
    width: '100%',
    gap: 16,
  },
  // 별점 표시 스타일
  starsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  // 별 버튼 스타일
  starButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 평점 값 컨테이너 스타일
  ratingValueContainer: {
    alignItems: 'center',
  },
  // 평점 값 스타일
  ratingValue: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#284542',
  },
  // 이미지 컨테이너 스타일
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // 이미지 선택 래퍼 스타일
  imagePickerWrapper: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  // 이미지 선택 외부 원형 스타일 (PhotoPicker와 동일)
  imagePickerOuter: {
    width: 80,
    height: 80,
    padding: 4,
    backgroundColor: '#DFF7F2',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FAFAFA',
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  // 이미지 선택 내부 원형 스타일 (PhotoPicker와 동일)
  imagePickerInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E7FAF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 이미지 선택 FAB 버튼 스타일 (PhotoPicker와 동일)
  imagePickerFab: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.icon.active,
    justifyContent: 'center',
    alignItems: 'center',
    right: 0,
    bottom: 0,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  // 이미지 랩퍼 스타일 (원형으로 변경)
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  // 이미지 스타일
  image: {
    width: '100%',
    height: '100%',
  },
  // 이미지 제거 버튼 스타일
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  // 제출 버튼 컨테이너 스타일
  submitButtonContainer: {
    width: '100%',
    paddingTop: 16,
    marginBottom: 16,
  },
  // 커스텀 모달 스타일 (PhotoPicker와 동일)
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000080',
  },
  sheet: {
    backgroundColor: theme.bg.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  sheetItem: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border.gray,
  },
});
