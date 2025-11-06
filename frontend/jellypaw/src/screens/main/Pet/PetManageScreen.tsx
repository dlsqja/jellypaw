import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import SegmentedTabs, { TabItem } from '../../../ui/components/SegmentedTabs';
import { PetMiniCard, AddPetCard } from '../../../ui/components/PetMiniCard';
import PetSummaryCard from '../../../ui/components/PetSummaryCard';
import VaccinationSection from '../../../ui/components/VaccinationSection';
import { theme } from '../../../ui/system/variants';
import Header from '../../../ui/components/Header';

export default function PetManageScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'info' | 'health'>('info');

  const tabs: TabItem[] = [
    { id: 'info', label: '동물 정보' },
    { id: 'health', label: '건강 체크' },
  ];

  const pets = [
    {
      id: '1',
      name: '초코',
      kind: '강아지',
      avatar: 'https://placehold.co/64x64',
    },
    {
      id: '2',
      name: '루비',
      kind: '강아지',
      avatar: 'https://placehold.co/64x64',
    },
  ];
  const [selectedPetId, setSelectedPetId] = useState('1');

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* 헤더 */}
      <Header title="동물관리" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 펫 카드들 */}
        <View style={{ paddingTop: 16 }}>
          <View style={S.petRow}>
            <PetMiniCard
              name="초코"
              kind="강아지"
              avatarUri={pets[0].avatar}
              selected={selectedPetId === pets[0].id}
              onPress={() => setSelectedPetId(pets[0].id)}
            />

            <PetMiniCard
              name="루비"
              kind="강아지"
              avatarUri={pets[1].avatar}
              selected={selectedPetId === pets[1].id}
              onPress={() => setSelectedPetId(pets[1].id)}
            />

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

        {/* 콘텐츠 */}
        <View style={{ paddingTop: 16, gap: 16 }}>
          {activeTab === 'info' && (
            <>
              <PetSummaryCard
                name="초코"
                kind="강아지"
                registeredAt="2021.03.15"
                avatarUri="https://placehold.co/80x80"
                age="3살"
                weight="28kg"
                sex="수컷"
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
