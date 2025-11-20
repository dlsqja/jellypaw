# 제리뽀
> 반려동물 종합 관리 플랫폼 서비스

![메인 페이지](/images/home.png)
# 📜 목차
- [서비스 개요](#서비스-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [아키텍처 구성](#아키텍처-구성)
- [폴더 구조](#-폴더-구조)
- [팀원 소개](#팀원-소개)


# 📝서비스 개요

### 반려동물 종합 관리 플랫폼 서비스

- 반려동물 건강 정보 및 접종 관련 기록 관리
- 
- 소변 검사 키트 활용으로 AI 결과 분석
- 
- 반려동물 동반 가능 시설 조회 및 공유
- 
- 반려동물 동반 가능 시설 예약 및 후기 작성



# ⚡주요 기능

### 1. 피드 작성 / 조회
  - 일기 형식으로 반려동물의 일상을 기록하고, 다른 사용자의 피드를 열람 가능
  
  - 공개 범위(전체/ 친구/ 비공개) 설정 기능을 통해 개인정보 강화
 
  - 사진, 위치, 건강 데이터를 함께 업로드하여 반려동물의 성장 과정을 시각적으로 관리

### 2. MCP 기반 통합 검색 및 예약 
  
  - 사용자, 장소(병원,카페 등) 검색을 통해 반려동물 관련 정보를 손쉽게 탐색
  
  - 장소 상세 페이지에서 예약기능 제공 -> SNS와 실제 서비스 이용의 연결
  
  - 사용자 프로필을 통해 반려동물 성향, 관심사 기반으로 커뮤니티 매칭 가능

### 3. AI 기반 동물 건강 관리
  
  - 요검사 키트를 촬영하면 CNN 모델이 색상 패턴을 분석하여 건강 지표(단백질, 포도당, 혈노 등)를 자동 판별
  
  - 검사 결과를 저장하고, 날짜별 변화 추적을 통해 건강 이력 관리 및 이상 징후 조기 발견
  
  - OpenCV 기반 색상 교정 및 영역 인식 기술을 적용하여 다양한 조명 환경에서도 정확한 판별 가능

### 4. 사용자 검색과 장소 검색 분리
  - @유저명, 장소명으로 사용자 검색과 장소 검색 분리
  - 인증된 장소는 예약 가능
  <img height="500" alt="사용자 검색" src="images/사용자 검색.gif" />
  <img height="500" alt="장소 검색" src="images/장소 검색.gif" />

# 🛠기술 스택

### Frontend
- Language: TypeScript
- Framework: React Native, React
- UI/스타일링: TailwindCSS
- 상태 관리: Zustand

### Backend
- Language: Java 17
- Framework: Spring, Spring Boot 3.3.2, Spring Batch, Spring Scheduler 
- Database: MySQL 8.0, MongoDB 8, Redis 7 
- ORM: JPA
- 인증/보안: Spring Security
- Messaging & Search: Kafka 3.8.1, Elasticsearch 8.11.0
- AI : OpenCV, YOLOv8, DeltaE

### Infra 
- Containerization: EC2, AWS S3, Docker, Docker Compose
- CI/CD: Jenkins

# 📐아키텍처 구성 
### 시스템 아키텍처
![시스템 아키텍처](/images/system_architecture.png)

# 📂 폴더 구조
```
JellyPaw/

│
├── frontend/                               
│   │
│   ├── jellypaw/             # React Native 기반 모바일 앱 (Android)
│   │   ├── android/          # Android 네이티브 설정
│   │   │   └── ...
│   │   │
│   │   ├── src/
│   │   │   ├── layouts/       # 레이아웃 컴포넌트 (Auth, Main, WebView)
│   │   │   ├── navigation/
│   │   │   ├── screens/
│   │   │   │   ├── auth/      # 인증 화면 (회원가입 / 로그인)
│   │   │   │   └── main/      # 메인 화면 (Feed, Pet, Write, Mypage, Search)
│   │   │   ├── services/                   
│   │   │   ├── lib/
│   │   │   ├── ui/
│   │   │   └── types/                      
│   │   │
│   │   ├── assets/
│   │   ├── App.tsx
│   │   └── ...
│   │
│   └── jellypaw-web/          # React + Vite + TypeScript 기반 Webview
│       ├── public/
│       │
│       ├── src/
│       │   ├── assets/
│       │   ├── components/                
│       │   ├── pages/
│       │   ├── layouts/       # 페이지 레이아웃
│       │   ├── routers/       # React Router
│       │   ├── services/      # API
│       │   ├── hooks/         # React Query
│       │   ├── store/         # Zustand 전역 상태 관리
│       │   ├── types/
│       │   └── utils/
│       │
│       └── ...
│
├── backend/                                
│   ├── user/                  # User (인증, 사용자, 반려동물, 팔로우, FCM)
│   ├── board/                 # 피드 CRU (게시글, 댓글, 좋아요, 장소)
│   ├── board-view/            # 피드 Read (조회 최적화)
│   ├── reservation/           # 예약 서비스 (예약 관리, 예약 가능 시간)
│   ├── gateway/                            
│   ├── common/                             
│   ├── init/             
│   ├── build.gradle      
│   ├── settings.gradle   
│   └── docker-compose.yml
│
├── ai/                      # Python 기반 AI 분석 서버
│   ├── cv_classic/
│   │   └── ...              # OpenCV 기반 분석 스크립트들
│   │
│   ├── yolo_model/          # YOLO 모델 기반 분석
│   │   ├── analyze_*.py  
│   │   ├── classes.txt
│   │   ├── data.yaml
│   │   └── results/      
│   │
│   ├── api_server.py        # FastAPI/Flask API 서버
│   ├── Dockerfile
│   └── requirements.txt
│
├── package-lock.json
└── README.md

```




# 👥팀원 소개
| 전윤지 | 김유성 | 송인범 | 안성수 | 이대연 | 한진경 |
|-------------|--------|--------|--------|--------|--------|
| AI, 팀장  | BE, AI | BE  | BE  | FE   | FE   |




