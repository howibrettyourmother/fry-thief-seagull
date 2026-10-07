// ================= game state, waves, poop physics, fry stealing, hazards, bosses =================
let state='title',T=0,stT=0,TS=1,paused=false,scroll=0,spd=100;
let lv=0,L=LEVELS[0],loop=0,wave=0,waveT=0,spawnT=1,dogT=8,heartT=20;
let gull={x:110,y:300,tx:110,ty:300,vx:0,vy:0,flap:0,tilt:0,inv:0,carry:0,munch:0,cd:0},people=[],umbs=[],dogs=[],poops=[],shots=[],decals=[],parts=[],floats=[],boss=null,banner=null;
const MAXH=5,WAVELEN=30;
let hearts=MAXH,score=0,fries=0,splats=0,combo=0,comboT=0,shake=0,oopsN=0,runTime=0,poopN=0,endStats=null,unlockLv=Math.max(1,+LS.get('unlock',1)||1),selLv=0,bestT=0;
const say=(k,p)=>AUD.say(k,p);
const D=()=>lv+loop*5+(wave>0?0.5:0);           // difficulty
const waveNo=()=>loop*15+lv*3+wave+1;
// ---------- flow ----------
function clearWorld(){people=[];umbs=[];dogs=[];poops=[];shots=[];decals=[];floats=[];boss=null;banner=null;combo=0}
function newGame(i){score=0;fries=0;splats=0;loop=0;oopsN=0;runTime=0;poopN=0;startLevel(i||0)}
function startLevel(i){if(i>=LEVELS.length){i=0;loop++;}lv=i;L=LEVELS[i];wave=0;clearWorld();hearts=MAXH;state='card';stT=0;
  AUD.setTheme(['beach','surf','breeze','city','falls'][i]);setTimeout(()=>{if(state==='card')say(loop&&i===0?'again':i===0?'w1':'l'+(i+1),3)},350)}
function startPlay(){state='play';stT=0;gull.x=gull.tx=110;gull.y=gull.ty=(YMIN()+YMAX())/2;gull.inv=1;startWave(0)}
function startWave(w){wave=w;waveT=0;spawnT=0.6;dogT=lv+loop>0||w>0?rr(6,10):99;people=people.filter(p=>p.x<W+40);
  if(w===2){spawnBoss();return}banner={s:'WAVE '+(lv+1)+'-'+(w+1),t:0};if(w===1){say('w2',2);AUD.SFX.check()}}
function spawnBoss(){const k=['larry','chef','king','bot','truck'][lv],def=BOSS[k];AUD.setTheme(lv===4?'king':'boss');AUD.SFX.warn();
  const hp=Math.round((24+lv*5)*(1+loop*0.3));boss={k,name:def.name,x:W+160,hp,max:hp,st:'enter',t:0,at:1.5,flash:0,spl:[],n:0};def.init&&def.init(boss);
  banner={s:def.name,t:0,boss:1};setTimeout(()=>say('b'+(lv+1),3),300)}
function levelClear(){state='clear';stT=0;unlockLv=Math.max(unlockLv,Math.min(5,lv+2));LS.set('unlock',unlockLv);saveBest();AUD.SFX.fanfare();
  if(lv===LEVELS.length-1){finish();return}}
function finish(){state='win';stT=0;endStats={score,fries,splats,loop};boss=null;shots=[];AUD.setTheme('win');AUD.SFX.cheer();setTimeout(()=>say('legend',3),500);confetti(120)}
function saveBest(){if(score>best){best=score;LS.set('best',best)}if(waveNo()>bestWave){bestWave=waveNo();LS.set('bestwave',bestWave)}}
function oops(){state='oops';stT=0;oopsN++;saveBest();AUD.SFX.hurt();say('oops',3)}
function respawn(){// no harsh game over: full hearts, back to the start of this wave (bosses keep their damage)
  hearts=MAXH;state='play';stT=0;shots=[];poops=[];dogs=[];gull.inv=2;gull.tx=110;gull.ty=(YMIN()+YMAX())/2;
  if(wave===2&&boss){boss.st='fight';boss.at=2}else{people=[];umbs=[];startWave(wave)}}
