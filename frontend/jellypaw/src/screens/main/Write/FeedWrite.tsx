// FeedWrite.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import MobileLayout from '../../../components/AuthLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import BackHeader from '../../../ui/components/BackHeader';
import { Button } from '../../../ui/components/Button';
import PlaceSearchModal from './PlaceSearchModal';
import type { PlaceDetails } from '../../../types/GoogleMapType';
import type { MainStackParamList } from '../../../navigation/MainStackNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'FeedWrite'>;

export default function FeedWrite({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [images, setImages] = useState<(string | number)[]>([
    require('../../../../assets/pets/반려동물1.png'),
    require('../../../../assets/pets/반려동물2.png'),
    require('../../../../assets/pets/반려동물3.png'),
  ]);
  const [showPlaceSearchModal, setShowPlaceSearchModal] = useState(false);
  const pendingLocationRef = useRef<string | null>(null);

  const handleImagePicker = () => {
    if (images.length >= 3) {
      Alert.alert('알림', '최대 3장까지 선택할 수 있습니다.');
      return;
    }

    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: 3 - images.length, // 남은 이미지 개수만큼만 선택 가능
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        // 사용자가 취소한 경우
        return;
      }

      if (response.errorMessage) {
        Alert.alert('오류', response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const newImageUris = response.assets
          .map(asset => asset.uri)
          .filter((uri): uri is string => uri !== undefined);

        if (newImageUris.length > 0) {
          const totalImages = images.length + newImageUris.length;
          if (totalImages > 3) {
            Alert.alert('알림', '최대 3장까지 선택할 수 있습니다.');
            setImages([
              ...images,
              ...newImageUris.slice(0, 3 - images.length),
            ] as (string | number)[]);
          } else {
            setImages([...images, ...newImageUris] as (string | number)[]);
          }
        }
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePlaceSelect = (place: PlaceDetails) => {
    // 모달이 닫힌 후 상태를 업데이트하기 위해 ref에 저장
    pendingLocationRef.current = place.name || '';
    // 즉시 상태 업데이트 시도
    setLocation(place.name || '');
  };

  // 모달이 닫힌 후 location을 다시 업데이트
  const handleModalClose = () => {
    setShowPlaceSearchModal(false);
    // 모달이 완전히 닫힌 후 location 업데이트
    const pendingLocation = pendingLocationRef.current;
    if (pendingLocation) {
      setTimeout(() => {
        console.log('모달 닫힌 후 location 업데이트:', pendingLocation);
        setLocation(pendingLocation);
        pendingLocationRef.current = null;
      }, 100);
    }
  };

  const handleStarClick = (star: number, event: any) => {
    const locationX = event.nativeEvent?.locationX || 0;
    // 별 버튼의 절반 위치 계산 (아이콘 크기 32 + padding 8 = 약 40)
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

  const handleSubmit = () => {
    // TODO: 게시물 작성 API 호출
    console.log('제출:', { title, content, location, rating, images });
  };

  return (
    <>
      <View style={styles.container}>
        <BackHeader title={categoryName} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 제목 입력 */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>제목</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="제목을 입력하세요"
                placeholderTextColor="#A3A3A3"
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />
            </View>
            <View style={styles.counterContainer}>
              <Text style={styles.counter}>{title.length}/50</Text>
            </View>
          </View>

          {/* 내용 입력 */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>내용</Text>
            </View>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="내용을 입력하세요"
                placeholderTextColor="#A3A3A3"
                value={content}
                onChangeText={setContent}
                maxLength={500}
                multiline
                textAlignVertical="top"
              />
            </View>
            <View style={styles.counterContainer}>
              <Text style={styles.counter}>{content.length}/500</Text>
            </View>
          </View>

          {/* 위치 입력 */}
          <View style={[styles.section, styles.optionalSection]}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>위치 (선택사항)</Text>
            </View>
            <TouchableOpacity
              style={styles.locationInputContainer}
              onPress={() => setShowPlaceSearchModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.locationIconContainer} pointerEvents="none">
                <Icon name="location-outline" size={20} color="#A3A3A3" />
              </View>
              <View
                style={[styles.inputContainer, styles.locationInputWrapper]}
                pointerEvents="none"
              >
                <Text
                  style={[
                    styles.input,
                    styles.locationInput,
                    location ? { color: '#284542' } : {},
                  ]}
                  numberOfLines={1}
                >
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
                {[1, 2, 3, 4, 5].map(star => {
                  const isFullStar = rating >= star;
                  const isHalfStar = rating >= star - 0.5 && rating < star;
                  const starIconName = isFullStar
                    ? 'star'
                    : isHalfStar
                    ? 'star-half'
                    : 'star-outline';
                  const starColor =
                    isFullStar || isHalfStar ? '#FF8585' : '#FF8585';

                  return (
                    <TouchableOpacity
                      key={star}
                      style={styles.starButton}
                      onPress={e => handleStarClick(star, e)}
                      activeOpacity={0.7}
                    >
                      <Icon name={starIconName} size={32} color={starColor} />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.ratingValueContainer}>
                <Text style={styles.ratingValue}>
                  {rating > 0 ? rating.toFixed(1) : '0.0'}
                </Text>
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
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={handleImagePicker}
                >
                  <Icon name="camera-outline" size={24} color="#A3A3A3" />
                  <Text style={styles.imagePickerText}>사진 추가</Text>
                </TouchableOpacity>
              )}
              {/* 이미지 목록 */}
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={typeof uri === 'string' ? { uri } : uri}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Icon name="close-circle" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* 게시물 작성하기 버튼 */}
        <View style={[styles.submitButtonContainer, ,]}>
          <Button
            title="게시물 작성하기"
            onPress={handleSubmit}
            disabled={title.length === 0 || content.length === 0}
          />
        </View>
      </View>

      {/* 장소 검색 모달 */}
      <PlaceSearchModal
        visible={showPlaceSearchModal}
        onClose={handleModalClose}
        onPlaceSelect={handlePlaceSelect}
      />
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
  // 이미지 선택 버튼 스타일
  imagePickerButton: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  // 이미지 선택 텍스트 스타일
  imagePickerText: {
    fontSize: 12,
    color: '#A3A3A3',
    lineHeight: 16,
  },
  // 이미지 랩퍼 스타일
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
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
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  // 제출 버튼 컨테이너 스타일
  submitButtonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  // 제출 버튼 스타일
  // submitButton: {
  //   width: '100%',
  //   height: 56,
  //   backgroundColor: '#111827',
  //   borderRadius: 12,
  // },
  // 제출 버튼 텍스트 스타일
  // submitButtonText: {
  //   fontFamily: 'Pretendard-Bold',
  //   color: '#FFFFFF',
  //   lineHeight: 20,
  // },
});
