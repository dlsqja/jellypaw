// src/screens/main/Pet/ResultSummaryScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '../../../ui/components/Text';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetStackParamList } from '../../../navigation/PetNavigator';
import BackHeader from '../../../ui/components/BackHeader';
import { Button } from '../../../ui/components/Button';
import { palette, theme } from '../../../ui/system/variants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getUrineAnalysisList } from '../../../services/api/pet';
import type { getUrineAnalysisListResponse, UrineAnalysisSummaryItem } from '../../../types/main/pet';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<PetStackParamList, 'ResultSummary'>;

type ItemStatus = 'normal' | 'caution' | 'danger' | 'very_danger' | 'neutral';

interface ResultItem {
  key: string;
  label: string;
  statusLabel: string;
  statusType: ItemStatus;
  dotColor: string;
}

// API 응답을 ResultItem으로 변환하는 함수
function convertToResultItem(item: UrineAnalysisSummaryItem, index: number): ResultItem {
  // testNameKo를 key로 변환 (예: "빌리루빈" -> "bilirubin")
  const keyMap: { [key: string]: string } = {
    유로빌리노겐: 'urobilinogen',
    포도당: 'glucose',
    빌리루빈: 'bilirubin',
    케톤체: 'ketone',
    비중: 'sg',
    잠혈: 'blood',
    pH: 'ph',
    단백질: 'protein',
    아질산염: 'nitrite',
    백혈구: 'wbc',
  };

  const key = keyMap[item.testNameKo] || `item_${index}`;

  // severity와 isNormal에 따라 statusType 결정
  let statusType: ItemStatus = 'normal';
  let statusLabel = '정상';
  let dotColor: string = palette.aqua300;

  if (!item.isNormal) {
    const isPH = item.testNameKo === 'pH';
    
    if (isPH) {
      // pH 항목의 경우
      if (item.severity === 'strong_alkaline') {
        statusType = 'danger';
        statusLabel = '위험';
        dotColor = '#EF4444'; // 빨간색
      } else if (
        item.severity === 'mild_acidic' ||
        item.severity === 'slight_acidic' ||
        item.severity === 'mild_alkaline' ||
        item.severity === 'moderate_alkaline'
      ) {
        statusType = 'caution';
        statusLabel = '주의';
        dotColor = palette.gold700;
      } else {
        // 기본값
        statusType = 'caution';
        statusLabel = '주의';
        dotColor = palette.gold700;
      }
    } else {
      // pH 제외한 항목들
      if (item.severity === 'very_severe') {
        statusType = 'very_danger';
        statusLabel = '매우 위험';
        dotColor = '#B91C1C'; // 진한 빨간색
      } else if (item.severity === 'severe' || item.severity === '심각' || item.severity === '높음') {
        statusType = 'danger';
        statusLabel = '위험';
        dotColor = '#EF4444'; // 빨간색
      } else if (
        item.severity === 'moderate' ||
        item.severity === '중간' ||
        item.severity === 'low' ||
        item.severity === '경증' ||
        item.severity === 'high' ||
        item.severity === '중증'
      ) {
        statusType = 'caution';
        statusLabel = '주의';
        dotColor = palette.gold700;
      } else {
        // 기본값
        statusType = 'caution';
        statusLabel = '주의';
        dotColor = palette.gold700;
      }
    }
  } else {
    // 정상인 경우 (pH 중성도 정상으로 처리)
    statusType = 'normal';
    statusLabel = '정상';
  }

  return {
    key,
    label: item.testNameKo,
    statusLabel,
    statusType,
    dotColor,
  };
}

function statusColor(type: ItemStatus) {
  switch (type) {
    case 'caution':
      return palette.gold800;
    case 'danger':
      return '#EF4444';
    case 'very_danger':
      return '#B91C1C';
    case 'neutral':
      return palette.aqua400;
    case 'normal':
    default:
      return palette.aqua400;
  }
}