// ---------- fx ----------
function burst(x,y,n,cols,sp,r){for(let i=0;i<n&&parts.length<170;i++){const a=R()*TAU,v=rr(0.3,1)*(sp||160);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:rr(0.4,0.8),r:rr(2,r||5),c:pick(cols)})}}
function float(s,x,y,c){if(floats.length<14)floats.push({s,x,y,t:0,c:c||'#fff'})}
function confetti(n){for(let i=0;i<n&&parts.length<170;i++)parts.push({x:rr(0,W),y:TOP-10,vx:rr(-40,40),vy:rr(60,180),t:0,life:rr(1.6,3),r:rr(3,6),c:pick(['#ffd23f','#ff5d8f','#4fc3f7','#81c784','#ff8a26','#b388ff']),conf:1,rot:rr(0,6)})}
// ---------- spawning ----------
function mkPerson(k,x){const p={k,x:x||W+50,dir:-1,walk:0,skin:pick(SKINS),shirt:pick(SHIRTS),shorts:pick(SHIRTS),hair:pick(HAIRS),hat:R()<0.3?pick(['#fff','#ffd23f','#ff7043']):null,towel:pick(SHIRTS),
  mood:'happy',splat:0,run:0,fries:k==='fry'?1:0,cd:rr(0.8,1.8),say:'',sayT:0,arm:0,vx:0,up:0};
  if(k==='walk'){p.walk=1;p.dir=R()<0.5?-1:1;p.vx=p.dir*rr(18,36)}if(k==='fry'){p.arm=-0.5;if(R()<0.5){p.walk=1;p.dir=-1;p.vx=-rr(10,25)}}return p}
function spawn(){const d=D(),pool=['sun','walk','fry','fry','walk'];if(d>=0.5)pool.push('kid');if(d>=1.5)pool.push('kid');if(d>=2)pool.push('guard');if(d>=3)pool.push('guard','kid');
  const k=pick(pool),p=mkPerson(k);people.push(p);
  if(k==='sun'&&R()<Math.min(0.6,0.2+d*0.08))umbs.push({x:p.x+rr(-6,6),h:rr(70,84),r:rr(36,44),c:pick(['#ff5d8f','#ffd23f','#4fc3f7','#7cb342','#ff7043']),splats:[]});
  else if(d>=1&&R()<Math.min(0.35,d*0.06))umbs.push({x:p.x+rr(50,80),h:rr(80,92),r:rr(34,40),c:pick(['#ff5d8f','#ffd23f','#4fc3f7']),splats:[]})}
// ---------- hurt / score ----------
function hurt(){if(gull.inv>0||state!=='play')return;hearts--;gull.inv=1.6;shake=8;AUD.SFX.hurt();burst(gull.x,gull.y,14,['#fff','#cfd8dc','#4fc3f7'],200,4);
  if(hearts<=0){oops();return}if(R()<0.4)say('ouch',1)}
function addScore(n,x,y,c){score+=n;float('+'+n,x,y,c||'#fff')}
const REACT=[['HEY!','hey'],['EWW! BIRD!','gross'],['HEY!!','hey'],['MY HAT!',null],['GROSS!',null],['NOT COOL!',null]];
function splatPerson(p,po){p.splat=1;p.mood='mad';splats++;combo++;comboT=1.8;const m=Math.min(5,combo);addScore(50*m,p.x,GY()-110,m>1?'#ffd23f':'#fff');if(m>1)float('x'+m+' COMBO',p.x,GY()-140,'#ff5d8f');
  if(combo===3)say('combo',2);AUD.SFX.splat();burst(po.x,po.y,10,['#fff','#eeeeee'],150,4);const r=pick(REACT);p.say=p.fries&&R()<0.5?'NOOO!':r[0];p.sayT=1.6;if(r[1]&&R()<0.6)say(r[1],1);
  if(p.k==='sun'){p.up=1;setTimeout(()=>{p.run=1;p.dir=-1},1200)}else if(p.k==='fry'){if(p.fries){p.fries=0;// fries go flying: catch them!
      for(let i=0;i<4;i++)shots.push({k:'fry',x:p.x+10,y:GY()-60,vx:rr(-60,90),vy:rr(-380,-240),g:420,r:10,good:1,life:4})}p.arm=-2.4}
  else{p.run=1;p.dir=-1}}
