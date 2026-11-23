# 제출 증빙 체크리스트

실제로 배포한 화면만 캡처합니다. 이 파일은 진행 안내이며 제출 증빙을 대신하지 않습니다.

- [ ] 개발 폴더와 코딩 도구에서 소스가 열린 화면
- [ ] GitHub 저장소 URL, main 브랜치, 업로드된 코드와 커밋 화면
- [ ] AWS 콘솔의 사용 리전 및 생성한 리소스 화면
- [ ] S3 → 권한 → 퍼블릭 액세스 차단 4개 항목 모두 켜짐
- [ ] S3 → 권한 → 버킷 정책의 CloudFront 서비스 Principal, GetObject, 배포 SourceArn
- [ ] CloudFront → 원본 → S3 REST 원본 및 OAC 연결
- [ ] CloudFront → OAC 설정 → 요청 서명 항상 사용
- [ ] CloudFront 배포 활성화 및 배포 도메인
- [ ] CloudFront HTTPS 주소에서 웹앱 정상 표시
- [ ] S3 index.html 직접 객체 URL에서 AccessDenied (HTTP 403)
- [ ] CloudFront URL을 제출란에 텍스트로 기재

스크린샷에서 액세스 키, 비밀번호, 세션 토큰 등 자격 증명이 노출되지 않는지 확인합니다. S3 직접 접근 확인에는 콘솔의 인증된 객체 열기가 아닌 익명 HTTPS 주소를 사용합니다.
