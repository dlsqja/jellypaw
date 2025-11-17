// src/screens/main/Pet/ResultDetailScreen.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Text } from '../../../ui/components/Text';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetStackParamList } from '../../../navigation/PetNavigator';
import BackHeader from '../../../ui/components/BackHeader';
import { Button } from '../../../ui/components/Button';
import { palette } from '../../../ui/system/variants';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<PetStackParamList, 'ResultDetail'>;

type ItemStatus = 'normal' | 'good' | 'caution' | 'neutral';

const ITEM_LABEL_MAP: Record<string, string> = {
  protein: '단백질',
  bilirubin: '빌리루빈',
  ketone: '케톤체',
  ph: 'pH',
  sg: '요비중',
  blood: '잠혈',
  nitrite: '아질산염',
  wbc: '백혈구',
  urobilinogen: '유로빌리노겐',
  glucose: '포도당',
};

// 요약 화면과 동일한 더미 상태 매핑
const ITEM_STATUS_MAP: Record<
  string,
  { statusLabel: string; statusType: ItemStatus }
> = {
  bilirubin: { statusLabel: '보통', statusType: 'good' },
  protein: { statusLabel: '주의', statusType: 'caution' },
  urobilinogen: { statusLabel: '정상', statusType: 'normal' },
  glucose: { statusLabel: '정상', statusType: 'normal' },
  ketone: { statusLabel: '정상', statusType: 'normal' },
  sg: { statusLabel: '정상', statusType: 'normal' },
  blood: { statusLabel: '정상', statusType: 'normal' },
  ph: { statusLabel: '중성', statusType: 'neutral' },
  nitrite: { statusLabel: '정상', statusType: 'normal' },
  wbc: { statusLabel: '정상', statusType: 'normal' },
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
      };
    case 'good': // 보통
      return {
        iconBg: palette.green100,
        iconName: 'checkmark',
        iconColor: palette.green400,
        statusColor: palette.green400,
        badgeBg: palette.green100,
        badgeTextColor: palette.green400,
      };
    case 'neutral': // pH 중성
      return {
        iconBg: palette.aqua100,
        iconName: 'remove-outline',
        iconColor: palette.aqua400,
        statusColor: palette.aqua400,
        badgeBg: palette.aqua100,
        badgeTextColor: palette.aqua400,
      };
    case 'normal':
    default:
      return {
        iconBg: palette.aqua100,
        iconName: 'checkmark',
        iconColor: palette.aqua400,
        statusColor: palette.aqua400,
        badgeBg: palette.aqua100,
        badgeTextColor: palette.aqua400,
      };
  }
}

const SUSPICIOUS_DISEASES_PROTEIN = [
  '신장 질환',
  '신부전',
  '요로 감염증',
  '임신 중독증',
  '생리적 단백뇨',
];

export default function ResultDetailScreen({ route, navigation }: Props) {
  const { analysisId, itemKey } = route.params;

  const label = ITEM_LABEL_MAP[itemKey] ?? itemKey;

  const { statusLabel, statusType } =
    ITEM_STATUS_MAP[itemKey] ?? { statusLabel: '정상', statusType: 'normal' };

  const styleByStatus = getStatusStyle(statusType);

  const isProtein = itemKey === 'protein';
  const suspiciousChips = isProtein
    ? SUSPICIOUS_DISEASES_PROTEIN
    : ['관련 질환 1', '관련 질환 2'];

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
              <View
                style={[
                  S.summaryIconCircle,
                  { backgroundColor: styleByStatus.iconBg },
                ]}
              >
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
              >
                {statusLabel}
              </Text>
              <Text style={S.summaryStatusSub}>측정값</Text>
            </View>
          </View>

          <View
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
                : statusType === 'good'
                ? '보통 범위'
                : '정상 범위'}
            </Text>
          </View>
        </View>

        {/* 의심 질병 카드 (지금은 모든 상태 공통으로 사용, 나중에 분기 가능) */}
        <View style={S.card}>
          <View style={S.cardHeaderRow}>
            <View style={S.cardHeaderLeft}>
              <View style={S.cardHeaderIconCircleRed}>
                <Ionicons name="warning" size={14} color="#EF4444" />
              </View>
              <Text weight="bold" style={S.cardHeaderTitle}>
                의심 질병
              </Text>
            </View>
          </View>

          <View style={S.noticeBoxWrap}>
            <View style={S.noticeBox}>
              <Text style={S.noticeText}>
                <Text weight="semiBold" style={S.noticeTextStrong}>
                  주의:{' '}
                </Text>
                <Text style={S.noticeTextStrong}>
                  아래 정보는 참고용이며, 정확한 진단을 위해서는 반드시 수의사와
                  상담하시기 바랍니다.
                </Text>
              </Text>
            </View>
          </View>

          <View style={S.chipsWrap}>
            {suspiciousChips.map(chip => (
              <View key={chip} style={S.chip}>
                <Text weight="semiBold" style={S.chipText}>
                  {chip}
                </Text>
              </View>
            ))}
          </View>

          <View style={S.cardFooterTextWrap}>
            <Text style={S.cardFooterText}>
              위 질병들은 {label} 수치 이상과 관련이 있을 수 있습니다
            </Text>
          </View>
        </View>

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
            {/* 수의사 상담 필요 */}
            <View style={[S.recommendItem, S.recommendItemWarning]}>
              <View style={S.recommendIconWrap}>
                <Ionicons name="business" size={14} color={palette.gold800} />
              </View>
              <View style={S.recommendTextWrap}>
                <Text weight="semiBold" style={S.recommendTitleWarning}>
                  수의사 상담 필요
                </Text>
                <Text style={S.recommendBodyWarning}>
                  이상 수치가 발견되었습니다. 정확한 진단을 위해 전문의와
                  상담해보세요.
                </Text>
              </View>
            </View>

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

        {/* 하단 버튼 */}
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

        <Text style={S.debugText}>analysisId: {analysisId}</Text>
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
  },
  summaryTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: '#111827',
  },
  summarySubLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: '#525252',
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryStatus: {
    fontSize: 24,
    lineHeight: 32,
  },
  summaryStatusSub: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
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
    color: '#111827',
  },

  /** 의심 질병 */
  noticeBoxWrap: {
    marginBottom: 16,
  },
  noticeBox: {
    padding: 17,
    borderRadius: 12,
    backgroundColor: '#FCF9EA',
    borderWidth: 1,
    borderColor: palette.gold800,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#A32222',
  },
  noticeTextStrong: {
    color: '#A32222',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
    marginBottom: 24,
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
    color: '#284542',
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
    backgroundColor: '#FCF9EA',
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
