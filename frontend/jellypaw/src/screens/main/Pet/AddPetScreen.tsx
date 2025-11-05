// src/screens/pet/AddPetScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import BackHeader from '../../../ui/components/BackHeader';
import { Text } from '../../../ui/components/Text';
import Input from '../../../ui/components/Input';
import { Button } from '../../../ui/components/Button';
import PhotoPicker from '../../../ui/components/PhotoPicker';
import { theme } from '../../../ui/system/variants';
import Dropdown from '../../../ui/components/Dropdown';

export default function AddPetScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // ✅ 동물 “종류” 드롭다운 (강아지/고양이/기타)
  const [animalType, setAnimalType] = useState<
    '강아지' | '고양이' | '기타' | ''
  >('');

  // 기존 필드
  const [name, setName] = useState('');
  const [breed, setBreed] = useState(''); // 품종
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<
    '남자' | '여자' | '남자(중성화)' | '여자(중성화)' | ''
  >('남자');

  const onSave = () => {
    // TODO: 저장 로직
  };

  // 선택된 종류에 따라 품종 placeholder만 유연하게
  const breedPlaceholder = useMemo(() => {
    if (animalType === '강아지') return '예: 골든 리트리버';
    if (animalType === '고양이') return '예: 코리안 숏헤어';
    return '예: 햄스터 / 앵무새 등';
  }, [animalType]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.subtle }}>
      <BackHeader title="동물 추가" showDivider />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 프로필 사진 */}
        <View
          style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 16 }}
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
          <View style={{ height: 20 }} />
        </View>

        {/* 기본 정보 */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text weight="bold" style={S.sectionTitle}>
            기본 정보
          </Text>

          <Input
            label="이름"
            placeholder="동물 이름을 입력하세요"
            value={name}
            onChangeText={setName}
          />

          {/* ✅ 동물 종류 드롭다운 */}
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

          {/* 품종 (종류와 별개로 입력) */}
          <Input
            label="품종"
            placeholder={breedPlaceholder}
            value={breed}
            onChangeText={setBreed}
          />
          {/* 성별 */}
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

          {/* 저장하기 */}
          <View style={{ paddingTop: 8, paddingBottom: 24 }}>
            <Button
              title="저장하기"
              shape="pillSolid"
              size="lg"
              tone="aqua"
              onPress={onSave}
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
