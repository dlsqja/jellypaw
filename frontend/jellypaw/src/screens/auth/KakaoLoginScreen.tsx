import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export default function KakaoLoginScreen({ navigation }: NativeStackScreenProps<any>) {
  const [loading, setLoading] = useState(false);
  const onPress = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); navigation.replace('SignupWebView'); }, 400);
  };
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:24, backgroundColor:'#FAFAFA' }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        style={{ backgroundColor:'#FEE500', borderRadius:999, paddingVertical:14, paddingHorizontal:28 }}>
        {loading ? <ActivityIndicator/> : <Text style={{ fontWeight:'700' }}>카카오로 시작하기</Text>}
      </TouchableOpacity>
    </View>
  );
}
