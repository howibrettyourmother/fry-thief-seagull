// ================= game state, waves, poop physics, fry stealing, hazards, bosses =================
let state='title',T=0,stT=0,TS=1,paused=false,scroll=0,spd=100;
let lv=0,L=LEVELS[0],loop=0,wave=0,waveT=0,spawnT=1,dogT=8,heartT=40;
let gull={x:110,y:300,vx:0,vy:0,flap:0,tilt:0,inv:0,carry:0,munch:0,cd:0,sw:0,swCD:0},people=[],umbs=[],cars=[],dogs=[],poops=[],shots=[],decals=[],debris=[],parts=[],floats=[],boss=null,banner=null,card=null;
const WAVELEN=34,maxH=()=>diff?3:5;
let hearts=5,score=0,combo=0,comboT=0,shake=0,oopsN=0,runTime=0,poopN=0,endStats=null,unlockLv=Math.max(1,+LS.get('unlock',1)||1),selLv=0,bestT=0;
let fryM=100,hangry=0,megaN=0,megaC=0,chiliT=0,fartT=0,noHit=0;
const RUN={},WV={};function zero(o){Object.assign(o,{splats:0,fries:0,dads:0,toupees:0,megas:0,hits:0,s0:score})}
const say=(k,p)=>AUD.say(k,p);
const D=()=>lv+loop*5+(wave>0?0.6:0)+diff*1.5;           // difficulty
const SPM=()=>(diff?1.15:1)*(1+loop*0.06);
const megaNeed=()=>diff?7:5;function megaReady(){return megaC>0}
// ---------- flow ----------
function clearWorld(){people=[];umbs=[];cars=[];dogs=[];poops=[];shots=[];decals=[];debris=[];floats=[];boss=null;banner=null;combo=0}
function newGame(i){score=0;loop=0;oopsN=0;runTime=0;poopN=0;megaC=0;megaN=0;noHit=0;zero(RUN);startLevel(i||0);if(diff)setTimeout(()=>say('hard',2),2200)}
function startLevel(i){if(i>=LEVELS.length){i=0;loop++;}lv=i;L=LEVELS[i];wave=0;clearWorld();hearts=maxH();fryM=100;hangry=0;chiliT=0;state='card';stT=0;resetInput();
  AUD.setTheme(['beach','surf','breeze','city','falls'][i]);setTimeout(()=>{if(state==='card')say(loop&&i===0?'again':i===0?'w1':'l'+(i+1),3)},350)}
function startPlay(){state='play';stT=0;gull.x=110;gull.y=(YMIN()+YMAX())/2;gull.vx=gull.vy=0;gull.inv=1;startWave(0)}
function startWave(w){wave=w;waveT=0;spawnT=0.5;dogT=lv+loop+diff>0||w>0?rr(5,9):99;heartT=rr(40,55);state='play';stT=0;zero(WV);resetInput();
  if(w===2){spawnBoss();return}banner={s:'WAVE '+(lv+1)+'-'+(w+1),t:0};if(w===1){say('w2',2);AUD.SFX.check()}}
function spawnBoss(){const k=['larry','chef','king','bot','truck'][lv],def=BOSS[k];AUD.setTheme(lv===4?'king':'boss');AUD.SFX.warn();
  const hp=Math.round((30+lv*6)*(1+loop*0.3)*(diff?1.3:1));boss={k,name:def.name,x:W+160,hp,max:hp,st:'enter',t:0,at:1.5,flash:0,spl:[],n:0,ph:1,hits:0,say:'',sayT:0};def.init&&def.init(boss);
  banner={s:def.name,t:0,boss:1};setTimeout(()=>{say('b'+(lv+1),3);bossSay(pick(def.taunts))},300)}
function bossSay(s){if(boss){boss.say=s;boss.sayT=2.2}}
function waveEnd(){// gross-out stats card; no-hit waves pay a multiplier
  const pts=score-WV.s0;let bonus=0,mult=1;if(WV.hits===0){noHit++;mult=Math.min(2.5,1.5+0.25*(noHit-1));bonus=Math.round(pts*(mult-1));score+=bonus;setTimeout(()=>say('perfect',2),900)}else noHit=0;
  card={boss:wave===2,rows:[['Butts Bombed',WV.splats],['Fries Yoinked',WV.fries],['Dads Ruined',WV.dads],['Toupees Launched',WV.toupees],['Mega Dumps',WV.megas],['Hits Taken',WV.hits],['Continues (run)',oopsN]],pts,bonus,mult};
  state='stats';stT=0;shots=shots.filter(s=>s.good&&s.k!=='heart');poops=[];resetInput();saveBest();AUD.SFX.fanfare();setTimeout(()=>AUD.SFX.fart(wave===2?1:[1,7,11],1),900);say(wave===2?'d'+(lv+1):'wave',3);
  if(wave===2){unlockLv=Math.max(unlockLv,Math.min(5,lv+2));LS.set('unlock',unlockLv)}}
function nextFromStats(){if(wave<2)startWave(wave+1);else if(lv===LEVELS.length-1)finish();else startLevel(lv+1)}
function finish(){state='win';stT=0;endStats={score,loop,...RUN,cont:oopsN};boss=null;shots=[];AUD.setTheme('win');AUD.SFX.cheer();setTimeout(()=>say('legend',3),500);confetti(120);saveBest()}
function saveBest(){if(score>best){best=score;LS.set('best'+diff,best)}}
function oops(){state='oops';stT=0;oopsN++;saveBest();AUD.SFX.fart(9,1);say('oops',3);resetInput()}
function respawn(){// continue: full hearts, back to the start of this wave (bosses keep their damage = boss checkpoint)
  hearts=maxH();state='play';stT=0;shots=[];poops=[];dogs=[];gull.inv=2;gull.x=110;gull.y=(YMIN()+YMAX())/2;gull.vx=gull.vy=0;fryM=Math.max(fryM,70);hangry=0;
  if(wave===2&&boss){boss.st='fight';boss.at=2;WV.hits=1}else{people=[];umbs=[];cars=[];const s0=WV.s0;startWave(wave);WV.s0=s0;WV.hits=1}}
