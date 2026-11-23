import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context = { window: {} };
vm.runInNewContext(await readFile('web/config.js', 'utf8'), context);
const { graphqlEndpoint, apiKey } = context.window.APP_CONFIG;
async function call(query, variables, authenticated = true) {
  const response = await fetch(graphqlEndpoint, {
    method: 'POST', headers: { 'content-type': 'application/json', ...(authenticated ? { 'x-api-key': apiKey } : {}) },
    body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(15000)
  });
  return { status: response.status, body: await response.json() };
}
const query = 'query { listGuestbook { guestbookId nickname message createdAt } }';
const mutation = 'mutation Add($nickname: String!, $message: String!) { addGuestbook(nickname: $nickname, message: $message) { guestbookId nickname message createdAt } }';
const before = await call(query);
assert.equal(before.status, 200); assert.ok(!before.body.errors);
const anonymous = await call(query, {}, false);
assert.ok(anonymous.status === 401 || anonymous.status === 403 || anonymous.body.errors);
for (const input of [
  { nickname: ' ', message: '공백 닉네임 거부 확인' },
  { nickname: '한', message: '짧은 닉네임 거부 확인' },
  { nickname: 'a'.repeat(21), message: '긴 닉네임 거부 확인' },
  { nickname: '검증용', message: ' \n ' },
  { nickname: '검증용', message: 'a'.repeat(201) }
]) {
  const result = await call(mutation, input);
  assert.ok(result.body.errors?.some(error => error.errorType === 'ValidationError'), JSON.stringify(result.body));
}
const started = Date.now();
const input = { nickname: '  연결확인  ', message: `  AppSync와 DynamoDB 방명록 저장·재조회 검증을 완료했습니다. (${new Date().toISOString()})  ` };
const written = await call(mutation, input);
assert.ok(!written.body.errors, JSON.stringify(written.body));
const item = written.body.data.addGuestbook;
assert.equal(item.nickname, input.nickname.trim()); assert.equal(item.message, input.message.trim());
assert.ok(item.guestbookId); assert.ok(Math.abs(Date.parse(item.createdAt) - started) < 60000);
let items;
for (let attempt = 0; attempt < 10; attempt++) {
  const result = await call(query);
  assert.ok(!result.body.errors, JSON.stringify(result.body));
  items = result.body.data.listGuestbook;
  if (items.some(entry => entry.guestbookId === item.guestbookId)) break;
  await new Promise(resolve => setTimeout(resolve, 500));
}
assert.ok(items.some(entry => entry.guestbookId === item.guestbookId));
assert.ok(items.length <= 20);
for (let index = 1; index < items.length; index++) assert.ok(items[index - 1].createdAt >= items[index].createdAt);
const result = { verifiedAt: new Date().toISOString(), endpoint: graphqlEndpoint, checks: ['authenticated query', 'missing key rejected', 'five invalid mutations rejected', 'trimmed valid write', 'server generated ID and time', 'independent query returned saved item', 'latest-first and maximum 20'], savedTestEntry: item };
await writeFile('evidence/guestbook-live-verification.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
