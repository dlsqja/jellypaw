import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../../ui/system/variants';
import { Text } from '../../../ui/components/Text';
import { PetMiniCard, AddPetCard } from '../../../ui/components/PetMiniCard';
import SegmentedTabs, { TabItem } from '../../../ui/components/SegmentedTabs';
import PetSummaryCard from '../../../ui/components/PetSummaryCard';
import Header from '../../../ui/components/Header';
import { API_BASE_URL } from '@env';

// api import
import { getPetList, getPetDetail } from '../../../services/api/pet';
// type import
import type {
  getPetListResponse,
  getPetDetailResponse,
} from '../../../types/main/pet';

// 상대경로 -> 절대경로, 없으면 null
const toAbsolute = (u?: string | null) => {
  if (!u || !u.trim()) return null;
  // 이미 절대경로(https:// or http:// or //)면 그대로
  if (/^(https?:)?\/\//i.test(u)) return u;

  const base = (API_BASE_URL || '').replace(/\/+$/, ''); // 뒤 슬래시 제거
  const path = u.replace(/^\/+/, '');                    // 앞 슬래시 제거
  return `${base}/${path}`;
};

// 성별 변환 함수
const formatGender = (
  gender: 'FEMALE' | 'FEMALE_NEUTERING' | 'MALE' | 'MALE_NEUTERING' | 'NON',
): string => {
  switch (gender) {
    case 'FEMALE':
      return '여자';
    case 'MALE':
      return '남자';
    case 'FEMALE_NEUTERING':
      return '여자(중성)';
    case 'MALE_NEUTERING':
      return '남자(중성)';
    default:
      return '없음';
  }
};

// 종 변환 함수
const formatSpecies = (species: 'CAT' | 'DOG' | undefined): string => {
  switch (species) {
    case 'CAT':
      return '고양이';
    case 'DOG':
      return '강아지';
    default:
      return '기타';
  }
};

// 기본 이미지 (로컬 리소스)
const defaultImage = require('../../../assets/images/pets/반려동물1.png');

export default function PetManageScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'info' | 'health'>('info');
  // 펫 전체 목록 저장
  const [pets, setPets] = useState<getPetListResponse[]>([]);
  // 선택한 펫 ID 저장
  const [selectedPetId, setSelectedPetId] = useState<number>(0);
  // 위 ID값으로 조회한 펫 상세 정보 저장
  const [selectedPet, setSelectedPet] = useState<getPetDetailResponse | null>(
    null,
  );
  // 펫 목록 불러오기
  useEffect(() => {
    getPetList().then(data => {
      console.log('펫 목록', data);
      setPets(data);
      // 펫 목록이 있고 선택된 펫이 없으면 첫 번째 펫을 선택
      if (data.length > 0 && selectedPetId === 0) {
        setSelectedPetId(data[0].petId ?? 0);
      }
    });
  }, []);

  // 선택한 동물의 상세 정보 불러오기
  useEffect(() => {
    if (selectedPetId !== 0) {
      getPetDetail(selectedPetId).then(data => {
        console.log('펫 상세 정보', data);
        setSelectedPet(data);
      });
    }
  }, [selectedPetId]);

  const tabs: TabItem[] = [
    { id: 'info', label: '동물 정보' },
    { id: 'health', label: '건강 체크' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* 헤더 */}
      <Header title="동물관리" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 펫 카드들 */}
        <View style={{ paddingTop: 16 }}>
          <View style={S.petRow}>
            {pets.map(pet => (
  <PetMiniCard
    key={pet.petId}
    name={pet.name ?? ''}
    species="강아지"
    avatarUri={toAbsolute(pet.photoUrl)}           // ✅ 상대 -> 절대, 없으면 null
    selected={selectedPetId === pet.petId}
    onPress={() => setSelectedPetId(pet.petId ?? 0)}
  />
))}

            <AddPetCard onPress={() => navigation.navigate('AddPet')} />
          </View>
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
          {activeTab === 'info' && (
            <>
              
<PetSummaryCard
  name={selectedPet?.name ?? ''}
  kind={formatSpecies(selectedPet?.species)}
  avatarUri={toAbsolute(selectedPet?.photoUrl) ?? null} // ✅ 동일
  age={selectedPet?.age ?? 0}
  weight={selectedPet?.weight ?? 0}
  sex={formatGender(selectedPet?.gender ?? 'NON')}
  onEdit={() => navigation.navigate('EditPet')}
/>

              {/* <View style={{ paddingTop: 16 }}>
                <VaccinationSection
                  items={[
                    {
                      title: '종합백신',
                      date: '2024.01.15',
                      nextDate: '2025.01.15',
                    },
                    {
                      title: '광견병',
                      date: '2024.01.15',
                      nextDate: '2025.01.15',
                    },
                    {
                      title: '심장사상충',
                      date: '2024.01.01',
                      nextDate: '2024.02.01',
                    },
                  ]}
                />
              </View> */}
            </>
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
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: theme.border.gray, // '#E5E7EB'
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, lineHeight: 28, color: theme.text.primary }, // '#111827'
  headerIcon: {
    width: 24,
    height: 24,
    backgroundColor: theme.text.primary,
    borderRadius: 2,
  },

  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 3장을 가로로 균등 배치
  },

  healthPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border.gray, // '#E5E7EB'
    backgroundColor: theme.bg.surface, // '#FFFFFF'
    alignItems: 'center',
    justifyContent: 'center',
  },
});
