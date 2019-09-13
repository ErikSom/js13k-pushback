import {setGlobal, uiResize, showTutorial, showLevels, addBlocker, destroyBlockers, showEndScreen} from "./ui.js";
import lvls from './levels.js';

const glCanvas = document.createElement("canvas");
let boundingRect;
const global = {};

global.saveKey = 'pushback-js13k';
global.unlockedLevels = localStorage.getItem(global.saveKey) || 1;

setGlobal(global);

const startGame = ()=> {
    startHtml();
    startInput();
    startWebGL();
    levelsList();

    loadLevel(0);
    global.levelEnded = true; //disables levelPassed() and levelFailed()
    setPhysicsConstants();
    window.requestAnimationFrame(render);
}
const startHtml = () => {
    document.body.style.touchAction = "none";
    document.body.style.margin = "0px";

    glCanvas.style.position = "absolute";
    document.body.appendChild(glCanvas);

    window.onresize = resize;
    resize()
}
const resize = () =>{
    glCanvas.width = glCanvas.height = Math.min(window.innerWidth, window.innerHeight);

    const min = Math.min(window.innerWidth, window.innerHeight);
    glCanvas.style.top = Math.floor(window.innerHeight/2-min/2)+"px";//center canvas on screen
    glCanvas.style.left = Math.floor(window.innerWidth/2-min/2)+"px";//center canvas on screen
    glCanvas.style.width = min+"px";
    glCanvas.style.height = min+"px";

    boundingRect = glCanvas.getBoundingClientRect();
    uiResize();
}

const startInput = ()=> {
    global.inputO = 0; //indicates if touch down or up
    global.inputX = 0;
    global.inputY = 0;
    global.inputXd = 0;
    global.inputYd = 0;
    global.touchID = -1;

    const inputDo =  (x, y, type) => {
        x = x - boundingRect.left;
        y = y - boundingRect.top;
        global.inputXd = x - global.inputX;
        global.inputYd = y - global.inputY;
        global.inputX = x;
        global.inputY = y;
        if (type != 2) {
            global.inputO = type;
        }
    }
    const touchStart =  (e) => {
        if (global.touchID != -1) {
            return;
        }
        global.touchID = e.changedTouches[0].identifier;
        inputDo(e.changedTouches[0].clientX,
            e.changedTouches[0].clientY,
            1);
        showTutorial(0);
    };
    const touchEnd = (e) => {
        const list = e.changedTouches;
        for (let i = 0; i < list.length; ++i) {
            if (global.touchID == list[i].identifier) {
                global.touchID = -1;
                inputDo(e.changedTouches[i].clientX,
                    e.changedTouches[i].clientY,
                    0);
                break;
            }
        }
    };
    const touchMove = (e) => {
        const list = e.changedTouches;
        for (let i = 0; i < list.length; ++i) {
            if (global.touchID == list[i].identifier) {
                inputDo(list[i].clientX,
                    list[i].clientY,
                    2);
                break;
            }
        }
    };
    const mouseDown = (e) => {
        inputDo(e.clientX,
            e.clientY,
            1);
        showTutorial(0);
    };
    const mouseUp =  (e) => {
        inputDo(e.clientX,
            e.clientY,
            0);
    };
    const mouseMove = (e) => {
        inputDo(e.clientX,
            e.clientY,
            2);
    };
    glCanvas.addEventListener("touchstart", touchStart, true);
    glCanvas.addEventListener("touchend", touchEnd, true);
    glCanvas.addEventListener("touchcancel", touchEnd, true);
    glCanvas.addEventListener("touchmove", touchMove, true);
    glCanvas.addEventListener("mousedown", mouseDown, true);
    glCanvas.addEventListener("mouseup", mouseUp, true);
    glCanvas.addEventListener("mouseout", mouseUp, true);
    glCanvas.addEventListener("mouseleave", mouseUp, true);
    glCanvas.addEventListener("mousemove", mouseMove, true);
}

