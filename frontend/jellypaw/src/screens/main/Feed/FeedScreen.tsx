// src/screens/main/Feed/FeedScreen.tsx
import React from 'react';
import AuthorizedWebView from '../../../layouts/AuthorizedWebView';
import { WEB_BASE_URL } from '@env';

type Props = {
  boardId?: number;
};

const WEB_BASE = (WEB_BASE_URL || 'http://k13a201.p.ssafy.io:3000').replace(/\/+$/, '');

export default function FeedScreen({ boardId }: Props) {
  // boardId가 있으면 fromWrite=true 쿼리 파라미터 추가 (작성 완료 후 이동한 경우)
  const path = boardId ? `/feed/${boardId}?fromWrite=true` : '/feed';
  const uri = `${WEB_BASE}${path}`;

  console.log('[FeedScreen] boardId =', boardId, 'uri =', uri);

  return <AuthorizedWebView uri={uri} />;
}
