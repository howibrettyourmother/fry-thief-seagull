// ================= rendering, HUD, screens, loop, test hooks =================
let UI=[],HUDB=[];
function btn(id,x,y,w,h,fn){UI.push({id,x,y,w,h,fn})}
function hbtn(id,x,y,w,h,fn){HUDB.push({id,x,y,w,h,fn})}
function uiTap(p){for(const b of UI)if(inR(p,b)){AUD.SFX.click();b.fn();return}
  if(state==='card'&&stT>0.4)startPlay();else if(state==='clear'&&stT>1.2)startLevel(lv+1);else if(state==='oops'&&stT>1.2)respawn();else if(state==='win'){AUD.SFX.firework();burst(p.x,p.y,30,['#ffd23f','#ff5d8f','#4fc3f7','#fff','#81c784'],260,6)}}
function uiKey(){if(state==='title')newGame(selLv);else if(state==='card')startPlay();else if(state==='clear'&&stT>1.2)startLevel(lv+1);else if(state==='oops'&&stT>1.2)respawn()}
function goTitle(){saveBest();state='title';paused=false;clearWorld();AUD.setTheme('title');selLv=Math.min(selLv,unlockLv-1)}
// ---------- world ----------
function drawBoss(b){const def=BOSS[b.k];X.save();
  if(b.st==='down'){const a=Math.min(1,b.t*1.5);X.translate(b.x,GY());X.rotate(a*0.5);X.translate(-b.x,-GY());X.globalAlpha=1-Math.max(0,b.t-2)*1.2}
  if(b.flash>0&&((T*30)|0)%2)X.globalAlpha*=0.6;def.draw(b);for(const s of b.spl)splatOn(b.x+s[0],GY()+s[1],0.9);X.restore();
  if(b.st==='down')for(let i=0;i<4;i++){const a=T*5+i*TAU/4;star5(b.x+Math.cos(a)*50,GY()-250+Math.sin(a)*14,9,'#ffd23f')}}
function drawWorld(){drawBackdrop(lv);const g=GY();
  for(const d of decals)splatOn(d.x,d.y,0.55);
  for(const p of people)if(p.k==='sun'&&!p.up)drawPerson(p);
  for(const u of umbs)drawUmbrella(u);
  if(boss)drawBoss(boss);
  for(const p of people)if(!(p.k==='sun'&&!p.up))drawPerson(p);
  for(const d of dogs)drawDog(d);
  for(const s of shots)drawShot(s);
  for(const p of poops)drawPoop(p);
  if(state==='play'||state==='card'||state==='oops'){
    // drop guide: where a poop would land right now (helps little aimers)
    if(state==='play'){const dy=g-60-gull.y,t=dy>0?(-80+Math.sqrt(6400+2200*dy))/1100:0,lx=gull.x-6+gull.vx*0.3*t;X.globalAlpha=0.35+0.1*Math.sin(T*6);ell(lx,g+6,16,5,'#fff');X.globalAlpha=1}
    ell(gull.x,g+8,22*(0.4+0.6*(gull.y/g)),5,'rgba(0,0,0,0.12)');drawGull(gull.x,gull.y,{flap:gull.flap,tilt:gull.tilt,inv:gull.inv>0,carry:gull.carry>0,munch:gull.munch})}
  drawParts()}
function drawParts(){for(const p of parts){const k=1-p.t/p.life;X.globalAlpha=Math.min(1,k*2);if(p.conf){X.save();X.translate(p.x,p.y);X.rotate(p.rot);X.fillStyle=p.c;X.fillRect(-p.r,-p.r/2,p.r*2,p.r);X.restore()}else circ(p.x,p.y,p.r*(0.4+0.6*k),p.c)}X.globalAlpha=1;
  for(const f of floats){X.globalAlpha=1-Math.max(0,f.t-0.7)/0.5;txt(f.s,f.x,f.y,18,f.c,{st:'rgba(0,0,0,0.55)',sw:4});X.globalAlpha=1}}
