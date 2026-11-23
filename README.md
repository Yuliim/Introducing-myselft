# 황유림 자기소개 웹앱

기획서의 Home·소개·프로젝트·연락처·방명록을 원페이지로 구현합니다. 이번 과제의 배포 대상은 AWS S3 + CloudFront입니다. 기획서 원본은 수정하지 않았습니다.

## 로컬 실행

Node.js가 설치된 PowerShell에서 `npm.cmd run dev` 실행 후 http://127.0.0.1:5173 접속. 별도 패키지 설치가 필요 없습니다. `npm.cmd run check`로 JavaScript 구문을 검사합니다. Windows의 npm.ps1 실행 정책 충돌을 피하도록 npm.cmd를 사용합니다.

## 현재 상태

- 화면, 프로젝트 상세 창, 방명록 클라이언트 구현.
- S3 퍼블릭 액세스 차단 4개 항목, 암호화, CloudFront OAC, 배포 ARN으로 제한한 버킷 정책을 CloudFormation으로 작성.
- AWS 리소스 생성 및 웹 파일 업로드 완료. 익명 요청으로 CloudFront HTML/CSS/JS 200, S3 직접 주소 403 확인. 상세 결과: evidence/VERIFICATION.md.
- GitHub Yuliim/Introducing-myselft main 브랜치에 초기 코드 업로드 완료. 제출용 AWS 설정 캡처는 별도 확보 필요.
- 방명록 AppSync + DynamoDB 백엔드를 yurim-guestbook 스택으로 배포했습니다. 실제 API에서 정상 저장·독립 요청 재조회, 키 없는 요청 거부, 잘못된 입력 5종 거부를 확인했습니다. web/config.js 연결값을 설정했으며 수정된 app.js·config.js의 S3 업로드와 CloudFront 캐시 갱신이 남았습니다. 검증 결과: evidence/guestbook-live-verification.json. 배포 절차: evidence/GUESTBOOK-DEPLOY.md.
- 이메일, GitHub 주소, 프로젝트 기간·역할·기술·성과, 자격증은 본인 확인 후 입력 필요.

## AWS 배포

AWS CLI v2 설치와 본인 계정 인증 후 계정·리전을 확인합니다. 리소스 사용에 따라 AWS 요금이 발생할 수 있습니다.

```powershell
aws sts get-caller-identity
./scripts/deploy.ps1 -Region ap-northeast-2
```

스크립트가 CloudFormation 스택을 생성하고 web 폴더만 업로드합니다. S3 정적 웹사이트 호스팅은 켜지 않습니다. CloudFront는 S3 REST 원본에 OAC 서명을 사용합니다. 출력의 CloudFrontUrl, S3DirectUrl로 검증합니다.

```powershell
./scripts/verify.ps1 -CloudFrontUrl https://실제도메인.cloudfront.net -S3DirectUrl https://실제버킷.s3.ap-northeast-2.amazonaws.com/index.html
```

템플릿은 S3 삭제 사고 방지를 위해 버킷 Retain을 지정했습니다. 과제 종료 후 스택을 삭제해도 버킷과 객체는 남으므로 별도로 정리해야 합니다.

## GitHub 연동

GitHub에서 빈 저장소를 생성한 뒤 해당 주소로 아래 명령을 실행합니다. 계정 확인 전 임의의 원격 주소나 작성자를 설정하지 않습니다.

```powershell
git init -b main
git add .
git commit -m "Add portfolio and private S3 CloudFront infrastructure"
git remote add origin https://github.com/본인계정/저장소.git
git push -u origin main
```

Git 인증은 Git Credential Manager 브라우저 로그인으로 진행합니다. AWS 비밀 키나 자격 증명 파일은 저장소에 올리지 않습니다. 코딩 도구는 현재 사용 중인 Codex를 개발환경 캡처에 포함할 수 있는지 수업 기준을 확인합니다(과제의 Claude Code는 예시).

## 방명록 API 계약

web/config.js에 graphqlEndpoint와 apiKey를 설정하면 API 호출이 활성화됩니다. 브라우저에 배포되는 AppSync API 키는 공개되는 값이므로 비밀 인증 수단으로 취급할 수 없습니다. 실습용 만료·권한·요청량 제한을 별도 구성해야 합니다.

```graphql
type Guestbook { guestbookId: ID!, nickname: String!, message: String!, createdAt: AWSDateTime! }
type Query { listGuestbook: [Guestbook!]! }
type Mutation { addGuestbook(nickname: String!, message: String!): Guestbook! }
```

서버에서도 trim 후 닉네임 2~20자, 메시지 1~200자를 검증합니다. ID와 createdAt은 서버에서 생성합니다. DynamoDB는 guestbookId를 PK로 유지하고, 최신순 조회를 위해 feed=PUBLIC 및 sortKey=createdAt#guestbookId를 갖는 ByCreatedAt GSI를 추가했습니다. Query는 scanIndexForward=false, limit=20으로 실행합니다. 작성 직후 GSI에 반영되기 전에는 실제 Mutation 성공 응답을 받은 글을 UI에 병합합니다. `npm.cmd test`는 로컬 에뮬레이션으로 입력 경계값, 서버 생성 필드, 조회 설정, 오류 전파를 확인하며 AWS 배포 검증을 대신하지 않습니다.

## 참고

- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
- https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-cloudfront-originaccesscontrol.html

기획서에 첨부된 동적 미디어 아키텍처 링크는 현재 앱 구성과 다르므로, 제출 전 실제 S3 → CloudFront 및 AppSync → DynamoDB 흐름을 표현한 그림인지 확인할 필요가 있습니다. 원본을 자동으로 수정하지 않습니다.
