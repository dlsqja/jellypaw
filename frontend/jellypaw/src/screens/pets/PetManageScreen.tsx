import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SafeAreaLayout from '../../components/MobilelLayout';
import { Text } from '../../ui/components/Text';
import SegmentedTabs, { TabItem } from '../../ui/components/SegmentedTabs';
import { PetMiniCard, AddPetCard } from '../../ui/components/PetMiniCard';
import PetSummaryCard from '../../ui/components/PetSummaryCard';
import VaccinationSection from '../../ui/components/VaccinationSection';
import MenuBar from '../../ui/components/MenuBar';

export default function PetManageScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'info' | 'health'>('info');

  const tabs: TabItem[] = [
    { id: 'info', label: '동물 정보' },
    { id: 'health', label: '건강 체크' },
  ];

  const pets = [
    { id: '1', name: '초코', kind: '강아지', avatar: 'https://placehold.co/64x64' },
    { id: '2', name: '루비', kind: '강아지', avatar: 'https://placehold.co/64x64' },
  ];
  const [selectedPetId, setSelectedPetId] = useState('1');

  return (
    <SafeAreaLayout backgroundColor="#F9FAFB" style={{ flex: 1 }}>
      {/* 고정 헤더 */}
      <View style={[S.header, { paddingTop: 16 }]}>
        <Text weight="bold" style={S.headerTitle}>동물관리</Text>
        <View style={S.headerIcon} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 펫 카드들 */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <View style={S.petRow}>
            <PetMiniCard
              name="초코"
              kind="강아지"
              avatarUri={pets[0].avatar}
              selected={selectedPetId === pets[0].id}
              onPress={() => setSelectedPetId(pets[0].id)}
            />
            <View style={{ width: 16 }} />
            <PetMiniCard
              name="루비"
              kind="강아지"
              avatarUri={pets[1].avatar}
              selected={selectedPetId === pets[1].id}
              onPress={() => setSelectedPetId(pets[1].id)}
            />
            <View style={{ width: 16 }} />
            <AddPetCard onPress={() => { /* 추가 */ }} />
          </View>
        </View>

        {/* 탭 */}
        <View style={{ paddingTop: 24 }}>
          <SegmentedTabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as 'info' | 'health')} />
        </View>

        {/* 콘텐츠 */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 16 }}>
          <PetSummaryCard
            name="초코"
            kind="강아지"
            registeredAt="2021.03.15"
            avatarUri="https://placehold.co/80x80"
            age="3살"
            weight="28kg"
            sex="수컷"
            onEdit={() => {}}
          />

          {activeTab === 'info' && (
            <View style={{ paddingTop: 16 }}>
              <VaccinationSection
                items={[
                  { title: '종합백신', date: '2024.01.15', nextDate: '2025.01.15' },
                  { title: '광견병', date: '2024.01.15', nextDate: '2025.01.15' },
                  { title: '심장사상충', date: '2024.01.01', nextDate: '2024.02.01' },
                ]}
              />
            </View>
          )}

          {activeTab === 'health' && (
            <View style={S.healthPlaceholder}>
              <Text>건강 체크 콘텐츠 영역</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 하단 탭바 */}
      <MenuBar
  activeKey="pet"
  onFeedPress={() => navigation.navigate('Feed')}
  onSearchPress={() => navigation.navigate('Search')}
  onPetPress={() => navigation.navigate('Pets')}
  onMyPagePress={() => navigation.navigate('MyPage')}
  onWrite={() => navigation.navigate('FeedWrite')}
/>

    </SafeAreaLayout>
  );
}

const S = StyleSheet.create({
  header: {
    height: 64, paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.95)', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, lineHeight: 28, color: '#111827' },
  headerIcon: { width: 24, height: 24, backgroundColor: '#111827', borderRadius: 2 },
  petRow: { flexDirection: 'row', alignItems: 'center' },
  healthPlaceholder: {
    width: '100%', height: 200, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
  },
});
