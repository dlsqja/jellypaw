// src/ui/components/PhotoPicker.tsx
import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  ViewStyle,
  Platform,
  ActionSheetIOS,
  Modal,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../system/variants';
import { Text } from './Text';

type Props = {
  uri?: string | null;
  size?: number;                 // 기본 112
  style?: ViewStyle;

  /** 선택된 이미지 uri를 부모로 전달 */
  onChangeUri?: (uri: string | null) => void;

  /** 커스텀 동작을 쓰고 싶다면 주입(있으면 내부 기본 동작보다 우선) */
  onTakePhoto?: () => void;
  onPickFromLibrary?: () => void;
};

export default function PhotoPicker({
  uri,
  size = 112,
  style,
  onChangeUri,
  onTakePhoto,
  onPickFromLibrary,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const outer = size;
  const inner = outer - 8;                // 패딩 4 * 2
  const fab = Math.round(outer * 0.32);   // 약 36

  // ====== 내부 기본 구현 ======
  const pickFromLibrary = () => {
    if (onPickFromLibrary) return onPickFromLibrary();

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        selectionLimit: 1, // 아바타 1장
      },
      (res: ImagePickerResponse) => {
        if (res.didCancel) return;
        if (res.errorMessage) {
          Alert.alert('오류', res.errorMessage);
          return;
        }
        const picked = res.assets?.[0]?.uri ?? null;
        onChangeUri?.(picked);
      }
    );
  };

  const takePhoto = () => {
    if (onTakePhoto) return onTakePhoto();

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      (res: ImagePickerResponse) => {
        if (res.didCancel) return;
        if (res.errorMessage) {
          Alert.alert('오류', res.errorMessage);
          return;
        }
        const captured = res.assets?.[0]?.uri ?? null;
        onChangeUri?.(captured);
      }
    );
  };
  // ===========================

  const openMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['카메라로 촬영', '갤러리에서 선택', '취소'],
        cancelButtonIndex: 2,
          userInterfaceStyle: 'light',
        },
        (idx) => {
          if (idx === 0) takePhoto();
          if (idx === 1) pickFromLibrary();
        }
      );
    } else {
      setSheetOpen(true);
    }
  };

  const closeMenu = () => setSheetOpen(false);

  return (
    <View style={[{ width: outer, height: outer }, style]}>
      {/* 큰 원 눌러도 메뉴 오픈 */}
      <Pressable
        onPress={openMenu}
        style={[S.outer, { width: outer, height: outer, borderRadius: outer / 2 }]}
      >
        <View
          style={[
            S.inner,
            {
              width: inner,
              height: inner,
              borderRadius: inner / 2,
              backgroundColor: '#E7FAF6',
            },
          ]}
        >
          {uri ? (
            <Image source={{ uri }} style={{ width: inner, height: inner, borderRadius: inner / 2 }} />
          ) : (
            <Feather name="camera" size={Math.round(outer * 0.43)} color={theme.icon.active} />
          )}
        </View>
      </Pressable>

      {/* 우하단 카메라 FAB */}
      <Pressable
        onPress={openMenu}
        style={[
          S.fab,
          {
            width: fab,
            height: fab,
            borderRadius: fab / 2,
            right: 0,
            bottom: 0,
          },
        ]}
        android_ripple={{ color: '#ffffff22', borderless: true }}
        hitSlop={6}
      >
        <Feather name="camera" size={Math.round(fab * 0.5)} color={theme.text.onBrand} />
      </Pressable>

      {/* Android/기타 바텀 시트 */}
      <Modal
        transparent
        visible={sheetOpen}
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={closeMenu}
      >
        <View style={S.modalRoot}>
          <Pressable style={S.backdrop} onPress={closeMenu} />
          <View style={[S.sheet, { paddingBottom: Math.max(12, insets.bottom + 6) }]}>
            <Pressable
              style={[S.sheetItem, S.sheetItemDivider]}
              onPress={() => {
                closeMenu();
                takePhoto();
              }}
            >
              <Feather name="camera" size={18} color={theme.text.primary} />
              <View style={{ width: 8 }} />
              <Text style={{ color: theme.text.primary, fontSize: 16 }}>카메라로 촬영</Text>
            </Pressable>

            <Pressable
              style={[S.sheetItem, S.sheetItemDivider]}
              onPress={() => {
                closeMenu();
                pickFromLibrary();
              }}
            >
              <Feather name="image" size={18} color={theme.text.primary} />
              <View style={{ width: 8 }} />
              <Text style={{ color: theme.text.primary, fontSize: 16 }}>갤러리에서 선택</Text>
            </Pressable>

            <Pressable style={S.sheetItem} onPress={closeMenu}>
              <Feather name="x" size={18} color={theme.text.muted} />
              <View style={{ width: 8 }} />
              <Text style={{ color: theme.text.muted, fontSize: 16 }}>취소</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const S = StyleSheet.create({
  outer: {
    padding: 4,
    backgroundColor: '#DFF7F2',
    borderRadius: 9999,
    shadowColor: '#FAFAFA',
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  inner: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    backgroundColor: theme.icon.active,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000080' },
  sheet: {
    backgroundColor: theme.bg.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  sheetItem: { height: 48, flexDirection: 'row', alignItems: 'center' },
  sheetItemDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border.gray },
});
