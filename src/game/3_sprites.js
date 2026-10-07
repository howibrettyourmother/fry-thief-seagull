// ================= sprites: the gull, beachgoers, hazards, bosses (all vector, cached where static) =================
function strokeL(w,c){X.lineWidth=w;X.strokeStyle=c;X.lineCap='round';X.lineJoin='round';X.stroke()}
function fryCone(x,y,s){s=s||1;X.save();X.translate(x,y);X.scale(s,s);const fc=['#ffd54f','#ffca28','#ffe082'];for(let i=0;i<6;i++){X.save();X.rotate((i-2.5)*0.13);X.fillStyle=fc[i%3];X.fillRect(-2.5,-20,5,18);X.restore()}
  X.beginPath();X.moveTo(-10,-6);X.lineTo(10,-6);X.lineTo(7,10);X.lineTo(-7,10);X.closePath();X.fillStyle='#e53935';X.fill();X.fillStyle='#fff';X.fillRect(-3,-6,6,16);X.restore()}
// ---- the hero: a goofy seagull with big eyes. facing right.
function drawGull(x,y,o){const fl=Math.sin(o.flap),tilt=o.tilt||0;X.save();X.translate(x,y);X.rotate(tilt);
  if(o.inv&&((T*14)|0)%2)X.globalAlpha=0.45;
  // back wing
  X.save();X.rotate(-0.2-fl*0.6);ell(-6,-6,30,9,'#b0bec5',-0.3);ell(-28,-10,8,5,'#37474f',-0.3);X.restore();
  ell(0,4,26,15,'#fff');ell(-22,2,10,6,'#eceff1',0.4);poly([-30,0,-44,-6,-42,8],'#fff');poly([-40,-4,-46,-6,-44,4],'#37474f');
  ell(4,12,15,7,'#f5f5f5');
  // head
  circ(22,-6,13,'#fff');ell(22,1,9,4,'rgba(0,0,0,0.04)');
  circ(25,-10,6,'#fff');X.lineWidth=1.5;X.strokeStyle='#333';X.beginPath();X.arc(25,-10,6,0,TAU);X.stroke();circ(26.5,-10,3,'#222');circ(27.5,-11.2,1.1,'#fff');
  X.beginPath();X.moveTo(19,-17);X.lineTo(30,-15);strokeL(2.4,'#555');
  // beak (open when munching)
  const op=o.munch>0?Math.abs(Math.sin(T*30))*5:0;poly([31,-6,48,-4+op*0.2,31,-1],'#ffb300');poly([31,-1,46,-1+op,31,3+op*0.5],'#ff8f00');circ(44,-3,1.6,'#e53935');
  if(o.carry){X.save();X.translate(46,-1);X.rotate(0.5);X.fillStyle='#ffd54f';X.fillRect(-2,-3,16,5);X.fillRect(2,1,13,4);X.restore()}
  // feet
  X.beginPath();X.moveTo(-4,17);X.lineTo(-10,24);X.moveTo(4,17);X.lineTo(0,25);strokeL(3,'#ff8f00');
  // front wing
  X.save();X.translate(-2,0);X.rotate(-0.1-fl*0.85);ell(-10,-4,32,10,'#cfd8dc',-0.25);ell(-36,-10,9,6,'#37474f',-0.25);X.beginPath();X.ellipse(-10,-4,32,10,-0.25,0,TAU);strokeL(1.5,'#90a4ae');X.restore();
  X.restore()}
// ---- beachgoers. p={k,x,skin,shirt,hair,mood,splat,run,arm}
const SKINS=['#f6d0b1','#e0ac69','#c68642','#8d5524','#ffdbac'],SHIRTS=['#ff5d8f','#4fc3f7','#ffd23f','#7cb342','#ab47bc','#ff7043','#26a69a'],HAIRS=['#3e2723','#ffca28','#6d4c41','#212121','#d84315'];
function face(x,y,r,mood){circ(x-r*0.35,y-r*0.1,r*0.13,'#222');circ(x+r*0.35,y-r*0.1,r*0.13,'#222');
  X.beginPath();if(mood==='mad'){X.moveTo(x-r*0.55,y-r*0.5);X.lineTo(x-r*0.15,y-r*0.3);X.moveTo(x+r*0.55,y-r*0.5);X.lineTo(x+r*0.15,y-r*0.3);strokeL(2,'#222');X.beginPath();X.arc(x,y+r*0.5,r*0.25,Math.PI*1.1,Math.PI*1.9);strokeL(2,'#222')}
  else if(mood==='shock'){ell(x,y+r*0.4,r*0.18,r*0.25,'#5d2a1a')}
  else{X.arc(x,y+r*0.15,r*0.35,0.2,Math.PI-0.2);strokeL(2,'#222')}}
