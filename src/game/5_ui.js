// ================= rendering, HUD, controls, screens, loop, test hooks =================
let UI=[],HUDB=[];
function btn(id,x,y,w,h,fn){UI.push({id,x,y,w,h,fn})}
function hbtn(id,x,y,w,h,fn){HUDB.push({id,x,y,w,h,fn})}
function uiTap(p){for(const b of UI)if(inR(p,b)){AUD.SFX.click();b.fn();return}
  if(state==='card'&&stT>0.4)startPlay();else if(state==='stats'&&stT>1.2)nextFromStats();else if(state==='oops'&&stT>1.2)respawn();else if(state==='win'){AUD.SFX.fart(null,1);burst(p.x,p.y,30,['#ffd23f','#ff5d8f','#4fc3f7','#fff','#81c784'],260,6)}}
function uiKey(){if(state==='title')newGame(selLv);else if(state==='card')startPlay();else if(state==='stats'&&stT>1.2)nextFromStats();else if(state==='oops'&&stT>1.2)respawn()}
function goTitle(){saveBest();state='title';paused=false;clearWorld();resetInput();AUD.setTheme('title');selLv=Math.min(selLv,unlockLv-1)}
// ---------- world ----------
function drawBoss(b){const def=BOSS[b.k];X.save();
  if(b.st==='down'){const a=Math.min(1,b.t*1.5);X.translate(b.x,GY());X.rotate(a*0.5);X.translate(-b.x,-GY());X.globalAlpha=1-Math.max(0,b.t-2)*1.2}
  if(b.flash>0&&((T*30)|0)%2)X.globalAlpha*=0.6;def.draw(b);for(const s of b.spl)splatOn(b.x+s[0],GY()+s[1],0.9);X.restore();
  if(b.st==='down')for(let i=0;i<4;i++){const a=T*5+i*TAU/4;star5(b.x+Math.cos(a)*50,GY()-250+Math.sin(a)*14,9,'#ffd23f')}}
function drawWorld(){drawBackdrop(lv);const g=GY();
  for(const d of decals)splatOn(d.x,d.y,0.55);
  for(const c of cars)drawCar(c);
  for(const p of people)if(p.k==='sun'&&!p.up)drawPerson(p);
  for(const u of umbs)drawUmbrella(u);
  if(boss){drawBoss(boss);if(boss.sayT>0&&boss.say){const bx=clamp(boss.x-40,100,W-100),by=GY()-300;X.globalAlpha=Math.min(1,boss.sayT*3);X.font='900 15px '+FONT;const w=X.measureText(boss.say).width+18;X.fillStyle='#fff';rrect(bx-w/2,by-14,w,28,12);X.fill();X.lineWidth=2.5;X.strokeStyle='#c62828';X.stroke();txt(boss.say,bx,by+1,15,'#c62828');X.globalAlpha=1}}
  for(const p of people)if(!(p.k==='sun'&&!p.up))drawPerson(p);
  for(const d of dogs)drawDog(d);
  for(const t of debris)drawToupee(t);
  for(const s of shots)drawShot(s);
  for(const p of poops)p.mega?drawMega(p):drawPoop(p);
  if(state==='play'||state==='card'||state==='oops'){
    if(state==='play'){const dy=g-60-gull.y,t=dy>0?(-80+Math.sqrt(6400+2200*dy))/1100:0,lx=gull.x-6+gull.vx*0.3*t;X.globalAlpha=0.4+0.12*Math.sin(T*6);ell(lx,g+6,16,5,'#fff');X.beginPath();X.ellipse(lx,g+6,16,5,0,0,TAU);strokeL(2,'#0d47a1');X.globalAlpha=1}
    ell(gull.x,g+8,22*(0.4+0.6*(gull.y/g)),5,'rgba(0,0,0,0.12)');drawGull(gull.x,gull.y,{flap:gull.flap,tilt:gull.tilt,inv:gull.inv>0,carry:gull.carry>0,munch:gull.munch});
    if(chiliT>0)for(let i=0;i<2;i++)circ(gull.x-34+rr(-4,4),gull.y+6+rr(-4,4),rr(3,6),'rgba(110,70,30,0.45)');
    if(hangry)txt('HANGRY',gull.x,gull.y-34,13,'#ff5252',{st:'#fff',sw:3})}
  drawParts()}
