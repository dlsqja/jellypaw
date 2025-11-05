import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from './Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../system/variants';

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

type Props<T extends string = string> = {
  label?: string;
  value?: T;
  placeholder?: string;
  options: SelectOption<T>[];
  onChange?: (value: T) => void;
  style?: ViewStyle;
};

export default function Dropdown<T extends string = string>({
  label,
  value,
  placeholder = '선택하세요',
  options,
  onChange,
  style,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  const currentLabel = useMemo(() => {
    const found = options.find(o => o.value === value);
    return found?.label;
  }, [options, value]);

  return (
    <>
      {/* 라벨 */}
      {label ? <Text style={S.label}>{label}</Text> : null}

      {/* 필드(입력창처럼 보이는 버튼) */}
      <Pressable
        onPress={() => setOpen(true)}
        style={[S.field, style]}
        android_ripple={{ color: '#00000012', borderless: false }}
      >
        <Text
          style={[
            S.valueText,
            !currentLabel && { color: '#A3A3A3' },
          ]}
          numberOfLines={1}
        >
          {currentLabel ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.icon.inactive} />
      </Pressable>

      {/* 모달 시트 */}
      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={S.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={S.sheet}>
            {options.map(opt => {
              const selected = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onChange?.(opt.value);
                    setOpen(false);
                  }}
                  style={S.item}
                >
                  <Text style={{ color: theme.text.primary }}>{opt.label}</Text>
                  {selected && (
                    <Ionicons name="checkmark" size={18} color={theme.icon.active} />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const S = StyleSheet.create({
  label: {
    color: '#284542',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'Pretendard-SemiBold',
  },
  field: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border.gray,
    backgroundColor: theme.bg.surface,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  valueText: {
    fontSize: 14,
    color: '#284542',
    fontFamily: 'Pretendard-SemiBold',
    marginRight: 8,
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000055',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    backgroundColor: theme.bg.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border.gray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
