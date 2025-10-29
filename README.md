## JellyPaw FE

### 1. React Navigation과 WebView를 설치

```
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-webvie
```

### 2. 예상 폴더구조

```
frontend/
├── jellypaw-web/        (React - 웹)
│   ├── src/
│   └── public/
│
└── jellypaw/        ( React Native - 앱)
    ├── App.tsx          (WebView로 jellypaw-web 로드)
    ├── CameraScreen.tsx (네이티브 카메라 기능)
    └── PushNotification.tsx (푸시 알림 기능)
```

- 이후에 웹 부분을 앱에서 web-view로 만들 예정