const startWebGL = ()=> {
    const gl = glCanvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        //preserveDrawingBuffer: false,
        //failIfMajorPerformanceCaveat: false
    });
    gl.depthFunc(gl.ALWAYS);
    gl.disable(gl.BLEND);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.DITHER);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
    gl.disable(gl.SAMPLE_COVERAGE);
    gl.disable(gl.SCISSOR_TEST);
    gl.disable(gl.STENCIL_TEST);
    const ext = gl.getExtension('OES_texture_float');
    global.gl = gl;

    //shaders
    const vxSh0 = global.vxSh0 =
        "precision highp float;" +
        "attribute float vtx;" +
        "varying vec2 uv;" +
        "void main()" +
        "{" +
        "vec4 s = vec4(-1.,1.,0.,1.);" +
        //"if(vtx == .25){s.y = 3.;}"+
        "if(vtx == .5 ){s.x = 3.;}" +
        "if(vtx == .75){s.y = -3.;}" +
        "uv = s.xy;" +
        "gl_Position = s*.5;" + //*.5 to avoid .w == 1. flicker bug
        "}";
    const frSh0 =
        "precision highp float;" +
        "uniform mat4 mtx;" +
        "uniform sampler2D tex;" +
        "varying vec2 uv;" +
        "void main()" +
        "{" +
        "vec2 res = mtx[0].xy;" +
        "vec2 r = 1./res;" +
        "vec2 u = floor((uv*.5+.5)*res)+.5;" +

        "float k = mtx[0].z;" +
        "float n = mtx[0].w;" +

        "vec4 t = texture2D(tex,u*r).xyzw;" +
        "vec4 t1= t+vec4(floor(u*.5)*2.+1.,0.,0.);" +

        "vec2 v = vec2(0.);" +
          
        "vec2 w = t1.xy-mtx[1].xy;"+
        "float o = dot(w,w);"+
        "float ol = 16.;"+
              "ol*= ol;"+
          
        "if(dot(t1.zw, t1.zw) < .125 && o < ol)" + //click balls
        "{" +
        "v += mtx[1].zw*(ol-o)/ol;" +
        "}" +

        "u = floor(u*.5)*2.-2.;" +

        "for(float j = .5; j < 6.; ++j)" +
        "{" +
        "for(float i = .5; i < 6.; ++i)" +
        "{" +
        "vec2 m = u+vec2(i,j);" +
        "vec4 t2 = texture2D(tex,m*r).xyzw;" +
        "if(t2.x == 1024.){continue;}" +
        "t2 = t2+vec4(floor(m*.5)*2.+1.,0.,0.)-t1;" +
        "vec2 d = t2.xy;" +
        "float l = length(d);" +
        "d /= l;" +
        "if(l > 2. || l < .001){d = vec2(0.);}" +
        "float c = (2.-l)*k;" +
        "float e = dot(d,t2.zw)*n;" +
        "v -= d*(c-e);" +
        "}" +
        "}" +
        "gl_FragColor = t+vec4(0.,0.,v);" +
        "}";
    const frSh1 =
        "precision highp float;" +
        "uniform mat4 mtx;" +
        "uniform sampler2D tex0;" +
        "uniform sampler2D tex1;" +
        "varying vec2 uv;" +
        "vec4 lod(vec2 u){return texture2D(tex1,u).xyzw;}" +
        "void main()" +
        "{" +
        "vec2 u = uv*.5+.5;" +
        "vec4 t = texture2D(tex0,u).xyzw;" +
        "vec2 res = mtx[0].xy;" +
        "u = t.xy+floor(u*res*.5)*2.+1.;" +
        "vec2 r = 1./res;" +
        "float a = mtx[2].w;" +
        "vec4 v = (lod((u-vec2(.1,.0))*r).x-lod((u+vec2(.1,.0))*r).x)*vec4(0.,0.,1.,0.)*a+" +
        "(lod((u-vec2(.0,.1))*r).x-lod((u+vec2(.0,.1))*r).x)*vec4(0.,0.,0.,1.)*a+" +
        "(lod(u*r)*vec4(0.,0.,2.,2.)-vec4(0.,0.,1.,1.))*mtx[2].y;" +
        "gl_FragColor = t+v;" +
        "}";
    const frSh2 =
        "precision highp float;" +
        "uniform mat4 mtx;" +
        "uniform sampler2D tex;" +
        "varying vec2 uv;" +
        "void main()" +
        "{" +
        "vec2 res = mtx[0].xy;" +
        "vec2 r = 1./res;" +
        "vec2 u = floor((uv*.5+.5)*res)+.5;" +

        "float id = floor(dot(floor(fract(u*.5)*2.),vec2(1.,2.))+.5);" +
        "float id2 = -1.;" +

        "u = floor(u*.5)*2.-2.;" +

        "vec4 t = vec4(1024.);" +
        "for(float j = .5; j < 6.; ++j)" +
        "{" +
        "for(float i = .5; i < 6.; ++i)" +
        "{" +
        "vec2 m = vec2(i,j);" +
        "vec4 t2 = texture2D(tex,(u+m)*r).xyzw;" +
        "if(t2.x == 1024.){continue;}" +
        "t2.xy += t2.zw + floor(m*.5)*2.-2.;" +
        "if(t2.x >= -1. && t2.x < 1. &&" +
        "t2.y >= -1. && t2.y < 1.){++id2;}" +
        "if(id2 == id)" +
        "{" +
        "id2+=.1;" +
        "t = t2;" +
        "}" +
        "}" +
        "}" +
        "gl_FragColor = t;" +
        "}";
    const frSh3 =
        "precision highp float;" +
        "uniform mat4 mtx;" +
        "uniform sampler2D tex0;" +
        "uniform sampler2D tex1;" +
        "varying vec2 uv;" +
        "void main()" +
        "{" +
        "vec2 res = mtx[0].xy;" +
        "vec2 u = floor((uv*.5+.5)*res)+.5;" +
        "vec2 r = 1./res;" +
        "vec4 t = texture2D(tex0,u*r).xyzw;" +
        "if(t.x == 1024.){gl_FragColor = vec4(1024.); return;}" +
        "vec4 t1 = t+vec4(floor(u*.5)*2.+1.,0.,0.);" +

        "vec4 b0 = texture2D(tex1,(u-.25)*r).xyzw;" +
        "b0 = b0*255.+.1;" +
        "vec4 b0les = step(b0,vec4(255.));" +
        "vec4 b0mod = floor(mod(b0,vec4(15.)))-7.;" +
        "vec4 b0div = floor(b0/15.)-7.;" +
        "vec4 b1 = texture2D(tex1,(u+.25)*r).xyzw;" +
        "b1 = b1*255.+.1;" +
        "vec4 b1les = step(b1,vec4(255.));" +
        "vec4 b1mod = floor(mod(b1,vec4(15.)))-7.;" +
        "vec4 b1div = floor(b1/15.)-7.;" +

        "vec2 v = vec2(0.);" +
        "vec2 b;" +
        "vec4 t2;" +
        "float l;" +

        "float L = mtx[2].x;" +
        "float k = mtx[3].z;" +
        "float n = mtx[3].w;" +

        "b = u+vec2(b0mod.x,b0div.x);" +
        "t2 = texture2D(tex0,b*r).xyzw;" +
        "t2 = t2+vec4(floor(b*.5)*2.+1.,0.,0.)-t1;" +
        "l = length(t2.xy);" +
        "b = t2.xy/l;" +
        "if(l<.001){b = vec2(0.);}" +
        "v -= b0les.x*b*((L-l)*k-dot(t2.zw,b)*n);" +

        "b = u+vec2(b0mod.y,b0div.y);" +
        "t2 = texture2D(tex0,b*r).xyzw;" +
        "t2 = t2+vec4(floor(b*.5)*2.+1.,0.,0.)-t1;" +
        "l = length(t2.xy);" +
        "b = t2.xy/l;" +
        "if(l<.001){b = vec2(0.);}" +
        "v -= b0les.y*b*((L-l)*k-dot(t2.zw,b)*n);" +

        "b = u+vec2(b0mod.z,b0div.z);" +
        "t2 = texture2D(tex0,b*r).xyzw;" +
        "t2 = t2+vec4(floor(b*.5)*2.+1.,0.,0.)-t1;" +
        "l = length(t2.xy);" +
        "b = t2.xy/l;" +
        "if(l<.001){b = vec2(0.);}" +
        "v -= b0les.z*b*((L-l)*k-dot(t2.zw,b)*n);" +

        "b = u+vec2(b0mod.w,b0div.w);" +
        "t2 = texture2D(tex0,b*r).xyzw;" +
        "t2 = t2+vec4(floor(b*.5)*2.+1.,0.,0.)-t1;" +
        "l = length(t2.xy);" +
        "b = t2.xy/l;" +
        "if(l<.001){b = vec2(0.);}" +
        "v -= b0les.w*b*((L-l)*k-dot(t2.zw,b)*n);" +

        "b = u+vec2(b1mod.x,b1div.x);" +
        "t2 = texture2D(tex0,b*r).xyzw;" +
        "t2 = t2+vec4(floor(b*.5)*2.+1.,0.,0.)-t1;" +
        "l = length(t2.xy);" +
        "b = t2.xy/l;" +
        "if(l<.001){b = vec2(0.);}" +
        "v -= b1les.x*b*((L-l)*k-dot(t2.zw,b)*n);" +

        "b = u+vec2(b1mod.y,b1div.y);" +
        "t2 = texture2D(tex0,b*r).xyzw;" +
        "t2 = t2+vec4(floor(b*.5)*2.+1.,0.,0.)-t1;" +
        "l = length(t2.xy);" +
        "b = t2.xy/l;" +
        "if(l<.001){b = vec2(0.);}" +
        "v -= b1les.y*b*((L-l)*k-dot(t2.zw,b)*n);" +

        "gl_FragColor = t+vec4(0.,0.,v);" +
        "}";
    const frSh4 =
        "precision highp float;" +
        "uniform mat4 mtx;" +
        "uniform sampler2D tex0;" +
        "uniform sampler2D tex1;" +
        "uniform sampler2D tex2;" +
        "varying vec2 uv;" +
        "vec2 find(sampler2D tex, vec4 o, vec2 u, vec2 r)" +
        "{" +
        "vec2 e = vec2(0.);" +

        "u = floor(u*.5)*2.;" +

        "vec4 o0;" +
        "vec2 u0;" +
        "vec2 h;" +

        "vec2 b = step(vec2(0.),o.xy)*4.-2.;" +

        "o0 = o;" +
        "u0 = u;" +
        "h = u0+vec2(0.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(0.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +

        "o0 = o-vec4(b,0.,0.);" +
        "u0 = u+b;" +
        "h = u0+vec2(0.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(0.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +

        "o0 = o-vec4(b*vec2(0.,1.),0.,0.);" +
        "u0 = u+b*vec2(0.,1.);" +
        "h = u0+vec2(0.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(0.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +

        "o0 = o-vec4(b*vec2(1.,0.),0.,0.);" +
        "u0 = u+b*vec2(1.,0.);" +
        "h = u0+vec2(0.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(0.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +

        "return e;" +
        "}" +
        "void main()" +
        "{" +
        "vec2 res = mtx[0].xy;" +
        "vec2 r = 1./res;" +
        "vec2 u = uv*.5+.5;" +
        "vec4 t = texture2D(tex1,u).xyzw;" +
        "if(t.x == 1024.){gl_FragColor = vec4(1.1); return;}" +
        "u *= res;" +
        "vec2 x = vec2(float(fract(u.x)>=.5)*.5-.25,0.);" +

        "vec2 f = find(tex2, t-vec4(t.zw,0.,0.), u, r);" +

        "vec4 l = texture2D(tex0,(f+x)*r).xyzw;" +
        "l = l*255.+.1;" +
        "vec4 lmod = floor(mod(l,15.))-7.;" +
        "vec4 ldiv = floor(l/15.)-7.;" +

        "u = floor(u);" +
        "vec2 f2 = vec2(0.);" +

        "f2 = f+vec2(lmod.x,ldiv.x);" +
        "t = texture2D(tex2,f2*r).xyzw;" +
        "f2 = find(tex1, t+vec4(t.zw,0.,0.), f2, r);" +
        "if(l.x < 255.){l.x = dot(f2-.5-u+7.,vec2(1.,15.))+.1;}" +

        "f2 = f+vec2(lmod.y,ldiv.y);" +
        "t = texture2D(tex2,f2*r).xyzw;" +
        "f2 = find(tex1, t+vec4(t.zw,0.,0.), f2, r);" +
        "if(l.y < 255.){l.y = dot(f2-.5-u+7.,vec2(1.,15.))+.1;}" +

        "f2 = f+vec2(lmod.z,ldiv.z);" +
        "t = texture2D(tex2,f2*r).xyzw;" +
        "f2 = find(tex1, t+vec4(t.zw,0.,0.), f2, r);" +
        "if(l.z < 255.){l.z = dot(f2-.5-u+7.,vec2(1.,15.))+.1;}" +

        "f2 = f+vec2(lmod.w,ldiv.w);" +
        "t = texture2D(tex2,f2*r).xyzw;" +
        "f2 = find(tex1, t+vec4(t.zw,0.,0.), f2, r);" +
        "if(l.w < 255.){l.w = dot(f2-.5-u+7.,vec2(1.,15.))+.1;}" +

        "gl_FragColor = l/255.;" +
        "}";
    const frSh6 =
        "precision highp float;" +
        "uniform mat4 mtx;" +
        "uniform sampler2D tex;" +
        "varying vec2 uv;" +
        "void main()" +
        "{" +
        "vec2 res = mtx[0].xy;" +
        "vec2 r = 1./res;" +
        "vec2 u = (uv*.5+.5)*res;" +
        "float id = 0.;" +
        "if(fract(u.x) >= .5){id = 4.;}" +
        "u = floor(u);" +

        "vec2 p = u+.5;" +
        "vec2 t = texture2D(tex,p*r).xy;" +
        "p = floor(p*.5)*2.+1.+t;" +

        "vec4 o = vec4(1.1);" +
        "float id2 = -1.;" +
        "u -= 7.;" +
        "float wx = 1.;" +
        "float wy = 1.;" +
        "float wz = 1.;" +
        "float ww = 1.;" +
        "for(float j = .5; j < 15.; ++j)" +
        "{" +
        "for(float i = .5; i < 15.; ++i)" +
        "{" +
        "vec2 p2 = u+vec2(i,j);" +
        "vec2 t2 = texture2D(tex,p2*r).xy;" +
        "p2 = floor(p2*.5)*2.+1.+t2;" +
        "float l = length(p-p2);" +
        "if(t2.x != 1024. && l > 1.9 && l < 2.1){++id2;}" +
        "vec4 w = vec4(0.);" +
        "if(id2 == id+0.){w.x = wx; wx = 0.;}" +
        "if(id2 == id+1.){w.y = wy; wy = 0.;}" +
        "if(id2 == id+2.){w.z = wz; wz = 0.;}" +
        "if(id2 == id+3.){w.w = ww; ww = 0.;}" +
        "o += ((i-.4+floor(j)*15.)/255.-1.1)*w;" +
        "}" +
        "}" +
        "if(t.x == 1024.){o = vec4(1.1);}" +
        "gl_FragColor = o;" +
        "}";
    const frSh9 =
        "precision highp float;" +
        "uniform mat4 mtx;" +
        "uniform sampler2D tex0;" +
        "uniform sampler2D tex1;" +
        "varying vec2 uv;" +
        "void main()" +
        "{" +
        "vec2 res = mtx[0].xy;" +
        "vec2 r = 1./res;" +
        "vec2 u = uv*.5+.5;" +
        "vec4 t = texture2D(tex0,u).xyzw;" +
        "if(t.x == 1024.){gl_FragColor = vec4(1024.); return;}" +

        "float f = mtx[2].z;" +

        "u = floor(u*res*.5)*2.;" +
        "vec4 t1 = vec4(u+1.,0.,0.)+t;" +
        "u = u+.5+step(vec2(0.),t.xy)*2.-2.;" +

        "for(float i = .5; i < 4.; ++i)" +
        "{" +
        "for(float j = .5; j < 4.; ++j)" +
        "{" +
        "vec2 m = u+vec2(j,i);" +
        "vec4 t2 = texture2D(tex1,m*r).xyzw;" +
        "if(t2.x == 1024.){continue;}" +
        "vec2 v = t2.zw;" +
        "t2 = t2+vec4(floor(m*.5)*2.+1.,0.,0.)-t1;" +
        "float l = length(v)*float(dot(t2.xy,t2.xy)<1.);" +
        "v /= l;" +
        "if(l<.001){v = vec2(0.);}" +
        "t.zw += v*dot(t2.zw,v)*f;" +
        "}" +
        "}" +
        "gl_FragColor = t;" +
        "}";
    const frSh10 =
        "precision highp float;" +
        "uniform mat4 mtx;" +
        "uniform sampler2D tex0;" +
        "uniform sampler2D tex1;" +
        "uniform sampler2D tex2;" +
        "varying vec2 uv;" +
        "vec2 find(sampler2D tex, vec4 o, vec2 u, vec2 r)" +
        "{" +
        "vec2 e = vec2(0.);" +

        "u = floor(u*.5)*2.;" +

        "vec4 o0;" +
        "vec2 u0;" +
        "vec2 h;" +

        "vec2 b = step(vec2(0.),o.xy)*4.-2.;" +

        "o0 = o;" +
        "u0 = u;" +
        "h = u0+vec2(0.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(0.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +

        "o0 = o-vec4(b,0.,0.);" +
        "u0 = u+b;" +
        "h = u0+vec2(0.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(0.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +

        "o0 = o-vec4(b*vec2(0.,1.),0.,0.);" +
        "u0 = u+b*vec2(0.,1.);" +
        "h = u0+vec2(0.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(0.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +

        "o0 = o-vec4(b*vec2(1.,0.),0.,0.);" +
        "u0 = u+b*vec2(1.,0.);" +
        "h = u0+vec2(0.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,0.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(0.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +
        "h = u0+vec2(1.5,1.5); if(dot(abs(texture2D(tex,h*r).xyzw-o0),vec4(1.))<.001){e = h;}" +

        "return e;" +
        "}" +
        "void main()" +
        "{" +
        "vec2 u = uv*.5+.5;" +
        "vec4 t = texture2D(tex1,u).xyzw;" +
        "if(t.x == 1024.){gl_FragColor = vec4(0.); return;}" +
        "vec2 res = mtx[0].xy;" +
        "vec2 r = 1./res;" +
        "vec2 f = find(tex2, t-vec4(t.zw,0.,0.), u*res, r);" +
        "gl_FragColor = texture2D(tex0,f*r).xyzw;" +
        "}";
    const frSh11 =
        `precision highp float;
        uniform mat4 mtx;
        uniform sampler2D tex0;
        uniform sampler2D tex1;
        varying vec2 uv;
        void main()
        {
            vec2 res = mtx[0].xy;
            vec2 r = 1./res;
            vec2 u = uv*.5+.5;
            vec4 c = texture2D(tex0,u).xyzw;
            if(c.w == 0.){gl_FragColor = c; return;}  //0=disables color change
            float id = 0.;//color id
            if(c.x > c.y && c.x > c.z){id = 1.;}//red
            if(c.y > c.x && c.y > c.z){id = 2.;}//green
            if(c.z > c.x && c.z > c.y){id = 3.;}//blue
            if(c.x == c.y && c.x > c.z){id = 4.;}//yellow
            if(c.x == c.z && c.x > c.y){id = 5.;}//purple
            bool ge = id != 0. && mtx[0].z != 0.;
            vec2 t = texture2D(tex1,u).xy;
            u = floor(u*res*.5)*2.-2.;
            //generate random value
            vec4 d = fract(sin(dot(t,vec2(42.1234,74.4321)))*vec4(6456.5891,
                                                                  7456.6892,
                                                                  8456.7893,
                                                                  9456.8894));
            for(float j = .5; j < 6.; ++j)
            {
                for(float i = .5; i < 6.; ++i)
                {
                    vec2 m = vec2(i,j);
                    vec2 m2 = (u+m)*r;
                    vec4 c2 = texture2D(tex0,m2).xyzw;
                    vec2 t2 = texture2D(tex1,m2).xy;
                    float id2 = 0.;
                    if(c2.x > c2.y && c2.x > c2.z){id2 = 1.;}//red
                    if(c2.y > c2.x && c2.y > c2.z){id2 = 2.;}//green
                    if(c2.z > c2.x && c2.z > c2.y){id2 = 3.;}//blue
                    if(c2.x == c2.y && c2.x > c2.z){id2 = 4.;}//yellow
                    if(c2.x == c2.z && c2.x > c2.y){id2 = 5.;}//purple
                    bool b = t2.x == 1024.;
                    t2 = t2+(floor(m*.5)*2.-2.)-t;
                    if(b || dot(t2,t2) > 4.){id2 = 0.;}
                    if(id == 1. && id2 == 5.){c = vec4(.6,.4,.6,0.) - d*vec4(.0,.2,.0,.0);} //red killed by purple
                    if(id == 2. && id2 == 1.){c = vec4(.6,.4,.4,0.) - d*vec4(.0,.2,.2,.0);} //green killed by red
                    if(id == 3. && id2 == 4.){c = vec4(.6,.6,.4,0.) - d*vec4(.0,.0,.2,.0);} //blue killed by yellow
                    if(id == 4. && id2 == 2.){c = vec4(.4,.6,.4,0.) - d*vec4(.2,.0,.2,.0);} //yellow killed by green
                    if(id == 5. && id2 == 1.){c = vec4(.4,.4,.6,0.) - d*vec4(.2,.2,.0,.0);} //purple killed by blue
                    if(ge && id2 != 0.){c = d*vec4(1.,1.,1.,0.);}
                }
            }
            gl_FragColor = c;
        }`;
    const frSh12 =
        "precision highp float;"+
        "uniform mat4 mtx;"+
        "uniform sampler2D tex0;"+
        "uniform sampler2D tex1;"+
        "varying vec2 uv;"+
        "void main()"+
        "{"+
            "vec2 res = mtx[0].xy;"+
            "vec2 r = 1./res;"+
            "vec2 u = uv*.5+.5;"+
            
            "vec4 l = texture2D(tex0,u).xyzw;"+
            "vec4 a = l*255.+.1;"+
            "vec4 lmod = floor(mod(a,15.))-7.;"+
            "vec4 ldiv = floor(    a/15. )-7.;"+

            "vec3 c = texture2D(tex1,u).xyz;"+

            "u = floor(u*res)+.5;"+
            "vec3 c2 = vec3(0.);"+

            "c2 = texture2D(tex1,(u+vec2(lmod.x,ldiv.x))*r).xyz;"+
            "if(!all(equal(c,c2))){l.x = 1.;}"+

            "c2 = texture2D(tex1,(u+vec2(lmod.y,ldiv.y))*r).xyz;"+
            "if(!all(equal(c,c2))){l.y = 1.;}"+

            "c2 = texture2D(tex1,(u+vec2(lmod.z,ldiv.z))*r).xyz;"+
            "if(!all(equal(c,c2))){l.z = 1.;}"+

            "c2 = texture2D(tex1,(u+vec2(lmod.w,ldiv.w))*r).xyz;"+
            "if(!all(equal(c,c2))){l.w = 1.;}"+

            "gl_FragColor = l;"+
        "}";
    const frSh15 = 
        `precision highp float;
        uniform sampler2D tex0;
        uniform sampler2D tex1;
        varying vec2 uv;
        void main()
        {
            vec2 u = uv*.5+.5;
            vec4 t = texture2D(tex0,u).xyzw;
            vec4 c = texture2D(tex1,u).xyzw;
            if(abs(c.w-.5) < .1){t *= vec4(1.,1.,0.,0.);}
            gl_FragColor = t;
        }`;
    const frShS =
        `precision highp float;
        uniform mat4 mtx;
        uniform sampler2D tex0;
        uniform sampler2D tex1;
        uniform sampler2D tex2;
        uniform sampler2D tex3;
        uniform sampler2D tex4;
        varying vec2 uv;
        void main()
        {
            vec2 res = mtx[0].xy;
            vec2 r = 1./res;
            vec2 o = uv*.5+.5;
            vec2 u = o*res*.5;
            vec4 t = vec4(fract(u)*2.-1.,0.,0.);
            vec4 s = step(vec4(0.),t)*vec4(1.,1.,0.,0.)-vec4(1.,1.,0.,0.);
                 u = (floor(u)+s.xy)*2.;
                 s*= 2.;
            vec4 v1 = vec4(1024.);
            vec4 v2 = vec4(1024.);
            vec2 g2 = vec2(0.);
            for(float i = .5; i < 4.; ++i)
            {
                for(float j = .5; j < 4.; ++j)
                {
                    vec4 m = vec4(j,i,0.,0.);
                    vec2 g = (u+m.xy)*r;
                    vec4 t2 = texture2D(tex0,g).xyzw;
                    vec4 p = t-t2-s-2.*floor(m*.5);
                    if(t2.x != 1024. && dot(p.xy,p.xy)<1.)
                    {
                        v1 = t2;
                    }
                    t2 = texture2D(tex2,g).xyzw;
                    p = t-t2-s-2.*floor(m*.5);
                    if(t2.x != 1024. && dot(p.xy,p.xy)<1.)
                    {
                        v2 = t2;
                        g2 = g;
                    }
                }
            }
            vec4 a = texture2D(tex4,o).xyzw;
            vec4 wtr = .5+.5*cos(6.3*(length(v1.zw)*.6+.54+vec4(.0,.1,.2,.0)))+texture2D(tex1,o).x;
            vec4 obj = length(v2.zw)+texture2D(tex3,g2).xyzw;
            if(v1.x != 1024.){a = wtr;}
            if(v2.x != 1024.){a = obj;}
            gl_FragColor = a;
        }`;

    const shaderCreator = (vectexShaderCode, fragmentShaderCode) => {
        const shaderProgram = gl.createProgram();
        let shader;

        shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shader, vectexShaderCode);
        gl.compileShader(shader);
        gl.getShaderParameter(shader, gl.COMPILE_STATUS) || alert(gl.getShaderInfoLog(shader));
        gl.attachShader(shaderProgram, shader);

        shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, fragmentShaderCode);
        gl.compileShader(shader);
        gl.getShaderParameter(shader, gl.COMPILE_STATUS) || alert(gl.getShaderInfoLog(shader));
        gl.attachShader(shaderProgram, shader);

        gl.linkProgram(shaderProgram);

        return shaderProgram;
    };
    global.shaderCreator = shaderCreator;

    //physics shaders
    global.shaderP0 = shaderCreator(vxSh0, frSh0); //calculates balls to balls collision
    global.shdVtx0 = gl.getAttribLocation(global.shaderP0, "vtx");
    global.shdMtx0 = gl.getUniformLocation(global.shaderP0, "mtx");
    global.shdTex0 = gl.getUniformLocation(global.shaderP0, "tex");
    global.shaderP1 = shaderCreator(vxSh0, frSh1); //calculates collision with distanceField
    global.shdVtx1 = gl.getAttribLocation(global.shaderP1, "vtx");
    global.shdMtx1 = gl.getUniformLocation(global.shaderP1, "mtx");
    global.shdTex10 = gl.getUniformLocation(global.shaderP1, "tex0");
    global.shdTex11 = gl.getUniformLocation(global.shaderP1, "tex1");
    global.shaderP2 = shaderCreator(vxSh0, frSh2); //calculates ball grid movement
    global.shdVtx2 = gl.getAttribLocation(global.shaderP2, "vtx");
    global.shdMtx2 = gl.getUniformLocation(global.shaderP2, "mtx");
    global.shdTex2 = gl.getUniformLocation(global.shaderP2, "tex");
    global.shaderP3 = shaderCreator(vxSh0, frSh3); //calculates bar forces
    global.shdVtx3 = gl.getAttribLocation(global.shaderP3, "vtx");
    global.shdMtx3 = gl.getUniformLocation(global.shaderP3, "mtx");
    global.shdTex30 = gl.getUniformLocation(global.shaderP3, "tex0");
    global.shdTex31 = gl.getUniformLocation(global.shaderP3, "tex1");
    global.shaderP4 = shaderCreator(vxSh0, frSh4); //calculates bar grid movement
    global.shdVtx4 = gl.getAttribLocation(global.shaderP4, "vtx");
    global.shdMtx4 = gl.getUniformLocation(global.shaderP4, "mtx");
    global.shdTex40 = gl.getUniformLocation(global.shaderP4, "tex0");
    global.shdTex41 = gl.getUniformLocation(global.shaderP4, "tex1");
    global.shdTex42 = gl.getUniformLocation(global.shaderP4, "tex2");
    global.shaderP9 = shaderCreator(vxSh0, frSh9); //calculates forces from layer0
    global.shdVtx9 = gl.getAttribLocation(global.shaderP9, "vtx");
    global.shdMtx9 = gl.getUniformLocation(global.shaderP9, "mtx");
    global.shdTex90 = gl.getUniformLocation(global.shaderP9, "tex0");
    global.shdTex91 = gl.getUniformLocation(global.shaderP9, "tex1");
    global.shaderP10 = shaderCreator(vxSh0, frSh10); //calculates ball color grid movement
    global.shdVtx10 = gl.getAttribLocation(global.shaderP10, "vtx");
    global.shdMtx10 = gl.getUniformLocation(global.shaderP10, "mtx");
    global.shdTex100 = gl.getUniformLocation(global.shaderP10, "tex0");
    global.shdTex101 = gl.getUniformLocation(global.shaderP10, "tex1");
    global.shdTex102 = gl.getUniformLocation(global.shaderP10, "tex2");
    global.shaderP11 = shaderCreator(vxSh0, frSh11); //calculates objects collision causes ball color change
    global.shdVtx11 = gl.getAttribLocation(global.shaderP11, "vtx");
    global.shdMtx11 = gl.getUniformLocation(global.shaderP11, "mtx");
    global.shdTex110 = gl.getUniformLocation(global.shaderP11, "tex0");
    global.shdTex111 = gl.getUniformLocation(global.shaderP11, "tex1");
    global.shaderP12 = shaderCreator(vxSh0, frSh12); //calculates bar between balls with different colors gets destroyed
    global.shdVtx12 = gl.getAttribLocation(global.shaderP12, "vtx");
    global.shdMtx12 = gl.getUniformLocation(global.shaderP12, "mtx");
    global.shdTex120 = gl.getUniformLocation(global.shaderP12, "tex0");
    global.shdTex121 = gl.getUniformLocation(global.shaderP12, "tex1");
    global.shaderP15 = shaderCreator(vxSh0, frSh15);//make ball immovable if color ...
    global.shdVtx15 = gl.getAttribLocation(global.shaderP15, "vtx");
    global.shdTex150 = gl.getUniformLocation(global.shaderP15, "tex0");
    global.shdTex151 = gl.getUniformLocation(global.shaderP15, "tex1");
    //initializers shaders
    global.shaderP6 = shaderCreator(vxSh0, frSh6); //join balls with bars
    global.shdVtx6 = gl.getAttribLocation(global.shaderP6, "vtx");
    global.shdMtx6 = gl.getUniformLocation(global.shaderP6, "mtx");
    global.shdTex6 = gl.getUniformLocation(global.shaderP6, "tex");
    //image shader
    global.shaderPS = shaderCreator(vxSh0, frShS);
    global.shdVtxS = gl.getAttribLocation(global.shaderPS, "vtx");
    global.shdMtxS = gl.getUniformLocation(global.shaderPS, "mtx");
    global.shdTexS0 = gl.getUniformLocation(global.shaderPS, "tex0");
    global.shdTexS1 = gl.getUniformLocation(global.shaderPS, "tex1");
    global.shdTexS2 = gl.getUniformLocation(global.shaderPS, "tex2");
    global.shdTexS3 = gl.getUniformLocation(global.shaderPS, "tex3");
    global.shdTexS4 = gl.getUniformLocation(global.shaderPS, "tex4");

    //meshes
    const meshData = new Float32Array([.25, .5, .75]); //a triangle where each vertex is a single float value
    global.meshBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, global.meshBuff);
    gl.bufferData(gl.ARRAY_BUFFER, meshData, gl.STATIC_DRAW);

    //textures
    const textureCreator = (format, x, y, type, txf, data, txId) => {
        gl.activeTexture(txId);
        const tx = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tx);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, txf);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, txf);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, x, y, 0, format, type, data);
        return tx;
    }
    global.texWidth = 256;
    global.texHeight = 256;
    global.tex0 = new Array(2); //layer0 water balls
    global.tex0[0] = textureCreator(gl.RGBA, global.texWidth, global.texHeight, gl.FLOAT, gl.NEAREST, null, gl.TEXTURE0);
    global.tex0[1] = textureCreator(gl.RGBA, global.texWidth, global.texHeight, gl.FLOAT, gl.NEAREST, null, gl.TEXTURE1);
    global.tex1 = new Array(2); //layer1 terrain height and map decorations
    global.tex1[0] = textureCreator(gl.RGBA, global.texWidth * 2, global.texHeight * 2, gl.UNSIGNED_BYTE, gl.LINEAR, null, gl.TEXTURE2);
    global.tex1[1] = textureCreator(gl.RGBA, global.texWidth * 2, global.texHeight * 2, gl.UNSIGNED_BYTE, gl.LINEAR, null, gl.TEXTURE3);
    global.tex2 = new Array(2); //layer2 objects balls
    global.tex2[0] = textureCreator(gl.RGBA, global.texWidth, global.texHeight, gl.FLOAT, gl.NEAREST, null, gl.TEXTURE4);
    global.tex2[1] = textureCreator(gl.RGBA, global.texWidth, global.texHeight, gl.FLOAT, gl.NEAREST, null, gl.TEXTURE5);
    global.tex3 = new Array(2); //layer2 objects balls bars
    global.tex3[0] = textureCreator(gl.RGBA, global.texWidth * 2, global.texHeight, gl.UNSIGNED_BYTE, gl.NEAREST, null, gl.TEXTURE6);
    global.tex3[1] = textureCreator(gl.RGBA, global.texWidth * 2, global.texHeight, gl.UNSIGNED_BYTE, gl.NEAREST, null, gl.TEXTURE7);
    global.tex4 = new Array(2); //layer2 objects balls colors
    global.tex4[0] = textureCreator(gl.RGBA, global.texWidth, global.texHeight, gl.UNSIGNED_BYTE, gl.NEAREST, null, gl.TEXTURE8);
    global.tex4[1] = textureCreator(gl.RGBA, global.texWidth, global.texHeight, gl.UNSIGNED_BYTE, gl.NEAREST, null, gl.TEXTURE9);

    //frameBuffers
    const frameBuffCreator = (texture) => {
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        return fb;
    }
    global.fb0 = new Array(2);
    global.fb0[0] = frameBuffCreator(global.tex0[0]);
    global.fb0[1] = frameBuffCreator(global.tex0[1]);
    global.fb1 = new Array(2);
    global.fb1[0] = frameBuffCreator(global.tex1[0]);
    global.fb1[1] = frameBuffCreator(global.tex1[1]);

    global.fb2 = new Array(2);
    global.fb2[0] = frameBuffCreator(global.tex2[0]);
    global.fb2[1] = frameBuffCreator(global.tex2[1]);
    global.fb3 = new Array(2);
    global.fb3[0] = frameBuffCreator(global.tex3[0]);
    global.fb3[1] = frameBuffCreator(global.tex3[1]);
    global.fb4 = new Array(2);
    global.fb4[0] = frameBuffCreator(global.tex4[0]);
    global.fb4[1] = frameBuffCreator(global.tex4[1]);

    //global matrix used by shaders
    global.shaderMtx = new Float32Array(4 * 4);
    global.shaderMtx[0] = global.texWidth;
    global.shaderMtx[1] = global.texHeight;

    //ping pong texture rendering counter
    global.l0n = 0;
    global.l2n = 0;
    global.l3n = 0;
    global.l4n = 0;

    //activate filling a layer
    global.fillTex0 = false; //layer0 water
    global.fillTex1 = false; //layer1 terrain and map decorations
    global.fillTex2 = false; //layer2 object balls with bars and colors

    //array used to read GPU texture in CPU
    global.rdPix = new Uint8Array(global.texWidth*global.texHeight*4);
}
const levelsList = ()=> {
    global.baseOperations = `
        float hex(vec2 u)
        {
            vec3 a = u.xyx*mat3(0. ,1. ,0.,
                            .866, .5,0.,
                            .866,-.5,0.);
            return 1.-dot(abs(a),vec3(1.));
        }
        void drawDonut(inout float r, vec2 u, vec2 position, float scale, float rotate, float gap, float fat)
        {
            rotate *= 6.283;
            gap *= 6.283;
            scale = 1./scale;
            fat = 1./fat;
            vec2 t = sin(vec2(0.,1.57)+rotate);
            vec2 a;
            vec2 b;
            b = (u-position)*scale;
            a = b*mat2(t,t.yx*vec2(-1.,1.));
            a = vec2(log(dot(a,a)),atan(a.x,a.y)*2.);
            a = vec2(max(abs(a.y)-gap,0.),a.x)*fat;
            r = max(r, 1.-dot(a,a)*length(b));
        }
        void drawLine(inout float r, vec2 u, vec2 p1, vec2 p2, float w)
        {
            vec2 a = normalize(p2-p1);
            u = u-(p1+p2)*.5;
            u = u*mat2(a,a.yx*vec2(-1.,1.));
            float l = distance(p1,p2)*.5;
            u.x = max(abs(u.x)-l,0.);
            u /= w;
            r = max(1.-dot(u,u),r);
        }
        float drawTerrainCircle(vec2 u, vec2 p1, vec2 s)
        {
            vec2 a = (u+p1)*s;
            float t = max(1.-length(a),0.);
            float r = min(1., t*(1.0+t/2.));
            return r;
        }
        float drawBoat(inout vec4 r, vec2 u, vec2 p, float angle){
            vec2 dir = sin(angle + vec2(0.,1.57));
            vec2 a = (u+p)*12.;
            a = a*mat2(dir ,dir .yx*vec2(-1.,1.));
            a = vec2(max(abs(a.x)-1.,0.),a.y);
            a = abs(a);
            return float(1.-a.y-a.x >= 0.);
        }
        void drawCurrent(inout vec2 v, vec2 u, vec2 p, vec2 s, vec2 a)
        {
            vec2 r = (u+p)*s;
            v += a*max(1.-dot(r,r),0.);
        }
        float rnd(vec2 u, vec2 f, float g1, float g2)
        {
            vec4 a = fract(sin(dot(f,vec2(37.34,97.74)))
                        *vec4(6925.953,
                                7925.953,
                                8925.953,
                                9925.953));
            vec2 b = cos(a.x*g1+vec2(0.,1.57));
            return cos(dot(u,b*a.y*g2)+a.z*6.2831)*.5+.5;
        }
        float bub(vec2 u)
        {
            vec3 a = u.xyx*mat3(0.,1. , 0.,
                                 .86602540378, .5, 0.,
                                 .86602540378,-.5, 0.);
            return max(1.-dot(abs(a),vec3(.57735026919)),0.);
        }
        float fn(vec2 u, float g1, float g2)
        {
            vec2 s = vec2(2.,1.73205080757);
            vec2 a0 = (u+s*vec2(.0 ,.0))/s;
            vec2 a1 = (u+s*vec2(.5 ,.0))/s;
            vec2 a2 = (u+s*vec2(.25,.5))/s;
            vec2 a3 = (u+s*vec2(.75,.5))/s;
            vec2 a0f = fract(a0)*s-s*.5;
            vec2 a1f = fract(a1)*s-s*.5;
            vec2 a2f = fract(a2)*s-s*.5;
            vec2 a3f = fract(a3)*s-s*.5;
            return bub(a0f)*rnd(u,floor(a0)+.0,g1,g2)+
                bub(a1f)*rnd(u,floor(a1)+.1,g1,g2)+
                bub(a2f)*rnd(u,floor(a2)+.2,g1,g2)+
                bub(a3f)*rnd(u,floor(a3)+.3,g1,g2);
        }
        vec2 corner(){return vec2(CORNER);}
        vec4 myBoatsColor(){return vec4(MYBOATSCOLOR);}
        void finalDestTrr(vec2 u, inout float r)
        {
            u *= corner();
            vec2 a;
            //draw final destination island
            a = u*6.-vec2(6.3);
            a += sin(a.yx)*1.2;
            r = max((1.-dot(a,a)*.08)*(fn(u*18.,6.283,4.)*.6+1.),r);
            //draw final destination bridge
            a = (u-vec2(.9))*32.;
            a = a*mat2(-1.,1.,1.,1.);
            a = abs(a);
            a = a-vec2(1.5,5.);
            r = max(min(1.-max(a.x,a.y),1.)*.6,r);
        }
        void finalDestDeco(vec2 u, inout vec4 r)
        {
            float h = 0.;
            finalDestTrr(u, h);
            u *= corner();
            //generate grass
            vec2 a = u*24.;
            vec4 g = cos(6.28*((fn(a,.5,8.)+
                                fn(a*2.+1.1,.5,8.)+
                                fn(a*4.+2.2,.5,8.)+
                                fn(a*6.+3.3,.5,8.))*.05+
                            vec4(.3,.2,.33,.0)))*.5+.25+h*.5;
            //limit grass to just the island
            r = mix(r,g,clamp(h*4.-2.,0.,1.));
            //draw steps road
            a = (u-vec2(.945))*128.;
            a = a*mat2(-1.,1.,1.,1.);
            a.y = abs(a.y)-16.;
            a.y = abs(a.y)-8.;
            a.y = abs(a.y)-4.;
            a.y = abs(a.y)-2.;
            a = abs(a)-vec2(6.,1.);
            r = mix(r,r*1.3,clamp(1.-max(a.x,a.y),0.,1.));
        }
    `

}
const loadLevel = (n) => {
    const levelData = lvls[n];
    global.currentLevel = n;
    const gl = global.gl;
    let frSh5 =
        `precision highp float;
        uniform mat4 mtx;
        varying vec2 uv;
        REPLACE
        void main()
        {
            vec2 res = mtx[0].xy;
            vec2 r = 1./res;
            vec2 u = floor((uv*.5+.5)*res)*.5+.25;
            vec2 i = floor(fract(u)*2.);
            float id = floor(i.x+i.y*2.+.5);
            u = floor(u)*2.+1.;
            vec2 s = vec2(1.,1.732);
            vec2 a = mod(u  ,s*2.)-s;
            vec2 b = mod(u+s,s*2.)-s;
            if(dot(b,b)<dot(a,a)){a = b;}
            a = -a;
            float id2 = -1.;
            float n = .5;
            vec4 o = vec4(1024.);

            i = a+vec2( 0., 0.);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2( 2., 0.);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2(-2., 0.);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2( 1., 1.732);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2(-1., 1.732);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2( 1.,-1.732);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2(-1.,-1.732);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            o.xy += .001;
            if(objectsShape((u+o.xy)*r*2.-1.).x == 0.){o = vec4(1024.);}

            gl_FragColor = o;
        }`;
    let frSh13 =
        `precision highp float;
        uniform mat4 mtx;
        varying vec2 uv;
        REPLACE
        void main()
        {
            vec2 res = mtx[0].xy;
            vec2 r = 1./res;
            vec2 u = floor((uv*.5+.5)*res)*.5+.25;
            vec2 i = floor(fract(u)*2.);
            float id = floor(i.x+i.y*2.+.5);
            u = floor(u)*2.+1.;
            vec2 s = vec2(1.,1.732);
            vec2 a = mod(u  ,s*2.)-s;
            vec2 b = mod(u+s,s*2.)-s;
            if(dot(b,b)<dot(a,a)){a = b;}
            a = -a;
            float id2 = -1.;
            float n = .5;
            vec4 o = vec4(1024.);

            i = a+vec2( 0., 0.);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2( 2., 0.);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2(-2., 0.);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2( 1., 1.732);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2(-1., 1.732);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2( 1.,-1.732);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}

            i = a+vec2(-1.,-1.732);
            if(i.x>=-1. && i.x<1. &&
               i.y>=-1. && i.y<1. ){++id2;}
            if(id == id2){o = vec4(i,0.,0.); id2 = n;}
            
            o.xy += .001;
            
            gl_FragColor = objectsShape((u+o.xy)*r*2.-1.);
        }`;
    let frSh7 =
        `precision highp float;
        varying vec2 uv;
        REPLACE
        void main()
        {
            gl_FragColor = vec4(terrainHeight(uv),0.,
                                waterCurrents(uv)*.5+.5);
        }`;
    let frSh8 =
        `precision highp float;
        varying vec2 uv;
        void main()
        {
            vec4 a = fract(sin(vec4(dot(uv,vec2(23.123,87.987)),
                                    dot(uv,vec2(34.234,96.876)),
                                    dot(uv,vec2(45.345,15.765)),
                                    dot(uv,vec2(56.456,24.654))))*45678.7654)*2.-1.;
            a *= vec4(1.,1.,0.,0.);
            if(fract(sin(dot(uv,vec2(23.123,87.987)))*48366.8235) > REPLACE){a = vec4(1024.);}
            gl_FragColor = a;
        }`;
    let frSh14 =
        `precision highp float;
        varying vec2 uv;
        REPLACE
        void main()
        {
            gl_FragColor = mapDecorations(uv);
        }`;
    let replaceShader = global.baseOperations + levelData.shaderFunctions;
    replaceShader = replaceShader.replace("CORNER", levelData.finalDestinationCorner[0].toFixed(0)+","+
                                                    levelData.finalDestinationCorner[1].toFixed(0)     );
    replaceShader = replaceShader.replace("MYBOATSCOLOR",   (levelData.myBoatsColor[0]/255).toFixed(4)+","+
                                                            (levelData.myBoatsColor[1]/255).toFixed(4)+","+
                                                            (levelData.myBoatsColor[2]/255).toFixed(4)+","+
                                                             levelData.myBoatsColor[3]                     );

    frSh5 = frSh5.replace("REPLACE", replaceShader);
    frSh7 = frSh7.replace("REPLACE", replaceShader);
    frSh13 = frSh13.replace("REPLACE", replaceShader);
    frSh14 = frSh14.replace("REPLACE", replaceShader);
    frSh8 = frSh8.replace("REPLACE", levelData.waterQuantity.toFixed(2));

    const shaderCreator = global.shaderCreator;
    const vxSh0 = global.vxSh0;

    //shaders
    global.shaderP5 = shaderCreator(vxSh0, frSh5); //layer2 objects shape
    global.shdVtx5 = gl.getAttribLocation(global.shaderP5, "vtx");
    global.shdMtx5 = gl.getUniformLocation(global.shaderP5, "mtx");
    global.shaderP13 = shaderCreator(vxSh0, frSh13); //layer2 objects color
    global.shdVtx13 = gl.getAttribLocation(global.shaderP13, "vtx");
    global.shdMtx13 = gl.getUniformLocation(global.shaderP13, "mtx");
    global.shaderP7 = shaderCreator(vxSh0, frSh7); //layer1 terrain height
    global.shdVtx7 = gl.getAttribLocation(global.shaderP7, "vtx");
    global.shaderP8 = shaderCreator(vxSh0, frSh8); //layer0 water quantity
    global.shdVtx8 = gl.getAttribLocation(global.shaderP8, "vtx");
    global.shaderP14 = shaderCreator(vxSh0, frSh14);//layer1 map decorations
    global.shdVtx14 = gl.getAttribLocation(global.shaderP14, "vtx");

    global.fillTex0 = true; //water
    global.fillTex1 = true; //terrain and map decorations
    global.fillTex2 = true; //objects made of balls

    global.myBoatsColor = [ levelData.myBoatsColor[0],
                            levelData.myBoatsColor[1],
                            levelData.myBoatsColor[2],
                            levelData.myBoatsColor[3]*255];

    global.finalDestinationCorner = levelData.finalDestinationCorner;

    global.levelEnded = false;//trigger only once levelPassed() or levelFailed()
    global.confetti = false;

    destroyBlockers();
    if(levelData.blockers) levelData.blockers.forEach(obj=>{
        addBlocker(obj.w, obj.h, obj.l, obj.t);
    })


    if(n >=1 && n<=3) showTutorial(n);
}
global.loadLevel = loadLevel;