// ---------- fx ----------
function burst(x,y,n,cols,sp,r){for(let i=0;i<n&&parts.length<170;i++){const a=R()*TAU,v=rr(0.3,1)*(sp||160);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:rr(0.4,0.8),r:rr(2,r||5),c:pick(cols)})}}
function float(s,x,y,c){if(floats.length<14)floats.push({s,x,y,t:0,c:c||'#fff'})}
function confetti(n){for(let i=0;i<n&&parts.length<170;i++)parts.push({x:rr(0,W),y:TOP-10,vx:rr(-40,40),vy:rr(60,180),t:0,life:rr(1.6,3),r:rr(3,6),c:pick(['#ffd23f','#ff5d8f','#4fc3f7','#81c784','#ff8a26','#b388ff']),conf:1,rot:rr(0,6)})}
// ---------- spawning ----------
function mkPerson(k,x){const p={k,x:x||W+50,dir:-1,walk:0,skin:pick(SKINS),shirt:pick(SHIRTS),shorts:pick(SHIRTS),hair:pick(HAIRS),hat:R()<0.25&&k!=='toupee'&&k!=='dad'?pick(['#fff','#ffd23f','#ff7043']):null,towel:pick(SHIRTS),
  mood:'happy',splat:0,run:0,fries:k==='fry'?1:0,chili:0,cd:rr(0.6,1.5),say:'',sayT:0,arm:0,vx:0,up:0};
  if(k==='walk'||k==='toupee'||k==='lady'){p.walk=1;p.dir=R()<0.5?-1:1;p.vx=p.dir*rr(18,40)}if(k==='fry'){p.arm=-0.5;p.chili=R()<0.16;if(R()<0.5){p.walk=1;p.vx=-rr(10,25)}}
  if(k==='buff')p.arm=-2.2;if(k==='lady'){p.hat='#f8bbd0';p.mood='happy'}if(k==='toupee')p.hair=pick(['#6d4c41','#3e2723','#bdbdbd']);return p}
function spawn(){const d=D(),pool=['sun','walk','fry','fry','toupee','lady','buff'];if(d>=0.5)pool.push('kid','dad');if(d>=1.2)pool.push('guard','kid');if(d>=2)pool.push('bro','guard');if(d>=3)pool.push('kid','bro','guard');
  const k=pick(pool);if(k==='dad'){const x=W+90,c={x,c:pick(['#e53935','#1e88e5','#ffb300','#8e24aa']),splats:[]};const dd=mkPerson('dad',x-80),kd=mkPerson('kidl',x-115);kd.k='kidl';dd.car=c;kd.dad=dd;dd.kid=kd;c.dad=dd;cars.push(c);people.push(dd,kd);return}
  const p=mkPerson(k);people.push(p);
  if(k==='sun'&&R()<Math.min(0.6,0.25+d*0.08))umbs.push({x:p.x+rr(-6,6),h:rr(70,84),r:rr(36,44),c:pick(['#ff5d8f','#ffd23f','#4fc3f7','#7cb342','#ff7043']),splats:[]});
  else if(d>=1&&R()<Math.min(0.35,d*0.06))umbs.push({x:p.x+rr(50,80),h:rr(80,92),r:rr(34,40),c:pick(['#ff5d8f','#ffd23f','#4fc3f7']),splats:[]})}
// ---------- hurt / score ----------
function hurt(){if(gull.inv>0||state!=='play')return;hearts--;WV.hits++;RUN.hits++;combo=0;gull.inv=1.4;shake=9;AUD.SFX.hurt();burst(gull.x,gull.y,14,['#fff','#cfd8dc','#4fc3f7'],200,4);fryM=Math.max(0,fryM-15);
  if(hearts<=0){oops();return}if(R()<0.35)say('ouch',1)}
function addScore(n,x,y,c){score+=n;float('+'+n,x,y,c||'#fff')}
const REACT=[['HEY!','hey'],['EWW! BIRD!','gross'],['GROSS!',null],['IT\'S WARM!',null],['WHY ME?!',null],['BIRD BUTT!',null],['NOT COOL!',null],['MY HAT!',null]];
function bubble(p,s){p.say=s;p.sayT=1.7}
function splatPerson(p,po,mega){p.splat=1;p.mood='mad';WV.splats++;RUN.splats++;combo++;comboT=diff?0.85:1.1;const m=Math.min(8,combo);let pts=50*m;const gy=GY();
  if(m>1)float('x'+m+' COMBO',p.x,gy-145,'#ff5d8f');if(combo===4)say('combo',2);
  if(!mega){AUD.SFX[R()<0.5?'wet':'splat']();if(R()<0.2)AUD.SFX.fart([5,0,8,11]);burst(po.x,po.y,10,['#8b5a2b','#5a3517','#c8925a'],150,4)}
  const k=p.k;
  if(k==='toupee'){p.bald=1;debris.push({x:p.x,y:gy-84,vx:rr(-60,60),vy:-420,rot:0,vr:rr(-12,12),c:p.hair,t:0});bubble(p,'MY TOUPEE!');say('toupee',2);WV.toupees++;RUN.toupees++;pts+=100;setTimeout(()=>{p.run=1;p.dir=-1},900)}
  else if(k==='dad'){bubble(p,pick(['MY NEW SHIRT!','HEY!!','NOT AGAIN!']));dadRuined(p,0)}
  else if(k==='buff'){p.mood='cry';p.arm=0.3;bubble(p,'WAAAH!');say('cry',2);pts+=100;setTimeout(()=>{p.run=1;p.dir=-1},1600)}
  else if(k==='lady'){p.mood='scream';bubble(p,'IT\'S IN MY MOUTH!');say('mouth',2);pts+=100;p.run=1;p.dir=-1;p.spit=1}
  else if(k==='kidl'){bubble(p,'HEY! NO FAIR!');p.mood='mad';p.run=1}
  else{const r=pick(REACT);bubble(p,p.fries&&R()<0.5?'NOOO!':r[0]);if(r[1]&&R()<0.5)say(r[1],1);
    if(k==='sun'){p.up=1;setTimeout(()=>{p.run=1;p.dir=-1},1100)}
    else if(k==='fry'){if(p.fries){p.fries=0;for(let i=0;i<3;i++)shots.push({k:'fry',x:p.x+10,y:gy-60,vx:rr(-60,90),vy:rr(-380,-240),g:420,r:10,good:1,life:4,chili:p.chili})}p.arm=-2.4}
    else{p.run=1;p.dir=-1}}
  addScore(pts,p.x,gy-112,m>1?'#ffd23f':'#fff')}