function stealFries(p){p.fries=0;p.mood='mad';p.arm=-2.4;p.say=pick(['MY FRIES!','HEY!','NOOO!']);p.sayT=1.6;fries++;gull.carry=1.2;gull.munch=0.9;addScore(100,p.x,GY()-120,'#ffd23f');AUD.SFX.munch();
  burst(gull.x+40,gull.y,12,['#ffd54f','#ffca28','#fff59d'],160,4);say(pick(['myfries','noo','fries','yum','fries']),2);setTimeout(()=>{p.run=1;p.dir=-1},900)}
// ---------- bosses (cartoony, ground-based; take poop hits) ----------
function lob(x,y,tx,ty,t,g){return{vx:(tx-x)/t,vy:(ty-y-0.5*g*t*t)/t}}
function aim(x,y,sp,spread){const a=Math.atan2(gull.y-y,gull.x-x)+(spread||0);return{vx:Math.cos(a)*sp,vy:Math.sin(a)*sp}}
function shoot(k,x,y,v,o){shots.push(Object.assign({k,x,y,vx:v.vx,vy:v.vy,g:0,r:9,life:6},o||{}))}
const BOSS={
 larry:{name:'Lifeguard Larry',rects:b=>[[b.x-38,GY()-250,76,120]],
   upd(b,dt){if((b.at-=dt)<=0){b.n++;const hx=b.x-20,hy=GY()-205;
     if(b.n%3===0){b.blow=0.6;AUD.SFX.whistle();for(let i=-1;i<=1;i++)shoot('ring',hx,hy,aim(hx,hy,170,i*0.28),{r:14})}
     else{AUD.SFX.puff();for(let i=0;i<4+Math.min(3,loop);i++)shoot('water',b.x-46,GY()-170,aim(b.x-46,GY()-170,240+i*25,rr(-0.12,0.12)),{r:8})}
     b.at=Math.max(1.1,2-lv*0.1-loop*0.15)}b.blow=Math.max(0,(b.blow||0)-dt)},
   draw(b){const g=GY(),x=b.x;X.strokeStyle='#fff';X.lineWidth=8;X.beginPath();X.moveTo(x-40,g);X.lineTo(x-26,g-130);X.moveTo(x+40,g);X.lineTo(x+26,g-130);X.moveTo(x-34,g-60);X.lineTo(x+34,g-60);X.stroke();
     X.fillStyle='#fff';X.fillRect(x-44,g-136,88,12);txt('LIFEGUARD',x,g-90,11,'#e53935');
     X.fillStyle='#e53935';rrect(x-30,g-170,60,40,10);X.fill();X.fillStyle='#e0ac69';rrect(x-32,g-232,64,66,22);X.fill();circ(x,g-258,28,'#e0ac69');X.fillStyle='#ffca28';X.beginPath();X.arc(x,g-262,29,Math.PI*1.05,TAU*0.98);X.fill();
     X.fillStyle='#222';rrect(x-26,g-266,26,10,4);X.fill();rrect(x-2,g-266,22,10,4);X.fill();
     X.beginPath();X.moveTo(x-50,g-200);X.lineTo(x-20,g-210);strokeL(10,'#e0ac69');X.fillStyle='#ff7043';rrect(x-86,g-182,46,18,6);X.fill();X.fillStyle='#ffd23f';X.fillRect(x-92,g-180,8,14);
     const bs=b.blow>0?1.4:1;X.save();X.translate(x-28,g-246);X.scale(bs,bs);X.fillStyle='#bdbdbd';rrect(-24,-7,26,14,5);X.fill();circ(-24,0,9,'#9e9e9e');X.restore();if(b.blow>0)txt('TWEET!',x-70,g-290,20,'#fff',{st:'#e53935',sw:5});
     X.beginPath();X.arc(x-6,g-244,7,0.2,Math.PI-0.2);strokeL(2.5,'#5d2a1a')}},
 chef:{name:'Chef Frank',rects:b=>[[b.x-50,GY()-230,100,110]],
   upd(b,dt){if((b.at-=dt)<=0){b.n++;const sx=b.x-30,sy=GY()-170;b.toss=0.4;
     if(b.n%4===0){for(let i=0;i<5;i++){const v=lob(sx,sy,rr(W*0.15,W*0.6),rr(YMIN()+40,YMAX()-40),1.1,420);shoot('fry',sx,sy,v,{g:420,good:1,r:10})}float('FREE FRIES?!',sx,sy-60,'#ffd23f')}
     else{AUD.SFX.pop();for(let i=0;i<2+Math.min(3,lv>>1+loop);i++){const v=lob(sx,sy,gull.x+rr(-60,60),gull.y+rr(-40,40),rr(0.8,1.1),500);shoot('ketchup',sx,sy,v,{g:500,r:10})}}
     b.at=Math.max(1,1.8-loop*0.15)}b.toss=Math.max(0,(b.toss||0)-dt)},
   draw(b){const g=GY(),x=b.x;X.fillStyle='#8d6e63';X.fillRect(x-80,g-130,160,130);X.fillStyle='#5d4037';X.fillRect(x-60,g-110,120,60);
     X.fillStyle='#fff';X.fillRect(x-90,g-140,180,16);for(let i=0;i<9;i++){X.fillStyle=i%2?'#fff':'#e53935';X.fillRect(x-90+i*20,g-140,20,16)}
     rrect(x-70,g-176,140,34,8);X.fillStyle='#ffd23f';X.fill();txt('FRY SHACK',x,g-158,18,'#c62828');fryCone(x+50,g-46,1.4);
     circ(x,g-210,26,'#f6d0b1');X.fillStyle='#fff';rrect(x-22,g-262,44,36,12);X.fill();ell(x,g-232,26,6,'#fff');face(x+2,g-208,24,'mad');
     X.beginPath();X.moveTo(x-12,g-196);X.quadraticCurveTo(x,g-202,x+12,g-196);strokeL(4,'#3e2723');X.fillStyle='#fff';rrect(x-30,g-186,60,50,12);X.fill();
     const a=b.toss>0?-1.6:-0.4;X.save();X.translate(x-24,g-176);X.rotate(a);X.beginPath();X.moveTo(0,0);X.lineTo(-26,0);strokeL(9,'#f6d0b1');X.fillStyle='#d32f2f';rrect(-40,-9,16,24,4);X.fill();X.restore()}},
 king:{name:'Sandcastle King',rects:b=>[[b.x-34,GY()-232-b.pop,68,70],[b.x-90,GY()-150,180,150]],
   init(b){b.pop=0},
   upd(b,dt){b.pop=24+Math.sin(T*1.6)*22;if((b.at-=dt)<=0){b.n++;const sx=b.x,sy=GY()-200-b.pop;AUD.SFX.boing();
     const n=b.n%3===0?5:3;for(let i=0;i<n;i++){const v=lob(sx,sy,gull.x+(i-(n-1)/2)*55,gull.y,1.0+i*0.05,520);shoot('bucket',sx,sy,v,{g:520,r:11,c:pick(['#ff7043','#29b6f6','#ffd23f'])})}
     b.at=Math.max(1.1,1.9-loop*0.15)}},
   draw(b){const g=GY(),x=b.x,S='#e8c987',S2='#d6b06a';X.fillStyle=S;X.fillRect(x-90,g-110,180,110);for(let i=0;i<9;i++)X.fillRect(x-90+i*20,g-124,12,16);
     for(const tx of [-70,70]){X.fillStyle=S2;X.fillRect(x+tx-18,g-170,36,170);for(let i=0;i<3;i++)X.fillRect(x+tx-18+i*13,g-182,9,14);poly([x+tx,g-210,x+tx+4,g-196,x+tx+18,g-200],'#e53935');X.fillStyle='#795548';X.fillRect(x+tx-1,g-212,2,30)}
     X.fillStyle='#5d4037';X.beginPath();X.arc(x,g,26,Math.PI,TAU);X.fill();for(let i=0;i<6;i++)circ(x-80+i*32,g-60+(i%2)*14,3,'#c9a35f');
     X.save();X.beginPath();X.rect(x-60,0,120,g-120);X.clip();const ky=g-200-b.pop;X.fillStyle=S2;rrect(x-34,ky-20,68,90,26);X.fill();face(x,ky,30,'mad');
     poly([x-30,ky-28,x-30,ky-54,x-15,ky-40,x,ky-60,x+15,ky-40,x+30,ky-54,x+30,ky-28],'#ffd23f');circ(x,ky-42,4,'#e53935');X.restore();
     X.fillStyle=S;X.fillRect(x-60,g-130,120,22);for(let i=0;i<6;i++)X.fillRect(x-60+i*22,g-140,12,12)}},
 bot:{name:'Beach Ball Bot',rects:b=>[[b.x-50,b.y-50,100,100]],
   init(b){b.y=GY()-60;b.vy=0;b.vx=-60},
   upd(b,dt){b.vy+=900*dt;b.y+=b.vy*dt;if(b.y>GY()-55){b.y=GY()-55;b.vy=-rr(560,700);AUD.SFX.boing()}b.x+=b.vx*dt;if(b.x<W*0.45){b.vx=Math.abs(b.vx)}if(b.x>W-INR-60){b.vx=-Math.abs(b.vx)}
     if(Math.hypot(gull.x-b.x,gull.y-b.y)<60)hurt();
     if((b.at-=dt)<=0){b.n++;AUD.SFX.beep();for(let i=-1;i<=1;i++)shoot('ball',b.x-30,b.y,aim(b.x-30,b.y,200,i*0.3),{r:11});b.at=Math.max(1.2,2.2-loop*0.2)}},
   draw(b){X.save();X.translate(b.x,b.y);X.beginPath();X.moveTo(0,-52);X.lineTo(6,-74);strokeL(3,'#616161');circ(6,-76,6,((T*4)|0)%2?'#e53935':'#ffeb3b');X.rotate(b.x*0.01);
     const C=['#e53935','#fff','#1e88e5','#fff','#fdd835','#fff'];for(let i=0;i<6;i++){X.beginPath();X.moveTo(0,0);X.arc(0,0,52,i*TAU/6,(i+1)*TAU/6);X.closePath();X.fillStyle=C[i];X.fill()}X.rotate(-b.x*0.01);
     X.fillStyle='#37474f';rrect(-38,-20,76,34,14);X.fill();circ(-16,-4,8,'#4dd0e1');circ(16,-4,8,'#4dd0e1');circ(-14,-6,3,'#fff');circ(18,-6,3,'#fff');X.fillStyle='#4dd0e1';X.fillRect(-12,8,24,3);
     X.beginPath();X.moveTo(-50,10);X.lineTo(-70,-10+Math.sin(T*8)*8);X.moveTo(50,10);X.lineTo(70,-10-Math.sin(T*8)*8);strokeL(5,'#616161');X.restore()}},
 truck:{name:'The Hot Dog Truck',rects:b=>[[b.x-100,GY()-170,200,150]],
   init(b){b.dir=-1},
   upd(b,dt){b.x+=b.dir*40*dt;if(b.x<W*0.55)b.dir=1;if(b.x>W-INR-60)b.dir=-1;if((b.at-=dt)<=0){b.n++;
     if(b.n%3===0){AUD.SFX.honk();float('HONK HONK!',b.x,GY()-200,'#fff');for(let i=0;i<6;i++)shoot('mustard',b.x-60,GY()-120,aim(b.x-60,GY()-120,260,(i-2.5)*0.12),{r:8})}
     else{AUD.SFX.pop();for(let i=0;i<3;i++){const v=lob(b.x,GY()-190,gull.x+rr(-70,70),gull.y+rr(-30,30),rr(0.9,1.2),480);shoot('hotdog',b.x,GY()-190,v,{g:480,r:12})}}
     b.at=Math.max(0.9,1.6-loop*0.15)}},
   draw(b){const g=GY(),x=b.x;X.fillStyle='#fff';rrect(x-100,g-130,200,100,16);X.fill();X.fillStyle='#ffcc80';ell(x+10,g-160,90,24,'#ffcc80');ell(x+10,g-166,96,12,'#c0392b');
     X.beginPath();X.moveTo(x-80,g-170);for(let i=-80;i<=100;i+=10)X.lineTo(x+i,g-170+(i%20?4:-4));strokeL(4,'#fbc02d');X.fillStyle='#e53935';X.fillRect(x-100,g-60,200,16);
     X.fillStyle='#4fc3f7';rrect(x-90,g-118,50,40,8);X.fill();circ(x-66,g-96,12,'#e0ac69');X.fillStyle='#e53935';X.fillRect(x-76,g-112,22,6);
     txt('HOT DOGS',x+30,g-96,20,'#c62828');for(const wx of [-60,60]){circ(x+wx,g-28,20,'#333');circ(x+wx,g-28,9,'#bdbdbd');X.save();X.translate(x+wx,g-28);X.rotate(scroll*0.05);X.fillStyle='#757575';X.fillRect(-2,-9,4,18);X.restore()}
     circ(x-100,g-60,7,'#fff59d');X.fillStyle='#fff';X.beginPath();X.arc(x-80,g-96,0,0,TAU);X.fill()}}
};
function updBoss(dt){const b=boss,def=BOSS[b.k];b.flash=Math.max(0,b.flash-dt);
  if(b.st==='enter'){b.t+=dt;const tx=W*0.7;b.x=lerp(b.x,tx,Math.min(1,dt*2.2));if(b.k==='bot')def.upd(b,0);if(Math.abs(b.x-tx)<3){b.st='fight';b.at=1.2}return}
  if(b.st==='fight'){def.upd(b,dt);return}
  if(b.st==='down'){b.t+=dt;if(R()<0.3)confetti(2);if(b.t>2.8)levelClear()}}
