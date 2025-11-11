// src/screens/main/Search/SearchScreen.tsx
import React from 'react';
import AuthorizedWebView from '../../../layouts/AuthorizedWebView';
import { WEB_BASE_URL } from '@env';

const WEB_BASE = (WEB_BASE_URL || 'http://k13a201.p.ssafy.io:3000').replace(/\/+$/, '');

export default function SearchScreen() {
  return <AuthorizedWebView uri={`${WEB_BASE}/search`} />;
}
