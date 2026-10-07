// ================= levels (Michigan beaches) + pre-rendered parallax backdrops =================
const LEVELS=[
 {n:'Grand Haven Beach',sub:'Pier, red lighthouse & lots of fries',th:'haven',sky:['#5ec4ff','#d9f4ff'],lake:'#2f9fe0',sand:'#f3d9a0',sand2:'#e8c987'},
 {n:'Holland State Park',sub:'Say hi to Big Red!',th:'holland',sky:['#6ccaff','#e3f7ff'],lake:'#2b95d6',sand:'#f1d59a',sand2:'#e4c483'},
 {n:'Sleeping Bear Dunes',sub:'The biggest sand piles ever',th:'dunes',sky:['#7fd0ff','#fff1d6'],lake:'#23a0c8',sand:'#f0d29a',sand2:'#e2c084'},
 {n:'Belle Isle Beach',sub:'Detroit skyline & the Giant Slide',th:'belle',sky:['#ffaa72','#ffe6b8'],lake:'#3a86c8',sand:'#ecd09a',sand2:'#dcbd84'},
 {n:'Pictured Rocks',sub:'Rainbow cliffs up in the U.P.',th:'rocks',sky:['#68c0f0','#e8f6ff'],lake:'#1fb0b8',sand:'#efd7a6',sand2:'#e0c48e'}];
function hills(w,h,y0,amp,k,c,ph){X.beginPath();X.moveTo(0,h);for(let x=0;x<=w;x+=8)X.lineTo(x,y0-amp*(0.6*Math.sin(TAU*k*x/w+ph)+0.4*Math.sin(TAU*(k*2+1)*x/w+ph*2)));X.lineTo(w,h);X.closePath();X.fillStyle=c;X.fill()}
function pine(x,y,s,c){X.fillStyle='#5b3b22';X.fillRect(x-3*s,y-14*s,6*s,14*s);for(let i=0;i<3;i++)poly([x,y-(70-i*18)*s,x-(18+i*7)*s,y-(30-i*12)*s-12*s,x+(18+i*7)*s,y-(30-i*12)*s-12*s],c)}
function lakeBand(w,h,top,c){X.fillStyle=c;X.fillRect(0,top,w,h-top);X.fillStyle='rgba(255,255,255,0.45)';for(let i=0;i<60;i++)X.fillRect((i*137)%w,top+6+(i*29)%Math.max(8,h-top-10),22+(i%3)*8,2)}
function farArt(L,w,h){const th=L.th;
  if(th==='dunes'){hills(w,h,h-150,60,2,'#e9c88a',0.4);hills(w,h,h-110,40,3,'#dcb676',1.3);for(let i=0;i<30;i++){const x=(i*97)%w;X.fillStyle='#7cb342';X.fillRect(x,h-118-((i*13)%40),3,12)}}
  else if(th==='belle'){const B=[[200,110,50],[260,170,44],[310,130,60],[380,150,46],[700,120,56],[760,180,40],[810,140,64],[1000,130,50]];for(const [bx,bh,bw] of B){X.fillStyle='#8a7aa8';X.fillRect(bx,h-60-bh,bw,bh)}
    const rc=(cx,top,rw)=>{X.fillStyle='#7b9dc2';X.fillRect(cx-rw/2,h-60-top,rw,top);ell(cx,h-60-top,rw/2,5,'#7b9dc2')};rc(520,150,34);rc(600,150,34);rc(545,170,36);rc(575,170,36);rc(560,230,48)}
  else if(th==='rocks'){// striped sandstone cliffs on the far shore
    X.beginPath();X.moveTo(0,h-60);for(let x=0;x<=w;x+=40)X.lineTo(x,h-170-30*Math.sin(TAU*x/w*3));X.lineTo(w,h-60);X.closePath();X.fillStyle='#d98c4a';X.fill();
    const C=['#b5562c','#7a9a5a','#e7b46a','#8c5a3c','#5f8a8a'];for(let i=0;i<70;i++){X.fillStyle=C[i%5];X.fillRect((i*53)%w,h-160+(i*7)%40,8+(i%4)*4,90)}
    for(let i=0;i<32;i++)pine((i+0.5)*w/32,h-180-30*Math.sin(TAU*((i+0.5)/32)*3)+12,1,'#2e6b45')}
  else hills(w,h,h-80,14,3,'#9ccc8a',0.8);
  lakeBand(w,h,h-62,L.lake)}
