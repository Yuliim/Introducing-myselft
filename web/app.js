const config = window.APP_CONFIG || {};
const projects = [
  ['ICE STOCK', '재고 관리 프로젝트입니다. 실제 구현 내용과 담당 역할은 자료 확인 후 공개합니다.'],
  ['대학 물품관리 시스템', '대학 물품 관리 프로젝트입니다. 실제 구현 내용과 담당 역할은 자료 확인 후 공개합니다.'],
  ['섬 여행 앱', '섬 여행 애플리케이션 프로젝트입니다. 실제 구현 내용과 담당 역할은 자료 확인 후 공개합니다.']
];
const dialog = document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[Number(button.dataset.project)];
  document.querySelector('#dialog-title').textContent = project[0];
  document.querySelector('#dialog-description').textContent = project[1];
  dialog.showModal();
}));
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
const contacts = document.querySelector('#contact-links');
for (const [label, value, prefix] of [['이메일', config.email, 'mailto:'], ['GitHub', config.github, '']]) {
  const valid = value && (prefix ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : /^https:\/\/github\.com\/[\w-]+\/?$/.test(value));
  const element = document.createElement(valid ? 'a' : 'p');
  element.textContent = valid ? label : `${label} 주소 확인 중`;
  if (valid) { element.href = prefix + value; if (!prefix) { element.target = '_blank'; element.rel = 'noopener noreferrer'; } }
  contacts.append(element);
}
const form = document.querySelector('#guestbook-form');
const status = document.querySelector('#status');
const entries = document.querySelector('#entries');
const ready = /^https:\/\/.+\.appsync-api\..+\.amazonaws\.com\/graphql$/.test(config.graphqlEndpoint || '') && !!config.apiKey;
const message = document.querySelector('#message');
message.addEventListener('input', () => { document.querySelector('#count').textContent = `${message.value.length} / 200`; });
async function graphql(query, variables = {}) {
  const response = await fetch(config.graphqlEndpoint, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': config.apiKey }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(15000) });
  const result = await response.json();
  if (!response.ok || result.errors || !result.data) throw new Error('API request failed');
  return result.data;
}
async function loadEntries() {
  if (!ready) { status.textContent = 'AWS 방명록 연결 전입니다. 배포 설정 후 작성과 조회가 활성화됩니다.'; return; }
  status.textContent = '방명록을 불러오는 중입니다.';
  try {
    const data = await graphql('query { listGuestbook { guestbookId nickname message createdAt } }');
    entries.replaceChildren();
    for (const entry of data.listGuestbook) {
      const li = document.createElement('li');
      const name = document.createElement('strong'); name.textContent = entry.nickname;
      const time = document.createElement('time'); time.dateTime = entry.createdAt; time.textContent = new Date(entry.createdAt).toLocaleString('ko-KR');
      const body = document.createElement('p'); body.textContent = entry.message;
      li.append(name, time, body); entries.append(li);
    }
    status.textContent = data.listGuestbook.length ? '최신 방명록 최대 20건입니다.' : '첫 번째 방명록을 남겨주세요.';
    return true;
  } catch { status.textContent = '방명록을 불러오지 못했습니다. 잠시 후 목록 새로고침을 눌러주세요.'; return false; }
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  const nickname = form.elements.nickname.value.trim();
  const text = message.value.trim();
  if (nickname.length < 2 || nickname.length > 20 || !text || text.length > 200) { status.textContent = '닉네임은 2~20자, 메시지는 1~200자로 입력해주세요. 공백만 입력할 수 없습니다.'; return; }
  if (!ready) return;
  const button = form.querySelector('button'); button.disabled = true; status.textContent = '등록 중입니다.';
  try {
    await graphql('mutation Add($nickname: String!, $message: String!) { addGuestbook(nickname: $nickname, message: $message) { guestbookId } }', { nickname, message: text });
    form.reset(); document.querySelector('#count').textContent = '0 / 200';
    const loaded = await loadEntries();
    status.textContent = loaded ? '등록했습니다. 새 글이 목록 맨 위에 반영되었습니다.' : '등록은 완료했지만 목록 조회에 실패했습니다. 목록 새로고침을 눌러주세요.';
  } catch { status.textContent = '등록하지 못했습니다. 입력 내용을 유지했으니 잠시 후 다시 시도해주세요.'; }
  finally { button.disabled = false; }
});
if (!ready) form.querySelector('button').disabled = true;
document.querySelector('#refresh').addEventListener('click', loadEntries);
loadEntries();
