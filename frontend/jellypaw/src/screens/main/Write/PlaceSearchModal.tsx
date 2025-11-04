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
import {
  searchPlaces,
  getPlaceDetails,
} from '../../../services/googleMaps/GoogleMapApi';
// types
import { SearchResult, PlaceDetails } from '../../../types/GoogleMapType';

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
      console.log('handleConfirmPlace 호출됨:', selectedPlaceDetails);
      console.log('장소 이름:', selectedPlaceDetails.name);
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
      <View style={styles.resultContent}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultAddress} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={selectedPlaceDetails ? handleBackToList : onClose}
            style={styles.closeButton}
          >
            <Icon
              name={selectedPlaceDetails ? 'arrow-back' : 'close'}
              size={24}
              color="#284542"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedPlaceDetails ? '장소 상세 정보' : '장소 검색'}
          </Text>
          <View style={styles.closeButton} />
        </View>

        {selectedPlaceDetails ? (
          /* 장소 상세 정보 화면 */
          <View style={styles.detailsContainer}>
            <ScrollView
              style={styles.detailsScrollView}
              contentContainerStyle={styles.detailsContent}
            >
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
            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmPlace}
              >
                <Text style={styles.confirmButtonText}>이 장소 선택</Text>
              </TouchableOpacity>
            </View>
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
                  placeholder="장소를 검색하세요..."
                  placeholderTextColor="#A3A3A3"
                  autoFocus
                  returnKeyType="search"
                  onSubmitEditing={() => performSearch(query)}
                />
                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#6ABFB8" />
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
                style={styles.resultsList}
                contentContainerStyle={styles.resultsContent}
              />
            ) : query.trim().length > 0 && !loading ? (
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
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#284542',
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
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    paddingVertical: 8,
  },
  resultItem: {
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#284542',
    marginBottom: 4,
  },
  resultAddress: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    color: '#A3A3A3',
  },
  // 상세 정보 컨테이너 스타일
  detailsContainer: {
    flex: 1,
  },
  detailsScrollView: {
    flex: 1,
  },
  detailsContent: {
    padding: 16,
  },
  detailsSection: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
  },
  detailsName: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    color: '#284542',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  openingHoursContainer: {
    flex: 1,
  },
  weekdayTextContainer: {
    marginTop: 4,
  },

  confirmButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#6ABFB8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#FFFFFF',
  },
});
