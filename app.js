const app = document.querySelector('#app');
const cards = [
  { name: 'Linda Srikandi', balance: 112411, last: '2451', theme: 'lime' },
  { name: 'Linda Srikandi', balance: 112411, last: '0095', theme: 'dark' },
  { name: 'Linda Srikandi', balance: 12000, last: '1122', theme: 'white' },
];
const people = [
  { name: 'Syaiful Rijal', short: 'S Rijal', account: '8921362190', avatar: '👨🏻' },
  { name: 'Ferina C', short: 'Ferina C', account: '8921362191', avatar: '👩🏻' },
  { name: 'Daffa T', short: 'Daffa T', account: '8921362192', avatar: '👨🏽' },
  { name: 'Bayu S', short: 'Bayu S', account: '8921362193', avatar: '👨🏻‍💼' },
  { name: 'Christian K', short: 'Christian K', account: '8921362194', avatar: '👨🏽‍🦱' },
];
const state = { screen: 'home', selected: 0, recipient: 0, amount: '19', total: 521098.31, cardReturn: 'send', transactions: [], sent: 0 };
const money = n => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const avatar = p => `<span class="avatar" aria-hidden="true">${p.avatar}</span>`;
const screenHeader = (title, right = '<button class="circle" data-action="help" aria-label="도움말">?</button>') => `<header class="topbar"><button class="circle" data-action="home" aria-label="홈으로">←</button><span>${title}</span>${right}</header>`;
function navigate(screen) { state.screen = screen; render(); }
let transferTimer = null;
let pendingTransfer = null;
let receipt = null;
const outlineIcon = (name) => {
 const paths = { card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M6 15h4"/>', amount: '<circle cx="12" cy="12" r="9"/><path d="M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9m3-10v12"/>', fee: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/>', date: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18"/>' };
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
};
function transferHeader(title, action) {
 return `<div class="status-bar" aria-hidden="true"><span>9:41</span><div class="status-icons"><span class="signal"><i></i><i></i><i></i><i></i></span><svg viewBox="0 0 24 20"><path d="M2 6Q12 -2 22 6M6 10q6-5 12 0M10 14q2-2 4 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span class="battery"></span></div></div><header class="transfer-header"><button data-action="${action}" aria-label="${action==='cancel-transfer'?'송금 취소':'홈으로'}">←</button><span>${title}</span></header>`;
}
function sendingScreen() {
 const t = pendingTransfer;
 return `<section class="screen transfer-screen">${transferHeader('Send Money','cancel-transfer')}<div class="sending-body" role="status" aria-live="polite"><svg class="transfer-spinner" viewBox="0 0 100 100" aria-hidden="true"><circle class="spinner-track" cx="50" cy="50" r="44"/><circle class="spinner-progress" cx="50" cy="50" r="44"/></svg><h1>Sending $${money(t.amount)}<br>to ${people[t.recipient].name}</h1><p>Processing your transaction securely...</p></div><button class="cancel-transfer" data-action="cancel-transfer">Cancel</button><div class="home-indicator" aria-hidden="true"></div></section>`;
}
function completeScreen() {
 const t=receipt,p=people[t.recipient];
 const initials=p.name.split(' ').map(part=>part[0]).slice(0,2).join('');
 const date=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(t.date);
 return `<section class="screen transfer-screen">${transferHeader('Transfer Complete','home')}<div class="complete-body"><div class="complete-heading" role="status"><div class="transfer-check"><svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="m15 32 12 12 24-25" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h1>Transfer Complete</h1><p>You sent $${money(t.amount)} to ${p.name}</p></div><section class="receipt" aria-label="송금 상세 내역"><div class="receipt-person"><span class="initials">${initials}</span><div><strong>${p.name}</strong><small>${p.account}</small></div></div><dl><div class="receipt-row"><dt>${outlineIcon('card')}<span>From</span></dt><dd>Linda’s card <span class="card-digits">•••• ${t.last}</span></dd></div><div class="receipt-row"><dt>${outlineIcon('amount')}<span>Amount</span></dt><dd>$${t.amount.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</dd></div><div class="receipt-row"><dt>${outlineIcon('fee')}<span>Fee</span></dt><dd>$0.00 <span class="free-badge">Free</span></dd></div><div class="receipt-row"><dt>${outlineIcon('date')}<span>Date</span></dt><dd class="receipt-date">${date}</dd></div></dl></section></div><button class="done-transfer" data-action="home">Done</button><div class="home-indicator" aria-hidden="true"></div></section>`;
}
function startTransfer() {
 const amount=Number(state.amount);
 if(state.screen!=='send'||pendingTransfer||!Number.isFinite(amount)||amount<=0||amount>cards[state.selected].balance)return;
 pendingTransfer={amount,recipient:state.recipient,card:state.selected,last:cards[state.selected].last};
 navigate('sending');
 transferTimer=setTimeout(()=>{
  if(!pendingTransfer)return;
  const t=pendingTransfer;
  cards[t.card].balance-=t.amount;
  state.total=Math.round((state.total-t.amount)*100)/100;
  state.sent=t.amount;
  receipt={...t,date:new Date()};
  state.transactions.unshift(receipt);
  pendingTransfer=null;transferTimer=null;state.amount='0';
  navigate('success');
 },2600);
}
function cancelTransfer() {
 if(!pendingTransfer)return;
 clearTimeout(transferTimer);transferTimer=null;pendingTransfer=null;
 navigate('send');
}
function home() {
  return `<section class="screen"><header class="topbar"><span class="brand">Pesse</span><div class="top-actions"><button class="circle" data-action="help" aria-label="도움말">?</button><button class="pill black" data-action="rewards">♔ Rewards ˙</button></div></header>
  <div class="balance"><button class="balance-label" data-action="cards">Linda’s card balance <span class="mini-card"></span>⌄</button><h1>$${money(state.total)}</h1><span class="hold">Money hold <b>$2,500</b></span></div>
  <div class="actions"><button data-action="cards">↗ Send</button><button data-action="receive">↙ Receive</button></div>
  <div class="promo"><div><strong>Start sending money tax free</strong><p>The best place for freelancers to receive and send money. Start saving now!</p></div><span class="coin">$</span></div>
  <section class="panel"><div class="section-title">Send again<button class="text-button" data-action="people">＋ Add</button></div><div class="people">${people.map((p,i)=>`<button class="person" data-person="${i}">${avatar(p)}${p.short}</button>`).join('')}</div></section>
  <section class="panel history"><div class="section-title">History transaction<button class="text-button" data-action="history">see more</button></div>${state.transactions.map(t=>transaction(people[t.recipient].avatar,people[t.recipient].name,'Just now',`-$${money(t.amount)}`)).join('')}${transaction('◎','Dribbble Pro','June 28 · 00:01 AM','-$573')}${transaction('👨🏻','Syaiful Rijal','June 22 · 05:20 PM','+$1000',true)}${transaction('👩🏻','Ferina C','June 12 · 07:20 AM','-$200')}</section>
  <nav class="nav" aria-label="주 메뉴"><button class="active" data-action="home" aria-label="홈">⌂</button><button data-action="history" aria-label="거래 내역">◉</button><button data-action="cards" aria-label="카드">▤</button><button data-action="receive" aria-label="입금">＄</button><button data-action="profile" aria-label="프로필">♙</button></nav></section>`;
}
function transaction(icon,name,date,amount,positive=false) { return `<div class="transaction"><span class="avatar">${icon}</span><div class="transaction-info">${name}<small>${date}</small></div><span class="value ${positive?'positive':''}">${amount}</span></div>`; }
function cardScreen() { return `<section class="screen"><header class="topbar"><span>Select Card</span><button class="pill" data-action="new-card">＋ New card</button></header><div class="cards">${cards.map((c,i)=>`<button class="bank-card ${c.theme}" data-card="${i}" aria-label="${c.last} 카드 선택"><div class="card-name">${c.name}</div><div class="card-money">$${money(c.balance)}</div><span class="visa">VISA</span><span class="watermark" aria-hidden="true">Pesse</span><span class="card-bottom"><span>•••• ${c.last}</span>${state.selected===i?'<span class="main-badge">◉ Main card</span>':''}</span></button>`).join('')}</div><button class="pill black close" data-action="close-cards">× Close</button></section>`; }
function sendScreen() {
 const p=people[state.recipient],c=cards[state.selected];
 return `<section class="screen">${screenHeader('Send money')}<section class="panel"><div class="section-title">Send to</div><div class="recipient">${avatar(p)}<div class="recipient-info">${p.name}<small>${p.account}</small></div><button class="change" data-action="people">Change</button></div></section>
 <div class="amount-area"><div class="amount" aria-label="송금 금액"><span id="amount">$${money(Number(state.amount))}</span><span class="caret"></span></div><p id="amount-hint" class="amount-hint" role="status"></p></div>
 <section class="panel selected-card"><span class="card-thumbnail ${c.theme}">Pesse<br>•••• ${c.last}</span><div class="recipient-info">Linda’s card<small>Balance $${money(c.balance)}</small></div><button class="change" data-action="change-card">Change</button></section>
 <div class="panel keypad" aria-label="금액 입력 키패드">${['1','2','3','4','5','6','7','8','9','000','0','⌫'].map(k=>`<button data-key="${k}" aria-label="${k==='⌫'?'마지막 숫자 지우기':k}">${k}</button>`).join('')}</div><button class="primary" id="send-button" data-action="submit">Send money</button></section>`;
}
function render() {
 app.classList.toggle('transfer-mode',state.screen==='sending'||state.screen==='success');
 if(state.screen==='home') app.innerHTML=home();
 if(state.screen==='cards') app.innerHTML=cardScreen();
 if(state.screen==='send') {app.innerHTML=sendScreen();updateAmount();}
 if(state.screen==='people') app.innerHTML=`<section class="screen">${screenHeader('Select recipient')}<p class="muted">Choose who you’d like to send money to.</p><div class="recipient-list">${people.map((p,i)=>`<button class="recipient-option" data-person="${i}">${avatar(p)}<span>${p.name}<br><small>${p.account}</small></span></button>`).join('')}</div></section>`;
 if(state.screen==='sending') app.innerHTML=sendingScreen();
 if(state.screen==='success') app.innerHTML=completeScreen();
 if(state.screen==='receive') app.innerHTML=`<section class="screen">${screenHeader('Receive money')}<section class="panel"><p class="muted">Share your account details to receive money.</p><h2>Linda Srikandi</h2><p>Pesse · 8921 3621 88</p><button class="primary" data-action="copy">Copy account number</button></section><p class="muted">화면 시연용 가상 계좌입니다.</p></section>`;
 if(state.screen==='history') app.innerHTML=`<section class="screen">${screenHeader('Transactions')}<section class="panel history">${state.transactions.map(t=>transaction(people[t.recipient].avatar,people[t.recipient].name,'Just now',`-$${money(t.amount)}`)).join('')}${transaction('◎','Dribbble Pro','June 28 · 00:01 AM','-$573')}${transaction('👨🏻','Syaiful Rijal','June 22 · 05:20 PM','+$1000',true)}${transaction('👩🏻','Ferina C','June 12 · 07:20 AM','-$200')}</section></section>`;
 if(state.screen==='new-card') app.innerHTML=`<section class="screen">${screenHeader('New card')}<section class="panel"><p class="muted">데모 카드를 추가합니다.</p><form id="card-form"><label class="field-label" for="card-last">Card last 4 digits</label><input class="input" id="card-last" name="last" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required placeholder="1234"><button class="primary" type="submit">Add card</button></form></section></section>`;
 if(state.screen==='profile') app.innerHTML=`<section class="screen">${screenHeader('My profile')}<section class="panel"><h2>Linda Srikandi</h2><p class="muted">Personal account · Pesse demo</p><p>${cards.length} cards connected</p></section></section>`;
 if(state.screen==='rewards') app.innerHTML=`<section class="screen">${screenHeader('Rewards')}<section class="panel"><h2>Your next little extra.</h2><p class="muted">Your rewards will appear here.</p><span class="coin">$</span><p>0 points</p></section></section>`;
}
function updateAmount(){const n=Number(state.amount),invalid=n>cards[state.selected].balance;document.querySelector('#amount').textContent='$'+money(n);document.querySelector('#amount-hint').textContent=invalid?'카드 잔액을 초과했습니다.':'';document.querySelector('#send-button').disabled=n<=0||invalid;}
function inputKey(key){if(key==='⌫'||key==='Backspace')state.amount=state.amount.slice(0,-1)||'0';else if(/^\d+$/.test(key))state.amount=(state.amount==='0'?'':state.amount).concat(key).slice(0,8)||'0';updateAmount();}
let toastTimer;
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);}
app.addEventListener('click',async e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.dataset.card!==undefined){state.selected=Number(button.dataset.card);navigate(state.cardReturn);return;}
 if(button.dataset.person!==undefined){state.recipient=Number(button.dataset.person);navigate('send');return;}
 if(button.dataset.key!==undefined){inputKey(button.dataset.key);return;}
 const action=button.dataset.action;
 if(action==='cards'||action==='change-card'){state.cardReturn='send';navigate('cards');}
 else if(action==='close-cards')navigate('home');
 else if(action==='help')toast('Send → 카드 선택 → 금액 입력으로 진행하세요. 실제 이체가 없는 데모입니다.');
 else if(action==='submit')startTransfer();
 else if(action==='cancel-transfer')cancelTransfer();
 else if(action==='copy'){try{await navigator.clipboard.writeText('8921362188');toast('계좌번호를 복사했습니다.');}catch{toast('계좌번호: 8921362188');}}
 else if(action)navigate(action);
});
app.addEventListener('submit',e=>{if(e.target.id!=='card-form')return;e.preventDefault();const last=new FormData(e.target).get('last');if(!/^\d{4}$/.test(last))return;if(cards.some(c=>c.last===last)){toast('이미 등록된 카드 번호입니다.');return;}cards.push({name:'Linda Srikandi',balance:0,last,theme:'white'});navigate('cards');toast('데모 카드를 추가했습니다.');});
document.addEventListener('keydown',e=>{if(state.screen!=='send'||e.ctrlKey||e.metaKey||e.altKey)return;if(/^\d$/.test(e.key)||e.key==='Backspace'){e.preventDefault();inputKey(e.key);}});
render();