function drawParts(){for(const p of parts){const k=1-p.t/p.life;X.globalAlpha=Math.min(1,k*2);if(p.conf){X.save();X.translate(p.x,p.y);X.rotate(p.rot);X.fillStyle=p.c;X.fillRect(-p.r,-p.r/2,p.r*2,p.r);X.restore()}else circ(p.x,p.y,p.r*(0.4+0.6*k),p.c)}X.globalAlpha=1;
  for(const f of floats){X.globalAlpha=1-Math.max(0,f.t-0.7)/0.5;txt(f.s,f.x,f.y,18,f.c,{st:'rgba(0,0,0,0.55)',sw:4});X.globalAlpha=1}}
// ---------- HUD (always below the status bar / notch) ----------
function drawHUD(){HUDB=[];const t=TOP+8;rrect(8+INL,t,W-16-INL-INR,46,23);X.fillStyle='rgba(255,255,255,0.88)';X.fill();
  for(let i=0;i<maxH();i++)heartP(30+INL+i*23,t+25,10,i<hearts?'#ff3b6b':'rgba(0,0,0,0.13)');
  const fx=30+INL+maxH()*23+2,fw=clamp(W-INR-125-fx-82,50,240);fryCone(fx+6,t+28,0.65);rrect(fx+18,t+13,fw,14,7);X.fillStyle='rgba(0,0,0,0.15)';X.fill();
  const fk=fryM/100;if(fk>0){rrect(fx+18,t+13,Math.max(14,fw*fk),14,7);X.fillStyle=fk>0.35?'#ffb300':(((T*6)|0)%2?'#ff5252':'#ffb300');X.fill()}
  txt(hangry?'HANGRY!':'FRY METER',fx+18+fw/2,t+21,10,hangry?'#c62828':'#5d4037');
  for(let i=0;i<megaNeed();i++)circ(fx+24+i*9,t+36,3,i<megaN?'#8d6e63':'rgba(0,0,0,0.15)');if(megaC)txt('MEGA x'+megaC,fx+26+megaNeed()*9,t+37,10,'#e65100',{a:'left'});
  txt(String(score),W-INR-106,t+24,20,'#0d47a1',{a:'right'});
  const mx=W-INR-54;circ(mx+18,t+23,19,'#4fc3f7');if(AUD.muted){X.beginPath();X.moveTo(mx+8,t+13);X.lineTo(mx+28,t+33);strokeC('#0d47a1',3)}poly([mx+9,t+18,mx+15,t+18,mx+22,t+11,mx+22,t+35,mx+15,t+28,mx+9,t+28],'#0d47a1');
  hbtn('mute',mx-4,t-4,44,54,()=>AUD.setMuted(!AUD.muted));
  const px=W-INR-100;circ(px+18,t+23,19,'#4fc3f7');X.fillStyle='#0d47a1';X.fillRect(px+11,t+14,5,18);X.fillRect(px+20,t+14,5,18);hbtn('pause',px-4,t-4,44,54,()=>{paused=true;resetInput();AUD.SFX.click()});
  const by=t+54;
  if(boss){const w=W-40-INL-INR,x=20+INL;rrect(x,by+12,w,14,7);X.fillStyle='rgba(0,0,0,0.35)';X.fill();const k=boss.hp/boss.max;if(k>0){rrect(x,by+12,Math.max(14,w*k),14,7);X.fillStyle=k>0.66?'#ff5d8f':k>0.33?'#ff8a26':'#e53935';X.fill()}
    X.fillStyle='rgba(255,255,255,0.8)';X.fillRect(x+w*0.33-1,by+12,2,14);X.fillRect(x+w*0.66-1,by+12,2,14);txt(boss.name+'  ·  PHASE '+boss.ph,W/2,by+4,13,'#fff',{st:'rgba(0,0,0,0.55)',sw:4})}
  else{const x=30+INL,w=W-60-INL-INR,k=clamp(waveT/WAVELEN,0,1);txt('WAVE '+(lv+1)+'-'+(wave+1)+(loop?'  SUMMER '+(loop+1):'')+(diff?'  HARD':''),x,by+4,12,'#fff',{st:'rgba(0,0,0,0.5)',sw:3,a:'left'});
    rrect(x,by+12,w,8,4);X.fillStyle='rgba(255,255,255,0.65)';X.fill();rrect(x,by+12,Math.max(8,w*k),8,4);X.fillStyle='#ffb300';X.fill()}
  if(combo>1&&comboT>0){txt('COMBO x'+Math.min(8,combo),W/2,by+40,20,'#ffd23f',{st:'#c62828',sw:5});rrect(W/2-40,by+52,Math.max(2,80*comboT/(diff?0.85:1.1)),4,2);X.fillStyle='#ffd23f';X.fill()}
  if(chiliT>0)txt('CHILI CHEESE MODE '+chiliT.toFixed(1),W/2,by+72,15,'#ff8f00',{st:'#4e342e',sw:4});
  if(state==='play'&&!paused)drawControls()}