// ---------- HUD (always below the status bar / notch) ----------
function drawHUD(){HUDB=[];const t=TOP+8;rrect(8+INL,t,W-16-INL-INR,46,23);X.fillStyle='rgba(255,255,255,0.88)';X.fill();
  for(let i=0;i<MAXH;i++)heartP(30+INL+i*23,t+25,10,i<hearts?'#ff3b6b':'rgba(0,0,0,0.13)');
  const hx=30+INL+MAXH*23+4;fryCone(hx+4,t+28,0.7);txt(String(fries),hx+16,t+24,18,'#c62828',{a:'left'});
  txt(String(score),W-INR-112,t+24,22,'#0d47a1',{a:'right'});
  const mx=W-INR-54;circ(mx+18,t+23,19,'#4fc3f7');if(AUD.muted){X.beginPath();X.moveTo(mx+8,t+13);X.lineTo(mx+28,t+33);strokeC('#0d47a1',3)}poly([mx+9,t+18,mx+15,t+18,mx+22,t+11,mx+22,t+35,mx+15,t+28,mx+9,t+28],'#0d47a1');
  hbtn('mute',mx-4,t-4,44,54,()=>AUD.setMuted(!AUD.muted));
  const px=W-INR-100;circ(px+18,t+23,19,'#4fc3f7');X.fillStyle='#0d47a1';X.fillRect(px+11,t+14,5,18);X.fillRect(px+20,t+14,5,18);hbtn('pause',px-4,t-4,44,54,()=>{paused=true;AUD.SFX.click()});
  const by=t+54;
  if(boss){const w=W-40-INL-INR,x=20+INL;rrect(x,by+12,w,14,7);X.fillStyle='rgba(0,0,0,0.35)';X.fill();const k=boss.hp/boss.max;if(k>0){rrect(x,by+12,Math.max(14,w*k),14,7);X.fillStyle=k>0.5?'#ff5d8f':k>0.25?'#ff8a26':'#e53935';X.fill()}
    txt(boss.name,W/2,by+4,13,'#fff',{st:'rgba(0,0,0,0.55)',sw:4})}
  else{const x=30+INL,w=W-60-INL-INR,k=clamp(waveT/WAVELEN,0,1);txt('WAVE '+(lv+1)+'-'+(wave+1)+(loop?'  ☀'+(loop+1):''),x,by+4,12,'#fff',{st:'rgba(0,0,0,0.5)',sw:3,a:'left'});
    rrect(x,by+12,w,8,4);X.fillStyle='rgba(255,255,255,0.65)';X.fill();rrect(x,by+12,Math.max(8,w*k),8,4);X.fillStyle='#ffb300';X.fill();circ(x+w,by+16,8,wave===1?'#e53935':'#43a047')}
  if(combo>1&&comboT>0)txt('COMBO x'+Math.min(5,combo),W/2,by+40,20,'#ffd23f',{st:'#c62828',sw:5});
  if(state==='play'){const f=poopBtn(),dn=gull.cd>0.16;circ(f.x,f.y,f.r,dn?'rgba(255,255,255,0.95)':'rgba(255,255,255,0.75)');X.beginPath();X.arc(f.x,f.y,f.r,0,TAU);strokeC('#0d47a1',4);
    ell(f.x,f.y-8,13,15,'#fff');X.beginPath();X.ellipse(f.x,f.y-8,13,15,0,0,TAU);strokeC('#90a4ae',2);circ(f.x-4,f.y-12,3,'#e0e0e0');txt('POOP!',f.x,f.y+22,15,'#0d47a1')}}
