// src/screens/pet/PetManageScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../../ui/system/variants';
import { Text } from '../../../ui/components/Text';
import { PetMiniCard, AddPetCard } from '../../../ui/components/PetMiniCard';
import SegmentedTabs, { TabItem } from '../../../ui/components/SegmentedTabs';
import PetSummaryCard from '../../../ui/components/PetSummaryCard';
import Header from '../../../ui/components/Header';
import { API_BASE_URL } from '@env';

//  React Query 훅 사용
import { usePetList, usePetDetail } from '../../../services/queries/petHooks';
import type { getPetListResponse } from '../../../types/main/pet';

const toAbsolute = (u?: string | null) => {
  if (!u || !u.trim()) return null;
  if (/^(https?:)?\/\//i.test(u)) return u;
  const base = (API_BASE_URL || '').replace(/\/+$/, '');
  const path = u.replace(/^\/+/, '');
  return `${base}/${path}`;
};

const formatGender = (g: any) =>
  g === 'FEMALE' ? '여자' :
  g === 'MALE' ? '남자' :
  g === 'FEMALE_NEUTERING' ? '여자(중성)' :
  g === 'MALE_NEUTERING' ? '남자(중성)' : '없음';

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

  const { data: selectedPet } = usePetDetail(selectedPetId || undefined);

  const tabs: TabItem[] = [
    { id: 'info', label: '동물 정보' },
    { id: 'health', label: '건강 체크' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Header title="동물관리" />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* 상단 펫 카드들 */}
        <View style={{ paddingTop: 16 }}>
          <View style={S.petRow}>
            {pets.map((pet: getPetListResponse) => (
              <PetMiniCard
                key={pet.petId}
                name={pet.name ?? ''}
                species={formatSpecies(pet.species)}
                avatarUri={toAbsolute(pet.photoUrl)}
                selected={selectedPetId === pet.petId}
                onPress={() => setSelectedPetId(pet.petId ?? 0)}
              />
            ))}
            <AddPetCard onPress={() => navigation.navigate('AddPet')} />
          </View>
        </View>

        {/* 탭 */}
        <View style={{ paddingTop: 24 }}>
          <SegmentedTabs tabs={tabs} activeTab={activeTab} onTabChange={(id: any) => setActiveTab(id)} />
        </View>

        {/* 상세 정보 */}
        <View style={{ paddingTop: 16, gap: 16 }}>
          {activeTab === 'info' && (
            <PetSummaryCard
              name={selectedPet?.name ?? ''}
              kind={formatSpecies(selectedPet?.species)}
              avatarUri={toAbsolute(selectedPet?.photoUrl) ?? null}
              age={selectedPet?.age ?? 0}
              weight={selectedPet?.weight ?? 0}
              sex={formatGender(selectedPet?.gender ?? 'NON')}
              onEdit={() =>
                navigation.navigate('EditPet', {
                  petId: selectedPetId,
                  // 프리필용: 쿼리 캐시에 이미 있음 → initial로 전달해도 되고 안 해도 됨
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
  header: {
    height: 64, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1, borderBottomColor: theme.border.gray, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, lineHeight: 28, color: theme.text.primary },
  headerIcon: { width: 24, height: 24, backgroundColor: theme.text.primary, borderRadius: 2 },
  petRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  healthPlaceholder: {
    width: '100%', height: 200, borderRadius: 12, borderWidth: 1, borderColor: theme.border.gray,
    backgroundColor: theme.bg.surface, alignItems: 'center', justifyContent: 'center',
  },
});