function drawControls(){
  if(joy.id!=null){X.globalAlpha=0.5;circ(joy.ox,joy.oy,JR,'rgba(255,255,255,0.35)');X.beginPath();X.arc(joy.ox,joy.oy,JR,0,TAU);strokeC('#fff',3);X.globalAlpha=0.85;circ(joy.ox+joy.dx*JR,joy.oy+joy.dy*JR,26,'#fff');X.globalAlpha=1}
  else if(runTime<15&&!(DEBUG&&bot.on)){const x=INL+90,y=H-Math.max(BOT,8)-100;X.globalAlpha=0.3+0.1*Math.sin(T*4);circ(x,y,JR,'rgba(255,255,255,0.4)');circ(x,y,24,'#fff');X.globalAlpha=1;txt('FLY: touch & drag',x,y+JR+14,13,'#fff',{st:'#0d47a1',sw:3})}
  const f=poopBtn(),dn=poopHeld>0;circ(f.x,f.y,f.r,dn?'rgba(255,255,255,0.98)':'rgba(255,255,255,0.75)');X.beginPath();X.arc(f.x,f.y,f.r,0,TAU);strokeC(chiliT>0?'#ff8f00':'#0d47a1',dn?6:4);
  X.save();X.translate(f.x,f.y-6);X.scale(1.25,1.25);poopSwirl();X.restore();txt('POOP',f.x,f.y+22,15,'#0d47a1');
  const s=swoopBtn(),rd=gull.swCD<=0;circ(s.x,s.y,s.r,rd?'rgba(255,213,79,0.85)':'rgba(255,255,255,0.4)');X.beginPath();X.arc(s.x,s.y,s.r,0,TAU);strokeC('#e65100',3);poly([s.x-10,s.y-10,s.x+10,s.y-10,s.x,s.y+6],'#e65100');txt('SWOOP',s.x,s.y+18,10,'#e65100');
  if(megaReady()){const m=megaBtn(),pu=1+Math.sin(T*8)*0.06;circ(m.x,m.y,m.r*pu,'rgba(141,110,99,0.92)');X.beginPath();X.arc(m.x,m.y,m.r*pu,0,TAU);strokeC('#ffd23f',4);txt('MEGA',m.x,m.y-5,13,'#fff');txt('DUMP',m.x,m.y+10,11,'#ffd23f')}}
