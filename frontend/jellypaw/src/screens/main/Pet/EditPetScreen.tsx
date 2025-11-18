// src/screens/pet/EditPetScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import BackHeader from '../../../ui/components/BackHeader';
import { Text } from '../../../ui/components/Text';
import Input from '../../../ui/components/Input';
import Dropdown from '../../../ui/components/Dropdown';
import PhotoPicker from '../../../ui/components/PhotoPicker';
import { Button } from '../../../ui/components/Button';
import { palette, theme } from '../../../ui/system/variants';
import { useRoute, useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useUpdatePetInfo, useUpdatePetImage, useDeletePet, useDeletePetImage } from '../../../services/queries/petHooks';

import { getPetDetail, updatePetInfo, updatePetImage, deletePet } from '../../../services/api/pet';
import type { PetSpecies, PetGender, getPetDetailResponse } from '../../../types/main/pet';

import { API_BASE_URL, VITE_IMAGE_BASE_URL } from '@env';

// Route params 타입 정의
type RouteParams = {
  petId: number;
  initial?: getPetDetailResponse;
};

// 상대→절대 변환(상세의 photoUrl이 상대경로일 수 있음)
const toImageUrl = (u?: string | null) => {
  if (!u || !u.trim()) return null;
  const trimmed = u.trim();

  // 이미 절대 URL이면 그대로
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const path = trimmed.replace(/^\/+/, '');

  // 1순위: 이미지 베이스 URL
  if (VITE_IMAGE_BASE_URL && VITE_IMAGE_BASE_URL.trim()) {
    return VITE_IMAGE_BASE_URL.replace(/\/+$/, '') + '/' + path;
  }

  return null;
};

const toSpecies = (label: '강아지' | '고양이' | '기타' | ''): PetSpecies | undefined =>
  label === '강아지' ? 'DOG' : label === '고양이' ? 'CAT' : undefined;

const fromSpecies = (sp?: PetSpecies): '강아지' | '고양이' | '기타' | '' => (sp === 'DOG' ? '강아지' : sp === 'CAT' ? '고양이' : '기타');

const toGender = (label: '남자' | '여자' | '남자(중성화)' | '여자(중성화)' | ''): PetGender | undefined => {
  switch (label) {
    case '남자':
      return 'MALE';
    case '여자':
      return 'FEMALE';
    case '남자(중성화)':
      return 'MALE_NEUTERING';
    case '여자(중성화)':
      return 'FEMALE_NEUTERING';
    default:
      return 'NON';
  }
};

const fromGender = (g?: PetGender): '남자' | '여자' | '남자(중성화)' | '여자(중성화)' | '' => {
  switch (g) {
    case 'MALE':
      return '남자';
    case 'FEMALE':
      return '여자';
    case 'MALE_NEUTERING':
      return '남자(중성화)';
    case 'FEMALE_NEUTERING':
      return '여자(중성화)';
    default:
      return '';
  }
};

