// src/screens/main/Pet/components/UrineAnalysisCard.tsx

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../../../ui/components/Text';
import { Button } from '../../../../ui/components/Button';
import { palette, theme } from '../../../../ui/system/variants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { getUrineAnalysisListResponse, UrineAnalysisSummaryItem } from '../../../../types/main/pet';

type ItemStatus = 'normal' | 'caution' | 'danger' | 'very_danger' | 'neutral';

// 항목의 상태를 결정하는 함수
function getItemStatus(item: UrineAnalysisSummaryItem): { statusType: ItemStatus; statusLabel: string; color: string } {
  if (item.isNormal) {
    // 정상인 경우 (pH 중성도 정상으로 처리)
    return {
      statusType: 'normal',
      statusLabel: '정상',
      color: palette.green400,
    };
  }

  const isPH = item.testNameKo === 'pH';

  if (isPH) {
    // pH 항목의 경우
    if (item.severity === 'strong_alkaline') {
      return {
        statusType: 'danger',
        statusLabel: '위험',
        color: '#EF4444',
      };
    } else if (
      item.severity === 'mild_acidic' ||
      item.severity === 'slight_acidic' ||
      item.severity === 'mild_alkaline' ||
      item.severity === 'moderate_alkaline'
    ) {
      return {
        statusType: 'caution',
        statusLabel: '주의',
        color: palette.gold800,
      };
    } else {
      return {
        statusType: 'caution',
        statusLabel: '주의',
        color: palette.gold800,
      };
    }
  } else {
    // pH 제외한 항목들
    if (item.severity === 'very_severe') {
      return {
        statusType: 'very_danger',
        statusLabel: '매우 위험',
        color: '#B91C1C',
      };
    } else if (item.severity === 'severe' || item.severity === '심각' || item.severity === '높음') {
      return {
        statusType: 'danger',
        statusLabel: '위험',
        color: '#EF4444',
      };
    } else if (
      item.severity === 'moderate' ||
      item.severity === '중간' ||
      item.severity === 'low' ||
      item.severity === '경증' ||
      item.severity === 'high' ||
      item.severity === '중증'
    ) {
      return {
        statusType: 'caution',
        statusLabel: '주의',
        color: palette.gold800,
      };
    } else {
      return {
        statusType: 'caution',
        statusLabel: '주의',
        color: palette.gold800,
      };
    }
  }
}

// 날짜 포맷팅 함수
const formatAnalysisDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;

    return `${year}. ${month}. ${day}. ${ampm} ${displayHours}:${minutes}`;
  } catch (error) {
    return dateString;
  }
};

// 전체 상태 확인 함수
const getOverallStatus = (summary: getUrineAnalysisListResponse['summary']) => {
  // 모든 항목의 상태를 계산
  const allItemStatuses = summary.map((item) => getItemStatus(item));
  
  const warningItems = allItemStatuses.filter(
    (status) => status.statusType === 'caution' || status.statusType === 'danger' || status.statusType === 'very_danger'
  );
  const hasWarning = warningItems.length > 0;
  
  // 위험/매우위험이 있거나 주의 항목 5개 이상이면 검진 요망
  const hasDanger = warningItems.some((status) => status.statusType === 'danger' || status.statusType === 'very_danger');
  const cautionCount = warningItems.filter((status) => status.statusType === 'caution').length;
  const needsCheckup = hasDanger || cautionCount >= 5;
  
  if (needsCheckup) {
    return {
      hasWarning: true,
      label: '검진 요망',
      color: palette.pink400, // 현재 주의 필요 색상
      bgColor: palette.pink100,
    };
  } else if (hasWarning) {
    return {
      hasWarning: true,
      label: '주의 필요',
      color: palette.gold800, // 노란색
      bgColor: palette.gold200, // 연한 노란색 배경
    };
  } else {
    return {
      hasWarning: false,
      label: '정상',
      color: palette.aqua400,
      bgColor: palette.aqua100,
    };
  }
};

interface UrineAnalysisCardProps {
  analysis: getUrineAnalysisListResponse;
  onPress: () => void;
}

export default function UrineAnalysisCard({ analysis, onPress }: UrineAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = getOverallStatus(analysis.summary);
  const hasMore = analysis.summary.length > 7;
  const displayItems = isExpanded ? analysis.summary : analysis.summary.slice(0, 7);
  const remainingCount = analysis.summary.length - 7;

  const handleMoreClick = () => {
    setIsExpanded(true);
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={S.analysisCard}>
      {/* 헤더 */}
      <View style={S.cardHeader}>
        <View style={S.cardHeaderLeft}>
          <View style={S.cardIcon}>
            <Ionicons name="flask" size={16} color={palette.aqua300} />
          </View>
          <Text weight="bold" style={S.cardTitle}>
            최근 소변검사 결과
          </Text>
        </View>
        <Button
          title="상세 보기"
          shape="pillOutline"
          tone="lightAqua"
          borderTone="default"
          size="sm"
          onPress={onPress}
          titleStyle={{ fontSize: 12 }}
        />
      </View>

      {/* 검사일 */}
      <Text style={S.cardDate}>검사일: {formatAnalysisDate(analysis.createdAt)}</Text>

      {/* 전체 상태 */}
      <View style={[S.statusBadge, { backgroundColor: status.bgColor }]}>
        <Text weight="semiBold" style={[S.statusBadgeText, { color: status.color }]}>
          전체 상태: {status.label}
        </Text>
      </View>

      {/* 검사 항목 리스트 */}
      <View style={S.itemsList}>
        {displayItems.map((item, index) => {
          const itemStatus = getItemStatus(item);
          const progressColor = itemStatus.color;
          // 상태에 따라 progress bar 길이 조정 (정상: 100%, 주의→위험→매우위험 순으로 감소)
          const progressPercent =
            itemStatus.statusType === 'normal'
              ? 100
              : itemStatus.statusType === 'caution'
              ? 70
              : itemStatus.statusType === 'danger'
              ? 40
              : 20; // very_danger

          return (
            <View key={index} style={S.itemRow}>
              <View style={S.itemLeft}>
                <Text weight="medium" style={S.itemName}>
                  {item.testNameKo}
                </Text>
              </View>
              <View style={S.itemRight}>
                <View style={S.progressBarContainer}>
                  <View style={[S.progressBar, { width: `${progressPercent}%`, backgroundColor: progressColor }]} />
                </View>
                <Text weight="medium" style={[S.itemResult, { color: progressColor }]}>
                  {itemStatus.statusLabel}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* 더보기 */}
      {hasMore && !isExpanded && (
        <TouchableOpacity activeOpacity={0.7} onPress={handleMoreClick} style={S.moreItems}>
          <Text style={S.moreItemsText}>+{remainingCount}개 항목 더보기</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const S = StyleSheet.create({
  analysisCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.gray200,
    padding: 20,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    // backgroundColor: palette.aqua100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    color: palette.aqua500,
  },
  cardDate: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 14,
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: palette.aqua500,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
  },
  progressBarContainer: {
    width: 80,
    height: 8,
    backgroundColor: palette.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  itemResult: {
    fontSize: 14,
    minWidth: 70,
    textAlign: 'right',
  },
  moreItems: {
    paddingTop: 8,
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: 12,
    color: palette.aqua400,
  },
});