function dadRuined(dd,car){WV.dads++;RUN.dads++;if(car){bubble(dd,'NOT MY NEW CAR!');say('car',3);addScore(200,dd.car.x,GY()-80,'#ffd23f');dd.mood='mad'}
  const kd=dd.kid;if(kd&&!kd.splat&&!kd.run){kd.mood='laugh';setTimeout(()=>{bubble(kd,'HA HA, DAD!');say('laugh',1)},car?1200:700)}}
function eatFry(n,chili){fries(n);if(chili){chiliT=6;say('chili',3);AUD.SFX.fart(11,1);float('CHILI CHEESE MODE!',gull.x,gull.y-50,'#ff8f00')}}
function fries(n){WV.fries+=n;RUN.fries+=n;fryM=Math.min(100,fryM+30*n);if(hangry&&fryM>20){hangry=0}megaN+=n;if(megaN>=megaNeed()&&megaC<2){megaN=0;megaC++;AUD.SFX.charge();float('MEGA DUMP READY!',gull.x,gull.y-60,'#ffd23f')}}
function stealFries(p){const ch=p.chili;p.fries=0;p.mood='mad';p.arm=-2.4;bubble(p,pick(['MY FRIES!','HEY!','NOOO!','THIEF!']));gull.carry=1.2;gull.munch=0.9;addScore(100,p.x,GY()-120,'#ffd23f');AUD.SFX.munch();
  burst(gull.x+40,gull.y,12,['#ffd54f','#ffca28','#fff59d'],160,4);if(R()<0.35)setTimeout(()=>AUD.SFX.fart([2,10,0]),450);if(!ch)say(pick(['mine','myfries','noo','fries','mine','yum']),2);eatFry(1,ch);setTimeout(()=>{p.run=1;p.dir=-1},900)}
