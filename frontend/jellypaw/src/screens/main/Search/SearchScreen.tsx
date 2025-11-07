import React from 'react';
import { Platform } from 'react-native';
import WebView from 'react-native-webview';

const os = Platform.OS;
os == 'android';

export default function SearchScreen() {
  // 웹뷰 표시
  return <WebView source={{ uri: 'http://k13a201.p.ssafy.io:3000/search' }} />;
}
