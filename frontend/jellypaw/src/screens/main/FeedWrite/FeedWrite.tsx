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
  Dimensions,
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
import Slider from '@react-native-community/slider';
import type { PlaceDetails } from '../../../types/GoogleMapType';
import type { FeedWriteStackParamList } from '../../../navigation/FeedWriteNavigator';
import { createFeed, updateFeed, getFeeds } from '../../../services/api/feedWrite';
import { getRedisBoard } from '../../../services/api/redis';
import { FeedListItem } from '../../../types/main/feedList';
import type { FeedWriteRequest, FeedWritePlaceRequest } from '../../../types/main/feedWrite';
import { theme, palette } from '../../../ui/system/variants';
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [visibility, setVisibility] = useState<string>('전체 공개');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tempRating, setTempRating] = useState<number>(0);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 화면 높이 계산
  const screenHeight = Dimensions.get('window').height;
  const headerHeight = 60;
  const bottomToolbarHeight = 48;
  const topContentHeight = 100; // 날짜, 카테고리, 제목, 구분선 등 대략적인 높이
  const locationSectionHeight = location ? 40 : 0; // 장소 섹션 높이 (장소가 있을 때만)
  const imageSectionHeight = images.length > 0 ? 180 : 0; // 사진 목록 높이
  const contentSectionHeight =
    screenHeight - headerHeight - bottomToolbarHeight - insets.top - insets.bottom - topContentHeight - imageSectionHeight - locationSectionHeight;

  // 카테고리 목록
  const categories = [
    { name: '일상', value: 'DAILY', icon: 'calendar-clear', iconFamily: 'Ionicons' },
    { name: '건강', value: 'HEALTH', icon: 'heart', iconFamily: 'Ionicons' },
    { name: '식당', value: 'DINING', icon: 'restaurant', iconFamily: 'Ionicons' },
    { name: '미용', value: 'BEAUTY', icon: 'cut', iconFamily: 'Ionicons' },
    { name: '음식', value: 'FOOD', icon: 'fast-food', iconFamily: 'Ionicons' },
    { name: '장난감', value: 'TOY', icon: 'game-controller', iconFamily: 'Ionicons' },
    { name: '여행', value: 'TRAVEL', icon: 'location', iconFamily: 'Ionicons' },
    { name: '기타', value: 'ETC', icon: 'ellipsis-horizontal-circle-sharp', iconFamily: 'Ionicons' },
  ];

  // 카테고리 이름 가져오기
  const getCategoryName = (value: string): string => {
    const found = categories.find((cat) => cat.value === value);
    return found ? found.name : categoryName || '카테고리 선택';
  };

  // 초기 카테고리 로그
  React.useEffect(() => {
    console.log('[FeedWrite] 초기 카테고리:', categoryValue, '-> category state:', category);
  }, [categoryValue, category]);

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
    // 이미지 개수 체크
    if (images.length >= 3) {
      Alert.alert('알림', '이미지는 최대 3장까지 선택할 수 있습니다.');
      return;
    }

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
          if (captured) {
            if (images.length < 3) {
              setImages([...images, captured] as (string | number)[]);
            } else {
              Alert.alert('알림', '이미지는 최대 3장까지 선택할 수 있습니다.');
            }
          }
        }
      },
    );
  };

  // 이미지 선택 핸들러 - 갤러리에서 선택
  const handlePickFromLibrary = () => {
    // 이미지 개수 체크
    if (images.length >= 3) {
      Alert.alert('알림', '이미지는 최대 3장까지 선택할 수 있습니다.');
      return;
    }

    const remainingSlots = 3 - images.length;
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: remainingSlots, // 남은 이미지 개수만큼만 선택 가능
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
            Alert.alert('알림', '이미지는 최대 3장까지 선택할 수 있습니다.');
            // 최대 3개까지만 추가
            setImages([...images, ...newImageUris.slice(0, remainingSlots)] as (string | number)[]);
          } else {
            setImages([...images, ...newImageUris] as (string | number)[]);
          }
        }
      }
    });
  };

  // 이미지 선택 핸들러 - 커스텀 모달 표시
  const handleImagePicker = () => {
    if (images.length >= 3) {
      Alert.alert('알림', '이미지는 최대 3장까지 선택할 수 있습니다.');
      return;
    }
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

  const handleModalStarClick = (star: number, event: any) => {
    const locationX = event.nativeEvent?.locationX || 0;
    const buttonWidth = 40;
    const isLeftHalf = locationX < buttonWidth / 2;

    if (isLeftHalf) {
      // 왼쪽 클릭: 해당 별의 0.5로 설정
      setTempRating(star - 0.5);
    } else {
      // 오른쪽 클릭: 해당 별의 1.0로 설정
      setTempRating(star);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
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
    if (!title.trim() || !content.trim()) {
      setAlertMessage('제목과 내용을 입력해주세요.');
      setShowCustomAlert(true);
      return;
    }

    try {
      setIsSubmitting(true);

      //  1) 현재 화면에 남아있는 서버 이미지들 (풀 URL → 상대 경로)
      const currentServerImagePaths = images
        .filter((u): u is string => typeof u === 'string')
        .filter((u) => u.startsWith(VITE_IMAGE_BASE_URL))
        .map((fullUrl) => fullUrl.replace(VITE_IMAGE_BASE_URL, ''));

      // 2) 새로 추가된 로컬 이미지들만 업로드 대상
      const newLocalImageUris = images
        .filter((u): u is string => typeof u === 'string')
        .filter((u) => u.startsWith('file://') || u.startsWith('content://'));

      // 3) 삭제할 이미지들 = 처음 서버에 있던 것들 - 지금 남아 있는 것들
      const removeImageUrls = mode === 'edit' ? originalServerImages.filter((orig) => !currentServerImagePaths.includes(orig)) : [];

      const boardRequest: FeedWriteRequest = {
        category,
        title: title.trim(),
        content: content.trim(),
        placeId: mode === 'edit' ? initialPlaceId : null,
        starRating: rating,
        visibility: 'PUBLIC',
        // 백엔드 BoardUpdateRequest.removeImages 와 매칭
        removeImages: removeImageUrls.length > 0 ? removeImageUrls : undefined,
      };

      console.log('[FeedWrite] 게시글 작성 요청 - 카테고리:', category);
      console.log('[FeedWrite] boardRequest:', boardRequest);

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
                // FeedWriteStack을 제거하고 FeedStack으로 이동
                // reset을 사용하여 스택에서 FeedWriteStack을 완전히 제거
                parentNav?.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'FeedStack',
                      params: {
                        screen: 'Feed',
                        params: { boardId: createdBoardId },
                      },
                    },
                  ],
                });
              } else {
                // boardId 못 찾으면 그냥 피드 메인으로
                parentNav?.reset({
                  index: 0,
                  routes: [{ name: 'FeedStack' }],
                });
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
        <BackHeader title={mode === 'edit' ? '피드 수정' : '피드 작성'} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* 날짜 및 카테고리 */}
          <View style={styles.dateSection}>
            <View style={styles.dateRow}>
              {/* 카테고리 선택 */}
              <TouchableOpacity style={styles.categoryButton} onPress={() => setShowCategoryModal(true)} activeOpacity={0.7}>
                {(() => {
                  const selectedCategory = categories.find((cat) => cat.value === category);
                  if (selectedCategory && selectedCategory.iconFamily === 'Ionicons') {
                    return <Icon name={selectedCategory.icon} size={16} color={palette.aqua500} />;
                  }
                  return null;
                })()}
                {/* <Text style={styles.titleCategoryButtonText}>{getCategoryName(category)}</Text> */}
                <Icon name="chevron-down" size={12} color={palette.aqua500} />
              </TouchableOpacity>
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </View>
          </View>

          {/* 위치 표시 (장소가 추가된 경우만) */}
          {location && (
            <View style={styles.locationSection}>
              <View style={styles.locationContainer}>
                <View style={styles.locationIconContainer}>
                  <Icon name="location-outline" size={20} color={palette.aqua500} />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {location}
                  </Text>
                  <TouchableOpacity
                    style={styles.locationRemoveButton}
                    onPress={() => {
                      setLocation('');
                      setSelectedPlace(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon name="close" size={20} color={palette.aqua500} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* 제목 입력 */}
          <View style={styles.titleSection}>
            <Pressable style={styles.titleInputContainer} onPress={() => titleInputRef.current?.focus()}>
              <TextInput
                ref={titleInputRef}
                style={styles.titleInput}
                placeholder="제목"
                placeholderTextColor={palette.gray400}
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />
            </Pressable>
          </View>

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 내용 입력 */}
          <View style={styles.contentSection}>
            <Pressable style={styles.contentInputContainer} onPress={() => contentInputRef.current?.focus()}>
              <TextInput
                ref={contentInputRef}
                style={[styles.contentInput, { minHeight: Math.max(contentSectionHeight, 200) }]}
                placeholder="반려동물과 함께한 특별한 순간을 기록해보세요"
                placeholderTextColor={palette.gray400}
                value={content}
                onChangeText={setContent}
                maxLength={500}
                multiline
                textAlignVertical="top"
              />
            </Pressable>
          </View>

          {/* 첨부된 이미지 가로 리스트 */}
          {images.length > 0 && (
            <View style={styles.attachedImagesSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attachedImagesContainer}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.attachedImageWrapper}>
                    <Image source={typeof uri === 'string' ? { uri } : uri} style={styles.attachedImage} resizeMode="cover" />
                    <TouchableOpacity style={styles.attachedImageRemoveButton} onPress={() => handleRemoveImage(index)}>
                      <Icon name="close-circle" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 3 && (
                  <TouchableOpacity style={styles.attachedImageAddButton} onPress={handleImagePicker} activeOpacity={0.7}>
                    <Icon name="add" size={32} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* 하단 툴바 */}
        <View style={styles.bottomToolbar}>
          <View style={styles.toolbarLeft}>
            <TouchableOpacity style={styles.toolbarButton} onPress={handleImagePicker} activeOpacity={0.7}>
              <Icon name="images-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton} onPress={() => setShowPlaceSearchModal(true)} activeOpacity={0.7}>
              <Icon name="location-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.toolbarRatingContainer}>
              <TouchableOpacity
                style={styles.toolbarRatingButton}
                onPress={() => {
                  setTempRating(rating);
                  setShowRatingModal(true);
                }}
                activeOpacity={0.7}
              >
                <Icon name="star" size={22} color={rating > 0 ? '#FF8585' : palette.gray400} />
                <Text style={styles.toolbarRatingText}>{rating > 0 ? rating.toFixed(1) : ''}</Text>
              </TouchableOpacity>
              {rating > 0 && (
                <TouchableOpacity
                  style={styles.toolbarRatingRemoveButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setRating(0);
                  }}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={16} color={palette.gray400} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.toolbarRight}>
            {isSubmitting ? (
              <Button
                onPress={handleSubmit}
                shape="pillOutline"
                size="sm"
                loading={isSubmitting}
                accessibilityLabel={mode === 'edit' ? '수정하기' : '작성하기'}
                style={{ backgroundColor: 'transparent', borderWidth: 0 }}
              />
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={mode === 'edit' ? '수정하기' : '작성하기'}
                hitSlop={8}
              >
                <Icon name="checkmark" size={24} color={!title.trim() || !content.trim() ? palette.gray400 : palette.aqua300} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* 장소 검색 모달 */}
      <PlaceSearchModal visible={showPlaceSearchModal} onClose={handleModalClose} onPlaceSelect={handlePlaceSelect} />

      {/* 카테고리 선택 모달 */}
      <Modal
        transparent
        visible={showCategoryModal}
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setShowCategoryModal(false)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(12, insets.bottom + 6) }]}>
            <View style={styles.sheetHeader}>
              <Text weight="bold" style={styles.sheetTitle}>
                카테고리 선택
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Icon name="close" size={24} color={theme.text.primary} />
              </TouchableOpacity>
            </View>
            {categories.map((cat) => {
              const renderIcon = () => {
                if (cat.iconFamily === 'Ionicons') {
                  return <Icon name={cat.icon} size={20} color={category === cat.value ? theme.icon.active : theme.icon.inactive} />;
                }
                return null;
              };

              return (
                <Pressable
                  key={cat.value}
                  style={[styles.sheetItem, styles.sheetItemDivider, category === cat.value && styles.sheetItemSelected]}
                  onPress={() => {
                    console.log('[FeedWrite] 카테고리 변경:', cat.name, '->', cat.value);
                    setCategory(cat.value);
                    setShowCategoryModal(false);
                  }}
                >
                  <View style={styles.sheetItemLeft}>
                    {renderIcon()}
                    <Text style={[styles.sheetItemText, category === cat.value && styles.sheetItemTextSelected]}>{cat.name}</Text>
                  </View>
                  {category === cat.value && <Icon name="checkmark" size={20} color={theme.icon.active} style={{ paddingRight: 16 }} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

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

      {/* 별점 선택 모달 */}
      <Modal
        transparent
        visible={showRatingModal}
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.ratingModalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setShowRatingModal(false)} />
          <View style={styles.ratingModalContent}>
            <Text weight="bold" style={styles.ratingModalScore}>
              {tempRating.toFixed(1)}
            </Text>
            <View style={styles.ratingModalStars}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFullStar = tempRating >= star;
                const isHalfStar = tempRating >= star - 0.5 && tempRating < star;
                const starIconName = isFullStar ? 'star' : isHalfStar ? 'star-half' : 'star-outline';
                const starColor = isFullStar || isHalfStar ? palette.pink300 : palette.gray200;
                return (
                  <TouchableOpacity
                    key={star}
                    style={styles.ratingModalStarButton}
                    onPress={(e) => handleModalStarClick(star, e)}
                    activeOpacity={0.7}
                  >
                    <Icon name={starIconName} size={32} color={starColor} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 별점 확인 버튼 */}
            <View style={styles.ratingModalButtons}>
              <Button
                title="취소"
                tone="lightAqua"
                shape="outline"
                size="default"
                onPress={() => setShowRatingModal(false)}
                style={styles.ratingModalButton}
              />
              <Button
                title="확인"
                tone="aqua"
                shape="solid"
                size="default"
                onPress={() => {
                  setRating(tempRating);
                  setShowRatingModal(false);
                }}
                style={styles.ratingModalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 커스텀 Alert 모달 */}
      <Modal
        transparent
        visible={showCustomAlert}
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowCustomAlert(false)}
      >
        <View style={styles.alertModalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setShowCustomAlert(false)} />
          <View style={styles.alertModalContent}>
            <Text weight="bold" style={styles.alertModalMessage}>
              {alertMessage}
            </Text>
            <Button title="확인" tone="aqua" shape="solid" size="default" onPress={() => setShowCustomAlert(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.gray100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  // 상단 버튼들
  topButtonsContainer: {
    flexDirection: 'row',
    paddingBottom: 12,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  // 카테고리 선택 버튼
  topButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: palette.gray200,
    borderRadius: 8,
    gap: 4,
  },
  // 카테고리 선택 버튼 텍스트
  topButtonText: {
    fontSize: 14,
    color: palette.aqua500,
    fontFamily: 'Pretendard-Medium',
  },
  // 날짜 섹션
  dateSection: {
    paddingBottom: 8,
  },
  // 날짜 행
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // 날짜 텍스트
  dateText: {
    fontSize: 14,
    color: palette.gray400,
    fontFamily: 'Pretendard-Medium',
  },
  // 이미지 섹션
  imageSection: {
    paddingHorizontal: 16,
  },
  // 이미지 섹션 플레이스홀더
  imagePlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // 이미지 섹션 플레이스홀더 내부
  imagePlaceholderInner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 이미지 섹션 플레이스홀더 카메라 버튼
  imagePlaceholderCamera: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 첨부된 이미지 섹션
  attachedImagesSection: {
    paddingVertical: 16,
  },
  // 첨부된 이미지 컨테이너
  attachedImagesContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
    paddingBottom: 0,
  },
  // 첨부된 이미지 랩퍼
  attachedImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  // 첨부된 이미지
  attachedImage: {
    width: '100%',
    height: '100%',
  },
  // 첨부된 이미지 제거 버튼
  attachedImageRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  // 첨부된 이미지 추가 버튼
  attachedImageAddButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 위치 섹션
  locationSection: {
    paddingBottom: 16,
  },
  // 위치 컨테이너
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // 위치 아이콘 컨테이너
  locationIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 위치 텍스트 컨테이너
  locationTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  // 위치 텍스트
  locationText: {
    fontSize: 14,
    color: palette.aqua500,
    fontFamily: 'Pretendard-Medium',
  },
  // 위치 제거 버튼
  locationRemoveButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 카테고리 섹션
  categorySection: {
    paddingBottom: 8,
  },
  // 카테고리 행
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // 카테고리 버튼
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: palette.gray200,
    borderRadius: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  // 제목 섹션
  titleSection: {
    paddingBottom: 8,
  },
  // 제목 입력 컨테이너
  titleInputContainer: {
    width: '100%',
  },
  // 제목 입력
  titleInput: {
    fontSize: 18,
    color: palette.aqua500,
    fontFamily: 'Pretendard-Bold',
    padding: 0,
    margin: 0,
  },
  // 구분선
  divider: {
    height: 1,
    backgroundColor: palette.gray200,
    marginBottom: 8,
  },

  // 별점 표시 컨테이너
  ratingDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // 별점 텍스트
  ratingText: {
    fontSize: 20,
    color: palette.aqua500,
    fontFamily: 'Pretendard-Bold',
  },
  // 별점 주기 버튼
  ratingButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: palette.gray100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  // 별점 주기 버튼 텍스트
  ratingButtonText: {
    fontSize: 14,
    color: palette.aqua500,
    fontFamily: 'Pretendard-Medium',
  },
  // 날짜 버튼
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // 날짜 버튼 텍스트
  dateButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
  },
  // 별점 컨테이너
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // 별점 버튼
  starButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 내용 섹션
  contentSection: {
    paddingBottom: 0,
  },
  // 내용 입력 컨테이너
  contentInputContainer: {
    width: '100%',
    height: 320,
  },
  // 내용 입력
  contentInput: {
    fontSize: 14,
    color: palette.aqua500,
    fontFamily: 'Pretendard-Medium',
    padding: 0,
    margin: 0,
    ...Platform.select({
      ios: {
        paddingTop: 0,
      },
      android: {
        paddingTop: 0,
      },
    }),
  },
  // 하단 툴바
  bottomToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: palette.gray100,
    borderTopWidth: 1,
    borderTopColor: palette.gray200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // 하단 툴바 왼쪽
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  // 하단 툴바 오른쪽
  toolbarRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 하단 툴바 버튼
  toolbarButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 하단 툴바 별점 컨테이너
  toolbarRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // 하단 툴바 별점 버튼
  toolbarRatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    padding: 0,
    minWidth: 24,
    minHeight: 24,
  },
  // 하단 툴바 별점 텍스트
  toolbarRatingText: {
    fontSize: 16,
    color: palette.aqua500,
    fontFamily: 'Pretendard-Bold',
  },
  // 하단 툴바 별점 제거 버튼
  toolbarRatingRemoveButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 하단 툴바 장소 버튼
  toolbarLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    padding: 4,
    minWidth: 40,
    minHeight: 40,
  },
  // 하단 툴바 장소 텍스트
  toolbarLocationText: {
    fontSize: 16,
    color: palette.gray400,
    fontFamily: 'Pretendard-Bold',
  },
  // 하단 툴바 장소 텍스트 (활성화)
  toolbarLocationTextActive: {
    color: palette.aqua500,
  },
  // 하단 툴바 장소 제거 버튼
  toolbarLocationRemoveButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 커스텀 모달 스타일 (PhotoPicker와 동일)
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  // 커스텀 모달 백드랍
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000080',
  },
  // 커스텀 모달 스타일
  sheet: {
    backgroundColor: theme.bg.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  // 커스텀 모달 아이템
  sheetItem: {
    height: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 커스텀 모달 아이템 구분선
  sheetItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border.gray,
  },
  // 커스텀 모달 헤더
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray200,
  },
  // 커스텀 모달 헤더 텍스트
  sheetTitle: {
    fontSize: 18,
    color: theme.text.primary,
  },
  // 커스텀 모달 아이템 선택됨
  sheetItemSelected: {
    width: '100%',
    backgroundColor: theme.bg.brandSubtle,
  },
  // 커스텀 모달 아이템 왼쪽 (아이콘 + 텍스트)
  sheetItemLeft: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  // 커스텀 모달 아이템 텍스트
  sheetItemText: {
    fontSize: 16,
    color: theme.text.primary,
  },
  // 커스텀 모달 아이템 텍스트 선택됨
  sheetItemTextSelected: {
    color: theme.icon.active,
    fontFamily: 'Pretendard-Bold',
  },
  // 별점 모달 루트
  ratingModalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 별점 모달 컨텐츠
  ratingModalContent: {
    backgroundColor: theme.bg.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    alignItems: 'center',
    minWidth: 280,
  },
  // 별점 모달 점수
  ratingModalScore: {
    fontSize: 48,
    color: palette.pink300,
  },
  // 별점 모달 별들
  ratingModalStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  // 별점 모달 별 버튼
  ratingModalStarButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  // 별점 모달 힌트
  ratingModalHint: {
    fontSize: 14,
    color: palette.gray400,
    marginBottom: 24,
  },
  // 별점 모달 슬라이더 컨테이너
  ratingModalSliderContainer: {
    width: '100%',
    marginBottom: 24,
  },
  // 별점 모달 슬라이더
  ratingModalSlider: {
    width: '100%',
    height: 40,
  },
  // 별점 모달 버튼들
  ratingModalButtons: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  // 별점 모달 버튼
  ratingModalButton: {
    flex: 1,
  },
  // 커스텀 Alert 모달 루트
  alertModalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 커스텀 Alert 모달 컨텐츠
  alertModalContent: {
    backgroundColor: theme.bg.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 320,
  },
  // 커스텀 Alert 모달 메시지
  alertModalMessage: {
    fontSize: 18,
    color: theme.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
});