// ---------- shot patterns ----------
function lead(t){return{x:gull.x+gull.vx*t*0.8,y:gull.y+gull.vy*t*0.5}}
function lob(x,y,tx,ty,t,g){return{vx:(tx-x)/t,vy:(ty-y-0.5*g*t*t)/t}}
function lobL(x,y,t,g,jit){const p=lead(t);return lob(x,y,p.x+rr(-jit,jit),p.y+rr(-jit*0.6,jit*0.6),t,g)}
function aimA(x,y,sp){const t=Math.hypot(gull.x-x,gull.y-y)/sp,p=lead(t);return Math.atan2(p.y-y,p.x-x)}
function shoot(k,x,y,v,o){if(shots.length<90)shots.push(Object.assign({k,x,y,vx:v.vx,vy:v.vy,g:0,r:9,life:7},o||{}))}
function fan(k,x,y,n,arc,sp,o){sp*=SPM();const a0=aimA(x,y,sp);for(let i=0;i<n;i++){const a=a0+(n>1?(i/(n-1)-0.5)*arc:0);shoot(k,x,y,{vx:Math.cos(a)*sp,vy:Math.sin(a)*sp},o)}}
function spiral(k,x,y,n,sp,rot,o){sp*=SPM();for(let i=0;i<n;i++){const a=rot+i*TAU/n;shoot(k,x,y,{vx:Math.cos(a)*sp,vy:Math.sin(a)*sp},o)}}
function rain(k,n,o){for(let i=0;i<n;i++)setTimeout(()=>{if(state==='play'&&boss&&boss.st==='fight')shoot(k,rr(XMIN(),boss.x-60),YMIN()-30,{vx:rr(-20,20),vy:60},Object.assign({g:260},o||{}))},i*180)}
// ---------- bosses: 3 phases each (pattern gets meaner at 66% and 33% health) ----------
const BOSS={
 larry:{name:'Lifeguard Larry',taunts:['NO POOPING ON MY BEACH!','TWEET! TIMEOUT, BIRD!','I SAW THAT!','WALK, DON\'T FLY!'],rects:b=>[[b.x-38,GY()-250,76,120]],
   upd(b,dt){b.blow=Math.max(0,(b.blow||0)-dt);if((b.at-=dt)>0)return;b.n++;const hx=b.x-20,hy=GY()-205,cx=b.x-46,cy=GY()-170;
     if(b.n%3===0){b.blow=0.6;AUD.SFX.whistle();fan('ring',hx,hy,b.ph>1?5:3,b.ph>1?1.1:0.7,170,{r:14})}
     else{AUD.SFX.puff();fan('water',cx,cy,5,0.55,250,{r:8});
       if(b.ph>=2)for(let i=0;i<10;i++)setTimeout(()=>{if(b.st==='fight'){const a=-2.7+i*0.15;shoot('water',cx,cy,{vx:Math.cos(a)*300*SPM(),vy:Math.sin(a)*300*SPM()},{r:7})}},i*55)}
     if(b.ph>=3&&b.n%2===0)rain('water',6,{r:9});
     b.at=[1.7,1.35,1.05][b.ph-1]},
   draw(b){const g=GY(),x=b.x;X.strokeStyle='#fff';X.lineWidth=8;X.beginPath();X.moveTo(x-40,g);X.lineTo(x-26,g-130);X.moveTo(x+40,g);X.lineTo(x+26,g-130);X.moveTo(x-34,g-60);X.lineTo(x+34,g-60);X.stroke();
     X.fillStyle='#fff';X.fillRect(x-44,g-136,88,12);txt('LIFEGUARD',x,g-90,11,'#e53935');
     X.fillStyle='#e53935';rrect(x-30,g-170,60,40,10);X.fill();X.fillStyle='#e0ac69';rrect(x-32,g-232,64,66,22);X.fill();circ(x,g-258,28,'#e0ac69');X.fillStyle='#ffca28';X.beginPath();X.arc(x,g-262,29,Math.PI*1.05,TAU*0.98);X.fill();
     X.fillStyle='#222';rrect(x-26,g-266,26,10,4);X.fill();rrect(x-2,g-266,22,10,4);X.fill();
     X.beginPath();X.moveTo(x-50,g-200);X.lineTo(x-20,g-210);strokeL(10,'#e0ac69');X.fillStyle='#ff7043';rrect(x-86,g-182,46,18,6);X.fill();X.fillStyle='#ffd23f';X.fillRect(x-92,g-180,8,14);
     const bs=b.blow>0?1.4:1;X.save();X.translate(x-28,g-246);X.scale(bs,bs);X.fillStyle='#bdbdbd';rrect(-24,-7,26,14,5);X.fill();circ(-24,0,9,'#9e9e9e');X.restore();if(b.blow>0)txt('TWEET!',x-70,g-290,20,'#fff',{st:'#e53935',sw:5});
     X.beginPath();X.arc(x-6,g-244,7,0.2,Math.PI-0.2);strokeL(2.5,'#5d2a1a')}},
 chef:{name:'Chef Frank',taunts:['THESE FRIES ARE MINE!','TASTE THE KETCHUP!','COME GET \'EM, BIRD!','FIVE STAR SPLATTER!'],rects:b=>[[b.x-50,GY()-230,100,110]],
   upd(b,dt){b.toss=Math.max(0,(b.toss||0)-dt);if((b.at-=dt)>0)return;b.n++;const sx=b.x-30,sy=GY()-170;b.toss=0.4;
     if(b.n%5===0){for(let i=0;i<4;i++){const v=lob(sx,sy,rr(W*0.15,W*0.55),rr(YMIN()+40,YMAX()-40),1.1,420);shoot('fry',sx,sy,v,{g:420,good:1,r:10})}bossSay('OOPS, DROPPED SOME!')}
     else{AUD.SFX.pop();for(let i=0;i<3;i++){shoot('ketchup',sx,sy,lobL(sx,sy,rr(0.8,1.1),500,60),{g:500,r:10})}
       if(b.ph>=2)fan('mustard',sx,sy,5,0.7,240,{r:8});if(b.ph>=3&&b.n%2)spiral('ketchup',b.x,GY()-200,12,170,b.n*0.4,{r:9})}
     b.at=[1.6,1.3,1.05][b.ph-1]},
   draw(b){const g=GY(),x=b.x;X.fillStyle='#8d6e63';X.fillRect(x-80,g-130,160,130);X.fillStyle='#5d4037';X.fillRect(x-60,g-110,120,60);
     X.fillStyle='#fff';X.fillRect(x-90,g-140,180,16);for(let i=0;i<9;i++){X.fillStyle=i%2?'#fff':'#e53935';X.fillRect(x-90+i*20,g-140,20,16)}
     rrect(x-70,g-176,140,34,8);X.fillStyle='#ffd23f';X.fill();txt('FRY SHACK',x,g-158,18,'#c62828');fryCone(x+50,g-46,1.4);
     circ(x,g-210,26,'#f6d0b1');X.fillStyle='#fff';rrect(x-22,g-262,44,36,12);X.fill();ell(x,g-232,26,6,'#fff');face(x+2,g-208,24,'mad');
     X.beginPath();X.moveTo(x-12,g-196);X.quadraticCurveTo(x,g-202,x+12,g-196);strokeL(4,'#3e2723');X.fillStyle='#fff';rrect(x-30,g-186,60,50,12);X.fill();
     const a=b.toss>0?-1.6:-0.4;X.save();X.translate(x-24,g-176);X.rotate(a);X.beginPath();X.moveTo(0,0);X.lineTo(-26,0);strokeL(9,'#f6d0b1');X.fillStyle='#d32f2f';rrect(-40,-9,16,24,4);X.fill();X.restore()}},
 king:{name:'Sandcastle King',taunts:['BOW TO THE KING!','BUCKET HIM!','NOT MY MOAT!','OFF WITH HIS BEAK!'],rects:b=>[[b.x-34,GY()-232-b.pop,68,70],[b.x-90,GY()-150,180,150]],
   init(b){b.pop=0},
   upd(b,dt){b.pop=24+Math.sin(T*1.6)*22;if((b.at-=dt)>0)return;b.n++;const sx=b.x,sy=GY()-200-b.pop;AUD.SFX.boing();
     const n=b.ph>=2?5:3;for(let i=0;i<n;i++){const p=lead(1);const v=lob(sx,sy,p.x+(i-(n-1)/2)*55,p.y,1.0+i*0.04,520);shoot('bucket',sx,sy,v,{g:520,r:11,c:pick(['#ff7043','#29b6f6','#ffd23f'])})}
     if(b.ph>=2&&b.n%2===0)for(let i=0;i<2+b.ph-2;i++)shoot('crab',b.x-90-i*30,GY()-12,{vx:-150*SPM(),vy:0},{r:13,g:900,bounce:440,life:8});
     if(b.ph>=3&&b.n%2)spiral('bucket',sx,sy,8,160,b.n*0.3,{r:10,c:'#ffd23f'});
     b.at=[1.8,1.45,1.15][b.ph-1]},
   draw(b){const g=GY(),x=b.x,S='#e8c987',S2='#d6b06a';X.fillStyle=S;X.fillRect(x-90,g-110,180,110);for(let i=0;i<9;i++)X.fillRect(x-90+i*20,g-124,12,16);
     for(const tx of [-70,70]){X.fillStyle=S2;X.fillRect(x+tx-18,g-170,36,170);for(let i=0;i<3;i++)X.fillRect(x+tx-18+i*13,g-182,9,14);poly([x+tx,g-210,x+tx+4,g-196,x+tx+18,g-200],'#e53935');X.fillStyle='#795548';X.fillRect(x+tx-1,g-212,2,30)}
     X.fillStyle='#5d4037';X.beginPath();X.arc(x,g,26,Math.PI,TAU);X.fill();for(let i=0;i<6;i++)circ(x-80+i*32,g-60+(i%2)*14,3,'#c9a35f');
     X.save();X.beginPath();X.rect(x-60,0,120,g-120);X.clip();const ky=g-200-b.pop;X.fillStyle=S2;rrect(x-34,ky-20,68,90,26);X.fill();face(x,ky,30,'mad');
     poly([x-30,ky-28,x-30,ky-54,x-15,ky-40,x,ky-60,x+15,ky-40,x+30,ky-54,x+30,ky-28],'#ffd23f');circ(x,ky-42,4,'#e53935');X.restore();
     X.fillStyle=S;X.fillRect(x-60,g-130,120,22);for(let i=0;i<6;i++)X.fillRect(x-60+i*22,g-140,12,12)}},
 bot:{name:'Beach Ball Bot',taunts:['SEAGULL DETECTED','BOUNCE.EXE','POOP ON SENSOR!','RECALCULATING...'],rects:b=>[[b.x-50,b.y-50,100,100]],
   init(b){b.y=GY()-60;b.vy=0;b.vx=-70},
   upd(b,dt){b.vy+=900*dt;b.y+=b.vy*dt;if(b.y>GY()-55){b.y=GY()-55;b.vy=-rr(560,700)*(b.ph>=2?1.12:1);AUD.SFX.boing()}const sp=[70,110,140][b.ph-1];b.vx=Math.sign(b.vx||-1)*sp;b.x+=b.vx*dt;if(b.x<W*0.42)b.vx=sp;if(b.x>W-INR-60)b.vx=-sp;
     if(Math.hypot(gull.x-b.x,gull.y-b.y)<62)hurt();
     if((b.at-=dt)>0)return;b.n++;AUD.SFX.beep();fan('ball',b.x-30,b.y,b.ph>=2?5:3,b.ph>=2?1:0.6,210,{r:11});
     if(b.ph>=3)spiral('ball',b.x,b.y,10,150,b.n*0.35,{r:9,g:300,bounce:380,life:5});b.at=[2,1.6,1.3][b.ph-1]},
   draw(b){X.save();X.translate(b.x,b.y);X.beginPath();X.moveTo(0,-52);X.lineTo(6,-74);strokeL(3,'#616161');circ(6,-76,6,((T*4)|0)%2?'#e53935':'#ffeb3b');X.rotate(b.x*0.01);
     const C=['#e53935','#fff','#1e88e5','#fff','#fdd835','#fff'];for(let i=0;i<6;i++){X.beginPath();X.moveTo(0,0);X.arc(0,0,52,i*TAU/6,(i+1)*TAU/6);X.closePath();X.fillStyle=C[i];X.fill()}X.rotate(-b.x*0.01);
     X.fillStyle='#37474f';rrect(-38,-20,76,34,14);X.fill();const ec=b.ph>=3?'#ff5252':'#4dd0e1';circ(-16,-4,8,ec);circ(16,-4,8,ec);circ(-14,-6,3,'#fff');circ(18,-6,3,'#fff');X.fillStyle=ec;X.fillRect(-12,8,24,3);
     X.beginPath();X.moveTo(-50,10);X.lineTo(-70,-10+Math.sin(T*8)*8);X.moveTo(50,10);X.lineTo(70,-10-Math.sin(T*8)*8);strokeL(5,'#616161');X.restore()}},
 truck:{name:'The Hot Dog Truck',taunts:['HONK HONK!','RELISH THE MOMENT!','YOU CAN\'T CATCH-UP!','EAT MUSTARD, FEATHER FACE!'],rects:b=>[[b.x-100,GY()-170,200,150]],
   init(b){b.dir=-1},
   upd(b,dt){const sp=[40,70,95][b.ph-1];b.x+=b.dir*sp*dt;if(b.x<W*0.55)b.dir=1;if(b.x>W-INR-60)b.dir=-1;if((b.at-=dt)>0)return;b.n++;
     if(b.n%3===0){AUD.SFX.honk();float('HONK HONK!',b.x,GY()-200,'#fff');fan('mustard',b.x-60,GY()-120,6,0.75,260,{r:8});if(b.ph>=2)fan('ring',b.x-60,GY()-150,5,1.2,180,{r:14})}
     else{AUD.SFX.pop();for(let i=0;i<3;i++)shoot('hotdog',b.x,GY()-190,lobL(b.x,GY()-190,rr(0.9,1.2),480,70),{g:480,r:12});if(b.ph>=2)shoot('ketchup',b.x,GY()-190,lobL(b.x,GY()-190,0.8,500,20),{g:500,r:10})}
     if(b.ph>=3&&b.n%2){spiral('mustard',b.x,GY()-160,12,170,b.n*0.5,{r:8});rain('hotdog',4,{r:12})}
     b.at=[1.5,1.25,1][b.ph-1]},
   draw(b){const g=GY(),x=b.x;X.fillStyle='#fff';rrect(x-100,g-130,200,100,16);X.fill();ell(x+10,g-160,90,24,'#ffcc80');ell(x+10,g-166,96,12,'#c0392b');
     X.beginPath();X.moveTo(x-80,g-170);for(let i=-80;i<=100;i+=10)X.lineTo(x+i,g-170+(i%20?4:-4));strokeL(4,'#fbc02d');X.fillStyle='#e53935';X.fillRect(x-100,g-60,200,16);
     X.fillStyle='#4fc3f7';rrect(x-90,g-118,50,40,8);X.fill();circ(x-66,g-96,12,'#e0ac69');X.fillStyle='#e53935';X.fillRect(x-76,g-112,22,6);
     txt('HOT DOGS',x+30,g-96,20,'#c62828');for(const wx of [-60,60]){circ(x+wx,g-28,20,'#333');circ(x+wx,g-28,9,'#bdbdbd');X.save();X.translate(x+wx,g-28);X.rotate(scroll*0.05);X.fillStyle='#757575';X.fillRect(-2,-9,4,18);X.restore()}
     circ(x-100,g-60,7,'#fff59d')}}
};
function updBoss(dt){const b=boss,def=BOSS[b.k];b.flash=Math.max(0,b.flash-dt);b.sayT-=dt;
  if(b.st==='enter'){b.t+=dt;const tx=W*0.7;b.x=lerp(b.x,tx,Math.min(1,dt*2.2));if(b.k==='bot')def.upd(b,0);if(Math.abs(b.x-tx)<3){b.st='fight';b.at=1.2}return}
  if(b.st==='fight'){def.upd(b,dt);if(R()<dt*0.12)bossSay(pick(def.taunts));return}
  if(b.st==='down'){b.t+=dt;if(R()<0.3)confetti(2);if(b.t>2.8)waveEnd()}}
