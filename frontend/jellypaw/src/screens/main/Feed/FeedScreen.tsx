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

  return (
    <AuthorizedWebView
      uri={`${WEB_BASE_URL}${path}`}
    />
  );
}
