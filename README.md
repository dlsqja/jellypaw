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
├── jellypaw-web/        (지금 만들 React Vite 프로젝트)
│   ├── src/
│   └── public/
│
└── jellypaw/        (나중에 만들 React Native 프로젝트)
    ├── App.tsx          (WebView로 jellypaw-web 로드)
    ├── CameraScreen.tsx (네이티브 카메라 기능)
    └── PushNotification.tsx (푸시 알림 기능)
```