function bossHit(po,dmg){const b=boss;b.hp-=dmg;b.hits++;b.flash=0.12;AUD.SFX.bossHit();score+=20*dmg;burst(po.x,po.y,8,['#8b5a2b','#5a3517'],120,3);if(R()<0.25)AUD.SFX.fart([2,10,4,0]);if(b.spl.length<14)b.spl.push([po.x-b.x,po.y-GY()]);
  if(b.hits%6===0)shots.push({k:'fry',x:b.x-40,y:GY()-180,vx:rr(-160,-60),vy:-300,g:420,r:10,good:1,life:4});
  const ph=b.hp>b.max*0.66?1:b.hp>b.max*0.33?2:3;if(ph>b.ph&&b.hp>0){b.ph=ph;b.at=1.2;banner={s:'PHASE '+ph+'!',t:0};say('t'+(lv+1),3);bossSay(pick(BOSS[b.k].taunts));AUD.SFX.warn();shake=10}
  if(b.hp<=0){b.hp=0;b.st='down';b.t=0;shots=shots.filter(s=>s.good);AUD.SFX.bossDown();AUD.SFX.fart(3,1);addScore(1500,b.x,GY()-260,'#ffe14d');confetti(60);bossSay(['MY WHISTLE IS FULL OF POOP!','THAT\'S NOT MY SECRET SAUCE!','IT SMELLS LIKE A PORTA POTTY!','TOO. MUCH. POOP.','MY HOT DOGS!'][lv])}}
