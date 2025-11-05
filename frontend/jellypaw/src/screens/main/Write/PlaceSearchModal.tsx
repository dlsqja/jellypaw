import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../ui/components/Text';
import BackHeader from '../../../ui/components/BackHeader';
import {
  searchPlaces,
  getPlaceDetails,
} from '../../../services/googleMaps/GoogleMapApi';
// types
import { SearchResult, PlaceDetails } from '../../../types/GoogleMapType';
import { Button } from '../../../ui/components/Button';

interface PlaceSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onPlaceSelect: (place: PlaceDetails) => void;
}

export default function PlaceSearchModal({
  visible,
  onClose,
  onPlaceSelect,
}: PlaceSearchModalProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaceDetails, setSelectedPlaceDetails] =
    useState<PlaceDetails | null>(null);

  // Debounce를 위한 타이머
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // 모달이 닫힐 때 검색어 및 선택된 장소 초기화
  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setSelectedPlaceDetails(null);
    }
  }, [visible]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await searchPlaces(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('검색 오류:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = async (place: SearchResult) => {
    try {
      setLoading(true);
      Keyboard.dismiss();

      const details = await getPlaceDetails(place.place_id);
      if (details) {
        setSelectedPlaceDetails(details);
      }
    } catch (error) {
      console.error('상세 정보 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPlace = () => {
    if (selectedPlaceDetails) {
      // onPlaceSelect를 먼저 호출하고 약간의 지연 후 모달 닫기
      onPlaceSelect(selectedPlaceDetails);
      // 상태 업데이트가 완료될 시간을 주기 위해 약간의 지연
      setTimeout(() => {
        onClose();
      }, 50);
    }
  };

  const handleBackToList = () => {
    setSelectedPlaceDetails(null);
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handlePlaceSelect(item)}
    >
      <Text style={styles.resultName}>{item.name}</Text>
      <Text style={styles.resultAddress} numberOfLines={1}>
        {item.address}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* 헤더 */}
        <View style={styles.headerContainer}>
          <BackHeader
            title={selectedPlaceDetails ? '장소 상세 정보' : '장소 검색'}
            onBackPress={selectedPlaceDetails ? handleBackToList : onClose}
          />
        </View>

        {selectedPlaceDetails ? (
          /* 장소 상세 정보 화면 */
          <View style={styles.detailsContainer}>
            <ScrollView style={styles.detailsScrollView}>
              <View style={styles.detailsSection}>
                <Text style={styles.detailsName}>
                  {selectedPlaceDetails.name}
                </Text>
                {selectedPlaceDetails.address && (
                  <View style={styles.detailsRow}>
                    <Icon
                      name="location-outline"
                      size={20}
                      color="#6B7280"
                      style={styles.detailsIcon}
                    />
                    <Text style={styles.detailsText}>
                      {selectedPlaceDetails.address}
                    </Text>
                  </View>
                )}
                {selectedPlaceDetails.phone_number && (
                  <View style={styles.detailsRow}>
                    <Icon
                      name="call-outline"
                      size={20}
                      color="#6B7280"
                      style={styles.detailsIcon}
                    />
                    <Text style={styles.detailsText}>
                      {selectedPlaceDetails.phone_number}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
            <Button
              titleStyle={{ fontFamily: 'Pretendard-Bold' }}
              title="이 장소 선택"
              tone="aqua"
              shape="pillSolid"
              size="lg"
              onPress={handleConfirmPlace}
              style={styles.confirmButton}
            />
          </View>
        ) : (
          <>
            {/* 검색 입력 */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Icon
                  name="search-outline"
                  size={20}
                  color="#A3A3A3"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="원하는 장소를 검색하세요"
                  placeholderTextColor="#A3A3A3"
                  autoFocus
                  returnKeyType="search"
                  onSubmitEditing={() => performSearch(query)}
                />
                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#A3A3A3" />
                  </View>
                )}
              </View>
            </View>

            {/* 검색 결과 */}
            {results.length > 0 ? (
              <FlatList
                data={results}
                renderItem={renderResultItem}
                keyExtractor={item => item.place_id}
                keyboardShouldPersistTaps="handled"
              />
            ) : // 로딩 후에도 검색 결과가 없는 경우
            query.trim().length > 0 && !loading ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>검색 결과가 없습니다</Text>
              </View>
            ) : null}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Pretendard-Bold',
    color: '#284542',
    padding: 0,
  },
  loadingContainer: {
    marginLeft: 8,
  },
  resultItem: {
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  resultName: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#284542',
  },
  resultAddress: {
    fontSize: 12,
    color: '#A3A3A3',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#A3A3A3',
  },
  // 상세 정보 컨테이너 스타일
  detailsContainer: {
    flex: 1,
  },
  detailsScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },

  detailsSection: {
    paddingHorizontal: 8,
    paddingTop: 12,
  },

  detailsName: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    color: '#284542',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailsIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  detailsText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#284542',
    lineHeight: 20,
  },

  confirmButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
});