export default function EditPetScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { petId, initial } = (route.params || {}) as RouteParams;

  useEffect(() => {
    if (!petId) {
      Alert.alert('오류', '잘못된 접근입니다. (petId 없음)');
      nav.goBack();
    }
  }, [petId, nav]);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [deletePhoto, setDeletePhoto] = useState(false); // ✅ 추가: 삭제 의도 플래그

  const [name, setName] = useState('');
  const [animalType, setAnimalType] = useState<'강아지' | '고양이' | '기타' | ''>('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'남자' | '여자' | '남자(중성화)' | '여자(중성화)' | ''>('');

  // 초기 프로필
  useEffect(() => {
    if (!initial) return;
    setName(initial.name ?? '');
    setAnimalType(fromSpecies(initial.species));
    setGender(fromGender(initial.gender as PetGender));
    setAge(initial.age != null ? String(initial.age) : '');
    setWeight(initial.weight != null ? String(initial.weight) : '');
    setPhotoUri(toImageUrl(initial.photoUrl) || null);
    setDeletePhoto(false);
  }, [initial]);

  // 최신값 동기화(선택)
  useEffect(() => {
    if (!petId) return;
    (async () => {
      try {
        const d = await getPetDetail(petId);
        setName(d.name ?? '');
        setAnimalType(fromSpecies(d.species));
        setGender(fromGender(d.gender as PetGender));
        setAge(d.age != null ? String(d.age) : '');
        setWeight(d.weight != null ? String(d.weight) : '');
        setPhotoUri(toImageUrl(d.photoUrl) || null);
        setDeletePhoto(false);
      } catch (e) {
        console.log('[EditPet] getPetDetail 실패', e);
      }
    })();
  }, [petId]);

  const breedPlaceholder = useMemo(() => {
    if (animalType === '강아지') return '예: 골든 리트리버';
    if (animalType === '고양이') return '예: 코리안 숏헤어';
    return '예: 햄스터 / 앵무새 등';
  }, [animalType]);

  const infoMut = useUpdatePetInfo(petId);
  const imgMut = useUpdatePetImage(petId);
  const imgDelMut = useDeletePetImage(petId); // ✅ 추가
  const delPetMut = useDeletePet(petId); // ✅ React Query 삭제 훅 사용

  const onSave = async () => {
    try {
      const speciesEnum = toSpecies(animalType);
      const genderEnum = toGender(gender);
      const ageNum = age.trim() ? parseInt(age.trim(), 10) : undefined;
      const weightNum = weight.trim() ? parseFloat(weight.trim()) : undefined;

      // 1) 정보 업데이트
      await infoMut.mutateAsync({
        name: name.trim(),
        species: speciesEnum,
        gender: genderEnum,
        age: Number.isFinite(ageNum as number) ? ageNum : undefined,
        weight: Number.isFinite(weightNum as number) ? weightNum : undefined,
      });

      // 2) 이미지 처리 분기
      if (deletePhoto) {
        // 프로필 사진 제거 → 서버에서도 삭제
        await imgDelMut.mutateAsync();
      } else if (photoUri && /^file:|^content:|\/storage\//i.test(photoUri)) {
        // 새 로컬/갤러리 이미지 업로드
        await imgMut.mutateAsync(photoUri);
      } // 원격 URL 유지면 스킵

      Alert.alert('완료', '수정되었습니다.');
      nav.goBack(); // Manage는 캐시 최신값으로 즉시 반영됨
    } catch (e: any) {
      Alert.alert('실패', e?.message || '수정 중 오류가 발생했어요.');
    }
  };

  const onDelete = () => {
    Alert.alert('삭제', '동물 정보를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await delPetMut.mutateAsync(); // ✅ 캐시 정리+목록 무효화 처리됨
            Alert.alert('삭제됨', '반려동물이 삭제되었어요.');
            nav.goBack();
          } catch (e: any) {
            Alert.alert('실패', e?.message || '삭제 중 오류가 발생했어요.');
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.gray100 }}>
      <BackHeader title="동물 정보 수정" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* 프로필 사진 */}
        <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 8 }}>
          <PhotoPicker
            uri={photoUri || undefined}
            // 카메라 촬영
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
                    setDeletePhoto(false);
                  }
                },
              );
            }}
            // 갤러리에서 이미지 선택
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
                    setDeletePhoto(false);
                  }
                },
              );
            }}
          />
          <Pressable
            onPress={() => {
              // ✅ 기본이미지로 즉시 전환 + 삭제 의도 표기
              setPhotoUri(null);
              setDeletePhoto(true);
            }}
            hitSlop={6}
            style={{ paddingTop: 16 }}
            accessibilityRole="button"
          >
            <Text weight="semiBold" style={{ color: theme.icon.active, fontSize: 16, lineHeight: 22 }}>
              프로필 사진 제거
            </Text>
          </Pressable>
        </View>

        {/* 기본 정보 */}
        <View style={{ paddingTop: 24 }}>
          <Text weight="bold" style={S.sectionTitle}>
            기본 정보
          </Text>

          <Input label="이름" placeholder="동물 이름을 입력하세요" value={name} onChangeText={setName} />

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

          {/* <Input label="품종" placeholder={breedPlaceholder} value={breed} onChangeText={setBreed} /> */}

          <Input label="나이" placeholder="예: 3" value={age} onChangeText={setAge} keyboardType="number-pad" />
          <Input label="체중" placeholder="예: 4.2" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />

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

          <View style={{ paddingTop: 8, gap: 16, paddingBottom: 32 }}>
            <Button title="수정 완료" shape="pillSolid" tone="aqua" onPress={onSave} />
            <Button
              title="동물 정보 삭제"
              shape="pillOutline"
              tone="red"
              borderTone="pink"
              onPress={onDelete}
              style={{ backgroundColor: palette.pink100 }}
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
