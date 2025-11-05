// src/screens/pet/EditPetScreen.tsx
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import BackHeader from '../../../ui/components/BackHeader';
import { Text } from '../../../ui/components/Text';
import Input from '../../../ui/components/Input';
import Dropdown from '../../../ui/components/Dropdown';
import PhotoPicker from '../../../ui/components/PhotoPicker';
import { Button } from '../../../ui/components/Button';
import { palette, theme } from '../../../ui/system/variants';

export default function EditPetScreen() {
  // 기존 값(예시) – 필요하면 props/route로 주입해서 초기화하세요.
  const [photoUri, setPhotoUri] = useState<string | null>(
    'https://placehold.co/200x200',
  ); // 기존 사진
  const [name, setName] = useState('초코');
  const [animalType, setAnimalType] = useState<
    '강아지' | '고양이' | '기타' | ''
  >('강아지');
  const [breed, setBreed] = useState('골든 리트리버');
  const [age, setAge] = useState('3살');
  const [weight, setWeight] = useState('28kg');
  const [gender, setGender] = useState<
    '남자' | '여자' | '남자(중성화)' | '여자(중성화)' | ''
  >('남자');

  const breedPlaceholder = useMemo(() => {
    if (animalType === '강아지') return '예: 골든 리트리버';
    if (animalType === '고양이') return '예: 코리안 숏헤어';
    return '예: 햄스터 / 앵무새 등';
  }, [animalType]);

  const onSave = () => {
    // TODO: 저장 API
    Alert.alert('저장', '수정된 정보를 저장했어요.');
  };

  const onDelete = () => {
    Alert.alert('삭제', '동물 정보를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          // TODO: 삭제 API
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.gray100 }}>
      <BackHeader title="동물 정보 수정" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 프로필 사진 */}
        <View
          style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 8 }}
        >
          <PhotoPicker
            uri={photoUri || undefined}
            onTakePhoto={() => {
              // launchCamera(...) 후 setPhotoUri(uri)
            }}
            onPickFromLibrary={() => {
              // launchImageLibrary(...) 후 setPhotoUri(uri)
            }}
          />
          <Pressable
            onPress={() => setPhotoUri(null)}
            hitSlop={6}
            style={{ paddingTop: 16 }}
            accessibilityRole="button"
          >
            <Text
              weight="semiBold"
              style={{ color: theme.icon.active, fontSize: 16, lineHeight: 22 }}
            >
              프로필 사진 제거
            </Text>
          </Pressable>
        </View>

        {/* 기본 정보 */}
        <View style={{ paddingTop: 24 }}>
          <Text weight="bold" style={S.sectionTitle}>
            기본 정보
          </Text>

          <Input
            label="이름"
            placeholder="동물 이름을 입력하세요"
            value={name}
            onChangeText={setName}
          />

          <Dropdown
            label="동물 종류"
            value={animalType}
            placeholder="선택하세요"
            options={[
              { label: '강아지', value: '강아지' },
              { label: '고양이', value: '고양이' },
              { label: '기타', value: '기타' },
            ]}
            onChange={setAnimalType}
          />

          <Input
            label="품종"
            placeholder={breedPlaceholder}
            value={breed}
            onChangeText={setBreed}
          />

          <Input
            label="나이"
            placeholder="예: 3살"
            value={age}
            onChangeText={setAge}
            keyboardType="default"
          />

          <Input
            label="체중"
            placeholder="예: 28kg"
            value={weight}
            onChangeText={setWeight}
            keyboardType="default"
          />

          <Dropdown
            label="성별"
            value={gender}
            placeholder="선택하세요"
            options={[
              { label: '남자', value: '남자' },
              { label: '여자', value: '여자' },
              { label: '남자(중성화)', value: '남자(중성화)' },
              { label: '여자(중성화)', value: '여자(중성화)' },
            ]}
            onChange={setGender}
          />

          {/* 액션 버튼 */}
          <View style={{ paddingTop: 8, gap: 16, paddingBottom: 32 }}>
            {/* 수정 완료 */}
            <Button
              title="수정 완료"
              shape="pillSolid"
              size="lg"
              tone="aqua"
              onPress={onSave}
            />

            {/* 삭제 – 스샷처럼 연분홍 배경 + 빨간 아웃라인/텍스트 */}
            <Button
              title="동물 정보 삭제"
              shape="pillOutline"
              size="lg"
              tone="red" // 텍스트 핑크톤
              borderTone="pink" // 보더 핑크
              onPress={onDelete}
              style={{ backgroundColor: palette.pink100 }} // 연분홍 배경
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: theme.text.primary,
    marginBottom: 16,
  },
});
