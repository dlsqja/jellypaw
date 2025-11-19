// src/screens/main/Pet/ResultDetailScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../../../ui/components/Text';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetStackParamList } from '../../../navigation/PetNavigator';
import BackHeader from '../../../ui/components/BackHeader';
import { Button } from '../../../ui/components/Button';
import { palette } from '../../../ui/system/variants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Toast from 'react-native-toast-message';
import { getUrineAnalysisList } from '../../../services/api/pet';
import type { UrineAnalysisSummaryItem } from '../../../types/main/pet';

type Props = NativeStackScreenProps<PetStackParamList, 'ResultDetail'>;

type ItemStatus = 'normal' | 'caution' | 'danger' | 'very_danger' | 'neutral';

const ITEM_LABEL_MAP: Record<string, string> = {
  protein: '단백질',
  bilirubin: '빌리루빈',
  ketone: '케톤체',
  ph: 'pH',
  sg: '비중',
  blood: '잠혈',
  nitrite: '아질산염',
  wbc: '백혈구',
  urobilinogen: '유로빌리노겐',
  glucose: '포도당',
};

// 각 항목별 기준값 (정상 범위)
const NORMAL_RANGE_MAP: Record<string, string> = {
  urobilinogen: '0.1',
  glucose: '(-)',
  bilirubin: '(-)',
  ketone: '(-)',
  sg: '1.000',
  blood: '(-)',
  ph: '5',
  protein: '(-)',
  nitrite: '(-)',
  wbc: '(-)',
};

// 측정값 변환 함수 (영어 → 한국어)
const formatMatchedValue = (value: string): string => {
  if (value.toLowerCase() === 'trace') {
    return '미량';
  }
  if (value.toLowerCase() === 'neg' || value.toLowerCase() === 'negative') {
    return '(-)';
  }
  return value;
};

// 상태별 색/아이콘 스타일
function getStatusStyle(statusType: ItemStatus) {
  switch (statusType) {
    case 'caution':
      return {
        iconBg: palette.gold100,
        iconName: 'warning',
        iconColor: palette.gold800,
        statusColor: palette.gold800,
        badgeBg: palette.gold200,
        badgeTextColor: palette.gold800,
        recommendBg: palette.gold100,
        recommendBorder: palette.gold800,
        recommendIconColor: palette.gold800,
        recommendTextColor: palette.gold800,
      };
    case 'danger':
      return {
        iconBg: '#FEE2E2',
        iconName: 'warning',
        iconColor: '#EF4444',
        statusColor: '#EF4444',
        badgeBg: '#FEE2E2',
        badgeTextColor: '#EF4444',
        recommendBg: palette.pink100,
        recommendBorder: '#B91C1C',
        recommendIconColor: '#B91C1C',
        recommendTextColor: '#EF4444',
      };
    case 'very_danger':
      return {
        iconBg: '#FEE2E2',
        iconName: 'warning',
        iconColor: '#B91C1C',
        statusColor: '#B91C1C',
        badgeBg: '#FEE2E2',
        badgeTextColor: '#B91C1C',
        recommendBg: palette.pink100,
        recommendBorder: '#B91C1C',
        recommendIconColor: '#B91C1C',
        recommendTextColor: '#B91C1C',
      };
    case 'neutral': // pH 중성
      return {
        iconBg: palette.aqua100,
        iconName: 'remove-outline',
        iconColor: palette.aqua400,
        statusColor: palette.aqua400,
        badgeBg: palette.aqua100,
        badgeTextColor: palette.aqua400,
        recommendBg: palette.aqua100,
        recommendBorder: palette.aqua300,
        recommendIconColor: palette.aqua400,
        recommendTextColor: palette.aqua400,
      };
    case 'normal':
    default:
      return {
        iconBg: palette.aqua100,
        iconName: 'checkmark-sharp',
        iconColor: palette.aqua400,
        statusColor: palette.aqua400,
        badgeBg: palette.aqua100,
        badgeTextColor: palette.aqua400,
        recommendBg: palette.aqua100,
        recommendBorder: palette.aqua300,
        recommendIconColor: palette.aqua400,
        recommendTextColor: palette.aqua400,
      };
  }
}

