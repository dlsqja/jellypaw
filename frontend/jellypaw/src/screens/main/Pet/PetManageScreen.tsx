// src/screens/pet/PetManageScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../../ui/system/variants';
import { Text } from '../../../ui/components/Text';
import { Button } from '../../../ui/components/Button';
import { PetMiniCard, AddPetCard } from '../../../ui/components/PetMiniCard';
import SegmentedTabs, { TabItem } from '../../../ui/components/SegmentedTabs';
import PetSummaryCard from '../../../ui/components/PetSummaryCard';
import Header from '../../../ui/components/Header';
import { API_BASE_URL, VITE_IMAGE_BASE_URL } from '@env';

import { usePetList, usePetDetail } from '../../../services/queries/petHooks';
import type { getPetListResponse } from '../../../types/main/pet';

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
    : '없음';

const formatSpecies = (s: any) =>
  s === 'CAT' ? '고양이' : s === 'DOG' ? '강아지' : '기타';

export default function PetManageScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'info' | 'health'>('info');
  const [selectedPetId, setSelectedPetId] = useState<number>(0);

  const { data: pets = [], isLoading: isListLoading } = usePetList();

  // 최초 진입 시 첫 펫 선택
  useEffect(() => {
    if (!isListLoading && pets.length > 0 && selectedPetId === 0) {
      setSelectedPetId(pets[0].petId ?? 0);
    }
  }, [isListLoading, pets, selectedPetId]);

  // 선택된 펫 상세 (pets 없으면 enabled=false)
  const { data: selectedPet } = usePetDetail(
    selectedPetId || undefined,
  );

  const tabs: TabItem[] = [
    { id: 'info', label: '동물 정보' },
    { id: 'health', label: '건강 체크' },
  ];

  const isEmpty = !isListLoading && pets.length === 0;

  // ✅ 여기서 early return (모든 hook 호출 *후*)
  if (isEmpty) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <Header title="동물관리" />
        <View style={S.emptyWrap}>
          <Text weight="bold" style={S.emptyTitle}>
            현재 등록된 반려동물이 없습니다.
          </Text>
          <Text style={S.emptySubtitle}>
            반려동물을 등록하고 건강 정보와 일상을 관리해 보세요.
          </Text>
          <Button
            title="동물 추가하기"
            shape="pillSolid"
            size="lg"
            tone="aqua"
            onPress={() => navigation.navigate('AddPet')}
            style={S.emptyButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Header title="동물관리" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 펫 카드들 */}
        <View style={{ paddingTop: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={S.petRow}
          >
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
          <SegmentedTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id: any) => setActiveTab(id)}
          />
        </View>

        {/* 상세 정보 */}
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
            <View style={S.healthPlaceholder}>
              <Text>건강 체크 콘텐츠 영역</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  healthPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border.gray,
    backgroundColor: theme.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
});