// ---------- overlays ----------
function panel(w,h,y,c){const x=W/2-w/2;rrect(x,y,w,h,28);X.fillStyle=c||'rgba(255,253,240,0.96)';X.fill();X.lineWidth=6;X.strokeStyle='#29b6f6';X.stroke();return x}
function bigBtn(id,x,y,w,h,label,c,fn,size){rrect(x,y,w,h,h/2);X.fillStyle=c;X.fill();X.lineWidth=5;X.strokeStyle='#fff';X.stroke();txt(label,x+w/2,y+h/2+2,size||26,'#fff',{st:'rgba(0,0,0,0.25)',sw:5});btn(id,x,y,w,h,fn)}
function wrapTxt(s,x,y,size,fill,maxW,o){X.font='800 '+size+'px '+FONT;const words=s.split(' ');let line='',lines=[];for(const w of words){const t=line?line+' '+w:w;if(X.measureText(t).width>maxW&&line){lines.push(line);line=w}else line=t}lines.push(line);
  lines.forEach((l,i)=>txt(l,x,y+i*size*1.1,size,fill,o));return lines.length}
function drawCard(){const k=back(stT*2.2),y=Math.max(TOP+110,H*0.26);X.save();X.translate(W/2,y+120);X.scale(k,k);X.translate(-W/2,-(y+120));
  panel(Math.min(340,W-30),250,y);txt((loop?'SUMMER '+(loop+1)+' · ':'')+'LEVEL '+(lv+1),W/2,y+36,26,'#ff8a26',{st:'#fff',sw:6});wrapTxt(L.n,W/2,y+78,28,'#0d47a1',Math.min(310,W-50));
  txt(L.sub,W/2,y+140,16,'#5d4037');txt('Drag to fly · Tap to POOP',W/2,y+172,16,'#455a64');txt('Swoop low to grab FRIES!',W/2,y+196,16,'#e65100');txt('Tap to start!',W/2,y+230,18,'#43a047');X.restore()}
function drawBanner(){const b=banner;const k=back(b.t*3),out=b.t>2.2?ease((b.t-2.2)*3):0;X.save();X.globalAlpha=1-out;X.translate(W/2,H*0.36);X.scale(k,k);
  if(b.boss){rrect(-170,-52,340,104,26);X.fillStyle='rgba(255,255,255,0.94)';X.fill();X.lineWidth=6;X.strokeStyle='#e53935';X.stroke();txt('BOSS!',0,-22,22,'#e53935');txt(b.s,0,16,b.s.length>15?24:30,'#0d47a1')}
  else txt(b.s,0,0,38,'#ffd23f',{st:'#0d47a1',sw:7});X.restore()}
function drawOops(){X.fillStyle='rgba(20,40,80,0.35)';X.fillRect(0,0,W,H);const y=Math.max(TOP+120,H*0.3);panel(Math.min(330,W-30),220,y);txt('OOPSIE!',W/2,y+40,34,'#ff5d8f',{st:'#fff',sw:6});
  drawGull(W/2,y+100,{flap:T*10,tilt:Math.sin(T*6)*0.3});for(let i=0;i<3;i++){const a=T*4+i*TAU/3;star5(W/2+Math.cos(a)*44,y+72+Math.sin(a)*10,7,'#ffd23f')}
  wrapTxt(wave===2?'Back to the boss with full hearts! (It keeps its boo-boos.)':'Back to the start of this wave with full hearts!',W/2,y+156,16,'#0d47a1',Math.min(300,W-60));if(stT>1.2)txt('Tap to keep flying!',W/2,y+200,17,'#43a047')}
function drawClear(){X.fillStyle='rgba(20,40,80,0.3)';X.fillRect(0,0,W,H);const k=back(stT*2),y=Math.max(TOP+100,H*0.24);X.save();X.translate(W/2,y+140);X.scale(k,k);X.translate(-W/2,-(y+140));
  panel(Math.min(340,W-30),280,y);txt('BEACH CLEARED!',W/2,y+40,30,'#43a047',{st:'#fff',sw:6});wrapTxt(L.n,W/2,y+82,20,'#0d47a1',300);
  txt('Score '+score,W/2,y+126,24,'#0d47a1');fryCone(W/2-40,y+164,0.9);txt('× '+fries,W/2-22,y+160,20,'#c62828',{a:'left'});
  const nx=LEVELS[(lv+1)%5];txt('NEXT:',W/2,y+194,15,'#8d6e63');wrapTxt(nx.n,W/2,y+216,20,'#ff8a26',300);if(stT>1.2)txt('Tap to fly on!',W/2,y+256,17,'#43a047');X.restore();if(R()<0.1)confetti(3)}
