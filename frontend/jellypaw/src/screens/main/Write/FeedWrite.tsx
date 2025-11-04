// FeedWrite.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import MobileLayout from '../../../components/MobilelLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import BackHeader from '../../../ui/components/BackHeader';
import type { RootStackParamList } from '../../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'FeedWrite'>;

export default function FeedWrite({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  const handleImagePicker = () => {
    // TODO: 이미지 선택 기능 구현
    if (images.length < 3) {
      // 임시로 placeholder 이미지 추가
      setImages([...images, 'https://placehold.co/77x77']);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // TODO: 게시물 작성 API 호출
    console.log('제출:', { title, content, location, rating, images });
  };

  return (
    <MobileLayout style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <BackHeader title={categoryName} showDivider />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 제목 입력 */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Text style={styles.label} weight="semiBold">
              제목
            </Text>
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
            <Text style={styles.label} weight="semiBold">
              내용
            </Text>
          </View>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="오늘의 펫 라이프를 공유해보세요..."
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
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Text style={styles.label} weight="semiBold">
              위치 (선택사항)
            </Text>
          </View>
          <View style={styles.locationInputContainer}>
            <View style={styles.locationIconContainer}>
              <Icon name="location-outline" size={20} color="#A3A3A3" />
            </View>
            <View style={[styles.inputContainer, styles.locationInputWrapper]}>
              <TextInput
                style={[styles.input, styles.locationInput]}
                placeholder="위치를 입력하세요"
                placeholderTextColor="#A3A3A3"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
        </View>

        {/* 평점 선택 */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Text style={styles.label} weight="semiBold">
              평점 (선택사항)
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => setRating(star)}
              >
                <Icon
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={star <= rating ? '#FBBF24' : '#A3A3A3'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 사진 선택 */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Text style={styles.label} weight="semiBold">
              사진 선택 (최대 3장)
            </Text>
          </View>
          <View style={styles.imageContainer}>
            {images.length < 3 && (
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={handleImagePicker}
              >
                <Icon name="camera-outline" size={24} color="#A3A3A3" />
                <Text style={styles.imagePickerText}>카메라</Text>
              </TouchableOpacity>
            )}
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
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
      <View
        style={[
          styles.submitButtonContainer,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            (title.length === 0 || content.length === 0) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={title.length === 0 || content.length === 0}
        >
          <Text
            style={[
              styles.submitButtonText,
              (title.length === 0 || content.length === 0) &&
                styles.submitButtonTextDisabled,
            ]}
            weight="semiBold"
          >
            게시물 작성하기
          </Text>
        </TouchableOpacity>
      </View>
    </MobileLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  section: {
    width: '100%',
  },
  labelContainer: {
    paddingBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
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
  input: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Pretendard-Regular',
    padding: 0,
    margin: 0,
  },
  textAreaContainer: {
    height: 112,
    alignItems: 'flex-start',
  },
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
  counterContainer: {
    paddingTop: 4,
    alignItems: 'flex-end',
  },
  counter: {
    fontSize: 12,
    color: '#A3A3A3',
    lineHeight: 16,
  },
  locationInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  locationInputWrapper: {
    flex: 1,
    paddingLeft: 48,
  },
  locationIconContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInput: {
    paddingLeft: 0,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
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
  imagePickerText: {
    fontSize: 12,
    color: '#A3A3A3',
    lineHeight: 16,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  submitButtonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F9FAFB',
  },
  submitButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#111827',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
