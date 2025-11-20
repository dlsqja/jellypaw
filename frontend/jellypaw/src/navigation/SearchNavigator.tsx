import React from 'react';
import SearchScreen from '../screens/main/Search/SearchScreen';
import WebviewLayout from '../layouts/WebviewLayout';

export type SearchStackParamList = {
  Search: undefined;
};

// 피드 네비게이터
export default function SearchNavigator() {
  return (
    <WebviewLayout>
      <SearchScreen />
    </WebviewLayout>
  );
}
