// src/screens/main/Pet/PetManageScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme, palette } from '../../../ui/system/variants';
import { Text } from '../../../ui/components/Text';
import { Button } from '../../../ui/components/Button';
import { PetMiniCard, AddPetCard } from '../../../ui/components/PetMiniCard';
import SegmentedTabs, { TabItem } from '../../../ui/components/SegmentedTabs';
import PetSummaryCard from '../../../ui/components/PetSummaryCard';
import Header from '../../../ui/components/Header';
import { VITE_IMAGE_BASE_URL } from '@env';

import { usePetList, usePetDetail } from '../../../services/queries/petHooks';
import type { getPetListResponse } from '../../../types/main/pet';
import HealthCheckIntroSheet from './components/HealthCheckIntroSheet';
import HealthCheckStepSheet from './components/HealthCheckStepSheet';
import { useAuthUserId, useAuthCacheKey } from '../../../services/queries/authHooks';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { petKeys } from '../../../services/queries/petKeys';
import { getUrineAnalysisList } from '../../../services/api/pet';

const toImageUrl = (u?: string | null) => {
  if (!u || !u.trim()) return null;
  if (/^https?:\/\//i.test(u)) return u.trim();
  if (!VITE_IMAGE_BASE_URL) return u.trim();
  return `${VITE_IMAGE_BASE_URL}${u}`;
};

const formatGender = (g: any) =>
  g === 'FEMALE'
    ? '여자'
    : g === 'MALE'
    ? '남자'
    : g === 'FEMALE_NEUTERING'
    ? '여자(중성)'
    : g === 'MALE_NEUTERING'
    ? '남자(중성)'
    : g === 'NON'
    ? '무성'
    : '없음';

const formatSpecies = (s: any) => (s === 'CAT' ? '고양이' : s === 'DOG' ? '강아지' : '기타');

export default function PetManageScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'info' | 'health'>('info');
  const [selectedPetId, setSelectedPetId] = useState<number>(0);

  const [showIntroSheet, setShowIntroSheet] = useState(false);
  const [showStepSheet, setShowStepSheet] = useState(false);

  const nav = useNavigation<any>();

  const userKey = useAuthCacheKey();
  const { data: pets = [], isLoading: isListLoading } = usePetList();

  useEffect(() => {
    setSelectedPetId(0);
  }, [userKey]);

  useEffect(() => {
    if (!isListLoading && pets.length > 0 && selectedPetId === 0) {
      setSelectedPetId(pets[0].petId ?? 0);
    }
  }, [isListLoading, pets, selectedPetId]);

  const tabs: TabItem[] = [
    { id: 'info', label: '동물 정보' },
    { id: 'health', label: '건강 체크' },
  ];

  useEffect(() => {
    if (selectedPetId) {
      getUrineAnalysisList(Number(selectedPetId)).then((data) => {
        console.log('[PET] urineAnalysisList=', data);
      });
    }
  }, [selectedPetId]);

  const isEmpty = !isListLoading && pets.length === 0;

  const uid = useAuthUserId();
  const qc = useQueryClient();

  useFocusEffect(
    React.useCallback(() => {
      qc.invalidateQueries({ queryKey: petKeys.list(uid) });
    }, [qc, uid]),
  );

  // uid가 바뀌면 선택 리셋
  useEffect(() => {
    setSelectedPetId(0);
  }, [uid]);

  // PetManageScreen.tsx
  useEffect(() => {
    console.log('[PET] uid=', uid, 'pets.len=', pets?.length, 'loading=', isListLoading);
  }, [uid, pets, isListLoading]);

  useEffect(() => {
    if (isListLoading) return;

    if (pets.length === 0) {
      if (selectedPetId !== 0) setSelectedPetId(0);
      return;
    }

    const exists = pets.some((p) => p.petId === selectedPetId);
    if (!exists) {
      setSelectedPetId(pets[0].petId ?? 0);
    }
  }, [isListLoading, pets, selectedPetId]);

  const { data: selectedPet } = usePetDetail(selectedPetId || undefined);

  // 포커스시 목록 리프레시도 userKey로
  useFocusEffect(
    React.useCallback(() => {
      qc.invalidateQueries({ queryKey: petKeys.list(userKey) });
    }, [qc, userKey]),
  );

  // 목록 로딩 후 선택 로직은 그대로 유지
  useEffect(() => {
    if (!isListLoading && pets.length > 0 && selectedPetId === 0) {
      setSelectedPetId(pets[0].petId ?? 0);
    }
  }, [isListLoading, pets, selectedPetId]);

  if (isEmpty) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <Header title="동물관리" />
        <View style={S.emptyWrap}>
          <Image source={require('../../../../assets/images/pets/no_pet.png')} style={S.emptyImage} resizeMode="contain" />
          <Text weight="bold" style={S.emptyTitle}>
            현재 등록된 반려동물이 없습니다.
          </Text>
          <Text style={S.emptySubtitle}>반려동물을 등록하고 건강과 일상을 관리해 보세요.</Text>
          <Button title="동물 추가하기" shape="pillSolid" size="lg" tone="aqua" onPress={() => navigation.navigate('AddPet')} style={S.emptyButton} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Header title="동물관리" />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* 상단 펫 카드들 */}
        <View style={{ paddingTop: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.petRow}>
            {pets.map((pet: getPetListResponse) => (
              <PetMiniCard
                key={pet.petId}
                name={pet.name ?? ''}
                species={formatSpecies(pet.species)}
                avatarUri={toImageUrl(pet.photoUrl)}
                selected={selectedPetId === pet.petId}
                onPress={() => setSelectedPetId(pet.petId ?? 0)}
              />
            ))}
            <AddPetCard onPress={() => navigation.navigate('AddPet')} />
          </ScrollView>
        </View>

        {/* 탭 */}
        <View style={{ paddingTop: 24 }}>
          <SegmentedTabs tabs={tabs} activeTab={activeTab} onTabChange={(id: any) => setActiveTab(id)} />
        </View>

        {/* 콘텐츠 */}
        <View style={{ paddingTop: 16, gap: 16 }}>
          {activeTab === 'info' && selectedPet && (
            <PetSummaryCard
              name={selectedPet?.name ?? ''}
              kind={formatSpecies(selectedPet?.species)}
              avatarUri={toImageUrl(selectedPet?.photoUrl) ?? null}
              age={selectedPet?.age ?? 0}
              weight={selectedPet?.weight ?? 0}
              sex={formatGender(selectedPet?.gender ?? 'NON')}
              onEdit={() =>
                navigation.navigate('EditPet', {
                  petId: selectedPetId,
                  initial: selectedPet,
                })
              }
            />
          )}

          {activeTab === 'health' && (
            <Button
              title="건강 검진"
              shape="pillSolid"
              tone="aqua"
              onPress={() => setShowIntroSheet(true)} // ✅ 여기!
            />
          )}
        </View>
      </ScrollView>

      {/* 소변검사 인트로 시트 */}
      <HealthCheckIntroSheet
        visible={showIntroSheet}
        onClose={() => setShowIntroSheet(false)}
        onStartPress={() => {
          setShowIntroSheet(false);
          setShowStepSheet(true);
        }}
        onRequestKitPress={() => {
          // TODO: 키트 신청 화면 이동
        }}
      />

      {/* 단계별 안내 시트 */}
      <HealthCheckStepSheet
        visible={showStepSheet}
        onClose={() => setShowStepSheet(false)}
        onCompleteScan={() => {
          setShowStepSheet(false);
          if (selectedPetId) {
            nav.navigate('ScanCamera', { petId: selectedPetId });
          }
        }}
      />
    </View>
  );
}

const S = StyleSheet.create({
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 26,
    color: theme.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 32,
    height: 52,
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
});
