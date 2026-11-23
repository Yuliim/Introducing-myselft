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

이번 검증은 CloudFront 파일 제공과 S3 익명 직접 접근 차단을 확인합니다. AWS 콘솔의 퍼블릭 액세스 차단·OAC·버킷 정책 설정 캡처는 별도 제출 증빙으로 확보해야 합니다. 방명록 AppSync·DynamoDB 연결과 실제 저장은 아직 구현 전이며 이번 검증 대상에 포함되지 않습니다.
