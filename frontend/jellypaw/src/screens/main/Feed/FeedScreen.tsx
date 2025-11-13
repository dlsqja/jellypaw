// src/screens/main/Feed/FeedScreen.tsx
import React from 'react';
import AuthorizedWebView from '../../../layouts/AuthorizedWebView';
import { WEB_BASE_URL } from '@env';

type Props = {
  boardId?: number;
};

const WEB_BASE = (WEB_BASE_URL || 'http://k13a201.p.ssafy.io:3000').replace(/\/+$/, '');

export default function FeedScreen({ boardId }: Props) {
  const path = boardId ? `/feed/${boardId}` : '/feed';
  const uri = `${WEB_BASE}${path}`;

  console.log('[FeedScreen] boardId =', boardId, 'uri =', uri);

  return <AuthorizedWebView uri={uri} />;
}