function drawPause(){UI=[];X.fillStyle='rgba(20,40,80,0.5)';X.fillRect(0,0,W,H);const y=Math.max(TOP+100,H*0.28);panel(Math.min(320,W-30),230,y);txt('PAUSED',W/2,y+40,30,'#ff8a26',{st:'#fff',sw:6});
  bigBtn('resume',W/2-110,y+72,220,64,'RESUME ▶','#43a047',()=>{paused=false});bigBtn('home',W/2-110,y+150,220,52,'HOME','#4fc3f7',goTitle,20)}
// ---------- title ----------
function lockIcon(x,y){X.beginPath();X.arc(x,y-5,7,Math.PI,TAU);strokeC('#fff',3);rrect(x-9,y-5,18,15,3);X.fillStyle='#fff';X.fill();circ(x,y+2,2,'#9e9e9e')}
function drawTitle(){UI=[];lv=selLv;L=LEVELS[lv];drawBackdrop(selLv);X.fillStyle='rgba(255,255,255,0.12)';X.fillRect(0,0,W,H);
  const ly=TOP+70;X.save();X.translate(W/2,ly);X.rotate(-0.04+Math.sin(T*1.4)*0.015);txt('FRY THIEF',0,-22,Math.min(50,W*0.125),'#ffd23f',{st:'#0d47a1',sw:9});txt('SEAGULL',0,28,Math.min(58,W*0.145),'#fff',{st:'#0d47a1',sw:10});X.restore();
  txt('a silly beach game for ALEX',W/2,ly+72,16,'#fff',{st:'#0d47a1',sw:5});
  const gy=lerp(ly+160,H*0.4,0.5)+Math.sin(T*2.4)*8,s=Math.min(2.3,H/320);X.save();X.translate(W/2-10,gy);X.scale(s,s);drawGull(0,0,{flap:T*9,tilt:Math.sin(T*1.7)*0.08,carry:true});X.restore();
  for(let i=0;i<4;i++){const a=T*1.2+i*TAU/4;fryCone(W/2+Math.cos(a)*130,gy+Math.sin(a)*36+10,0.9)}
  const sy=H*0.6,gap=Math.min(70,(W-40)/5),x0=W/2-gap*2;txt('PICK A BEACH',W/2,sy-46,16,'#fff',{st:'#0d47a1',sw:5});
  for(let i=0;i<5;i++){const x=x0+i*gap,ok=i<unlockLv,sel=i===selLv,r=sel?29:25;circ(x,sy,r+4,sel?'#fff':'rgba(255,255,255,0.6)');circ(x,sy,r,ok?['#ff5d8f','#e53935','#ffb300','#7e57c2','#26a69a'][i]:'#9e9e9e');
    if(ok)txt(String(i+1),x,sy+2,26,'#fff',{st:'rgba(0,0,0,0.3)',sw:4});else lockIcon(x,sy);
    btn('lv'+(i+1),x-gap/2,sy-34,gap,68,()=>{if(ok){selLv=i;AUD.SFX.boing()}else AUD.SFX.zap()})}
  wrapTxt(LEVELS[selLv].n,W/2,sy+48,19,'#fff',W-30,{st:'#0d47a1',sw:5});
  const py=Math.min(H-BOT-150,sy+80),pulse=1+Math.sin(T*5)*0.04;X.save();X.translate(W/2,py+38);X.scale(pulse,pulse);X.translate(-W/2,-(py+38));bigBtn('play',W/2-110,py,220,76,'PLAY ▶','#43a047',()=>{newGame(selLv);AUD.SFX.squawk();setTimeout(()=>{},0)},38);X.restore();
  const bb=H-BOT-46,mx=W-INR-40;circ(mx,bb,24,'#4fc3f7');poly([mx-10,bb-5,mx-4,bb-5,mx+3,bb-12,mx+3,bb+12,mx-4,bb+5,mx-10,bb+5],'#0d47a1');if(AUD.muted){X.beginPath();X.moveTo(mx-14,bb-14);X.lineTo(mx+14,bb+14);strokeC('#c62828',4)}btn('mute',mx-28,bb-28,56,56,()=>AUD.setMuted(!AUD.muted));
  txt('BEST '+best,INL+20,bb,18,'#fff',{st:'#0d47a1',sw:4,a:'left'})}