// ---------- overlays ----------
function panel(w,h,y,c){const x=W/2-w/2;rrect(x,y,w,h,28);X.fillStyle=c||'rgba(255,253,240,0.96)';X.fill();X.lineWidth=6;X.strokeStyle='#29b6f6';X.stroke();return x}
function bigBtn(id,x,y,w,h,label,c,fn,size){rrect(x,y,w,h,h/2);X.fillStyle=c;X.fill();X.lineWidth=5;X.strokeStyle='#fff';X.stroke();txt(label,x+w/2,y+h/2+2,size||26,'#fff',{st:'rgba(0,0,0,0.25)',sw:5});btn(id,x,y,w,h,fn)}
function wrapTxt(s,x,y,size,fill,maxW,o){X.font='800 '+size+'px '+FONT;const words=s.split(' ');let line='',lines=[];for(const w of words){const t=line?line+' '+w:w;if(X.measureText(t).width>maxW&&line){lines.push(line);line=w}else line=t}lines.push(line);
  lines.forEach((l,i)=>txt(l,x,y+i*size*1.1,size,fill,o));return lines.length}
function drawCard(){const k=back(stT*2.2),y=Math.max(TOP+90,H*0.2);X.save();X.translate(W/2,y+130);X.scale(k,k);X.translate(-W/2,-(y+130));
  panel(Math.min(360,W-30),266,y);txt((loop?'SUMMER '+(loop+1)+' · ':'')+'LEVEL '+(lv+1)+(diff?' · HARD':''),W/2,y+34,22,'#ff8a26',{st:'#fff',sw:6});wrapTxt(L.n,W/2,y+72,28,'#0d47a1',Math.min(320,W-50));
  txt(L.sub,W/2,y+124,15,'#5d4037');
  [['LEFT THUMB','fly anywhere'],['RIGHT SIDE','POOP (hold = rapid fire)'],['SWOOP','dive and yoink fries'],['EAT FRIES','or get HANGRY']].forEach((r,i)=>{txt(r[0],W/2-8,y+152+i*22,13,'#e65100',{a:'right'});txt(r[1],W/2+4,y+152+i*22,13,'#37474f',{a:'left'})});
  txt('Tap to start',W/2,y+244,17,'#43a047');X.restore()}
function drawBanner(){const b=banner;const k=back(b.t*3),out=b.t>2.2?ease((b.t-2.2)*3):0;X.save();X.globalAlpha=1-out;X.translate(W/2,H*0.36);X.scale(k,k);
  if(b.boss){rrect(-170,-52,340,104,26);X.fillStyle='rgba(255,255,255,0.94)';X.fill();X.lineWidth=6;X.strokeStyle='#e53935';X.stroke();txt('BOSS!',0,-22,22,'#e53935');txt(b.s,0,16,b.s.length>15?24:30,'#0d47a1')}
  else txt(b.s,0,0,38,'#ffd23f',{st:'#0d47a1',sw:7});X.restore()}
function drawOops(){X.fillStyle='rgba(20,40,80,0.4)';X.fillRect(0,0,W,H);const y=Math.max(TOP+120,H*0.28);panel(Math.min(330,W-30),220,y);txt('WIPEOUT!',W/2,y+40,34,'#ff5d8f',{st:'#fff',sw:6});
  drawGull(W/2,y+100,{flap:T*10,tilt:Math.sin(T*6)*0.3});for(let i=0;i<3;i++){const a=T*4+i*TAU/3;star5(W/2+Math.cos(a)*44,y+72+Math.sin(a)*10,7,'#ffd23f')}
  wrapTxt(wave===2?'Continue from the boss checkpoint. Its damage stays.':'Continue from the start of this wave.',W/2,y+150,15,'#0d47a1',Math.min(300,W-60));txt('Continues used: '+oopsN,W/2,y+178,14,'#8d6e63');if(stT>1.2)txt('Tap to continue',W/2,y+202,17,'#43a047')}
