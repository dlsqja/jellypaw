// src/screens/pet/PetManageScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Modal, Pressable, Animated } from 'react-native';
import Toast from 'react-native-toast-message';
import { theme, palette } from '../../../ui/system/variants';
import Feather from 'react-native-vector-icons/Feather';
import { Text } from '../../../ui/components/Text';
import { Button } from '../../../ui/components/Button';
import { PetMiniCard, AddPetCard } from '../../../ui/components/PetMiniCard';
import SegmentedTabs, { TabItem } from '../../../ui/components/SegmentedTabs';
import PetSummaryCard from '../../../ui/components/PetSummaryCard';
import Header from '../../../ui/components/Header';
import { API_BASE_URL, VITE_IMAGE_BASE_URL } from '@env';

import { usePetList, usePetDetail } from '../../../services/queries/petHooks';
import type { getPetListResponse } from '../../../types/main/pet';
import HelathCheck from './HelathCheck';

const toImageUrl = (u?: string | null) => {
  if (!u || !u.trim()) return null;
  if (/^https?:\/\//i.test(u)) return u.trim();
  if (!VITE_IMAGE_BASE_URL) return u.trim();
  return `${VITE_IMAGE_BASE_URL}${u}`;
};

const formatGender = (g: any) =>
  g === 'FEMALE' ? '여자' : g === 'MALE' ? '남자' : g === 'FEMALE_NEUTERING' ? '여자(중성)' : g === 'MALE_NEUTERING' ? '남자(중성)' : '없음';

const formatSpecies = (s: any) => (s === 'CAT' ? '고양이' : s === 'DOG' ? '강아지' : '기타');

export default function PetManageScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'info' | 'health'>('info');
  const [selectedPetId, setSelectedPetId] = useState<number>(0);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  const { data: pets = [], isLoading: isListLoading } = usePetList();

  // 최초 진입 시 첫 펫 선택
  useEffect(() => {
    if (!isListLoading && pets.length > 0 && selectedPetId === 0) {
      setSelectedPetId(pets[0].petId ?? 0);
    }
  }, [isListLoading, pets, selectedPetId]);

  // 선택된 펫 상세 (pets 없으면 enabled=false)
  const { data: selectedPet } = usePetDetail(selectedPetId || undefined);

  const tabs: TabItem[] = [
    { id: 'info', label: '동물 정보' },
    { id: 'health', label: '건강 체크' },
  ];

  const isEmpty = !isListLoading && pets.length === 0;

  // 펫이 없을 때때
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

        {/* 동물 정보 */}
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
          {/* 건강 체크 */}
          {activeTab === 'health' && (
            <Button
              title="건강 검진"
              onPress={() => {
                setShowHealthModal(true);
                Animated.spring(slideAnim, {
                  toValue: 1,
                  useNativeDriver: true,
                  tension: 50,
                  friction: 7,
                }).start();
              }}
            />
          )}
        </View>
      </ScrollView>

      {/* 건강 검진 모달 */}
      <Modal
        visible={showHealthModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setShowHealthModal(false));
        }}
      >
        <Pressable
          style={S.modalOverlay}
          onPress={() => {
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => setShowHealthModal(false));
          }}
        >
          <Animated.View
            style={[
              S.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* 헤더 */}
              <View style={S.modalHeader}>
                <View style={S.modalHeaderLeft}>
                  <Feather name="flask" size={20} color={palette.aqua500} />
                  <Text weight="bold" style={S.modalTitle}>
                    건강 검진
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    Animated.timing(slideAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: true,
                    }).start(() => setShowHealthModal(false));
                  }}
                  hitSlop={8}
                >
                  <Feather name="x" size={24} color={theme.text.primary} />
                </Pressable>
              </View>

              {/* 내용 */}
              <View style={S.modalBody}>
                <Text style={S.modalDescription}>건강 검진 기능을 준비 중입니다.{'\n'}곧 만나보실 수 있어요!</Text>
              </View>

              {/* 버튼 */}
              <View style={S.modalFooter}>
                <Button
                  title="확인"
                  shape="pillSolid"
                  tone="aqua"
                  onPress={() => {
                    Animated.timing(slideAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: true,
                    }).start(() => setShowHealthModal(false));
                  }}
                />
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.bg.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.gray,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: theme.text.primary,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  modalFooter: {
    paddingHorizontal: 24,
  },
});