// ---------- victory ----------
function drawWin(){UI=[];lv=4;L=LEVELS[4];drawBackdrop(4);X.fillStyle='rgba(255,240,200,0.2)';X.fillRect(0,0,W,H);const e=endStats||{score,fries,splats,loop};
  const y0=TOP+40;txt('FRY THIEF',W/2,y0+10,Math.min(44,W*0.11),'#ffd23f',{st:'#0d47a1',sw:8});txt('LEGEND!',W/2,y0+56,Math.min(50,W*0.12),'#fff',{st:'#e65100',sw:8});
  const gy=y0+150+Math.sin(T*3)*10;X.save();X.translate(W/2,gy);X.scale(1.6,1.6);drawGull(0,0,{flap:T*10,carry:true,munch:1});X.restore();X.save();X.translate(W/2,gy-44);poly([-22,0,-22,-26,-11,-14,0,-30,11,-14,22,-26,22,0],'#ffd23f');X.restore();
  const py=Math.min(gy+70,H*0.5),pw=Math.min(340,W-30);panel(pw,190,py,'rgba(255,253,240,0.95)');
  const rows=[['Summer',e.loop+1],['Fries stolen',e.fries],['Splats',e.splats],['Score',e.score],['Best',best]];rows.forEach((r,i)=>{txt(r[0],W/2-pw/2+30,py+30+i*32,18,'#0d47a1',{a:'left'});txt(String(r[1]),W/2+pw/2-30,py+30+i*32,20,'#e65100',{a:'right'})});
  const bb=Math.min(H-BOT-80,py+210);bigBtn('again',W/2-160,bb,190,60,'MORE SUMMER ▶','#43a047',()=>{loop++;startLevel(0)},19);bigBtn('home',W/2+40,bb,120,60,'HOME','#4fc3f7',goTitle,20)}
// ---------- render ----------
function render(){X.setTransform(RS,0,0,RS,0,0);
  if(state==='title'){drawTitle();drawParts();return}
  if(state==='win'){drawWin();drawParts();return}
  UI=[];X.save();if(shake>0)X.translate(rr(-shake,shake)*0.6,rr(-shake,shake)*0.6);drawWorld();X.restore();
  drawHUD();if(banner)drawBanner();
  if(state==='card')drawCard();else if(state==='oops')drawOops();else if(state==='clear')drawClear();
  if(paused)drawPause();
  if(PERF_OVL){const p=perfStats();txt(`${p.fps}fps work ${p.avg}ms p95 ${p.p95}ms q${QUAL}`,W/2,H-BOT-12,12,'#fff',{st:'#000',sw:3})}}
// ---------- loop + frame-time stats + adaptive quality ----------
const PERF_OVL=/[?&]perf=1/.test(Q),FIXQ=/[?&]q=fixed/.test(Q);const workA=[],rafA=[];let last=performance.now(),acc=0,qWin=[];
function perfStats(){const s=a=>a.slice().sort((x,y)=>x-y);const w=s(workA),r=s(rafA);const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;const pc=(a,p)=>a.length?a[Math.min(a.length-1,(a.length*p)|0)]:0;
  return{n:w.length,avg:+avg(w).toFixed(2),p95:+pc(w,0.95).toFixed(2),max:+pc(w,1).toFixed(2),raf:+avg(r).toFixed(2),fps:Math.round(1000/(avg(r)||16.7)),q:QUAL}}
