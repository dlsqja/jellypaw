import React from 'react';
import { WebView } from 'react-native-webview';
import MobileLayout from '../../components/MobilelLayout';

const HTML = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
body{margin:0;background:#FAFAFA;font-family:-apple-system,Roboto,Segoe UI,Arial}
.wrap{max-width:375px;margin:0 auto;padding:24px}
.h{font-weight:700;font-size:20px;color:#284542;margin:16px 0}
.label{font-weight:600;font-size:14px;color:#284542;margin:12px 0 8px}
.input{width:100%;height:48px;border:1px solid #e5e5e5;border-radius:12px;padding:0 16px;background:#fff}
.btn{margin-top:24px;width:100%;height:56px;border-radius:9999px;background:#6ABFB8;color:#fff;font-weight:600;font-size:16px;border:0}
.meta{font-size:12px;color:#999;margin-top:8px}
</style>
<div class="wrap">
  <div class="h">추가 정보 입력</div>
  <div class="label">이메일</div>
  <input class="input" value="카카오톡 이메일 기본값" readonly />
  <div class="meta">카카오에서 제공된 이메일이에요. 수정은 카카오에서 가능</div>
  <div class="label">닉네임</div>
  <input class="input" placeholder="닉네임을 입력하세요" />
  <button class="btn" onclick="window.ReactNativeWebView.postMessage('{\\"type\\":\\"profile:completed\\"}')">회원 가입</button>
</div>`;
export default function SignupWebViewScreen({ navigation }: any) {
  return (
    <MobileLayout style={{ flex: 1 }}>
      <WebView
        source={{ html: HTML }} // 나중에 실제 URL로 교체
        onMessage={() => {
          // 회원가입 버튼 클릭 시 무조건 FeedWrite로 이동
          navigation.replace('FeedWrite');
        }}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess={false}
        mixedContentMode="never"
      />
    </MobileLayout>
  );
}
