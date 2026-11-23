import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const template = await readFile('infra/guestbook.yaml', 'utf8');
const blocks = [...template.matchAll(/      Code: \|\r?\n([\s\S]*?)(?=^  [A-Za-z]|^Outputs:)/gm)].map(m => m[1].split(/\r?\n/).map(line => line.startsWith('        ') ? line.slice(8) : line).join('\n'));
assert.equal(blocks.length, 2);
const util = {
  autoId: () => 'server-id', time: { nowISO8601: () => '2026-11-23T09:00:00.000Z' },
  error: (message, type) => { const error = new Error(message); error.name = type; throw error; },
  dynamodb: { toMapValues: value => value }
};
const resolvers = blocks.map(code => {
  const context = { util };
  vm.runInNewContext(code.replace(/^import .*;\r?\n/m, '').replaceAll('export function', 'function'), context);
  return context;
});
const [add, list] = resolvers;
for (const nickname of ['', ' ', 'a', 'a'.repeat(21)]) {
  assert.throws(() => add.request({ args: { nickname, message: 'valid' } }), { name: 'ValidationError' });
}
for (const message of ['', ' \n ', 'a'.repeat(201)]) {
  assert.throws(() => add.request({ args: { nickname: '방문자', message } }), { name: 'ValidationError' });
}
for (const nickname of ['ab', 'a'.repeat(20)]) {
  for (const message of ['x', 'x'.repeat(200)]) {
    const request = add.request({ args: { nickname: ` ${nickname} `, message: ` ${message} `, createdAt: 'forged' } });
    assert.equal(request.operation, 'PutItem');
    assert.equal(request.key.guestbookId, 'server-id');
    assert.equal(request.attributeValues.createdAt, '2026-11-23T09:00:00.000Z');
    assert.equal(request.attributeValues.nickname, nickname);
    assert.equal(request.attributeValues.message, message);
    assert.equal(request.attributeValues.feed, 'PUBLIC');
  }
}
const query = list.request({});
assert.equal(query.operation, 'Query'); assert.equal(query.index, 'ByCreatedAt');
assert.equal(query.scanIndexForward, false); assert.equal(query.limit, 20);
assert.equal(query.query.expressionValues[':feed'], 'PUBLIC');
assert.throws(() => list.response({ error: { message: 'failure', type: 'DataSourceError' } }), { name: 'DataSourceError' });
console.log('PASS: server validation, trimmed boundaries, server ID/time, newest-first indexed Query limit 20, and error propagation.');
console.log('Local emulation only. AWS APPSYNC_JS deployment and live persistence still require verification.');