function frame(now){const dt=Math.min(0.05,Math.max(0,(now-last)/1000));rafA.push(now-last);if(rafA.length>600)rafA.shift();last=now;acc+=dt*TS;const STEP=1/120;let n=0;const t0=performance.now();
  try{while(acc>=STEP&&n<120){if(DEBUG&&bot.on&&n%4===0)botThink();update(STEP);acc-=STEP;n++}if(n>=120)acc=0;render()}catch(e){console.error(e&&e.stack||e)}
  const wt=performance.now()-t0;if(TS===1){workA.push(wt);if(workA.length>600)workA.shift()}
  if(!FIXQ&&TS===1&&state==='play'&&!paused){qWin.push([wt,dt*1000]);if(qWin.length>=150){const a=qWin.reduce((x,y)=>x+y[0],0)/qWin.length,f=qWin.reduce((x,y)=>x+y[1],0)/qWin.length;qWin=[];
    if((a>10||f>21)&&qualI<QUALS.length-1){qualI++;QUAL=QUALS[qualI];resize()}}}
  requestAnimationFrame(frame)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){saveBest();if(state==='play')paused=true}});
// ---------- in-page bot (debug only): steers the same target a finger would and presses POOP ----------
const bot={on:false};
function botThink(){if(state==='card'&&stT>0.5){startPlay();return}if(state==='clear'&&stT>1.3){startLevel(lv+1);return}if(state==='oops'&&stT>1.3){respawn();return}if(state!=='play'||paused)return;
  const g=GY();let tx=W*0.35,ty=YMIN()+50;
  const fp=people.filter(p=>p.fries&&p.x>gull.x-10).sort((a,b)=>a.x-b.x)[0];
  if(boss){const r=BOSS[boss.k].rects(boss)[0];tx=r[0]+r[2]/2;ty=Math.max(YMIN()+20,Math.min(r[1]-90,YMAX()))}
  else if(fp&&fp.x<W*0.8){tx=clamp(fp.x-30,XMIN(),XMAX());ty=g-50}
  // dodge incoming hazards
  for(const s of shots){if(s.good)continue;const d=Math.hypot(s.x-gull.x,s.y-gull.y);if(d<110){ty+=s.y>gull.y?-90:90;tx-=40}}
  for(const d of dogs)if(Math.abs(d.x-gull.x)<110&&!d.splat)ty=Math.min(ty,g-230);
  gull.tx=clamp(tx,XMIN(),XMAX());gull.ty=clamp(ty,YMIN(),YMAX());
  // poop when the predicted landing spot meets a target
  const dy=g-60-gull.y,t=dy>0?(-80+Math.sqrt(6400+2200*dy))/1100:0,lx=gull.x-6+gull.vx*0.3*t;
  if(boss){poopQ=1;return}
  for(const p of people){if(p.splat)continue;const px=p.x+(-spd+p.vx)*t;if(Math.abs(px-lx)<14){poopQ=1;break}}}
AUD.setTheme('title');requestAnimationFrame(frame);
if(DEBUG)window.__F={get state(){return state},get lv(){return lv},get wave(){return wave},get loop(){return loop},get hearts(){return hearts},set hearts(v){hearts=v},get score(){return score},get fries(){return fries},get splats(){return splats},
  get boss(){return boss},get people(){return people},get shots(){return shots},get gull(){return gull},get paused(){return paused},get oopsN(){return oopsN},get best(){return best},get waveT(){return waveT},set waveT(v){waveT=v},
  audio:AUD,newGame,startLevel,startPlay,startWave,spawnBoss,levelClear,finish,respawn,goTitle,hurt,set TS(v){TS=v},get TS(){return TS},bot(on){bot.on=on},
  bossHp(v){if(boss)boss.hp=v},perf:perfStats,get qual(){return QUAL},
  get ui(){return UI.map(b=>({id:b.id,x:b.x+b.w/2,y:b.y+b.h/2}))},get hud(){return HUDB.map(b=>({id:b.id,x:b.x+b.w/2,y:b.y+b.h/2}))},toClient:(x,y)=>({x:x*SC,y:y*SC}),get poopBtn(){return poopBtn()}};
