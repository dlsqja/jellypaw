import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { theme } from '../system/variants';
type Item = { title: string; date: string; nextDate?: string };

export default function VaccinationSection({ items }: { items: Item[] }) {
  return (
    <View style={S.card}>
      <View style={S.header}>
        <MaterialIcons name="vaccines" size={18} color={theme.border.default}></MaterialIcons>
        <Text weight="medium" style={S.headerTitle}>예방접종 기록</Text>
      </View>

      <View style={{ gap: 12, marginTop: 12 }}>
        {items.map((it, idx) => (
          <View key={idx} style={S.item}>
            <View>
              <Text weight="semiBold" style={S.itemTitle}>{it.title}</Text>
              <Text style={S.itemSub}>접종일: {it.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={S.nextLabel}>다음 접종</Text>
              <Text style={S.nextDate}>{it.nextDate ?? '-'}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={S.bottomBtn}>
        <Feather name="edit-3" size={18} color={theme.border.default} />
        <Text weight="medium" style={S.bottomBtnText}>정보 추가 및 변경</Text>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingBottom: 16, paddingTop: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25 },
  headerTitle: { fontSize: 16, lineHeight: 24, color: '#111827' },
  item: { marginHorizontal: 25, height: 65, padding: 12, backgroundColor: '#FAFAFA', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle: { fontSize: 14, lineHeight: 20, color: '#111827' },
  itemSub: { fontSize: 14, lineHeight: 20, color: '#4B5563' },
  nextLabel: { fontSize: 14, lineHeight: 20, color: '#4D8983' },
  nextDate: { fontSize: 14, lineHeight: 20, color: '#374151' },
  bottomBtn: {
    marginTop: 16, marginHorizontal: 25, height: 38,
    borderRadius: 12, borderWidth: 1, borderColor: '#6ABFB8',
    backgroundColor: '#F0F7F9',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  bottomBtnText: { fontSize: 14, lineHeight: 21, color: '#6ABFB8' },
});