const setPhysicsConstants = ()=> {
    //variables changes in real time
    //no performance cost for modifiyng these

    global.ballsCollisionForce = .1;
    global.ballsCollisionDamping = .025;

    global.waterPushByPlayer = 7;
    global.waterCurrentsForceOfMap = .0015;
    global.waterFrictionToObjects = .04;

    global.terrainHeightForce = 2;

    global.objectsBarLength = 2;
    global.objectsBarForce = .06;
    global.objectsBarDamping = .02;
}
const levelStatus = ()=> {
    if(global.levelEnded){ return; }

    //run this functions every 4 frames
    if (typeof global.frameCounter === 'undefined')
    { global.frameCounter = 0; }
    ++global.frameCounter;
    if((global.frameCounter & 3) != 0){ return; }
    
    let pix = global.rdPix;
    const gl = global.gl;
    gl.readPixels(0, 0, global.texWidth, global.texHeight, gl.RGBA, gl.UNSIGNED_BYTE, pix);

    let rd = 0;
    let alive = false;//if any green boat is alive
    let lvlPass = false;//if level is passed

    for(let j = 0; j < global.texHeight; ++j)
    {
        for(let i = 0; i < global.texWidth; ++i)
        {
            if( pix[rd+1] > pix[rd+0] &&
                pix[rd+1] > pix[rd+2] )//ball has green color
            { 
                alive = true;

                let fDist = .07;//how close to the final destination to pass the level
                let fPos = .85;//position of the final destination

                let x = 2*(Math.floor(i*.5+.25)+.5)/(global.texWidth *.5)-1;
                let y = 2*(Math.floor(j*.5+.25)+.5)/(global.texHeight*.5)-1;
                x -= global.finalDestinationCorner[0] * fPos;
                y -= global.finalDestinationCorner[1] * fPos;

                if( x*x+y*y < fDist*fDist )
                {
                    lvlPass = true;
                }
            }
            rd += 4;
        }
    }
    if( lvlPass ){levelPassed(); global.levelEnded = true; global.confetti = true;}
    if( !alive  ){levelFailed(); global.levelEnded = true;}
}
const levelPassed = ()=> {
    if(global.unlockedLevels == global.currentLevel) global.unlockedLevels++;
    showLevels();
    showEndScreen(1);
}
const levelFailed = ()=> {
    showLevels();
    showEndScreen(0);
}
const render = ()=> {
    //update input data
    global.shaderMtx[4] = (0 + global.inputX / glCanvas.width) * global.texWidth;
    global.shaderMtx[5] = (1 - global.inputY / glCanvas.height) * global.texHeight;
    global.shaderMtx[6] = global.waterPushByPlayer * global.inputXd / glCanvas.width;
    global.shaderMtx[7] = global.waterPushByPlayer * -global.inputYd / glCanvas.height;
    if (global.inputO == 0) {
        global.shaderMtx[4] = -10000;
        global.shaderMtx[5] = -10000;
    }
    //update canvas size
    global.shaderMtx[12] = 1 / glCanvas.width;
    global.shaderMtx[13] = 1 / glCanvas.height;
    //update physics constants
    global.shaderMtx[2] = global.ballsCollisionForce;
    global.shaderMtx[3] = global.ballsCollisionDamping;
    global.shaderMtx[8] = global.objectsBarLength;
    global.shaderMtx[10] = global.waterFrictionToObjects;
    global.shaderMtx[11] = global.terrainHeightForce;
    global.shaderMtx[14] = global.objectsBarForce;
    global.shaderMtx[15] = global.objectsBarDamping;

    const gl = global.gl;

    gl.viewport(0, 0, global.texWidth, global.texHeight);

    let rd = 0;
    let wt = 0;

    //render to layer0
    {
        if (global.fillTex0) //initialize textures
        {
            global.fillTex0 = false;

            gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb0[global.l0n & 1]);
            gl.useProgram(global.shaderP8);
            gl.vertexAttribPointer(global.shdVtx8, 1, gl.FLOAT, 0, 0, 0);
            gl.enableVertexAttribArray(global.shdVtx8);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }

        rd = global.l0n & 1; //read
        ++global.l0n;
        wt = global.l0n & 1; //write
        //calculate ball to ball collision
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb0[wt]);
        gl.useProgram(global.shaderP0);
        gl.uniform1i(global.shdTex0, 0 + rd);
        gl.uniformMatrix4fv(global.shdMtx0, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx0, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        global.shaderMtx[9] = global.waterCurrentsForceOfMap; //layer1-enable constant currents forces

        rd = global.l0n & 1; //read
        ++global.l0n;
        wt = global.l0n & 1; //write
        //calculate collision with layer1
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb0[wt]);
        gl.useProgram(global.shaderP1);
        gl.uniform1i(global.shdTex10, 0 + rd);
        gl.uniform1i(global.shdTex11, 2 + 0);
        gl.uniformMatrix4fv(global.shdMtx1, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx1, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx1);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        rd = global.l0n & 1; //read
        ++global.l0n;
        wt = global.l0n & 1; //write
        //calculate ball grid movement
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb0[wt]);
        gl.useProgram(global.shaderP2);
        gl.uniform1i(global.shdTex2, 0 + rd);
        gl.uniformMatrix4fv(global.shdMtx2, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx2, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx2);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    //render to layer1
    {
        if (global.fillTex1) {
            global.fillTex1 = false;

            gl.viewport(0, 0, global.texWidth * 2, global.texHeight * 2);

            gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb1[0]);
            gl.useProgram(global.shaderP7);
            gl.vertexAttribPointer(global.shdVtx7, 1, gl.FLOAT, 0, 0, 0);
            gl.enableVertexAttribArray(global.shdVtx7);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb1[1]);
            gl.useProgram(global.shaderP14);
            gl.vertexAttribPointer(global.shdVtx14, 1, gl.FLOAT, 0, 0, 0);
            gl.enableVertexAttribArray(global.shdVtx14);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            gl.viewport(0, 0, global.texWidth, global.texHeight);
        }
    }
    //render to layer2
    {
        if (global.fillTex2) //initialize textures
        {
            global.fillTex2 = false;

            gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb2[global.l2n & 1]);
            gl.useProgram(global.shaderP5);
            gl.uniformMatrix4fv(global.shdMtx5, gl.FALSE, global.shaderMtx);
            gl.vertexAttribPointer(global.shdVtx5, 1, gl.FLOAT, 0, 0, 0);
            gl.enableVertexAttribArray(global.shdVtx5);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            // const pixels = new Float32Array(global.texWidth*global.texHeight*4);
            // gl.readPixels(0, 0, global.texWidth, global.texHeight, gl.RGBA, gl.FLOAT, pixels);
            // let stri = "";
            // let read = 0;
            // let t = 0;
            // for(let j = 0; j < global.texHeight; ++j)
            // {
            //     for(let i = 0; i < global.texWidth; ++i)
            //     {
            //         if(pixels[read]>=0){stri += " ";}
            //         stri += pixels[read].toFixed(1) + " ";   ++read;
            //         if(pixels[read]>=0){stri += " ";}
            //         stri += pixels[read].toFixed(1) + " ";   ++read;
            //         if(pixels[read]>=0){stri += " ";}
            //         stri += pixels[read].toFixed(1) + " ";   ++read;
            //         if(pixels[read]>=0){stri += " ";}
            //         stri += pixels[read].toFixed(1) + "|";   ++read;
            //         if((i&1)!=0){stri += "|";}
            //     }
            //     stri += "\n";
            // }
            // console.log(stri);

            gl.viewport(0, 0, global.texWidth * 2, global.texHeight);

            gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb3[global.l3n & 1]);
            gl.useProgram(global.shaderP6);
            gl.uniform1i(global.shdTex6, 4 + (global.l2n & 1));
            gl.uniformMatrix4fv(global.shdMtx6, gl.FALSE, global.shaderMtx);
            gl.vertexAttribPointer(global.shdVtx6, 1, gl.FLOAT, 0, 0, 0);
            gl.enableVertexAttribArray(global.shdVtx6);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            // pixels = new Uint8Array((global.texWidth*2)*(global.texHeight)*4);
            // gl.readPixels(0, 0, global.texWidth*2, global.texHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            // stri = "";
            // read = 0;
            // t = 0;
            // for(let j = 0; j < global.texHeight; ++j)
            // {
            //     for(let i = 0; i < global.texWidth*2; ++i)
            //     {
            //         t = pixels[read]+.5; while(t<100){stri += " "; t*=10;}
            //         stri += pixels[read] + " ";   ++read;
            //         t = pixels[read]+.5; while(t<100){stri += " "; t*=10;}
            //         stri += pixels[read] + " ";   ++read;
            //         t = pixels[read]+.5; while(t<100){stri += " "; t*=10;}
            //         stri += pixels[read] + " ";   ++read;
            //         t = pixels[read]+.5; while(t<100){stri += " "; t*=10;}
            //         stri += pixels[read] + "|";   ++read;
            //         if((i&1)!=0){stri += "|";}
            //     }
            //     stri += "\n";
            // }
            // console.log(stri);

            gl.viewport(0, 0, global.texWidth, global.texHeight);

            gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb4[global.l4n & 1]);
            gl.useProgram(global.shaderP13);
            gl.uniformMatrix4fv(global.shdMtx13, gl.FALSE, global.shaderMtx);
            gl.vertexAttribPointer(global.shdVtx13, 1, gl.FLOAT, 0, 0, 0);
            gl.enableVertexAttribArray(global.shdVtx13);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }

        //turn off input forces
        global.shaderMtx[6] = 0;
        global.shaderMtx[7] = 0;

        rd = global.l2n & 1; //read
        ++global.l2n;
        wt = global.l2n & 1; //write
        //calculate ball to ball collision
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb2[wt]);
        gl.useProgram(global.shaderP0);
        gl.uniform1i(global.shdTex0, 4 + rd);
        gl.uniformMatrix4fv(global.shdMtx0, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx0, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        rd = global.l2n & 1; //read
        ++global.l2n;
        wt = global.l2n & 1; //write
        //calculate bar forces
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb2[wt]);
        gl.useProgram(global.shaderP3);
        gl.uniform1i(global.shdTex30, 4 + rd);
        gl.uniform1i(global.shdTex31, 6 + (global.l3n & 1));
        gl.uniformMatrix4fv(global.shdMtx3, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx3, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx3);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        rd = global.l2n & 1; //read
        ++global.l2n;
        wt = global.l2n & 1; //write
        //calculate forces from layer0
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb2[wt]);
        gl.useProgram(global.shaderP9);
        gl.uniform1i(global.shdTex90, 4 + rd);
        gl.uniform1i(global.shdTex91, 0 + (global.l0n & 1));
        gl.uniformMatrix4fv(global.shdMtx9, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx9, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx9);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        global.shaderMtx[9] = 0; //layer1-disable constant currents forces

        rd = global.l2n & 1; //read
        ++global.l2n;
        wt = global.l2n & 1; //write
        //calculate collision with layer1
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb2[wt]);
        gl.useProgram(global.shaderP1);
        gl.uniform1i(global.shdTex10, 4 + rd);
        gl.uniform1i(global.shdTex11, 2 + 0);
        gl.uniformMatrix4fv(global.shdMtx1, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx1, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx1);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        
        rd = global.l2n & 1;//read
        ++global.l2n;
        wt = global.l2n & 1;//write
        //make ball immovable if color ...
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb2[wt]);
        gl.useProgram(global.shaderP15);
        gl.uniform1i(global.shdTex150, 4 + rd);
        gl.uniform1i(global.shdTex151, 8 + ((global.l4n + 0) & 1));
        gl.vertexAttribPointer(global.shdVtx15, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx15);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        rd = global.l2n & 1; //read
        ++global.l2n;
        wt = global.l2n & 1; //write
        //calculate ball grid movement
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb2[wt]);
        gl.useProgram(global.shaderP2);
        gl.uniform1i(global.shdTex2, 4 + rd);
        gl.uniformMatrix4fv(global.shdMtx2, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx2, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx2);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        rd = global.l4n & 1; //read
        ++global.l4n;
        wt = global.l4n & 1; //write
        //calculate color grid movement
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb4[wt]);
        gl.useProgram(global.shaderP10);
        gl.uniform1i(global.shdTex100, 8 + rd);
        gl.uniform1i(global.shdTex101, 4 + ((global.l2n + 0) & 1));
        gl.uniform1i(global.shdTex102, 4 + ((global.l2n + 1) & 1));
        gl.uniformMatrix4fv(global.shdMtx10, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx10, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx10);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        rd = global.l4n & 1; //read
        ++global.l4n;
        wt = global.l4n & 1; //write
        //calculate objects collision causes ball color change
        let tume = global.shaderMtx[2];
        global.shaderMtx[2] = global.confetti*1;
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb4[wt]);
        gl.useProgram(global.shaderP11);
        gl.uniform1i(global.shdTex110, 8 + rd);
        gl.uniform1i(global.shdTex111, 4 + ((global.l2n + 0) & 1));
        gl.uniformMatrix4fv(global.shdMtx11, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx11, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx11);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        global.shaderMtx[2] = tume;

        levelStatus();//must be positioned here

        gl.viewport(0, 0, global.texWidth * 2, global.texHeight);

        rd = global.l3n & 1; //read
        ++global.l3n;
        wt = global.l3n & 1; //write
        //calculate balls bar grid movement
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb3[wt]);
        gl.useProgram(global.shaderP4);
        gl.uniform1i(global.shdTex40, 6 + rd);
        gl.uniform1i(global.shdTex41, 4 + ((global.l2n + 0) & 1));
        gl.uniform1i(global.shdTex42, 4 + ((global.l2n + 1) & 1));
        gl.uniformMatrix4fv(global.shdMtx4, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx4, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx4);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        rd = global.l3n & 1; //read
        ++global.l3n;
        wt = global.l3n & 1; //write
        //calculate bar between balls with different colors gets destroyed
        gl.bindFramebuffer(gl.FRAMEBUFFER, global.fb3[wt]);
        gl.useProgram(global.shaderP12);
        gl.uniform1i(global.shdTex120, 6 + rd);
        gl.uniform1i(global.shdTex121, 8 + ((global.l4n + 0) & 1));
        gl.uniformMatrix4fv(global.shdMtx12, gl.FALSE, global.shaderMtx);
        gl.vertexAttribPointer(global.shdVtx12, 1, gl.FLOAT, 0, 0, 0);
        gl.enableVertexAttribArray(global.shdVtx12);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    gl.viewport(0, 0, glCanvas.width, glCanvas.height);

    //render to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(global.shaderPS);
    gl.uniform1i(global.shdTexS0, 0 + ((global.l0n + 0) & 1));
    gl.uniform1i(global.shdTexS1, 2 + 0                     );
    gl.uniform1i(global.shdTexS2, 4 + ((global.l2n + 0) & 1));
    gl.uniform1i(global.shdTexS3, 8 + ((global.l4n + 0) & 1));
    gl.uniform1i(global.shdTexS4, 2 + 1                     );
    gl.uniformMatrix4fv(global.shdMtxS, gl.FALSE, global.shaderMtx);
    gl.vertexAttribPointer(global.shdVtxS, 1, gl.FLOAT, 0, 0, 0);
    gl.enableVertexAttribArray(global.shdVtxS);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    window.requestAnimationFrame(render);
}

// ENTRY POINT
startGame()