export default function ResultSummaryScreen({ route, navigation }: Props) {
  const { analysisId, petId } = route.params;
  const [normalOpen, setNormalOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<getUrineAnalysisListResponse | null>(null);
  const [warningItems, setWarningItems] = useState<ResultItem[]>([]);
  const [normalItems, setNormalItems] = useState<ResultItem[]>([]);

  // API로 분석 결과 가져오기
  useEffect(() => {
    if (!analysisId || !petId) {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '분석 정보를 찾을 수 없습니다.',
      });
      navigation.goBack();
      return;
    }

    const fetchAnalysisResult = async () => {
      try {
        setLoading(true);
        // 목록을 가져와서 analysisId로 필터링
        const list = await getUrineAnalysisList(petId);
        const result = list.find((item) => item.id === analysisId);

        if (!result) {
          throw new Error('분석 결과를 찾을 수 없습니다. 분석이 아직 진행 중일 수 있습니다.');
        }

        setAnalysisData(result);

        // summary를 ResultItem으로 변환
        const allItems = result.summary.map((item, index) => convertToResultItem(item, index));

        // isNormal에 따라 분류 (주의, 위험, 매우 위험은 주의 항목에 포함)
        const warning = allItems.filter((item) => item.statusType === 'caution' || item.statusType === 'danger' || item.statusType === 'very_danger');
        const normal = allItems.filter((item) => item.statusType === 'normal');

        setWarningItems(warning);
        setNormalItems(normal);
      } catch (error: any) {
        console.error('[ResultSummaryScreen] 분석 결과 조회 실패', error);
        Toast.show({
          type: 'error',
          text1: '오류',
          text2: error?.message || '분석 결과를 불러오는데 실패했습니다.',
        });
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisResult();
  }, [analysisId, petId, navigation]);

  const normalCount = normalItems.length;
  const hasWarning = warningItems.length > 0;
  
  // 전체 건강 상태 결정
  const hasDanger = warningItems.some((item) => item.statusType === 'danger' || item.statusType === 'very_danger');
  const cautionCount = warningItems.filter((item) => item.statusType === 'caution').length;
  const needsCheckup = hasDanger || cautionCount >= 5; // 위험/매우위험이 있거나 주의 항목 5개 이상
  
  const overallStatus = useMemo(() => {
    if (needsCheckup) {
      return {
        emoji: '🚨',
        label: '검진 요망',
        color: palette.pink400,
        bgColor: palette.pink100,
      };
    } else if (hasWarning) {
      return {
        emoji: '⚠️',
        label: '주의 필요',
        color: palette.gold800,
        bgColor: palette.gold200,
      };
    } else {
      return {
        emoji: '✅',
        label: '정상',
        color: palette.aqua400,
        bgColor: palette.aqua100,
      };
    }
  }, [needsCheckup, hasWarning]);

  const goDetail = (itemKey: string) => {
    navigation.navigate('ResultDetail', {
      analysisId,
      itemKey,
      petId,
    });
  };

  if (loading) {
    return (
      <View style={[S.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <BackHeader title="소변 검사 분석 결과" />
        <ActivityIndicator size="large" color={palette.aqua300} />
        <Text style={{ marginTop: 16, color: theme.text.secondary }}>분석 결과를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={S.root}>
      <BackHeader title="소변 검사 분석 결과" />

      <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 전체 건강 상태 카드 */}
        <View style={S.card}>
          <View style={S.healthIconWrap}>
            <Text style={S.healthEmoji}>{overallStatus.emoji}</Text>
          </View>
          <Text weight="bold" style={S.healthTitle}>
            전체 건강 상태
          </Text>

          <View style={S.healthBadgeRow}>
            <View style={[S.healthBadge, { backgroundColor: overallStatus.bgColor }]}>
              <Text style={[S.healthBadgeText, { color: overallStatus.color }]}>
                {overallStatus.label}
              </Text>
            </View>
          </View>

          <Text weight="semiBold" style={S.healthDesc}>
            {needsCheckup
              ? '즉시 수의사와 상담하여 검진을 받으시기 바랍니다'
              : hasWarning
              ? '일부 항목에서 주의가 필요합니다'
              : '모든 검사 항목이 정상 범위입니다'}
          </Text>

          <View style={S.noticeBoxWrap}>
            <View style={S.noticeBox}>
              <Text style={S.noticeText}>
                <Text weight="semiBold" style={S.noticeTextStrong}>
                  주의:{' '}
                </Text>
                <Text style={S.noticeTextStrong}>
                  검사 정보는 참고용이며, 정확한 진단을 위해서는 반드시 수의사와
                  상담하시기 바랍니다.
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* 주의 필요 항목 */}
        {hasWarning && (
          <View style={S.section}>
            <View style={S.sectionHeaderRow}>
              <View style={S.sectionTitleLeft}>
                <View style={S.sectionIconCircle}>
                  <Ionicons name="warning" size={14} color={palette.gold800} />
                </View>
                <Text weight="bold" style={S.sectionTitle}>
                  주의 필요 항목 ({warningItems.length}개)
                </Text>
              </View>
            </View>

            {warningItems.map((item) => (
              <ResultRow key={item.key} item={item} onPress={() => goDetail(item.key)} />
            ))}
          </View>
        )}

        {/* 정상 항목 (토글) */}
        <View style={S.section}>
          <TouchableOpacity style={S.sectionHeaderRow} activeOpacity={0.9} onPress={() => setNormalOpen((o) => !o)}>
            <View style={S.sectionTitleLeft}>
              <View style={S.sectionIconCircle}>
                <Ionicons name="checkmark" size={14} color={palette.aqua400} />
              </View>
              <Text weight="bold" style={S.sectionTitle}>
                정상 항목 ({normalCount}개)
              </Text>
            </View>

            <View style={S.chip}>
              <Text style={S.chipText}>{normalOpen}</Text>
              <Ionicons name={normalOpen ? 'chevron-up' : 'chevron-down'} size={16} color={theme.text.primary} />
            </View>
          </TouchableOpacity>

          {normalOpen && (
            <View style={S.normalList}>
              {normalItems.map((item) => (
                <ResultRow key={item.key} item={item} onPress={() => goDetail(item.key)} />
              ))}
            </View>
          )}
        </View>

        {/* 권장사항 */}
        <View style={S.recommendCard}>
          <View style={S.recommendHeader}>
            <View style={S.sectionTitleLeft}>
              <View style={[S.sectionIconCircle, { backgroundColor: palette.white }]}>
                <Ionicons name="bulb-outline" size={14} color={palette.aqua300} />
              </View>
              <Text weight="bold" style={S.sectionTitle}>
                권장사항
              </Text>
            </View>
          </View>

          <View style={S.recommendList}>
            {/* 수의사 상담 권장 (주의 항목이 있을 때만 표시) */}
            {hasWarning && (
            <View style={[S.recommendItem, S.recommendItemWarning]}>
              <View style={S.recommendIconWrap}>
                <Ionicons name="warning" size={14} color={palette.gold800} />
              </View>
              <View style={S.recommendTextWrap}>
                <Text weight="semiBold" style={S.recommendTitleWarning}>
                  수의사 상담 권장
                </Text>
                <Text style={S.recommendBodyWarning}>주의 항목이 발견되었습니다. 전문의와 상담해보세요.</Text>
              </View>
            </View>
            )}

            <View style={S.recommendItem}>
              <View style={S.recommendIconWrap}>
                <Ionicons name="calendar-outline" size={14} color={palette.aqua400} />
              </View>
              <View style={S.recommendTextWrap}>
                <Text weight="semiBold" style={S.recommendTitle}>
                  정기 검사
                </Text>
                <Text style={S.recommendBody}>건강 유지를 위해 정기적인 검사를 받아보세요.</Text>
              </View>
            </View>

            <View style={S.recommendItem}>
              <View style={S.recommendIconWrap}>
                <Ionicons name="heart-outline" size={14} color={palette.aqua400} />
              </View>
              <View style={S.recommendTextWrap}>
                <Text weight="semiBold" style={S.recommendTitle}>
                  건강 관리
                </Text>
                <Text style={S.recommendBody}>충분한 수분 섭취와 균형잡힌 식단을 유지해주세요.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 하단 버튼들
        <View style={S.buttonRow}>
          <Button tone="aqua" shape="pillSolid" size="default" style={S.buttonHalf} title="병원 예약" />
          <Button
            tone="lightAqua"
            shape="pillOutline"
            borderTone="default"
            size="default"
            style={S.buttonHalf}
            titleStyle={{ color: palette.aqua300, fontWeight: '600' }}
            title="결과 저장"
          />
        </View>

        <Text style={S.debugText}>analysisId: {analysisId}</Text> */}
      </ScrollView>
    </View>
  );
}

// 항목 한 줄 컴포넌트
function ResultRow({ item, onPress }: { item: ResultItem; onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={S.resultRow}>
      <View style={S.resultLeft}>
        <View style={[S.dot, { backgroundColor: item.dotColor }]} />
        <Text weight="semiBold" style={S.resultLabel}>
          {item.label}
        </Text>
      </View>

      <View style={S.resultRight}>
        <Text weight="semiBold" style={[S.resultStatus, { color: statusColor(item.statusType) }]}>
          {item.statusLabel}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={palette.gray400} />
      </View>
    </TouchableOpacity>
  );
}

const S = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gray100,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingTop: 16,
    rowGap: 24,
  },
  card: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
    alignItems: 'center',
  },
  healthIconWrap: {
    marginBottom: 12,
  },
  healthEmoji: {
    fontSize: 32,
  },
  healthTitle: {
    fontSize: 18,
    lineHeight: 26,
    color: palette.aqua500,
    marginBottom: 8,
  },
  healthBadgeRow: {
    marginBottom: 12,
  },
  healthBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: palette.pink100,
  },
  healthBadgeText: {
    fontSize: 14,
    color: palette.pink400,
  },
  healthDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.aqua500,
    textAlign: 'center',
    // marginBottom: 16,
  },
  noticeBoxWrap: {
    marginTop: 16,
    width: '100%',
  },
  noticeBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: palette.gray100,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.gray700,
  },
  noticeTextStrong: {
    color: palette.aqua500,
  },
  section: {
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: palette.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    color: palette.aqua500,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 12,
    color: palette.aqua500,
    marginRight: 4,
  },
  normalList: {},
  resultRow: {
    width: '100%',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  resultLabel: {
    fontSize: 14,
    color: palette.aqua500,
  },
  resultRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultStatus: {
    fontSize: 14,
    marginRight: 8,
  },
  recommendCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  recommendHeader: {
    marginBottom: 16,
  },
  recommendList: {
    rowGap: 12,
  },
  recommendItem: {
    flexDirection: 'row',
    padding: 13,
    borderRadius: 12,
    backgroundColor: palette.aqua100,
    borderWidth: 1,
    borderColor: palette.aqua300,
  },
  recommendItemWarning: {
    backgroundColor: palette.gold100,
    borderColor: palette.gold800,
  },
  recommendIconWrap: {
    marginTop: 2,
  },
  recommendTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  recommendTitle: {
    fontSize: 14,
    color: palette.aqua500,
    marginBottom: 4,
  },
  recommendBody: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.aqua500,
  },
  recommendTitleWarning: {
    fontSize: 14,
    color: '#A32222',
    marginBottom: 4,
  },
  recommendBodyWarning: {
    fontSize: 12,
    lineHeight: 16,
    color: '#A32222',
  },
  buttonRow: {
    flexDirection: 'row',
    columnGap: 12,
    marginTop: 8,
  },
  buttonHalf: {
    flex: 1,
  },
  debugText: {
    marginTop: 8,
    fontSize: 10,
    color: palette.gray400,
    textAlign: 'right',
  },
});
