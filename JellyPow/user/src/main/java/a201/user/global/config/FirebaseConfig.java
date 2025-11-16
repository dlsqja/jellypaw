package a201.user.global.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Component
public class FirebaseConfig {

    @Value("${firebase.config.path:firebase-service-account.json}")
    private String firebaseConfigPath;

    @PostConstruct
    public void initialize() {
        try {
            // Firebase가 이미 초기화되어 있는지 확인
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = getFirebaseCredentials();
                
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase Admin SDK 초기화 완료");
            } else {
                log.info("Firebase Admin SDK가 이미 초기화되어 있습니다.");
            }
        } catch (IOException e) {
            log.error("Firebase Admin SDK 초기화 실패: {}", e.getMessage(), e);
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging() {
        return FirebaseMessaging.getInstance();
    }

    private InputStream getFirebaseCredentials() throws IOException {
        // ClassPathResource로 resources 폴더에서 파일 읽기 시도
        try {
            ClassPathResource resource = new ClassPathResource(firebaseConfigPath);
            if (resource.exists()) {
                return resource.getInputStream();
            }
        } catch (Exception e) {
            log.warn("ClassPath에서 Firebase 설정 파일을 찾을 수 없습니다: {}", firebaseConfigPath);
        }

        // 파일 시스템에서 직접 읽기 시도
        try {
            return new FileInputStream(firebaseConfigPath);
        } catch (Exception e) {
            log.error("Firebase 설정 파일을 찾을 수 없습니다: {}", firebaseConfigPath);
            throw new IOException("Firebase 설정 파일을 찾을 수 없습니다: " + firebaseConfigPath, e);
        }
    }
}