function splatOn(x,y,s){X.save();X.translate(x,y);X.scale(s,s);ell(0,0,10,5,'#fff');circ(-7,3,3,'#fff');circ(6,4,3.4,'#fff');X.fillStyle='#fff';X.fillRect(-2,0,3,9);circ(-0.5,9,2.4,'#fff');circ(2,-2,2,'#e0e0e0');X.restore()}
function drawPerson(p){const g=GY(),x=p.x,kid=p.k==='kid',s=kid?0.72:1,bob=p.run?Math.abs(Math.sin(T*16))*4:(p.walk?Math.abs(Math.sin(T*8+p.x*0.01))*2:0);
  X.save();X.translate(x,g);if(p.dir<0)X.scale(-1,1);ell(0,2,22*s,5,'rgba(0,0,0,0.15)');
  if(p.k==='sun'&&!p.up){// lying on a towel
    X.fillStyle=p.towel;rrect(-40,-6,80,10,3);X.fill();X.fillStyle='rgba(255,255,255,0.6)';for(let i=-34;i<36;i+=12)X.fillRect(i,-6,5,10);
    ell(-2,-12,24,8,p.shirt);ell(18,-12,10,5,p.skin);circ(-30,-14,9,p.skin);X.beginPath();X.arc(-30,-16,9,Math.PI,TAU);X.fillStyle=p.hair;X.fill();
    X.fillStyle='#222';X.fillRect(-36,-17,12,3);if(p.splat)splatOn(-4,-20,1);X.restore();return}
  const legSw=(p.walk||p.run)?Math.sin(T*(p.run?18:8)+p.x*0.01)*8:0,y0=-bob;
  X.beginPath();X.moveTo(-5*s,y0-28*s);X.lineTo(-5*s+legSw*s,y0);X.moveTo(5*s,y0-28*s);X.lineTo(5*s-legSw*s,y0);strokeL(6*s,p.skin);
  X.fillStyle=p.k==='guard'?'#e53935':p.shorts;rrect(-11*s,y0-36*s,22*s,13*s,4*s);X.fill();
  X.fillStyle=p.k==='guard'?'#e53935':p.shirt;rrect(-12*s,y0-62*s,24*s,28*s,8*s);X.fill();if(p.k==='guard'){txt('+',0,y0-50*s,14*s,'#fff')}
  // arms
  const ang=p.arm||0;X.beginPath();X.moveTo(-10*s,y0-56*s);X.lineTo(-18*s,y0-40*s);strokeL(5*s,p.skin);
  X.save();X.translate(10*s,y0-56*s);X.rotate(ang);X.beginPath();X.moveTo(0,0);X.lineTo(10*s,14*s);strokeL(5*s,p.skin);
  if(p.k==='fry'&&p.fries)fryCone(12*s,12*s,0.9);if(p.mood==='mad'&&!p.run)circ(10*s,15*s,4*s,p.skin);
  if(p.k==='kid'&&!p.run&&p.cd<0.6)circ(12*s,16*s,6,'#4fc3f7');
  if(p.k==='guard'&&!p.run){X.fillStyle='#ffb300';X.fillRect(6*s,10*s,18,7);X.fillStyle='#29b6f6';X.fillRect(20*s,8*s,6,4)}
  X.restore();
  circ(0,y0-72*s,12*s,p.skin);X.beginPath();X.arc(0,y0-74*s,12.5*s,Math.PI*1.05,TAU*0.99);X.fillStyle=p.hair;X.fill();
  if(p.hat){X.fillStyle=p.hat;ell(0,y0-82*s,16*s,4*s,p.hat);X.beginPath();X.arc(0,y0-82*s,9*s,Math.PI,TAU);X.fill()}
  if(p.k==='guard'){X.fillStyle='#222';X.fillRect(-9*s,y0-77*s,18*s,4*s)}
  face(2*s,y0-71*s,11*s,p.mood);if(p.splat)splatOn(0,y0-84*s,s);
  X.restore();
  if(p.say&&p.sayT>0){const bx=x,by=g-(kid?80:104)-Math.min(8,(1.6-p.sayT)*30);X.globalAlpha=Math.min(1,p.sayT*3);X.font='900 18px '+FONT;const w=X.measureText(p.say).width+18;
    X.fillStyle='#fff';rrect(bx-w/2,by-15,w,30,12);X.fill();X.lineWidth=2.5;X.strokeStyle='#333';X.stroke();poly([bx-6,by+14,bx+6,by+14,bx-2,by+24],'#fff');txt(p.say,bx,by+1,18,'#e53935');X.globalAlpha=1}}