// ---------- poop ----------
function dropPoop(){const ch=chiliT>0;poops.push({x:gull.x-6+(ch?rr(-8,8):0),y:gull.y+14,vx:gull.vx*0.3+(ch?rr(-40,40):0),vy:80,small:ch});gull.cd=ch?0.07:hangry?0.5:0.2;poopN++;
  if(ch){if(T>=fartT){AUD.SFX.fart([6,8,6,5]);fartT=T+0.4}}else{AUD.SFX.plop();if(R()<0.18)AUD.SFX.fart([2,0,4,10]);if(poopN===1||R()<0.05)say(pick(['bombs','bombs','splat']),1)}}
function dropMega(){megaC--;WV.megas++;RUN.megas++;poops.push({x:gull.x-6,y:gull.y+20,vx:gull.vx*0.25,vy:40,mega:1});AUD.SFX.fart(1,1);say('mega',3);float('MEGA DUMP!',gull.x,gull.y-50,'#ffd23f')}
function megaBoom(x){const g=GY(),R0=120;shake=16;AUD.SFX.mega();AUD.SFX.fart(3,1);burst(x,g-20,40,['#8b5a2b','#5a3517','#c8925a','#6d4520'],420,8);
  for(const p of people)if(!p.splat&&Math.abs(p.x-x)<R0)splatPerson(p,{x:p.x,y:g-60},1);for(const c of cars)if(Math.abs(c.x-x)<R0+40&&c.splats.length<4){c.splats.push(-20,10,30);if(c.dad)dadRuined(c.dad,1)}
  for(const u of umbs)if(Math.abs(u.x-x)<R0){u.gone=1}for(const d of dogs)if(Math.abs(d.x-x)<R0){d.splat=1;d.life=0}
  if(boss&&boss.st==='fight'&&Math.abs(boss.x-x)<R0+90)bossHit({x:boss.x-20,y:g-160},10);for(let i=0;i<6;i++)decals.push({x:x+rr(-R0,R0),y:g+rr(6,26)})}
