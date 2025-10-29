package a201.common.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.region.static}")
    private String region;

    // S3에 파일 업로드
    public String uploadFile(MultipartFile file, String directory) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            // 고유한 파일명 생성
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = directory + "/" + UUID.randomUUID() + extension;

            // S3에 업로드
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            // 업로드된 파일의 URL 반환
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);

        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패: " + e.getMessage());
        }
    }

    // 프로필 이미지 업로드
    public String uploadProfileImage(MultipartFile file) {
        return uploadFile(file, "profile");
    }

    // 배경 이미지 업로드
    public String uploadBackgroundImage(MultipartFile file) {
        return uploadFile(file, "background");
    }

    // S3에서 파일 삭제
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            // URL에서 파일 키 추출
            // 예: https://bucket.s3.region.amazonaws.com/profile/uuid.jpg -> profile/uuid.jpg
            String key = extractKeyFromUrl(fileUrl);
            
            if (key != null) {
                s3Client.deleteObject(builder -> builder
                        .bucket(bucketName)
                        .key(key)
                        .build());
            }
        } catch (Exception e) {
            // 삭제 실패해도 계속 진행 (파일이 이미 없을 수 있음)
            System.err.println("S3 파일 삭제 실패: " + fileUrl + ", 오류: " + e.getMessage());
        }
    }

    // URL에서 S3 키 추출
    private String extractKeyFromUrl(String fileUrl) {
        try {
            // https://bucket.s3.region.amazonaws.com/profile/uuid.jpg
            // -> profile/uuid.jpg
            String[] parts = fileUrl.split(".amazonaws.com/");
            if (parts.length == 2) {
                return parts[1];
            }
        } catch (Exception e) {
            System.err.println("URL 파싱 실패: " + fileUrl);
        }
        return null;
    }
}

