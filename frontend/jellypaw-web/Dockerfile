FROM nginx:stable-alpine

# Nginx 설정 덮어쓰기 (SPA 라우팅을 위한 설정)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY dist/ /usr/share/nginx/html

# 포트 오픈
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
