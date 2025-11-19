// src/screens/pet/AddPetScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform, BackHandler, Pressable } from 'react-native';
import BackHeader from '../../../ui/components/BackHeader';
import { Text } from '../../../ui/components/Text';
import Input from '../../../ui/components/Input';
import { Button } from '../../../ui/components/Button';
import PhotoPicker from '../../../ui/components/PhotoPicker';
import { palette, theme } from '../../../ui/system/variants';
import Dropdown from '../../../ui/components/Dropdown';
import { createPet } from '../../../services/api/pet';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker'; 
import { useQueryClient } from '@tanstack/react-query';
import { petKeys } from '../../../services/queries/petKeys'; // 경로는 실제 위치에 맞게


export default function AddPetScreen() {
  const nav = useNavigation<any>();
  const qc = useQueryClient(); 
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Android 하드웨어 뒤로가기 처리
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (nav.canGoBack()) {
          nav.goBack();
          return true; // 이벤트 소비
        }
        return false; // 기본 동작 (앱 종료)
      };

      if (Platform.OS === 'android') {
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
      }
    }, [nav])
  );

  const [animalType, setAnimalType] =
    useState<'DOG' | 'CAT' | 'ETC' | ''>('');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] =
    useState<'남자' | '여자' | '남자(중성화)' | '여자(중성화)' | '무성' | ''>(''); // ✅ 기본 ''로 (placeholder 보이게)

  const onSave = async () => {
  if (!name.trim()) {
    Alert.alert('필수 입력', '이름을 입력해 주세요.');
    return;
  }

  try {
    const species =
      animalType === 'DOG'
        ? 'DOG'
        : animalType === 'CAT'
        ? 'CAT'
        : animalType === 'ETC'
        ? 'ETC'
        : undefined;

    const genderEnum =
      gender === '남자'
        ? 'MALE'
        : gender === '여자'
        ? 'FEMALE'
        : gender === '남자(중성화)'
        ? 'MALE_NEUTERING'
        : gender === '여자(중성화)'
        ? 'FEMALE_NEUTERING'
        : gender === '무성'
        ? 'NON'
        : 'NON';

    const ageNum = age.trim() ? parseInt(age.trim(), 10) : undefined;
    const weightNum = weight.trim()
      ? parseFloat(weight.trim())
      : undefined;

    await createPet({
      name: name.trim(),
      species,
      gender: genderEnum,
      age: Number.isFinite(ageNum as number) ? ageNum : undefined,
      weight: Number.isFinite(weightNum as number) ? weightNum : undefined,
      photoUri,
    });

    qc.invalidateQueries({ queryKey: petKeys.list() });

    Alert.alert('등록 완료', '반려동물이 등록되었습니다.');
    nav.goBack();
  } catch (e) {
    console.log(e);
    Alert.alert('오류', '등록 중 문제가 발생했어요.');
  }
};


  const breedPlaceholder = useMemo(() => {
    if (animalType === 'DOG') return '예: 골든 리트리버';
    if (animalType === 'CAT') return '예: 코리안 숏헤어';
    return '예: 햄스터 / 앵무새 등';
  }, [animalType]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.gray100 }}>
      <BackHeader title="동물 추가" />

      <ScrollView
        contentContainerStyle={[{ paddingBottom: 40 }, S.scrollContent]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* 프로필 사진 */}
        <View
          style={{
            alignItems: 'center',
            paddingTop: 32,
            paddingBottom: 16,
          }}
        >
          <PhotoPicker
            uri={photoUri || undefined}
            onTakePhoto={() => {
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
                  const captured = response.assets?.[0]?.uri ?? null;
                  if (captured) {
                    setPhotoUri(captured);
                  }
                },
              );
            }}
            onPickFromLibrary={() => {
              launchImageLibrary(
                {
                  mediaType: 'photo',
                  quality: 0.8,
                  maxWidth: 1024,
                  maxHeight: 1024,
                  selectionLimit: 1,
                },
                (response: ImagePickerResponse) => {
                  if (response.didCancel) return;
                  if (response.errorMessage) {
                    Alert.alert('오류', response.errorMessage);
                    return;
                  }
                  const picked = response.assets?.[0]?.uri ?? null;
                  if (picked) {
                    setPhotoUri(picked);
                  }
                },
              );
            }}
          />
          {photoUri && (
            <Pressable
              onPress={() => {
                setPhotoUri(null);
              }}
              hitSlop={6}
              style={{ paddingTop: 16 }}
              accessibilityRole="button"
            >
              <Text weight="semiBold" style={{ color: theme.icon.active, fontSize: 16, lineHeight: 22 }}>
                프로필 사진 제거
              </Text>
            </Pressable>
          )}
        </View>

        {/* 기본 정보 */}
        <View style={S.sectionWrap}>
          <Text weight="bold" style={S.sectionTitle}>
            기본 정보
          </Text>

          <Input
            label="이름"
            placeholder="동물 이름을 입력하세요"
            value={name}
            onChangeText={setName}
          />

          {/* 동물 종류 */}
          <View style={S.dropdownWrapTop}>
            <Dropdown
              label="동물 종류"
              value={animalType}
              placeholder="선택하세요"
              options={[
                { label: '강아지', value: 'DOG' },
                { label: '고양이', value: 'CAT' },
                { label: '기타', value: 'ETC' },
              ]}
              onChange={setAnimalType}
            />
          </View>

          {/* 품종 (필요 시 활성화)
          <Input
            label="품종"
            placeholder={breedPlaceholder}
            value={breed}
            onChangeText={setBreed}
          />
          */}

          {/* 성별 */}
          <View style={S.dropdownWrapMid}>
            <Dropdown
              label="성별"
              value={gender}
              placeholder="선택하세요"
              options={[
                { label: '남자', value: '남자' },
                { label: '여자', value: '여자' },
                { label: '남자(중성화)', value: '남자(중성화)' },
                { label: '여자(중성화)', value: '여자(중성화)' },
                { label: '무성', value: '무성' },
              ]}
              onChange={setGender}
            />
          </View>

          <Input
            label="나이"
            placeholder="예: 3"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />
          <Input
            label="체중"
            placeholder="예: 4.2"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />

          <View style={{ paddingTop: 8, paddingBottom: 24 }}>
            <Button
              title="저장하기"
              shape="pillSolid"
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
  scrollContent: {
    overflow: 'visible',
  },
  sectionWrap: {
    overflow: 'visible',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: palette.gray800,
    marginBottom: 16,
  },
  dropdownWrapTop: {
    zIndex: 30,
    ...(Platform.OS === 'android' ? { elevation: 30 } : null),
  },
  dropdownWrapMid: {
    zIndex: 20,
    ...(Platform.OS === 'android' ? { elevation: 20 } : null),
  },
});
