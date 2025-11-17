// src/navigation/PetNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PetManageScreen from '../screens/main/Pet/PetManageScreen';
import AddPetScreen from '../screens/main/Pet/AddPetScreen';
import EditPetScreen from '../screens/main/Pet/EditPetScreen';
import MainLayout from '../layouts/MainLayout';
import ScanCameraScreen from '../screens/main/Pet/ScanCameraScreen';
import ScanLoadingScreen from '../screens/main/Pet/ScanLoadingScreen';
import ResultSummaryScreen from '../screens/main/Pet/ResultSummaryScreen';
import ResultDetailScreen from '../screens/main/Pet/ResultDetailScreen';

export type PetStackParamList = {
  Pets: undefined;
  AddPet: undefined;
  EditPet: undefined;
  ScanCamera: undefined;
  ScanLoading: {
    imageUri: string; // 카메라에서 찍은 사진
    petId?: number;
  };
  ResultSummary: {
    analysisId: string; // AI 분석 결과 id 같은 것
    petId?: number;
  };
  ResultDetail: {
    analysisId: string;
    itemKey: string; // 단백질 / 케톤 / pH 등 어떤 항목인지
    petId?: number;
  };
};

const Stack = createNativeStackNavigator<PetStackParamList>();

// 공용 레이아웃 래퍼
const withMainLayout =
  (Component: React.ComponentType<any>) =>
  (props: any) =>
    (
      <MainLayout>
        <Component {...props} />
      </MainLayout>
    );

export default function PetNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Pets"
    >
      {/* 일반 화면들은 MainLayout 안에서 */}
      <Stack.Screen
        name="Pets"
        component={withMainLayout(PetManageScreen)}
      />
      <Stack.Screen
        name="AddPet"
        component={withMainLayout(AddPetScreen)}
      />
      <Stack.Screen
        name="EditPet"
        component={withMainLayout(EditPetScreen)}
      />

      <Stack.Screen
        name="ScanCamera"
        component={ScanCameraScreen}
        options={{
          presentation: 'fullScreenModal',
        }}
      />

      <Stack.Screen
        name="ScanLoading"
        component={ScanLoadingScreen}
        options={{
          presentation: 'fullScreenModal',
        }}
      />

      <Stack.Screen
        name="ResultSummary"
        component={withMainLayout(ResultSummaryScreen)}
      />
      <Stack.Screen
        name="ResultDetail"
        component={withMainLayout(ResultDetailScreen)}
      />

    </Stack.Navigator>
  );
}
