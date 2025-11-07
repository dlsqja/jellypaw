import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from '../../../ui/components/Text';
import WebView from 'react-native-webview';
import MainLayout from '../../../layouts/MainLayout';
const os = Platform.OS;
os == 'android';

export default function FeedScreen() {
  // 웹뷰 표시
  return <WebView source={{ uri: 'http://k13a201.p.ssafy.io:3000/feed' }} />;
}