function lighthouse(x,g,s,c){X.fillStyle=c;X.beginPath();X.moveTo(x-16*s,g);X.lineTo(x-11*s,g-110*s);X.lineTo(x+11*s,g-110*s);X.lineTo(x+16*s,g);X.closePath();X.fill();X.fillStyle='#333';X.fillRect(x-14*s,g-126*s,28*s,16*s);circ(x,g-120*s,6*s,'#fff59d');poly([x-16*s,g-126*s,x,g-142*s,x+16*s,g-126*s],c);X.fillStyle='rgba(255,255,255,0.25)';X.fillRect(x-6*s,g-108*s,4*s,104*s)}
function midArt(L,w,h){const th=L.th,g=h;lakeBand(w,h,g-46,L.lake);
  if(th==='haven'){// Grand Haven pier + red lighthouses + catwalk
    X.fillStyle='#9e9e9e';X.fillRect(560,g-58,560,14);X.fillStyle='#c62828';for(let x=580;x<1080;x+=40)X.fillRect(x,g-110,4,52);X.fillRect(570,g-112,500,5);
    lighthouse(1090,g-58,1,'#d32f2f');X.fillStyle='#d32f2f';X.fillRect(700,g-118,70,60);poly([694,g-118,735,g-150,776,g-118],'#d32f2f');X.fillStyle='#333';X.fillRect(722,g-160,26,14)}
  else if(th==='holland'){// "Big Red": red house-shaped lighthouse on the channel
    X.fillStyle='#9e9e9e';X.fillRect(640,g-56,300,12);const x=780;X.fillStyle='#e53935';X.fillRect(x-60,g-150,120,94);poly([x-70,g-150,x,g-200,x+70,g-150],'#c62828');X.fillStyle='#e53935';X.fillRect(x-20,g-238,40,60);X.fillStyle='#333';X.fillRect(x-24,g-258,48,22);circ(x,g-248,8,'#fff59d');poly([x-26,g-258,x,g-276,x+26,g-258],'#c62828');
    for(let i=0;i<3;i++){X.fillStyle='#fff';X.fillRect(x-48+i*36,g-130,18,24)}X.fillStyle='#fff';X.fillRect(x-62,g-152,124,4)}
  else if(th==='dunes'){hills(w,h,g-70,30,2,'#e6c283',2.2);for(let i=0;i<40;i++){const x=(i*61)%w;X.strokeStyle='#689f38';X.lineWidth=2;X.beginPath();X.moveTo(x,g-60);X.lineTo(x-6,g-78);X.moveTo(x+3,g-60);X.lineTo(x+6,g-80);X.stroke()}
    X.fillStyle='#8d6e63';X.fillRect(300,g-120,6,70);rrect(270,g-150,70,34,6);X.fillStyle='#6d4c41';X.fill();txt('DUNE',305,g-139,11,'#fff8e1');txt('CLIMB',305,g-125,11,'#fff8e1')}
  else if(th==='belle'){// the Giant Slide (yellow/orange humps)
    const x=700;X.fillStyle='#6d4c41';X.fillRect(x-80,g-200,18,160);X.beginPath();X.moveTo(x-70,g-200);X.quadraticCurveTo(x,g-200,x+20,g-130);X.quadraticCurveTo(x+40,g-90,x+70,g-130);X.quadraticCurveTo(x+100,g-160,x+130,g-90);X.quadraticCurveTo(x+160,g-40,x+220,g-48);
    X.lineWidth=18;X.strokeStyle='#ffb300';X.lineCap='round';X.stroke();X.lineWidth=6;X.strokeStyle='#ff7043';X.stroke();txt('GIANT SLIDE',x-20,g-216,13,'#fff',{st:'#6d4c41',sw:4})}
  else {// Pictured Rocks arch right at the water
    X.fillStyle='#c97a3c';X.beginPath();X.moveTo(620,g-46);X.lineTo(640,g-220);X.lineTo(860,g-230);X.lineTo(880,g-46);X.lineTo(820,g-46);X.quadraticCurveTo(750,g-170,690,g-46);X.closePath();X.fill();
    const C=['#a3502a','#6f9a5a','#e8b66c','#7d4f35'];for(let i=0;i<16;i++){X.fillStyle=C[i%4];X.fillRect(640+i*14,g-210,6,60+(i%3)*30)}for(let i=0;i<6;i++)pine(650+i*40,g-218,1.1,'#2e6b45')}
  // a few beach umbrellas & a lifeguard stand far back for flavor
  for(const [ux,uc] of [[120,'#ff5d8f'],[380,'#ffd23f'],[1180,'#4fc3f7']]){X.fillStyle='#777';X.fillRect(ux-1,g-36,2,36);X.beginPath();X.arc(ux,g-34,22,Math.PI,TAU);X.fillStyle=uc;X.fill()}}
