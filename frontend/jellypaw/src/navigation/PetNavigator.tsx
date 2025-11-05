import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PetManageScreen from '../screens/main/Pet/PetManageScreen';
import AddPetScreen from '../screens/main/Pet/AddPetScreen';
import EditPetScreen from '../screens/main/Pet/EditPetScreen';
import MainLayout from '../layouts/MainLayout';

// stack param list
export type PetStackParamList = {
  Pets: undefined;
  AddPet: undefined;
  EditPet: undefined;
};

const Stack = createNativeStackNavigator<PetStackParamList>();

// 동물관리 네비게이터
export default function PetNavigator() {
  return (
    <MainLayout>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Pets"
      >
        <Stack.Screen name="Pets" component={PetManageScreen} />
        <Stack.Screen name="AddPet" component={AddPetScreen} />
        <Stack.Screen name="EditPet" component={EditPetScreen} />
      </Stack.Navigator>
    </MainLayout>
  );
}
