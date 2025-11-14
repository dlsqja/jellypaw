# Release APK 빌드 및 추출

프로덕션용 Release APK를 빌드하는 방법입니다.

## 사전 준비

### 1. 키스토어 파일 생성 (최초 1회만)

Release APK를 빌드하기 위해서는 서명용 키스토어 파일이 필요합니다.

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore jellypaw-release.keystore -alias jellypaw-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**입력 항목:**

- 키스토어 비밀번호: 원하는 비밀번호 입력 (노션 프론트 메모장 참고고)
- 이름, 조직 등 정보 입력
- 키 비밀번호: 키스토어 비밀번호와 동일하게 하려면 Enter

**⚠️ 중요:** 키스토어 파일과 비밀번호는 안전하게 보관하세요. 분실 시 앱 업데이트가 불가능합니다.

### 2. gradle.properties 설정

`android/gradle.properties` 파일에 키스토어 정보를 설정합니다.

```properties
# Release keystore configuration
MYAPP_RELEASE_STORE_FILE=jellypaw-release.keystore
MYAPP_RELEASE_KEY_ALIAS=jellypaw-key-alias
MYAPP_RELEASE_STORE_PASSWORD=실제-키스토어-비밀번호
MYAPP_RELEASE_KEY_PASSWORD=실제-키-비밀번호
```

**⚠️ 보안:** `gradle.properties` 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않습니다. 템플릿 파일은 `gradle.properties.example`을 참고하세요.

### 3. build.gradle 설정 확인

`android/app/build.gradle` 파일에 release 서명 설정이 포함되어 있는지 확인합니다.

```gradle
signingConfigs {
    debug {
        // ... debug 설정
    }
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        // ... 기타 설정
    }
}
```

## Release APK 빌드

### 기본 빌드 명령어

```bash
cd android
./gradlew assembleRelease
```

Windows에서는:

```bash
cd android
gradlew.bat assembleRelease
```

### Lint 오류 발생 시

파일 잠금 오류나 lint 오류가 발생하면 lint 검사를 건너뛰고 빌드할 수 있습니다:

```bash
cd android
./gradlew assembleRelease -x lintVitalAnalyzeRelease
```

## 빌드 결과

빌드가 성공하면 다음 위치에 APK 파일이 생성됩니다:

```
android/app/build/outputs/apk/release/app-release.apk
```

## APK 설치

### USB로 연결된 기기에 설치

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

기존 앱이 설치되어 있다면 덮어쓰기:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### 직접 설치

1. APK 파일을 휴대폰으로 복사 (USB 파일 전송, 이메일, 클라우드 등)
2. 휴대폰에서 파일 관리자로 APK 파일 열기
3. "알 수 없는 출처" 설치 허용 (필요 시)

## Google Play Store 배포

Google Play Store에 배포하려면 AAB(Android App Bundle) 형식을 사용하는 것이 권장됩니다.

### AAB 파일 생성

```bash
cd android
./gradlew bundleRelease
```

생성된 AAB 파일 위치:

```
android/app/build/outputs/bundle/release/app-release.aab
```

**참고:** Google Play Store는 2021년 8월부터 새 앱에 대해 AAB 형식을 필수로 요구합니다.

## 문제 해결

### 빌드 실패 시

1. **파일 잠금 오류**: Android Studio를 종료하고 다시 시도
2. **Lint 오류**: `-x lintVitalAnalyzeRelease` 옵션 사용
3. **키스토어 오류**: `gradle.properties`의 비밀번호 확인

### 설치 실패 시

1. **서명 불일치**: 기존 앱 삭제 후 재설치
2. **권한 문제**: "알 수 없는 출처" 설치 허용 확인
3. **저장 공간**: 기기 저장 공간 확인

## 중요 사항

- ✅ 키스토어 파일(`jellypaw-release.keystore`)은 안전하게 보관
- ✅ 모든 업데이트는 같은 키스토어로 서명해야 함
- ✅ 키스토어 분실 시 앱 업데이트 불가능
- ✅ `gradle.properties`는 Git에 커밋되지 않음 (보안)

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