function bossHit(po){const b=boss;b.hp--;b.flash=0.12;AUD.SFX.bossHit();score+=20;burst(po.x,po.y,8,['#fff'],120,3);if(b.spl.length<14)b.spl.push([po.x-b.x,po.y-GY()]);
  if(b.hp<=0){b.hp=0;b.st='down';b.t=0;shots=shots.filter(s=>s.good);AUD.SFX.bossDown();addScore(1000,b.x,GY()-260,'#ffe14d');setTimeout(()=>say('down',3),600);confetti(60)}}
// ---------- main update ----------
function update(dt){T+=dt;stT+=dt;if(banner){banner.t+=dt;if(banner.t>2.6)banner=null}
  for(const p of parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.conf){p.vy=Math.min(p.vy+60*dt,160);p.vx+=Math.sin(T*3+p.rot)*20*dt;p.rot+=dt*4}else{p.vx*=0.94;p.vy*=0.94}}parts=parts.filter(p=>p.t<p.life);
  for(const f of floats){f.t+=dt;f.y-=40*dt}floats=floats.filter(f=>f.t<1.2);
  if(state==='title'||state==='win'){scroll+=40*dt;return}
  if(state!=='play'||paused){gull.flap+=dt*8;if(state==='card')scroll+=30*dt;return}
  runTime+=dt;waveT+=dt;shake=Math.max(0,shake-dt*30);
  spd=boss?40:(95+Math.min(D(),12)*8+wave*6);scroll+=spd*dt;
  // gull
  if(keys.ArrowLeft)gull.tx-=280*dt;if(keys.ArrowRight)gull.tx+=280*dt;if(keys.ArrowUp)gull.ty-=280*dt;if(keys.ArrowDown)gull.ty+=280*dt;
  gull.tx=clamp(gull.tx,XMIN(),XMAX());gull.ty=clamp(gull.ty,YMIN(),YMAX());
  const ox=gull.x,oy=gull.y,k=Math.min(1,dt*10);gull.x+=(gull.tx-gull.x)*k;gull.y+=(gull.ty-gull.y)*k;gull.vx=(gull.x-ox)/dt;gull.vy=(gull.y-oy)/dt;
  gull.flap+=dt*(9+Math.max(0,-gull.vy)*0.03);gull.tilt=clamp(gull.vy*0.0012,-0.35,0.35);gull.inv=Math.max(0,gull.inv-dt);gull.carry=Math.max(0,gull.carry-dt);gull.munch=Math.max(0,gull.munch-dt);gull.cd-=dt;
  comboT-=dt;if(comboT<=0)combo=0;
  if(poopQ>0){if(gull.cd<=0){poops.push({x:gull.x-6,y:gull.y+14,vx:gull.vx*0.3,vy:80});gull.cd=0.26;poopN++;AUD.SFX.plop();if(poopN===1||R()<0.07)say(pick(['bombs','bombs','splat']),1)}poopQ=0}
  // waves
  if(wave<2){if(waveT<WAVELEN-3&&(spawnT-=dt)<=0){spawn();spawnT=Math.max(0.7,rr(1.3,2.1)-D()*0.1-wave*0.15)}
    if((dogT-=dt)<=0){dogs.push({x:W+40,vx:-120,h:0,vh:0,life:rr(9,13),splat:0});dogT=rr(14,22)/(1+D()*0.08);say('dog',2)}
    if(hearts<MAXH&&(heartT-=dt)<=0){shots.push({k:'heart',x:W+20,y:rr(YMIN()+30,YMAX()-60),vx:-70,vy:0,g:0,r:14,good:1,life:9});heartT=rr(18,26)}
    if(waveT>=WAVELEN)startWave(wave+1)}
  else if(boss)updBoss(dt);
  // people
  const g=GY();
  for(const p of people){if(p.run){p.vx=p.dir*170;p.walk=1}p.x+=(-spd+p.vx)*dt;p.sayT-=dt;if(p.mood==='mad'&&!p.run&&p.k!=='sun')p.arm=-2.4+Math.sin(T*18)*0.35;
    if(!p.run&&!p.splat&&p.x>W*0.18&&p.x<W-10){
      if(p.k==='kid'&&(p.cd-=dt)<=0){const t=rr(0.9,1.1),v=lob(p.x,g-60,gull.x,gull.y,t,500);shoot('balloon',p.x,g-60,v,{g:500,r:9,c:pick(['#4fc3f7','#ff80ab','#b2ff59'])});p.cd=Math.max(1.4,rr(2.3,3.2)-D()*0.1)}
      if(p.k==='guard'&&(p.cd-=dt)<=0){for(let i=0;i<3;i++)setTimeout(()=>{if(state==='play'&&!p.splat)shoot('water',p.x+14,g-52,aim(p.x+14,g-52,320),{r:6})},i*110);AUD.SFX.puff();p.cd=Math.max(1.6,rr(2.4,3)-D()*0.1)}}
    if(p.fries&&gull.inv<1.4&&Math.hypot(gull.x+40-(p.x+12),gull.y-(g-46))<36)stealFries(p)}
  people=people.filter(p=>p.x>-80&&p.x<W+200);
  for(const u of umbs)u.x-=spd*dt;umbs=umbs.filter(u=>u.x>-80);
  for(const d of dogs){d.life-=dt;const dx=gull.x-d.x;if(d.life<0)d.vx=-260;else if(!d.splat)d.vx=clamp(dx*1.5,-170,170)-spd*0.2;d.x+=d.vx*dt;
    if(d.h<=0&&!d.splat&&d.life>0&&Math.abs(dx)<80&&gull.y>g-200){d.vh=560;AUD.SFX.boing()}d.vh-=1300*dt;d.h=Math.max(0,d.h+d.vh*dt);
    if(Math.hypot(gull.x-(d.x-20),gull.y-(g-d.h-26))<34)hurt()}
  dogs=dogs.filter(d=>d.x>-80&&d.x<W+120);
  // poop physics
  for(const po of poops){po.vy+=1100*dt;po.x+=po.vx*dt;po.y+=po.vy*dt;
    for(const u of umbs){if(Math.abs(po.x-u.x)<u.r&&po.y>g-u.h-u.r*0.45&&po.y<g-u.h+6){po.dead=1;if(u.splats.length<4)u.splats.push(po.x-u.x);AUD.SFX.pop();float('BLOCKED!',u.x,g-u.h-50,'#b3e5fc');break}}if(po.dead)continue;
    for(const p of people){if(p.splat)continue;const kid=p.k==='kid',lying=p.k==='sun'&&!p.up,hw=lying?38:16,top=lying?g-24:g-(kid?70:92);if(Math.abs(po.x-p.x)<hw&&po.y>top&&po.y<g){po.dead=1;splatPerson(p,po);break}}if(po.dead)continue;
    for(const d of dogs){if(!d.splat&&Math.abs(po.x-d.x)<24&&po.y>g-d.h-40&&po.y<g-d.h){po.dead=1;d.splat=1;d.life=0;addScore(25,d.x,g-80);float('WOOF!',d.x,g-110,'#ffd23f');AUD.SFX.splat()}}if(po.dead)continue;
    if(boss&&boss.st==='fight'){for(const r of BOSS[boss.k].rects(boss))if(po.x>r[0]&&po.x<r[0]+r[2]&&po.y>r[1]&&po.y<r[1]+r[3]){po.dead=1;bossHit(po);break}}if(po.dead)continue;
    if(po.y>g+4){po.dead=1;if(decals.length>40)decals.shift();decals.push({x:po.x,y:g+rr(6,22)})}}
  poops=poops.filter(p=>!p.dead);for(const d of decals)d.x-=spd*dt;decals=decals.filter(d=>d.x>-20);
  // shots (hazards + goodies)
  for(const s of shots){s.vy+=(s.g||0)*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;const dd=Math.hypot(s.x-gull.x-8,s.y-gull.y);
    if(s.good){if(dd<s.r+28){s.dead=1;if(s.k==='heart'){hearts=Math.min(MAXH,hearts+1);AUD.SFX.heart();float('+1 ♥',s.x,s.y,'#ff8fab')}else{fries++;gull.munch=0.5;gull.carry=0.6;addScore(25,s.x,s.y,'#ffd23f');AUD.SFX.munch()}}}
    else if(dd<s.r+18){s.dead=1;burst(s.x,s.y,8,[s.k==='ketchup'?'#d32f2f':s.k==='mustard'?'#fbc02d':'#4fc3f7','#fff'],120,4);hurt()}
    if(s.y>g+20||s.x<-60||s.x>W+80||s.y<-80||s.life<=0)s.dead=1}
  shots=shots.filter(s=>!s.dead);
  if(score>best&&(bestT-=dt)<=0){bestT=2;best=score;LS.set('best',best)}}