function drawStats(){X.fillStyle='rgba(20,40,80,0.35)';X.fillRect(0,0,W,H);const c=card,k=back(stT*2),ph=104+c.rows.length*26+(c.bonus?30:0),y=Math.max(TOP+70,(H-ph)/2-30);X.save();X.translate(W/2,y+ph/2);X.scale(k,k);X.translate(-W/2,-(y+ph/2));
  const pw=Math.min(340,W-30);panel(pw,ph,y);txt(c.boss?'BOSS SPLATTERED!':'WAVE '+(lv+1)+'-'+(wave+1)+' DONE',W/2,y+32,24,'#43a047',{st:'#fff',sw:6});
  c.rows.forEach((r,i)=>{if(stT<0.25+i*0.12)return;txt(r[0],W/2-pw/2+26,y+70+i*26,16,'#0d47a1',{a:'left'});txt(String(r[1]),W/2+pw/2-26,y+70+i*26,18,'#e65100',{a:'right'})});
  let yy=y+70+c.rows.length*26;if(c.bonus){if(stT>1.1)txt('NO-HIT x'+c.mult+'  +'+c.bonus,W/2,yy+4,18,'#ff5d8f',{st:'#fff',sw:4});yy+=30}
  txt('Score '+score,W/2,yy+8,18,'#0d47a1');if(stT>1.2)txt('Tap to continue',W/2,yy+32,15,'#43a047');X.restore();if(R()<0.06)confetti(2)}
function drawPause(){UI=[];X.fillStyle='rgba(20,40,80,0.5)';X.fillRect(0,0,W,H);const y=Math.max(TOP+100,H*0.28);panel(Math.min(320,W-30),230,y);txt('PAUSED',W/2,y+40,30,'#ff8a26',{st:'#fff',sw:6});
  bigBtn('resume',W/2-110,y+72,220,64,'RESUME ▶','#43a047',()=>{paused=false});bigBtn('home',W/2-110,y+150,220,52,'QUIT TO TITLE','#4fc3f7',goTitle,18)}
// ---------- title ----------
function lockIcon(x,y){X.beginPath();X.arc(x,y-5,7,Math.PI,TAU);strokeC('#fff',3);rrect(x-9,y-5,18,15,3);X.fillStyle='#fff';X.fill();circ(x,y+2,2,'#9e9e9e')}
function drawTitle(){UI=[];lv=selLv;L=LEVELS[lv];drawBackdrop(selLv);X.fillStyle='rgba(255,255,255,0.12)';X.fillRect(0,0,W,H);
  const ly=TOP+70;X.save();X.translate(W/2,ly);X.rotate(-0.04+Math.sin(T*1.4)*0.015);txt('FRY THIEF',0,-22,Math.min(50,W*0.125),'#ffd23f',{st:'#0d47a1',sw:9});txt('SEAGULL',0,28,Math.min(58,W*0.145),'#fff',{st:'#0d47a1',sw:10});X.restore();
  txt('Steal fries. Bomb butts. No regrets.',W/2,ly+72,16,'#fff',{st:'#0d47a1',sw:5});
  const gy=lerp(ly+160,H*0.4,0.5)+Math.sin(T*2.4)*8,s=Math.min(2.3,H/320);X.save();X.translate(W/2-10,gy);X.scale(s,s);drawGull(0,0,{flap:T*9,tilt:Math.sin(T*1.7)*0.08,carry:true});X.restore();
  for(let i=0;i<4;i++){const a=T*1.2+i*TAU/4;fryCone(W/2+Math.cos(a)*130,gy+Math.sin(a)*36+10,0.9)}
  const sy=H*0.6,gap=Math.min(70,(W-40)/5),x0=W/2-gap*2;txt('PICK A BEACH',W/2,sy-46,16,'#fff',{st:'#0d47a1',sw:5});
  for(let i=0;i<5;i++){const x=x0+i*gap,ok=i<unlockLv,sel=i===selLv,r=sel?29:25;circ(x,sy,r+4,sel?'#fff':'rgba(255,255,255,0.6)');circ(x,sy,r,ok?['#ff5d8f','#e53935','#ffb300','#7e57c2','#26a69a'][i]:'#9e9e9e');
    if(ok)txt(String(i+1),x,sy+2,26,'#fff',{st:'rgba(0,0,0,0.3)',sw:4});else lockIcon(x,sy);
    btn('lv'+(i+1),x-gap/2,sy-34,gap,68,()=>{if(ok){selLv=i;AUD.SFX.boing()}else AUD.SFX.zap()})}
  wrapTxt(LEVELS[selLv].n,W/2,sy+48,19,'#fff',W-30,{st:'#0d47a1',sw:5});
  const py=Math.min(H-BOT-150,sy+80),pulse=1+Math.sin(T*5)*0.04;X.save();X.translate(W/2,py+38);X.scale(pulse,pulse);X.translate(-W/2,-(py+38));bigBtn('play',W/2-110,py,220,76,'PLAY ▶','#43a047',()=>{newGame(selLv);AUD.SFX.squawk()},38);X.restore();
  const bb=H-BOT-46,mx=W-INR-40;circ(mx,bb,24,'#4fc3f7');poly([mx-10,bb-5,mx-4,bb-5,mx+3,bb-12,mx+3,bb+12,mx-4,bb+5,mx-10,bb+5],'#0d47a1');if(AUD.muted){X.beginPath();X.moveTo(mx-14,bb-14);X.lineTo(mx+14,bb+14);strokeC('#c62828',4)}btn('mute',mx-28,bb-28,56,56,()=>AUD.setMuted(!AUD.muted));
  bigBtn('diff',INL+14,bb-24,150,48,diff?'HARD':'NORMAL',diff?'#e53935':'#ff8a26',()=>{diff=1-diff;LS.set('diff',diff);best=+LS.get('best'+diff,0)||0;AUD.SFX[diff?'fart':'boing']()},20);txt('BEST '+best,W/2+30,bb,17,'#fff',{st:'#0d47a1',sw:4})}