function drawUmbrella(u){const g=GY(),x=u.x,y=g-u.h;X.fillStyle='#8d6e63';X.fillRect(x-2,y,4,u.h);
  X.beginPath();X.moveTo(x-u.r,y+4);X.quadraticCurveTo(x,y-u.r*0.9,x+u.r,y+4);X.closePath();X.fillStyle=u.c;X.fill();
  X.save();X.clip();X.fillStyle='rgba(255,255,255,0.75)';for(let i=-3;i<=3;i+=2){X.beginPath();X.moveTo(x,y-u.r*0.5);X.lineTo(x+i*u.r/3.5-u.r/7,y+6);X.lineTo(x+i*u.r/3.5+u.r/7,y+6);X.closePath();X.fill()}X.restore();
  circ(x,y-u.r*0.47,3,'#8d6e63');for(const s of u.splats)splatOn(x+s,y-u.r*0.25-Math.abs(s)*-0.1-8,0.7)}
function drawDog(d){const g=GY()-d.h;X.save();X.translate(d.x,g);if(d.vx>0)X.scale(-1,1);const r=Math.sin(T*20)*5;
  ell(0,2+d.h,18,4,'rgba(0,0,0,0.15)');X.beginPath();X.moveTo(-12,-12);X.lineTo(-12+r,0);X.moveTo(12,-12);X.lineTo(12-r,0);strokeL(4,'#a1662f');
  ell(0,-16,18,10,'#c68642');circ(-18,-26,10,'#c68642');ell(-20,-32,4,8,'#8d5524',0.4);circ(-21,-28,2,'#222');circ(-28,-24,3,'#222');
  X.beginPath();X.moveTo(17,-20);X.quadraticCurveTo(26,-34+r,30,-30);strokeL(4,'#c68642');if(d.h>2){ell(-27,-18,4,6,'#ff5d8f')}
  if(d.splat)splatOn(0,-26,0.8);X.restore()}
function drawShot(s){const k=s.k;
  if(k==='water'){circ(s.x,s.y,s.r,'#4fc3f7');circ(s.x-2,s.y-2,s.r*0.35,'#e1f5fe')}
  else if(k==='balloon'){X.save();X.translate(s.x,s.y);X.rotate(s.vx*0.002);ell(0,0,s.r*0.9,s.r,s.c||'#4fc3f7');circ(-3,-4,3,'rgba(255,255,255,0.6)');poly([-2,s.r,2,s.r,0,s.r+4],s.c||'#4fc3f7');X.restore()}
  else if(k==='ketchup'){circ(s.x,s.y,s.r,'#d32f2f');circ(s.x-3,s.y-3,s.r*0.3,'#ff8a80')}
  else if(k==='mustard'){circ(s.x,s.y,s.r,'#fbc02d');circ(s.x-3,s.y-3,s.r*0.3,'#fff59d')}
  else if(k==='bucket'){X.save();X.translate(s.x,s.y);X.rotate(T*6);X.fillStyle=s.c||'#ff7043';X.beginPath();X.moveTo(-10,-10);X.lineTo(10,-10);X.lineTo(7,10);X.lineTo(-7,10);X.closePath();X.fill();X.fillStyle='#f3d9a0';X.fillRect(-10,-13,20,4);X.restore()}
  else if(k==='ball'){X.save();X.translate(s.x,s.y);X.rotate(T*5);const C=['#e53935','#fff','#1e88e5','#fff','#fdd835','#fff'];for(let i=0;i<6;i++){X.beginPath();X.moveTo(0,0);X.arc(0,0,s.r,i*TAU/6,(i+1)*TAU/6);X.closePath();X.fillStyle=C[i];X.fill()}X.restore()}
  else if(k==='hotdog'){X.save();X.translate(s.x,s.y);X.rotate(Math.atan2(s.vy,s.vx));ell(0,0,16,7,'#ffcc80');ell(0,-1,18,4.5,'#c0392b');X.beginPath();X.moveTo(-12,-2);for(let i=-12;i<=12;i+=4)X.lineTo(i,-2+(i%8?2:-2));strokeL(2,'#fbc02d');X.restore()}
  else if(k==='fry'){X.save();X.translate(s.x,s.y);X.rotate(T*4);X.fillStyle='#ffd54f';X.fillRect(-9,-2.5,18,5);X.strokeStyle='#e0a800';X.lineWidth=1;X.strokeRect(-9,-2.5,18,5);X.restore()}
  else if(k==='heart'){X.save();X.translate(s.x,s.y+Math.sin(T*3)*3);X.fillStyle='#ff4d6d';heartP(0,0,13);X.fill();X.lineWidth=2;X.strokeStyle='#fff';X.stroke();X.restore();X.beginPath();X.moveTo(s.x,s.y+12);X.lineTo(s.x,s.y+30);strokeL(1.5,'#fff')}
  else if(k==='ring'){X.beginPath();X.arc(s.x,s.y,s.r,0,TAU);strokeL(5,'rgba(255,255,255,0.85)')}}
function drawPoop(p){ell(p.x,p.y,5,6.5,'#fff');circ(p.x-1.5,p.y-2,1.6,'#e0e0e0');circ(p.x+1,p.y+3,1.4,'#bdbdbd')}