export default function ResultDetailScreen({ route, navigation }: Props) {
  const { analysisId, itemKey, petId } = route.params;
  const [summaryItem, setSummaryItem] = useState<UrineAnalysisSummaryItem | null>(null);
  const [allAnalysisData, setAllAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const label = ITEM_LABEL_MAP[itemKey] ?? itemKey;

  useEffect(() => {
    if (!petId) {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '대상 반려동물 정보를 찾을 수 없습니다.',
      });
      navigation.goBack();
      return;
    }

    let mounted = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const list = await getUrineAnalysisList(petId);
        const analysis = list.find((item) => item.id === analysisId);

        if (!analysis) {
          throw new Error('분석 결과를 찾을 수 없습니다.');
        }

        const targetLabel = ITEM_LABEL_MAP[itemKey] ?? itemKey;
        const foundItem =
          analysis.summary.find((item) => item.testNameKo === targetLabel) ??
          analysis.summary.find((item) => item.testNameKo === label);

        if (!foundItem) {
          throw new Error('해당 검사 항목을 찾을 수 없습니다.');
        }

        console.log('[ResultDetailScreen] foundItem:', foundItem);
        console.log('[ResultDetailScreen] suspectedConditions:', foundItem.suspectedConditions);
        console.log('[ResultDetailScreen] analysis:', analysis);

        if (mounted) {
          setSummaryItem(foundItem);
          setAllAnalysisData(analysis);
        }
      } catch (error: any) {
        console.error('[ResultDetailScreen] 검사 상세 조회 실패', error);
        Toast.show({
          type: 'error',
          text1: '오류',
          text2: error?.message || '검사 상세 정보를 불러오지 못했습니다.',
        });
        navigation.goBack();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      mounted = false;
    };
  }, [analysisId, itemKey, label, navigation, petId]);

  const { statusLabel, statusType } = useMemo(() => {
    if (!summaryItem) {
      return { statusLabel: '정보 없음', statusType: 'normal' as ItemStatus };
    }

    if (!summaryItem.isNormal) {
      const isPH = itemKey === 'ph';
      
      if (isPH) {
        // pH 항목의 경우
        if (summaryItem.severity === 'strong_alkaline') {
          return { statusLabel: '위험', statusType: 'danger' as ItemStatus };
        } else if (
          summaryItem.severity === 'mild_acidic' ||
          summaryItem.severity === 'slight_acidic' ||
          summaryItem.severity === 'mild_alkaline' ||
          summaryItem.severity === 'moderate_alkaline'
        ) {
          return { statusLabel: '주의', statusType: 'caution' as ItemStatus };
        } else {
          return { statusLabel: '주의', statusType: 'caution' as ItemStatus };
        }
      } else {
        // pH 제외한 항목들
        if (summaryItem.severity === 'very_severe') {
          return { statusLabel: '매우 위험', statusType: 'very_danger' as ItemStatus };
        } else if (summaryItem.severity === 'severe' || summaryItem.severity === '심각' || summaryItem.severity === '높음') {
          return { statusLabel: '위험', statusType: 'danger' as ItemStatus };
        } else if (
          summaryItem.severity === 'moderate' ||
          summaryItem.severity === '중간' ||
          summaryItem.severity === 'low' ||
          summaryItem.severity === '경증' ||
          summaryItem.severity === 'high' ||
          summaryItem.severity === '중증'
        ) {
          return { statusLabel: '주의', statusType: 'caution' as ItemStatus };
        } else {
          return { statusLabel: '주의', statusType: 'caution' as ItemStatus };
        }
      }
    }

    // pH 중성도 정상으로 처리
    return { statusLabel: '정상', statusType: 'normal' as ItemStatus };
  }, [itemKey, summaryItem]);

  const styleByStatus = getStatusStyle(statusType);

  // 의심 질병 아이콘 색상 (의심 질병 타이틀과 수의사 상담 필요 섹션에 사용)
  const suspicionIconColor = statusType === 'caution' 
    ? styleByStatus.recommendIconColor 
    : styleByStatus.iconColor;

  // 현재 선택된 항목의 의심 질병만 표시
  const suspiciousChips = summaryItem?.suspectedConditions ?? [];
  const hasSuspectedConditions = suspiciousChips.length > 0;

  console.log('[ResultDetailScreen] summaryItem:', summaryItem);
  console.log('[ResultDetailScreen] suspiciousChips:', suspiciousChips);
  console.log('[ResultDetailScreen] hasSuspectedConditions:', hasSuspectedConditions);

  if (loading) {
    return (
      <View style={[S.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <BackHeader title={label} />
        <ActivityIndicator size="large" color={palette.aqua300} />
        <Text style={{ marginTop: 16, color: '#6B7280' }}>검사 상세 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={S.root}>
      <BackHeader title={label} />

      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 요약 카드 */}
        <View style={S.summaryCard}>
          <View style={S.summaryRow}>
            <View style={S.summaryLeft}>
              <View style={S.summaryIconCircle}>
                <Ionicons
                  name={styleByStatus.iconName as any}
                  size={20}
                  color={styleByStatus.iconColor}
                />
              </View>
              <View style={S.summaryTextCol}>
                <Text weight="bold" style={S.summaryTitle}>
                  {label}
                </Text>
                <Text style={S.summarySubLabel}>검사 항목</Text>
              </View>
            </View>

            <View style={S.summaryRight}>
              <Text
                weight="bold"
                style={[
                  S.summaryStatus,
                  { color: styleByStatus.statusColor },
                ]}
                numberOfLines={1}
              >
                {statusLabel}
              </Text>
              <Text 
                style={S.summaryStatusSub}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {summaryItem?.unit || '측정값'}
              </Text>
            </View>
          </View>

          {/* <View
            style={[
              S.summaryBadge,
              { backgroundColor: styleByStatus.badgeBg },
            ]}
          >
            <Text
              weight="semiBold"
              style={[
                S.summaryBadgeText,
                { color: styleByStatus.badgeTextColor },
              ]}
            >
              {statusType === 'caution'
                ? '주의 범위'
                : statusType === 'danger'
                ? '위험 범위'
                : statusType === 'very_danger'
                ? '매우 위험 범위'
                : '정상 범위'}
            </Text>
          </View> */}

          {summaryItem?.matchedValue && summaryItem?.unit && (
            <View style={S.summaryResultWrap}>
              <Text style={S.summaryResultText}>
                측정값: {formatMatchedValue(summaryItem.matchedValue)} {summaryItem.unit}
              </Text>
              {NORMAL_RANGE_MAP[itemKey] && (
                <Text style={[S.summaryResultText, { color: palette.gray400, fontSize: 12 }]}>
                  기준값: {NORMAL_RANGE_MAP[itemKey]} {summaryItem.unit}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* 의심 질병 카드 (정상/중성 항목일 때는 표시하지 않음) */}
        {(statusType === 'caution' || statusType === 'danger' || statusType === 'very_danger') && (
        <View style={S.card}>
          <View style={[S.cardHeaderRow, { marginBottom: 0 }]}>
            <View style={S.cardHeaderLeft}>
              <View style={[S.cardHeaderIconCircleRed, { backgroundColor: 'transparent' }]}>
                <FontAwesome6 
                  name="briefcase-medical" 
                  size={14} 
                  color={suspicionIconColor} 
                />
              </View>
              <Text weight="bold" style={[S.cardHeaderTitle, { color: palette.aqua500 }]}>
                의심 질병
              </Text>
            </View>
          </View>

          <View style={[S.chipsWrap, { marginTop: 16 }]}>
            {hasSuspectedConditions ? (
              suspiciousChips.map((chip) => (
                <View 
                  key={chip} 
                  style={[S.chip, { backgroundColor: statusType === 'caution' ? palette.gold200 : styleByStatus.recommendBg }]}
                >
                  <Text 
                    weight="semiBold" 
                    style={[S.chipText, { color: styleByStatus.recommendTextColor }]}
                  >
                    {chip}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={S.noChipText}>관련 질환 정보가 없습니다.</Text>
            )}
          </View>

          <View style={S.cardFooterTextWrap}>
            <Text style={S.cardFooterText}>
              위 질병들은 {label} 수치 이상과 관련이 있을 수 있습니다
            </Text>
          </View>
        </View>
        )}

        {/* 권장사항 카드 */}
        <View style={S.card}>
          <View style={S.cardHeaderRow}>
            <View style={S.cardHeaderLeft}>
              <View style={S.cardHeaderIconCircle}>
                <Ionicons
                  name="bulb-outline"
                  size={14}
                  color={palette.aqua400}
                />
              </View>
              <Text weight="bold" style={S.cardHeaderTitle}>
                권장사항
              </Text>
            </View>
          </View>

          <View style={S.recommendList}>
            {/* 수의사 상담 필요 (정상/중성 항목일 때는 표시하지 않음) */}
            {(statusType === 'caution' || statusType === 'danger' || statusType === 'very_danger') && (
            <View style={[S.recommendItem, { backgroundColor: styleByStatus.recommendBg, borderColor: suspicionIconColor }]}>
              <View style={S.recommendIconWrap}>
                <Ionicons name="business" size={14} color={suspicionIconColor} />
              </View>
              <View style={S.recommendTextWrap}>
                <Text weight="semiBold" style={[S.recommendTitleWarning, { color: suspicionIconColor }]}>
                  수의사 상담 필요
                </Text>
                <Text style={[S.recommendBodyWarning, { color: suspicionIconColor }]}>
                  이상 수치가 발견되었습니다. 정확한 진단을 위해 전문의와
                  상담해보세요.
                </Text>
              </View>
            </View>
            )}

            {/* 정기 검사 */}
            <View style={S.recommendItem}>
              <View style={S.recommendIconWrap}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={palette.aqua400}
                />
              </View>
              <View style={S.recommendTextWrap}>
                <Text weight="semiBold" style={S.recommendTitle}>
                  정기 검사
                </Text>
                <Text style={S.recommendBody}>
                  건강 유지를 위해 정기적인 검사를 받아보세요.
                </Text>
              </View>
            </View>

            {/* 건강 관리 */}
            <View style={S.recommendItem}>
              <View style={S.recommendIconWrap}>
                <Ionicons
                  name="heart-outline"
                  size={14}
                  color={palette.aqua400}
                />
              </View>
              <View style={S.recommendTextWrap}>
                <Text weight="semiBold" style={S.recommendTitle}>
                  건강 관리
                </Text>
                <Text style={S.recommendBody}>
                  충분한 수분 섭취와 균형잡힌 식단을 유지해주세요.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 하단 버튼
        <View style={S.buttonRow}>
          <Button
            tone="aqua"
            shape="pillSolid"
            size="default"
            style={S.buttonHalf}
            title="병원 예약"
          />
          <Button
            tone="lightAqua"
            shape="pillOutline"
            borderTone="default"
            size="default"
            style={S.buttonHalf}
            titleStyle={{ color: palette.aqua300, fontWeight: '600' }}
            title="결과로 돌아가기"
            onPress={() => navigation.goBack()}
          />
        </View>

        <Text style={S.debugText}>analysisId: {analysisId}</Text> */}
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gray100,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
    rowGap: 24,
  },

  /** 상단 요약 카드 */
  summaryCard: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    marginRight: 16,
  },
  summaryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTextCol: {
    marginLeft: 12,
    flex: 1,
    minWidth: 0,
  },
  summaryTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: palette.aqua500,
    flexShrink: 1,
  },
  summarySubLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: '#525252',
  },
  summaryRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    minWidth: 100,
    maxWidth: '45%',
  },
  summaryStatus: {
    fontSize: 24,
    lineHeight: 32,
  },
  summaryStatusSub: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  summaryBadge: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  summaryBadgeText: {
    fontSize: 14,
  },
  summaryResultWrap: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: palette.gray200,
  },
  summaryResultText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.aqua500,
    textAlign: 'left',
  },

  /** 공통 카드 */
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  cardHeaderRow: {
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderIconCircleRed: {
    width: 24,
    height: 24,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardHeaderIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: palette.white,
  },
  cardHeaderTitle: {
    fontSize: 16,
    color: palette.aqua500,
  },

  /** 의심 질병 */
  noticeBoxWrap: {
    marginBottom: 16,
  },
  noticeBox: {
    padding: 17,
    borderRadius: 12,
    backgroundColor: palette.gray100,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.gray700,
  },
  noticeTextStrong: {
    color: palette.aqua500,

  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 8,
    rowGap: 8,
    marginBottom: 16,
  },
  noChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFE0E0',
  },
  chipText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#A32222',
  },
  cardFooterTextWrap: {
    alignItems: 'center',
  },
  cardFooterText: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.gray400,
    textAlign: 'center',
  },

  /** 권장사항 */
  recommendList: {
    rowGap: 12,
  },
  recommendItem: {
    flexDirection: 'row',
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#F0F7F9',
    borderWidth: 1,
    borderColor: palette.aqua300,
  },
  recommendItemWarning: {
    backgroundColor: palette.pink100,
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
    color: '#284542',
    marginBottom: 4,
  },
  recommendBody: {
    fontSize: 12,
    lineHeight: 16,
    color: '#284542',
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

  /** 하단 버튼 */
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