let BG=null;
function buildBG(lv){const L=LEVELS[lv],TW=Math.max(1280,Math.ceil(W/80)*80),k=clamp((H-TOP-BOT)/640,1,1.4),fh=300,mh=300;
  const mk=(h,fn)=>{const c=document.createElement('canvas');c.width=Math.ceil(TW*k*RS);c.height=Math.ceil(h*k*RS);const x=c.getContext('2d');x.scale(RS*k,RS*k);const keep=X;X=x;try{fn(TW,h)}finally{X=keep}return c};
  BG={lv,g:genCache,TW:TW*k,k,fh:fh*k,mh:mh*k,far:mk(fh,(w,h)=>{farArt(L,w,h);X.globalCompositeOperation='source-atop';X.fillStyle='rgba(220,240,255,0.35)';X.fillRect(0,0,w,h);X.globalCompositeOperation='source-over'}),mid:mk(mh,(w,h)=>midArt(L,w,h)),sky:null,skyH:0}}
function ensureBG(lv){if(!BG||BG.lv!==lv||BG.g!==genCache||BG.H!==H){buildBG(lv);BG.H=H}}
function drawTile(c,par,y,h){const TW=BG.TW,off=((scroll*par)%TW+TW)%TW;X.drawImage(c,-off,y,TW,h);if(TW-off<W)X.drawImage(c,TW-off,y,TW,h)}
const SANDTOP=()=>GY()-44;
function drawBackdrop(lv){ensureBG(lv);const L=LEVELS[lv],g=SANDTOP();
  if(!BG.sky||BG.skyH!==H){const gr=X.createLinearGradient(0,0,0,g);gr.addColorStop(0,L.sky[0]);gr.addColorStop(1,L.sky[1]);BG.sky=gr;BG.skyH=H}
  X.fillStyle=BG.sky;X.fillRect(0,0,W,g+2);
  blit(spr('sun'+lv,90,90,()=>{circ(0,0,42,'rgba(255,240,150,0.35)');circ(0,0,30,lv===3?'#ffb74d':'#ffe066')}),W-70,TOP+150);
  const cl=spr('cloud',150,64,()=>{X.globalAlpha=0.92;ell(0,10,64,20,'#fff');circ(-30,0,24,'#fff');circ(4,-10,30,'#fff');circ(38,2,20,'#fff');X.globalAlpha=1});
  for(let i=0;i<4;i++){const cx=((i*330-scroll*0.08)%(W+300)+W+300)%(W+300)-150,cy=TOP+120+((i*97)%Math.max(60,(g-BG.mh-TOP-200)))+i*30;blit(cl,cx,cy,0.7+(i%3)*0.2)}
  drawTile(BG.far,0.15,g+14-46*BG.k-BG.fh,BG.fh);
  drawTile(BG.mid,0.4,g-BG.mh+2,BG.mh);
  // sand (scrolls 1:1) with a lapping foam line
  X.fillStyle=L.sand;X.fillRect(0,g,W,H-g);X.fillStyle=L.sand2;const o=((scroll%70)+70)%70;for(let x=-o;x<W;x+=70){X.fillRect(x,g+30,6,3);X.fillRect(x+35,g+70,5,3);X.fillRect(x+20,g+110,6,3)}
  X.fillStyle='rgba(255,255,255,0.85)';X.beginPath();X.moveTo(0,g);for(let x=0;x<=W;x+=20)X.lineTo(x,g+4+3*Math.sin(x*0.05+T*2.5));X.lineTo(W,g);X.closePath();X.fill()}
