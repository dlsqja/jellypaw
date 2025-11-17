// src/screens/main/Pet/components/UrineAnalysisCard.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../../../ui/components/Text';
import { Button } from '../../../../ui/components/Button';
import { palette, theme } from '../../../../ui/system/variants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { getUrineAnalysisListResponse } from '../../../../types/main/pet';

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
  const hasWarning = summary.some((item) => !item.isNormal);
  return {
    hasWarning,
    label: hasWarning ? '주의 필요' : '정상',
    color: hasWarning ? palette.pink400 : palette.aqua400,
    bgColor: hasWarning ? palette.pink100 : palette.aqua100,
  };
};

interface UrineAnalysisCardProps {
  analysis: getUrineAnalysisListResponse;
  onPress: () => void;
}

export default function UrineAnalysisCard({ analysis, onPress }: UrineAnalysisCardProps) {
  const status = getOverallStatus(analysis.summary);
  const displayItems = analysis.summary.slice(0, 7); // 최대 7개 항목 표시
  const hasMore = analysis.summary.length > 7;

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
          title="상세보기"
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
          const isNormal = item.isNormal;
          const progressColor = isNormal ? palette.green400 : palette.gold800;
          const progressPercent = isNormal ? 70 : 40; // 임시 값

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
                <Text weight="medium" style={[S.itemResult, { color: isNormal ? palette.green400 : palette.gold800 }]}>
                  {isNormal ? '정상' : '주의'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* 더보기 */}
      {hasMore && (
        <View style={S.moreItems}>
          <Text style={S.moreItemsText}>+{analysis.summary.length - 7}개 항목 더보기</Text>
        </View>
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
    backgroundColor: palette.aqua100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    color: theme.text.primary,
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
    color: theme.text.primary,
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
    minWidth: 40,
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

