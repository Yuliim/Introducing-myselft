# 배포 접속 검증 결과

검증일: 2026-11-23 (한국 시간 기준)

AWS 콘솔 로그인 정보나 서명 URL 없이 익명 HTTPS GET 요청으로 검증했습니다.

| 대상 | HTTP 상태 | Content-Type | 결과 |
| --- | --- | --- | --- |
| https://ddy87lih0zb2d.cloudfront.net/ | 200 | text/html | 포트폴리오 HTML 응답 확인 |
| /style.css | 200 | text/css | 스타일 응답 확인 |
| /app.js | 200 | application/javascript | 앱 코드 응답 확인 |
| /config.js | 200 | application/javascript | 설정 파일 응답 확인 |
| https://yurim-portfolio-websitebucket-g5hey0k2850o.s3.eu-north-1.amazonaws.com/index.html | 403 | 해당 없음 | 익명 직접 접근 거부 확인 |

CloudFormation 출력에서 확인한 배포 ID: E21HQ8MTD4VEMV

위 검증은 CloudFront 파일 제공과 S3 익명 직접 접근 차단을 확인합니다. AWS 콘솔의 퍼블릭 액세스 차단·OAC·버킷 정책 설정 캡처는 별도 제출 증빙으로 확보해야 합니다.

## 방명록 백엔드 추가 검증

AppSync 및 DynamoDB 배포 후 API 키가 있는 조회, 키 없는 조회 거부, 잘못된 입력 5종 거부, 정상 입력의 trim 처리 및 저장, 서버 ID와 작성 시각 생성, 독립된 조회 요청으로 저장 데이터 재확인을 통과했습니다. 상세 결과는 guestbook-live-verification.json에 기록했습니다. 확인용 글 1건을 저장했습니다. 최대 20건 제한과 역순 Query는 서버 코드에 설정되어 있으며, 현재 실데이터 1건이므로 21건 이상의 실제 정렬 경계 테스트는 수행하지 않았습니다.

프론트엔드 연결 설정은 로컬 파일에 반영했으며, 변경한 app.js 및 config.js를 S3에 업로드한 뒤 브라우저에서 등록과 페이지 새로고침 후 조회를 확인해야 합니다.
