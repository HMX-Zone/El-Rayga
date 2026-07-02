/* ============================================================
   EL RAYGA — WEBGL HERO
   Raw-GLSL animated scene: dusk sky over the Gulf of Aqaba,
   Saudi mountains, shimmering sea, drifting stars. Reacts to
   the mouse and to scroll. No 3D library needed.
   ============================================================ */
(function () {
  const canvas = document.querySelector(".hero-gl");
  if (!canvas) return;
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (canvas) canvas.style.display = "none";
    const fallback = document.querySelector(".hero-art");
    if (fallback) fallback.style.display = "block";
    return;
  }

  const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
  const fs = `
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

  // --- sky: dusk gradient, warmer near horizon
  vec3 skyTop = vec3(.10,.09,.20);
  vec3 skyMid = vec3(.66,.30,.22);
  vec3 skyLow = vec3(.93,.62,.34);
  float horizon = .46 + uScroll * .06;
  float sy = smoothstep(horizon, 1.05, uv.y + m.y);
  vec3 col = mix(skyLow, mix(skyMid, skyTop, smoothstep(.3,1.,sy)), sy);

  // clouds
  float cl = fbm(vec2(uv.x*3. + t*.8, uv.y*6. - t*.2) );
  col += smoothstep(.55,.95,cl) * .06 * vec3(1.,.8,.7) * step(horizon, uv.y);

  // sun
  vec2 sunP = vec2(.68 + m.x, horizon + .17 + m.y*.5);
  float d = distance(vec2(uv.x, uv.y*1.4), vec2(sunP.x, sunP.y*1.4));
  col += vec3(1.,.75,.42) * exp(-d*d*160.);
  col += vec3(1.,.55,.3) * exp(-d*d*18.) * .35;

  // stars up top
  float st = step(.997, hash(floor(uv*vec2(280.,160.)))) * smoothstep(.62,.95,uv.y) * (0.5+0.5*sin(uTime*2.+uv.x*80.));
  col += st * .8;

  // --- mountains (Saudi coast across the gulf)
  float mtn = horizon + fbm(vec2(uv.x*5. + 7.3, 2.)) * .075;
  float mtn2 = horizon + fbm(vec2(uv.x*3.2 + 2., 5.)) * .045;
  if (uv.y < mtn2) col = mix(col, vec3(.16,.10,.19), .85);
  else if (uv.y < mtn) col = mix(col, vec3(.23,.14,.24), .7);

  // --- sea
  if (uv.y < horizon) {
    float depth = (horizon - uv.y) / horizon;
    vec3 seaFar = vec3(.13,.36,.38);
    vec3 seaNear = vec3(.03,.16,.19);
    vec3 sea = mix(seaFar, seaNear, smoothstep(0.,.9,depth));
    // waves: stretched noise, faster near viewer
    float w = fbm(vec2(uv.x*40., uv.y*140. + t*14.) * vec2(1., .35));
    float sparkle = smoothstep(.68,.86,w) * (.20 + .35*depth);
    sea += sparkle * vec3(.9,.75,.5);
    // sun reflection column
    float refl = exp(-pow((uv.x - sunP.x)*9.,2.)) * exp(-depth*3.5);
    sea += refl * vec3(1.,.6,.32) * (.4 + .3*sin(uv.y*300.+uTime*3.));
    col = sea;
  }

  // vignette + grain
  vec2 q = uv - .5;
  col *= 1. - dot(q,q)*.9;
  col += (hash(uv*uTime) - .5) * .035;

  gl_FragColor = vec4(col, 1.);
}`;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog); gl.useProgram(prog);

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
  addEventListener("mousemove", (e) => { mx = e.clientX / innerWidth; my = 1 - e.clientY / innerHeight; }, { passive: true });

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  addEventListener("resize", resize);

  const t0 = performance.now();
  (function frame() {
    smx += (mx - smx) * 0.04; smy += (my - smy) * 0.04;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (performance.now() - t0) / 1000);
    gl.uniform2f(uMouse, smx, smy);
    gl.uniform1f(uScroll, Math.min(scrollY / innerHeight, 1));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  })();
})();