// ---------- main update ----------
function update(dt){T+=dt;stT+=dt;if(banner){banner.t+=dt;if(banner.t>2.6)banner=null}
  for(const p of parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.conf){p.vy=Math.min(p.vy+60*dt,160);p.vx+=Math.sin(T*3+p.rot)*20*dt;p.rot+=dt*4}else{p.vx*=0.94;p.vy*=0.94}}parts=parts.filter(p=>p.t<p.life);
  for(const f of floats){f.t+=dt;f.y-=40*dt}floats=floats.filter(f=>f.t<1.2);
  for(const t of debris){t.t+=dt;t.vy+=700*dt;t.x+=(t.vx-spd)*dt;t.y+=t.vy*dt;t.rot+=t.vr*dt}debris=debris.filter(t=>t.y<GY()+30&&t.t<3);
  if(state==='title'||state==='win'){scroll+=40*dt;return}
  if(state!=='play'||paused){gull.flap+=dt*8;if(state==='card'||state==='stats')scroll+=30*dt;if(state==='stats'&&stT>7)nextFromStats();return}
  runTime+=dt;waveT+=dt;shake=Math.max(0,shake-dt*30);
  spd=boss?45:(120+Math.min(D(),14)*10+wave*10);scroll+=spd*dt;
  // fry meter: keep stealing or get HANGRY (slow + slow poops)
  fryM=Math.max(0,fryM-dt*(diff?5:3.6)*(boss?0.5:1));if(fryM<=0&&!hangry){hangry=1;say('hangry',2);float('HANGRY!',gull.x,gull.y-50,'#ff5252')}
  // gull: velocity follows the stick with light inertia (snappy, no lag)
  let ix=0,iy=0;if(DEBUG&&bot.on){ix=bot.vx;iy=bot.vy}else{const m=Math.hypot(joy.dx,joy.dy);if(m>0.1){ix=joy.dx;iy=joy.dy}ix+=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0);iy+=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0);const mm=Math.hypot(ix,iy);if(mm>1){ix/=mm;iy/=mm}}
  const GS=430*(hangry?0.55:1),ka=Math.min(1,dt*16);gull.vx+=(ix*GS-gull.vx)*ka;
  if(swoopQ){swoopQ=0;if(gull.sw<=0&&gull.swCD<=0){gull.sw=0.56;gull.swCD=0.9;AUD.SFX.whoosh();if(R()<0.6)AUD.SFX.fart([7,4])}}
  if(gull.sw>0){gull.sw-=dt;gull.vy=gull.sw>0.28?900:-640}else gull.vy+=(iy*GS-gull.vy)*ka;gull.swCD-=dt;
  gull.x+=gull.vx*dt;gull.y+=gull.vy*dt;if(gull.x<XMIN()){gull.x=XMIN();gull.vx=Math.max(0,gull.vx)}if(gull.x>XMAX()){gull.x=XMAX();gull.vx=Math.min(0,gull.vx)}
  if(gull.y<YMIN()){gull.y=YMIN();gull.vy=Math.max(0,gull.vy)}if(gull.y>YMAX()){gull.y=YMAX();gull.vy=Math.min(0,gull.vy)}
  gull.flap+=dt*(10+Math.max(0,-gull.vy)*0.03);gull.tilt=clamp(gull.vy*0.0011,-0.45,0.45);gull.inv=Math.max(0,gull.inv-dt);gull.carry=Math.max(0,gull.carry-dt);gull.munch=Math.max(0,gull.munch-dt);gull.cd-=dt;
  comboT-=dt;if(comboT<=0)combo=0;chiliT=Math.max(0,chiliT-dt);
  if(megaQ){megaQ=0;if(megaC>0)dropMega()}
  const wantPoop=poopTap||poopHeld>0||chiliT>0||(DEBUG&&bot.on&&bot.poop);poopTap=0;if(wantPoop&&gull.cd<=0)dropPoop();
  // waves
  if(wave<2){if(waveT<WAVELEN-3&&(spawnT-=dt)<=0){spawn();spawnT=Math.max(0.55,rr(1.1,1.8)-D()*0.09-wave*0.15)}
    if((dogT-=dt)<=0){dogs.push({x:W+40,vx:-120,h:0,vh:0,life:rr(9,13),splat:0});dogT=rr(12,18)/(1+D()*0.1);say('dog',2)}
    if(!diff&&hearts<=2&&(heartT-=dt)<=0){shots.push({k:'heart',x:W+20,y:rr(YMIN()+30,YMAX()-60),vx:-90,vy:0,g:0,r:14,good:1,life:9});heartT=rr(40,55)}
    if(waveT>=WAVELEN&&people.every(p=>p.x<W*0.2||p.run))waveEnd()}
  else if(boss)updBoss(dt);
  if(state!=='play')return;
  // people
  const g=GY(),grab=gull.sw>0?62:40;
  for(const p of people){if(p.run){p.vx=p.dir*180;p.walk=1}p.x+=(-spd+p.vx)*dt;p.sayT-=dt;if(p.mood==='mad'&&!p.run&&p.k!=='sun'&&p.k!=='kidl')p.arm=-2.4+Math.sin(T*18)*0.35;
    if(p.spit&&R()<0.3)burst(p.x-8,g-70,1,['#b3e5fc'],80,2);
    if(!p.run&&!p.splat&&p.x>W*0.15&&p.x<W-10){const sx=p.x+12,sy=g-60;
      if(p.k==='kid'&&(p.cd-=dt)<=0){shoot('balloon',p.x,sy,lobL(p.x,sy,rr(0.8,1.0),500,25),{g:500,r:9,c:pick(['#4fc3f7','#ff80ab','#b2ff59'])});p.cd=Math.max(1.2,rr(2.1,2.9)-D()*0.1)}
      if(p.k==='guard'&&(p.cd-=dt)<=0){const n=D()>=3?5:3;fan('water',sx,g-52,n,0.35+n*0.05,330,{r:6});AUD.SFX.puff();p.cd=Math.max(1.4,rr(2.2,2.8)-D()*0.1)}
      if(p.k==='bro'&&(p.cd-=dt)<=0){const a=aimA(sx,sy,300);shoot('frisbee',sx,sy,{vx:Math.cos(a)*300*SPM(),vy:Math.sin(a)*300*SPM()},{r:13,ax:-Math.cos(a)*280,ay:-Math.sin(a)*280,life:3});p.cd=Math.max(1.8,rr(2.6,3.2)-D()*0.1)}}
    if(p.fries&&Math.hypot(gull.x+40-(p.x+12),gull.y-(g-46))<grab)stealFries(p)}
  people=people.filter(p=>p.x>-80&&p.x<W+220);
  for(const u of umbs)u.x-=spd*dt;umbs=umbs.filter(u=>u.x>-80&&!u.gone);for(const c of cars)c.x-=spd*dt;cars=cars.filter(c=>c.x>-90);
  for(const d of dogs){d.life-=dt;const dx=gull.x-d.x;if(d.life<0)d.vx=-280;else if(!d.splat)d.vx=clamp(dx*1.8,-200,200)-spd*0.2;d.x+=d.vx*dt;
    if(d.h<=0&&!d.splat&&d.life>0&&Math.abs(dx)<90&&gull.y>g-210){d.vh=600;AUD.SFX.boing()}d.vh-=1300*dt;d.h=Math.max(0,d.h+d.vh*dt);
    if(Math.hypot(gull.x-(d.x-20),gull.y-(g-d.h-26))<34)hurt()}
  dogs=dogs.filter(d=>d.x>-80&&d.x<W+120);
  // poop physics
  for(const po of poops){po.vy+=1100*dt;po.x+=po.vx*dt;po.y+=po.vy*dt;
    if(po.mega){if(po.y>g-10){po.dead=1;megaBoom(po.x)}continue}
    for(const u of umbs){if(Math.abs(po.x-u.x)<u.r&&po.y>g-u.h-u.r*0.45&&po.y<g-u.h+6){po.dead=1;if(u.splats.length<4)u.splats.push(po.x-u.x);AUD.SFX.pop();if(R()<0.4)float('BLOCKED!',u.x,g-u.h-50,'#b3e5fc');break}}if(po.dead)continue;
    for(const c of cars){if(Math.abs(po.x-c.x)<56&&po.y>g-48&&po.y<g-10){po.dead=1;if(c.splats.length<5)c.splats.push(po.x-c.x);AUD.SFX.wet();if(c.dad&&!c.hit){c.hit=1;dadRuined(c.dad,1)}else addScore(10,po.x,g-60);break}}if(po.dead)continue;
    for(const p of people){if(p.splat)continue;const kid=p.k==='kid'||p.k==='kidl',lying=p.k==='sun'&&!p.up,hw=lying?38:(p.k==='buff'?22:16),top=lying?g-24:g-(kid?70:92);if(Math.abs(po.x-p.x)<hw&&po.y>top&&po.y<g){po.dead=1;splatPerson(p,po);break}}if(po.dead)continue;
    for(const d of dogs){if(!d.splat&&Math.abs(po.x-d.x)<24&&po.y>g-d.h-40&&po.y<g-d.h){po.dead=1;d.splat=1;d.life=0;addScore(25,d.x,g-80);float('WOOF?!',d.x,g-110,'#ffd23f');AUD.SFX.splat()}}if(po.dead)continue;
    if(boss&&boss.st==='fight'){for(const r of BOSS[boss.k].rects(boss))if(po.x>r[0]&&po.x<r[0]+r[2]&&po.y>r[1]&&po.y<r[1]+r[3]){po.dead=1;bossHit(po,1);break}}if(po.dead)continue;
    if(po.y>g+4){po.dead=1;if(decals.length>40)decals.shift();decals.push({x:po.x,y:g+rr(6,22)})}}
  poops=poops.filter(p=>!p.dead);for(const d of decals)d.x-=spd*dt;decals=decals.filter(d=>d.x>-20);
  // shots (hazards + goodies)
  for(const s of shots){s.vy+=(s.g||0)*dt;if(s.ax){s.vx+=s.ax*dt;s.vy+=s.ay*dt}s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.bounce&&s.y>g-12){s.y=g-12;s.vy=-s.bounce*(Math.abs(s.x-gull.x)<120?1:0.4)}
    const dd=Math.hypot(s.x-gull.x-8,s.y-gull.y);
    if(s.good){if(dd<s.r+30){s.dead=1;if(s.k==='heart'){hearts=Math.min(maxH(),hearts+1);AUD.SFX.heart();float('+1 ♥',s.x,s.y,'#ff8fab')}else{gull.munch=0.5;gull.carry=0.6;addScore(25,s.x,s.y,'#ffd23f');AUD.SFX.munch();if(R()<0.35)AUD.SFX.fart([2,10]);eatFry(1,s.chili)}}}
    else if(dd<s.r+16){s.dead=1;burst(s.x,s.y,8,[s.k==='ketchup'?'#d32f2f':s.k==='mustard'?'#fbc02d':'#4fc3f7','#fff'],120,4);hurt()}
    if((!s.bounce&&s.y>g+20)||s.x<-60||s.x>W+80||s.y<-80||s.life<=0)s.dead=1}
  shots=shots.filter(s=>!s.dead);
  if(score>best&&(bestT-=dt)<=0){bestT=2;best=score;LS.set('best'+diff,best)}}
