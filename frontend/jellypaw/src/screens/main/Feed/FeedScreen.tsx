// src/screens/main/Feed/FeedScreen.tsx
import React from 'react';
import AuthorizedWebView from '../../../layouts/AuthorizedWebView';
import { WEB_BASE_URL } from '@env';

const WEB_BASE = (WEB_BASE_URL || 'http://k13a201.p.ssafy.io:3000').replace(/\/+$/, '');

export default function FeedScreen() {
  return <AuthorizedWebView uri={`${WEB_BASE}/feed`} />;
}