// ---------- victory ----------
function drawWin(){UI=[];lv=4;L=LEVELS[4];drawBackdrop(4);X.fillStyle='rgba(255,240,200,0.2)';X.fillRect(0,0,W,H);const e=endStats||{score,loop,...RUN,cont:oopsN};
  const y0=TOP+40;txt('FRY THIEF',W/2,y0+10,Math.min(44,W*0.11),'#ffd23f',{st:'#0d47a1',sw:8});txt('LEGEND!',W/2,y0+56,Math.min(50,W*0.12),'#fff',{st:'#e65100',sw:8});
  const gy=y0+140+Math.sin(T*3)*10;X.save();X.translate(W/2,gy);X.scale(1.5,1.5);drawGull(0,0,{flap:T*10,carry:true,munch:1});X.restore();X.save();X.translate(W/2+30,gy-44);poly([-22,0,-22,-26,-11,-14,0,-30,11,-14,22,-26,22,0],'#ffd23f');X.restore();
  const rows=[['Summer'+(diff?' (HARD)':''),e.loop+1],['Butts Bombed',e.splats],['Fries Yoinked',e.fries],['Dads Ruined',e.dads],['Toupees Launched',e.toupees],['Mega Dumps',e.megas],['Continues',e.cont],['Score',e.score],['Best',best]];
  const py=Math.min(gy+60,H*0.42),pw=Math.min(340,W-30),ph=rows.length*26+20;panel(pw,ph,py,'rgba(255,253,240,0.95)');
  rows.forEach((r,i)=>{txt(r[0],W/2-pw/2+26,py+24+i*26,16,'#0d47a1',{a:'left'});txt(String(r[1]),W/2+pw/2-26,py+24+i*26,18,'#e65100',{a:'right'})});
  const bb=Math.min(H-BOT-70,py+ph+16);bigBtn('again',W/2-160,bb,190,56,'MORE SUMMER ▶','#43a047',()=>{loop++;startLevel(0)},19);bigBtn('home',W/2+40,bb,120,56,'TITLE','#4fc3f7',goTitle,20)}
