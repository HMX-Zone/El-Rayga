"use client";

import { useEffect, useRef } from "react";

/* Raw-GLSL animated Red Sea dusk: sky, Saudi mountains across the gulf,
   shimmering water, sun path, drifting stars. Mouse + scroll reactive.
   Falls back to a static gradient when WebGL / motion is unavailable. */

const FS = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uScroll;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.03; a *= .5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float t = uTime * .05;
  vec2 m = (uMouse - .5) * .06;

  vec3 skyTop = vec3(.10,.09,.20);
  vec3 skyMid = vec3(.66,.30,.22);
  vec3 skyLow = vec3(.93,.62,.34);
  float horizon = .46 + uScroll * .06;
  float sy = smoothstep(horizon, 1.05, uv.y + m.y);
  vec3 col = mix(skyLow, mix(skyMid, skyTop, smoothstep(.3,1.,sy)), sy);

  float cl = fbm(vec2(uv.x*3. + t*.8, uv.y*6. - t*.2));
  col += smoothstep(.55,.95,cl) * .06 * vec3(1.,.8,.7) * step(horizon, uv.y);

  vec2 sunP = vec2(.68 + m.x, horizon + .17 + m.y*.5);
  float d = distance(vec2(uv.x, uv.y*1.4), vec2(sunP.x, sunP.y*1.4));
  col += vec3(1.,.75,.42) * exp(-d*d*160.);
  col += vec3(1.,.55,.3) * exp(-d*d*18.) * .35;

  float st = step(.997, hash(floor(uv*vec2(280.,160.)))) * smoothstep(.62,.95,uv.y) * (0.5+0.5*sin(uTime*2.+uv.x*80.));
  col += st * .8;

  float mtn = horizon + fbm(vec2(uv.x*5. + 7.3, 2.)) * .075;
  float mtn2 = horizon + fbm(vec2(uv.x*3.2 + 2., 5.)) * .045;
  if (uv.y < mtn2) col = mix(col, vec3(.16,.10,.19), .85);
  else if (uv.y < mtn) col = mix(col, vec3(.23,.14,.24), .7);

  if (uv.y < horizon) {
    float depth = (horizon - uv.y) / horizon;
    vec3 seaFar = vec3(.13,.36,.38);
    vec3 seaNear = vec3(.03,.16,.19);
    vec3 sea = mix(seaFar, seaNear, smoothstep(0.,.9,depth));
    float w = fbm(vec2(uv.x*40., uv.y*140. + t*14.) * vec2(1., .35));
    float sparkle = smoothstep(.68,.86,w) * (.20 + .35*depth);
    sea += sparkle * vec3(.9,.75,.5);
    float refl = exp(-pow((uv.x - sunP.x)*9.,2.)) * exp(-depth*3.5);
    sea += refl * vec3(1.,.6,.32) * (.4 + .3*sin(uv.y*300.+uTime*3.));
    col = sea;
  }

  vec2 q = uv - .5;
  col *= 1. - dot(q,q)*.9;
  col += (hash(uv*uTime) - .5) * .03;

  gl_FragColor = vec4(col, 1.);
}`;

export default function HeroGL() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }"));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uScroll = gl.getUniformLocation(prog, "uScroll");

    let mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
    const onMouse = (e: MouseEvent) => { mx = e.clientX / innerWidth; my = 1 - e.clientY / innerHeight; };
    addEventListener("mousemove", onMouse, { passive: true });

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.75);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    addEventListener("resize", resize);

    const t0 = performance.now();
    let raf = 0;
    const frame = () => {
      smx += (mx - smx) * 0.04;
      smy += (my - smy) * 0.04;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform2f(uMouse, smx, smy);
      gl.uniform1f(uScroll, Math.min(scrollY / innerHeight, 1));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMouse);
      removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="hero-gl"
      aria-hidden
      style={{ background: "linear-gradient(to bottom, #1a1430 0%, #a4552f 42%, #0a2b30 46%, #06181c 100%)" }}
    />
  );
}
