// src/ui/components/PhotoPicker.tsx
import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Pressable, ViewStyle, Platform, ActionSheetIOS, Modal, Alert, PermissionsAndroid, Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../system/variants';
import { Text } from './Text';

type Props = {
  uri?: string | null;
  size?: number;
  style?: ViewStyle;
  onChangeUri?: (uri: string | null) => void;
  onTakePhoto?: () => void;
  onPickFromLibrary?: () => void;
};

export default function PhotoPicker({ uri, size = 112, style, onChangeUri, onTakePhoto, onPickFromLibrary }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const insets = useSafeAreaInsets();

  // ✅ prop으로 넘어오는 uri를 내부 state에 동기화
  const [currentUri, setCurrentUri] = useState<string | null>(null);

  useEffect(() => {
    if (typeof uri === 'string' && uri.trim().length > 0) {
      setCurrentUri(uri.trim());
    } else {
      setCurrentUri(null);
    }
  }, [uri]);

  const outer = size;
  const inner = outer - 8;
  const fab = Math.round(outer * 0.32);

  // ====== 내부 기본 구현 ======
  const pickFromLibrary = () => {
    if (onPickFromLibrary) {
      onPickFromLibrary();
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        selectionLimit: 1,
      },
      (res: ImagePickerResponse) => {
        if (res.didCancel) return;
        if (res.errorMessage) {
          Alert.alert('오류', res.errorMessage);
          return;
        }
        const picked = res.assets?.[0]?.uri ?? null;
        setCurrentUri(picked);
        onChangeUri?.(picked);
      },
    );
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // 먼저 현재 권한 상태 확인
        const checkResult = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);

        console.log('카메라 권한 상태 확인:', checkResult);

        // 이미 권한이 허용되어 있으면 true 반환
        if (checkResult) {
          console.log('카메라 권한이 이미 허용되어 있습니다.');
          return true;
        }

        console.log('카메라 권한 요청 시작...');
        // 권한 요청
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: '카메라 권한',
          message: '사진을 촬영하기 위해 카메라 권한이 필요합니다.',
          buttonNeutral: '나중에',
          buttonNegative: '취소',
          buttonPositive: '허용',
        });

        console.log('카메라 권한 요청 결과:', granted);

        // 권한 상태에 따른 처리
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          Alert.alert('권한 거부됨', '카메라 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.', [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동',
              onPress: () => Linking.openSettings(),
            },
          ]);
          return false;
        } else {
          // NEVER_ASK_AGAIN인 경우
          Alert.alert('권한 필요', '카메라 권한이 필요합니다. 설정에서 카메라 권한을 허용해주세요.', [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동',
              onPress: () => Linking.openSettings(),
            },
          ]);
          return false;
        }
      } catch (err) {
        console.warn('카메라 권한 요청 오류:', err);
        Alert.alert('오류', '카메라 권한 요청 중 오류가 발생했습니다.');
        return false;
      }
    }
    // iOS는 launchCamera가 자동으로 권한을 요청함
    return true;
  };

  const takePhoto = async () => {
    console.log('takePhoto 함수 호출됨');
    if (onTakePhoto) {
      onTakePhoto();
      return;
    }

    // 카메라 권한 확인 및 요청
    console.log('카메라 권한 확인 시작...');
    const hasPermission = await requestCameraPermission();
    console.log('권한 확인 결과:', hasPermission);
    if (!hasPermission) {
      Alert.alert('권한 필요', '카메라 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
      return;
    }

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
        setCurrentUri(captured);
        onChangeUri?.(captured);
      },
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
        },
      );
    } else {
      setSheetOpen(true);
    }
  };

  const closeMenu = () => setSheetOpen(false);

  return (
    <View style={[{ width: outer, height: outer }, style]}>
      {/* 큰 원 */}
      <Pressable onPress={openMenu} style={[S.outer, { width: outer, height: outer, borderRadius: outer / 2 }]}>
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
          {currentUri ? (
            <Image
              source={{ uri: currentUri }}
              style={{
                width: inner,
                height: inner,
                borderRadius: inner / 2,
                resizeMode: 'cover',
              }}
            />
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

      {/* Android 바텀 시트 */}
      <Modal transparent visible={sheetOpen} animationType="fade" presentationStyle="overFullScreen" statusBarTranslucent onRequestClose={closeMenu}>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000080',
  },
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
  sheetItem: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border.gray,
  },
});