// ---------- render ----------
function render(){X.setTransform(RS,0,0,RS,0,0);
  if(state==='title'){drawTitle();drawParts();return}
  if(state==='win'){drawWin();drawParts();return}
  UI=[];X.save();if(shake>0)X.translate(rr(-shake,shake)*0.6,rr(-shake,shake)*0.6);drawWorld();X.restore();
  drawHUD();if(banner)drawBanner();
  if(state==='card')drawCard();else if(state==='oops')drawOops();else if(state==='stats')drawStats();
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
// ---------- in-page bot (debug only): outputs a stick vector + POOP like a player would ----------
const bot={on:false,vx:0,vy:0,poop:0};
function botThink(){if(state==='card'&&stT>0.5){startPlay();return}if(state==='stats'&&stT>1.3){nextFromStats();return}if(state==='oops'&&stT>1.3){respawn();return}if(state!=='play'||paused)return;
  const g=GY();let tx=W*0.35,ty=YMIN()+60;
  const fp=people.filter(p=>p.fries&&p.x>gull.x-10).sort((a,b)=>a.x-b.x)[0];
  if(boss){const r=BOSS[boss.k].rects(boss)[0];tx=r[0]+r[2]/2;ty=Math.max(YMIN()+20,Math.min(r[1]-90,YMAX()))}
  else if(fp&&fp.x<W*0.8){tx=clamp(fp.x-30,XMIN(),XMAX());ty=g-50}
  for(const s of shots){if(s.good)continue;const d=Math.hypot(s.x-gull.x,s.y-gull.y);if(d<120){ty+=s.y>gull.y?-110:110;tx-=50}}
  for(const d of dogs)if(Math.abs(d.x-gull.x)<120&&!d.splat)ty=Math.min(ty,g-240);
  tx=clamp(tx,XMIN(),XMAX());ty=clamp(ty,YMIN(),YMAX());let vx=(tx-gull.x)/60,vy=(ty-gull.y)/60;const m=Math.hypot(vx,vy);if(m>1){vx/=m;vy/=m}bot.vx=vx;bot.vy=vy;
  if(megaC>0&&(boss||people.filter(p=>!p.splat&&Math.abs(p.x-gull.x)<120).length>=2))megaQ=1;
  const dy=g-60-gull.y,t=dy>0?(-80+Math.sqrt(6400+2200*dy))/1100:0,lx=gull.x-6+gull.vx*0.3*t;bot.poop=0;
  if(boss){bot.poop=1;return}for(const p of people){if(p.splat)continue;const px=p.x+(-spd+p.vx)*t;if(Math.abs(px-lx)<14){bot.poop=1;break}}}
AUD.setTheme('title');requestAnimationFrame(frame);
if(DEBUG)window.__F={get state(){return state},get lv(){return lv},get wave(){return wave},get loop(){return loop},get hearts(){return hearts},set hearts(v){hearts=v},get score(){return score},get run(){return RUN},
  get boss(){return boss},get people(){return people},get shots(){return shots},get gull(){return gull},get joy(){return joy},get poopHeld(){return poopHeld},get poopN(){return poopN},get paused(){return paused},get oopsN(){return oopsN},get best(){return best},
  get fryM(){return fryM},set fryM(v){fryM=v},get megaC(){return megaC},set megaC(v){megaC=v},get chiliT(){return chiliT},set chiliT(v){chiliT=v},get waveT(){return waveT},set waveT(v){waveT=v},get diff(){return diff},
  audio:AUD,newGame,startLevel,startPlay,startWave,spawnBoss,waveEnd,nextFromStats,finish,respawn,goTitle,hurt,set TS(v){TS=v},get TS(){return TS},bot(on){bot.on=on},
  bossHp(v){if(boss)boss.hp=v},perf:perfStats,get qual(){return QUAL},spawnP(k){people.push(mkPerson(k,W*0.5))},
  get ui(){return UI.map(b=>({id:b.id,x:b.x+b.w/2,y:b.y+b.h/2}))},get hud(){return HUDB.map(b=>({id:b.id,x:b.x+b.w/2,y:b.y+b.h/2}))},toClient:(x,y)=>({x:x*SC,y:y*SC}),get poopBtn(){return poopBtn()},get W(){return W},get H(){return H}};
