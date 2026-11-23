# 방명록 배포 및 확인

기획서 원본은 변경하지 않고 AppSync GraphQL → DynamoDB 흐름을 추가합니다. 기존 hosting 스택과 별도로 배포하므로 S3 및 CloudFront 설정은 유지합니다.

## 콘솔 배포

1. 스톡홀름 eu-north-1의 CloudFormation에서 새 스택을 생성합니다.
2. `infra/guestbook.yaml` 파일을 업로드하고 이름은 `yurim-guestbook`으로 지정합니다.
3. 검토 화면의 IAM 리소스 생성 확인 항목을 확인한 뒤 제출합니다. 이 역할은 AppSync가 해당 테이블에 PutItem, 해당 인덱스에 Query만 수행하도록 제한됩니다.
4. CREATE_COMPLETE 후 출력의 GraphqlEndpoint와 BrowserApiKey로 설정 파일을 생성합니다.

```powershell
node scripts/configure-guestbook.mjs '출력의 GraphqlEndpoint' '출력의 BrowserApiKey'
```

5. 변경된 web/app.js와 web/config.js를 기존 버킷 최상위에 업로드합니다.
6. CloudFront 배포 E21HQ8MTD4VEMV의 무효화에서 `/app.js`, `/config.js`를 지정합니다. 완료 후 브라우저를 새로고침합니다.

API 키는 브라우저에 공개되는 실습용 키입니다. AWS 액세스 키/시크릿 키가 아닙니다. 생성 후 기본 7일 만료이며 제출 일정에 맞춰 AppSync에서 만료를 연장해야 합니다. API 키만으로 방문자를 식별하거나 스팸을 방지할 수는 없습니다. 공개 운영 전 WAF 요청량 제한과 비용 알림을 설정하고, 필요시 사용자 인증 및 쓰기 권한 제한을 추가합니다. 이 템플릿은 WAF 유료 리소스를 생성하지 않습니다.

## 확인할 동작

- 처음 방문하면 자동 조회, 최대 20건 최신순 표시.
- 닉네임 2~20자, 메시지 1~200자. trim 후 공백만 입력 거부. AppSync에서도 동일 검증.
- 정상 등록 후 성공 안내, 입력 초기화, 서버가 반환한 글이 최신 목록에 반영.
- 새로고침 및 별도 브라우저에서도 저장한 글 조회.
- DynamoDB 항목의 guestbookId, nickname, message, createdAt 확인. createdAt과 ID는 AppSync 서버 생성.
- 클라이언트 검증을 우회해 GraphQL API에 공백/초과 길이를 보내도 ValidationError이며 저장되지 않음.
- 조회/등록 오류 안내, 등록 중 중복 제출 방지.
- HTML 형태의 메시지도 코드 실행 없이 텍스트로 표시.

guestbookId가 기본 파티션 키입니다. 최신순 조회를 위해 feed와 sortKey 보조 속성 및 ByCreatedAt GSI를 추가합니다. 전체 Scan 대신 GSI 역방향 Query로 20건을 조회합니다. GSI는 최종 일관성이므로 작성 직후 인덱스 반영 전에는 Mutation에서 실제 저장 성공 응답을 받은 글을 UI에 병합합니다.

이 문서는 배포 절차이며 실제 배포·테스트 성공 증빙을 대신하지 않습니다. 배포 후 기존 보고서의 'DB 연결 제외' 문구는 실제 결과에 맞춰 수정해야 합니다. 테이블은 Retain 정책이므로 스택 삭제 후에도 방명록 데이터는 남습니다.
