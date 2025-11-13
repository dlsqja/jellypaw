// src/navigation/PetNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PetManageScreen from '../screens/main/Pet/PetManageScreen';
import AddPetScreen from '../screens/main/Pet/AddPetScreen';
import EditPetScreen from '../screens/main/Pet/EditPetScreen';
import MainLayout from '../layouts/MainLayout';
import ScanCameraScreen from '../screens/main/Pet/ScanCameraScreen';

export type PetStackParamList = {
  Pets: undefined;
  AddPet: undefined;
  EditPet: undefined;
  ScanCamera: undefined;
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
          presentation: 'fullScreenModal', // iOS에서 특히 풀스크린 느낌
        }}
      />
    </Stack.Navigator>
  );
}
