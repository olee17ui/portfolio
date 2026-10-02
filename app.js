const app=document.querySelector('#app');
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
function image(src,alt,lazy=true){const n=el('img');n.src=src;n.alt=alt;n.decoding='async';if(lazy)n.loading='lazy';return n}
function link(href,text,cls){const n=el('a',text,cls);n.href=href;return n}
let content;
const categories=[['uiux','UI/UX','사용자 흐름, 와이어프레임, 웹·앱 화면과 프로토타입.'],['logo','LOGO','브랜드의 개성을 담은 로고, 심볼과 아이덴티티.'],['branding','BRANDING','브랜드 콘셉트, 아이덴티티와 다양한 매체의 적용 이미지.'],['detail','DETAIL PAGE','제품의 특징과 이야기를 전달하는 상세페이지.'],['banner','BANNER','핵심 메시지를 담은 프로모션·광고 배너.'],['ai','AI IMAGE','AI로 탐구한 이미지 콘셉트와 비주얼 실험.']];
const box=document.querySelector('#lightbox');box.querySelector('button').onclick=()=>box.close();box.onclick=e=>{if(e.target===box)box.close()};
function specializedDetail(p){
 const isLogo=p.group==='logo';const section=el('section',undefined,isLogo?'logo-detail':'brand-detail');
 const back=link('#/work/'+p.group,isLogo?'[ LOGO COLLECTION ]':'[ BRANDING COLLECTION ]','collection-back');section.append(back);
 const copy=el('div',undefined,'case-copy');copy.append(el('span',p.category+' / '+p.year,'section-kicker'),el('h1',p.title),el('p',p.description,'case-description'));
 if(p.role||p.tools){const facts=el('dl',undefined,'case-facts');for(const [label,value]of [['ROLE',p.role],['TOOLS',p.tools]])if(value)facts.append(el('dt',label),el('dd',value));copy.append(facts)}
 const primary=el('button',undefined,isLogo?'logo-enlarged':'brand-primary');primary.setAttribute('aria-label',p.title+' 이미지 확대');primary.append(image(p.cover,p.title,false));primary.onclick=()=>{box.querySelector('img').src=p.cover;box.querySelector('img').alt=p.title;box.showModal()};
 const hero=el('div',undefined,'case-hero');hero.append(copy,primary);section.append(hero);
 const gallery=el('div',undefined,'case-gallery');p.images.filter(src=>src!==p.cover).forEach((src,i)=>{const b=el('button');b.setAttribute('aria-label',p.title+' 상세 이미지 '+(i+1)+' 확대');b.append(image(src,p.title+' 상세 '+(i+1)));b.onclick=()=>{box.querySelector('img').src=src;box.querySelector('img').alt=p.title;box.showModal()};gallery.append(b)});section.append(gallery);app.append(section);
}
let disposeAlbum=()=>{};
function renderAlbum(projects){
 const demo=!projects.length;const source=demo?content.projects.filter(p=>!p.group).slice(0,8):projects;
 const pages=source.flatMap(p=>(p.images.length?p.images:[p.cover]).map(src=>({src,title:p.title,id:p.id})));let spread=0,busy=false,animation;
 const total=Math.ceil(pages.length/2),section=el('section',undefined,'album-section');section.setAttribute('aria-label','AI 이미지 바인더 앨범');
 const note=el('p',demo?'ALBUM PREVIEW / 기존 이미지로 보는 배치 샘플':'AI IMAGE / VISUAL ARCHIVE','album-note');section.append(note);
 const book=el('div',undefined,'album-book');const left=el('div',undefined,'album-sheet album-left'),right=el('div',undefined,'album-sheet album-right');book.append(left,right);
 const rings=el('div',undefined,'binder-rings');rings.setAttribute('aria-hidden','true');for(let i=0;i<3;i++)rings.append(el('span'));book.append(rings);
 function fill(sheet,index){sheet.replaceChildren();const page=pages[index];if(!page){sheet.append(el('span','END OF ARCHIVE','album-end'));return}const a=link('#/project/'+encodeURIComponent(page.id),undefined,'album-photo');a.append(image(page.src,page.title,false));sheet.append(a,el('div',String(index+1).padStart(2,'0')+' / '+page.title,'album-caption'))}
 const controls=el('nav',undefined,'album-controls');controls.setAttribute('aria-label','앨범 페이지 넘기기');const prev=el('button','‹'),next=el('button','›'),counter=el('span');prev.type=next.type='button';prev.setAttribute('aria-label','이전 두 페이지');next.setAttribute('aria-label','다음 두 페이지');counter.setAttribute('aria-live','polite');controls.append(prev,counter,next);
 function paint(){fill(left,spread*2);fill(right,spread*2+1);counter.textContent=total?String(spread+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'):'00 / 00';prev.disabled=spread===0;next.disabled=spread>=total-1}
 async function turn(direction){if(busy||spread+direction<0||spread+direction>=total)return;busy=true;const old=direction>0?right:left,leaf=el('div',undefined,'album-turn '+(direction>0?'turn-next':'turn-prev'));leaf.append(old.cloneNode(true));leaf.setAttribute('aria-hidden','true');leaf.inert=true;book.append(leaf);spread+=direction;paint();if(!matchMedia('(prefers-reduced-motion: reduce)').matches){animation=leaf.animate([{transform:'rotateY(0deg)',opacity:1},{transform:'rotateY('+(-direction*100)+'deg)',opacity:1,offset:.75},{transform:'rotateY('+(-direction*178)+'deg)',opacity:0}],{duration:650,easing:'cubic-bezier(.32,.05,.2,1)',fill:'forwards'});try{await animation.finished}catch{}}leaf.remove();busy=false}
 for(const [button,direction]of [[prev,-1],[next,1]]){let hovered=false;button.onpointerenter=e=>{if(e.pointerType==='mouse'&&!button.disabled){hovered=true;turn(direction)}};button.onpointerleave=()=>{hovered=false};button.onclick=e=>{if(e.detail===0||!hovered)turn(direction)}};const keys=e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,dialog'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();turn(e.key==='ArrowLeft'?-1:1)}};window.addEventListener('keydown',keys);
 let start;book.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY}});let swiped=false;book.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4){swiped=true;turn(dx<0?1:-1);setTimeout(()=>swiped=false,0)}});book.addEventListener('pointercancel',()=>start=null);book.addEventListener('click',e=>{if(swiped){e.preventDefault();e.stopPropagation()}},true);
 disposeAlbum=()=>{window.removeEventListener('keydown',keys);animation?.cancel()};paint();const stage=el('div',undefined,'album-stage');stage.append(book,controls);section.append(stage);app.append(section);
}
function render(){
 disposeAlbum();disposeAlbum=()=>{};
 const route=location.hash.slice(1)||'/';app.replaceChildren();document.body.dataset.page=route;document.querySelectorAll('[data-nav]').forEach(a=>{a.removeAttribute('aria-current');if(route==='/'+a.dataset.nav)a.setAttribute('aria-current','page')});
 const projects=content.projects;document.title=content.profile.name+' — Portfolio';
 if(route==='/'){
  const home=el('section',undefined,'portfolio-home');home.setAttribute('aria-labelledby','portfolio-title');
  const eyebrow=el('div',undefined,'hero-eyebrow');eyebrow.append(el('span','WEB DESIGNER / CREATIVE PORTFOLIO'),el('span','Archive — '+new Date().getFullYear()));
  const title=el('h1','PORTFOLIO','portfolio-title');title.id='portfolio-title';
  const stage=el('div',undefined,'hero-stage'),identity=el('div',undefined,'hero-identity');identity.append(el('span','DESIGNED BY','hero-label'),el('p',content.profile.name));
  const selected=projects.find(p=>p.featured)||projects[0];
  const art=link(selected?'#/project/'+encodeURIComponent(selected.id):'#/about',undefined,'hero-art');art.append(image(selected?selected.cover:content.profile.aboutImage,selected?selected.title:content.profile.name,false));art.append(el('span',selected?'01 / '+selected.title:'ABOUT THE DESIGNER','hero-art-caption'));art.setAttribute('aria-label',selected?selected.title+' 작업 보기':'디자이너 소개 보기');
  const intro=el('div',undefined,'hero-intro');intro.append(el('span','DIGITAL EXPERIENCES,','hero-label'),el('span','THOUGHTFULLY DESIGNED.','hero-label'),el('p','생각을 구조로,\n감각을 화면으로.'));
  stage.append(identity,art,intro);const bottom=el('div',undefined,'hero-bottom');bottom.append(el('span','WEB / UI·UX / VISUAL DESIGN'),link('#/index','EXPLORE PORTFOLIO','hero-work'),link('#/about','ABOUT ME'));
  home.append(eyebrow,title,stage,bottom);app.append(home);
 }else if(route==='/index'){
  const s=el('section',undefined,'contents-page'),visual=el('figure',undefined,'contents-visual');const preview=image(content.profile.indexImage||content.profile.aboutImage,'포트폴리오 비주얼',false);visual.append(preview,el('figcaption','A SELECTION OF IDEAS & IMAGES'));
  const panel=el('div',undefined,'contents-panel');panel.append(el('span','01 / CONTENTS','section-kicker'),el('h1','INDEX'),el('p','화면에서 브랜드까지,\n분야별로 작업을 소개합니다.','contents-intro'));const nav=el('nav',undefined,'contents-list');nav.setAttribute('aria-label','작업 분야 목차');categories.forEach(([id,title,description],i)=>{const a=link('#/work/'+id,undefined,'contents-item');const heading=el('div',undefined,'contents-heading');heading.append(el('span',String(i+1).padStart(2,'0')),el('h2',title));a.append(heading,el('p',description));const count=projects.filter(p=>p.group===id).length;a.append(el('span',count?String(count).padStart(2,'0')+' PROJECTS':'준비 중','contents-count'));nav.append(a)});panel.append(nav,link('#/work','[ Archive ]','contents-all'));s.append(visual,panel);app.append(s);
 }else if(route==='/work'||route.startsWith('/work/')){
  const selectedCategory=categories.find(c=>c[0]===route.slice(6));const visible=selectedCategory?projects.filter(p=>p.group===selectedCategory[0]):projects;
  const top=el('div',undefined,'page-top');top.append(el('h1','01 / Archive'),el('span',String(projects.length).padStart(2,'0')+' PROJECTS'));const grid=el('section',undefined,'work-grid');
  top.firstChild.textContent=selectedCategory?'01 / '+selectedCategory[1]:'01 / Archive';top.lastChild.textContent=String(visible.length).padStart(2,'0')+' PROJECTS';const filters=el('nav',undefined,'work-filters');filters.setAttribute('aria-label','작업 분류');[['','ALL'],...categories].forEach(([id,label])=>{const a=link('#/work'+(id?'/'+id:''),label);if((selectedCategory?.[0]||'')===id)a.setAttribute('aria-current','page');filters.append(a)});
  if(selectedCategory?.[0]==='logo')grid.className='logo-collection';if(selectedCategory?.[0]==='branding')grid.className='branding-collection';
  if(selectedCategory?.[0]==='ai'){app.append(top,filters);renderAlbum(visible);window.scrollTo(0,0);return}
  const isBanner=selectedCategory?.[0]==='banner';if(isBanner)grid.className='banner-collection';
  visible.forEach((p,i)=>{const a=link('#/project/'+encodeURIComponent(p.id),undefined,isBanner?'banner-card':'work-card'+(p.group==='logo'?' logo-card':''));
   if(isBanner){const copy=el('div',undefined,'banner-copy');copy.append(el('span',String(i+1).padStart(2,'0')+' / '+p.year,'section-kicker'),el('h2',p.title),el('p',p.summary||p.description),el('span',p.category,'banner-meta'));a.append(copy,image(p.cover,p.title))}
   else a.append(el('span',p.isNew?'[NEW]':'','badge'),image(p.cover,p.title),el('p',p.title+' / '+p.year+' — '+p.category+'\n'+p.summary));grid.append(a)});app.append(top,filters,grid);if(!visible.length)app.append(el('p','이 분야의 작업을 준비하고 있습니다.','empty'),link('#/index','[ BACK TO INDEX ]'));
 }else if(route==='/about'){
  const p=content.profile,s=el('section',undefined,'resume-page'),copy=el('div',undefined,'resume-copy');copy.append(el('span','02 / THE DESIGNER','section-kicker'),el('h1','ABOUT ME'));
  const facts=el('dl',undefined,'resume-facts');[['NAME',p.name],['BASED IN',p.location],['EMAIL',p.email],['FOCUS',p.discipline]].forEach(([label,value])=>{facts.append(el('dt',label));const dd=el('dd');dd.append(label==='EMAIL'?link('mailto:'+value,value):el('span',value));facts.append(dd)});copy.append(facts);
  [['INTRODUCTION / 자기소개',p.bio],['EXPERIENCE / 경력',p.experience],['EDUCATION / 학력·교육',p.education],['SKILLS / 사용 도구',p.skills],['AWARDS / 수상·자격',p.awards]].forEach(([label,value])=>{if(label.startsWith('AWARDS')&&!value)return;const section=el('section',undefined,'resume-section');section.append(el('h2',label),el('p',value||'등록 예정'));copy.append(section)});copy.append(link('mailto:'+p.email,'[ GET IN TOUCH ]','resume-contact'));
  const portrait=el('figure',undefined,'resume-portrait');portrait.append(image(p.aboutImage,p.name,false),el('figcaption',p.name+' / WEB DESIGNER'));s.append(copy,portrait);app.append(s);
 }else if(route.startsWith('/project/')){
  const p=projects.find(x=>encodeURIComponent(x.id)===route.slice(9));if(!p){app.append(el('p','작업을 찾을 수 없습니다.','empty'),link('#/work','전체 작업 보기'));return}
  document.title=p.title+' — '+content.profile.name;if(['logo','branding'].includes(p.group)){specializedDetail(p);window.scrollTo(0,0);return}const intro=el('section',undefined,'detail-intro');intro.append(el('h1',String(projects.indexOf(p)+1).padStart(2,'0')+' / '+p.title),el('p',p.description),el('div',p.category+' / '+p.year,'meta'));const gallery=el('section',undefined,'gallery');(p.images.length?p.images:[p.cover]).forEach((src,i)=>{const b=el('button');b.setAttribute('aria-label',p.title+' 이미지 '+(i+1)+' 확대');b.append(image(src,p.title+' — '+(i+1),i>0));b.onclick=()=>{box.querySelector('img').src=src;box.querySelector('img').alt=p.title;box.showModal()};gallery.append(b)});const nav=el('nav',undefined,'project-nav');nav.append(link('#/work','[ Archive ]'));if(projects.length>1)nav.append(link('#/project/'+encodeURIComponent(projects[(projects.indexOf(p)+1)%projects.length].id),'[ NEXT PROJECT ]'));app.append(intro,gallery,nav);
 }else{app.append(el('p','페이지를 찾을 수 없습니다.','empty'),link('#/','메인으로'))}
 window.scrollTo(0,0);
}
fetch('data/portfolio.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{content=data;const p=data.profile;document.querySelector('#name').textContent=p.name;document.querySelector('#location').textContent=p.location;document.querySelector('#email').textContent=p.email;document.querySelector('#contact').href='mailto:'+p.email;document.querySelector('#discipline').textContent=p.discipline;document.querySelector('#copyright').textContent='© '+p.name;document.querySelector('#year').textContent=new Date().getFullYear();if(/^https:\/\//.test(p.instagram)){const a=document.querySelector('#social');a.hidden=false;a.href=p.instagram;a.target='_blank';a.rel='noopener noreferrer'}render();window.addEventListener('hashchange',render)}).catch(()=>{app.replaceChildren(el('p','데이터를 불러오지 못했습니다. 로컬 서버 또는 GitHub Pages에서 열어 주세요.','empty'))});

