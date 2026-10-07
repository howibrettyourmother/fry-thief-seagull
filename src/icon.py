# Home Screen / favicon icons: a goofy seagull grabbing French fries over a Lake Michigan beach. Run: python3 src/icon.py
from PIL import Image, ImageDraw
import os, math
D=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(D,'..');S=1024
def master(pad=0.0):
    im=Image.new('RGB',(S,S));d=ImageDraw.Draw(im)
    for y in range(S):
        t=y/S;c0=(94,196,255);c1=(220,244,255)
        d.line([(0,y),(S,y)],fill=tuple(int(c0[i]+(c1[i]-c0[i])*t) for i in range(3)))
    d.rectangle([0,690,S,800],fill=(47,159,224));d.rectangle([0,800,S,S],fill=(243,217,160))
    for x in range(0,S,60):d.ellipse([x,785,x+70,815],fill=(255,255,255))
    d.ellipse([760,90,940,270],fill=(255,224,102))
    k=1-pad
    P=lambda x,y:(S/2+(x-S/2)*k,S/2+(y-S/2)*k)
    def E(x0,y0,x1,y1,**kw):d.ellipse([P(x0,y0),P(x1,y1)],**kw)
    def Pg(pts,**kw):d.polygon([P(*p) for p in pts],**kw)
    def Ln(pts,w,**kw):d.line([P(*p) for p in pts],width=max(1,int(w*k)),**kw)
    # back wing
    Pg([(430,500),(170,250),(120,330),(330,560)],fill=(176,190,197));Pg([(170,250),(120,330),(95,270)],fill=(55,71,79))
    # tail + body
    Pg([(260,560),(130,520),(150,640)],fill=(255,255,255));Pg([(150,525),(110,520),(130,600)],fill=(55,71,79))
    E(220,430,640,680,fill=(255,255,255),outline=(144,164,174),width=int(8*k))
    # head
    E(520,300,760,540,fill=(255,255,255),outline=(144,164,174),width=int(8*k))
    E(600,340,700,440,fill=(255,255,255),outline=(51,51,51),width=int(9*k));E(635,365,690,420,fill=(34,34,34));E(658,372,676,390,fill=(255,255,255))
    Ln([(585,330),(705,345)],16,fill=(85,85,85))
    # beak with fries
    Pg([(735,420),(900,445),(735,480)],fill=(255,179,0));Pg([(735,470),(880,470),(735,515)],fill=(255,143,0))
    for i,(dx,dy,a) in enumerate([(0,0,-0.35),(20,25,-0.1),(10,50,0.25)]):
        cx,cy=850+dx,455+dy;L=110;w=24;ca,sa=math.cos(a),math.sin(a)
        pts=[(cx-ca*10-sa*w/2,cy-sa*10+ca*w/2),(cx+ca*L-sa*w/2,cy+sa*L+ca*w/2),(cx+ca*L+sa*w/2,cy+sa*L-ca*w/2),(cx-ca*10+sa*w/2,cy-sa*10-ca*w/2)]
        Pg(pts,fill=(255,213,79),outline=(224,168,0))
    # front wing
    Pg([(450,520),(250,330),(190,400),(360,600)],fill=(207,216,220),outline=(144,164,174));Pg([(250,330),(190,400),(165,345)],fill=(55,71,79))
    # feet
    Ln([(400,670),(370,740)],18,fill=(255,143,0));Ln([(470,675),(470,750)],18,fill=(255,143,0))
    # fry carton on the sand
    Pg([(700,860),(860,860),(840,1000),(720,1000)],fill=(229,57,53));d.rectangle([P(765,860),P(795,1000)],fill=(255,255,255))
    for i in range(5):x=715+i*30;d.rectangle([P(x,780+(i%2)*20),P(x+22,870)],fill=(255,202,40))
    return im
m=master()
for n,sz in [('apple-touch-icon.png',180),('icon-512.png',512),('icon-192.png',192),('favicon-32.png',32)]:m.resize((sz,sz),Image.LANCZOS).save(os.path.join(OUT,n),optimize=True)
master(pad=0.2).resize((512,512),Image.LANCZOS).save(os.path.join(OUT,'icon-maskable-512.png'),optimize=True)
# social preview
og=Image.new('RGB',(1200,630),(94,196,255));og.paste(m.resize((630,630),Image.LANCZOS),(570,0));dd=ImageDraw.Draw(og)
try:
    from PIL import ImageFont;F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',84)
except Exception:F=None
for i,t in enumerate(['FRY THIEF','SEAGULL']):dd.text((50,190+i*110),t,fill=(255,210,63) if i==0 else (255,255,255),font=F,stroke_width=8,stroke_fill=(13,71,161))
og.save(os.path.join(OUT,'og.png'),optimize=True)
