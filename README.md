# Jellypaw FE

### 예상 폴더구조

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

# React Native

## Step 1: Start Metro

```
npm start
```

## Step 2: Build and run your app

### Android

```
npm run android
```

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

---

### React Navigation과 WebView를 설치

```
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-webview
```
