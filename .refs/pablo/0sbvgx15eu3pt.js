(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,808563,488098,e=>{"use strict";var t=e.i(843476),a=e.i(271645);function r(e,t){return"number"==typeof e&&Number.isFinite(e)?e:t}function n(e){var t;return{engine:"webgl"===(t=e?.engine)||"fallback"===t||"auto"===t?t:"auto",refraction:r(e?.refraction,20),edgeFade:r(e?.edgeFade,.22),shimmer:r(e?.shimmer,.95),chromaShift:r(e?.chromaShift,.36),animationSpeed:r(e?.animationSpeed,.85),fallbackBlur:r(e?.fallbackBlur,24),fallbackSaturation:r(e?.fallbackSaturation,205),fallbackContrast:r(e?.fallbackContrast,1.05),fallbackBrightness:r(e?.fallbackBrightness,1.03),fallbackHighlightOpacity:r(e?.fallbackHighlightOpacity,.35)}}function i(e,t){let a=Number.parseFloat(e??"");return Number.isFinite(a)?a:t}function o(e){return n({engine:e.getPropertyValue("--glass-engine").trim(),refraction:i(e.getPropertyValue("--glass-refraction"),20),edgeFade:i(e.getPropertyValue("--glass-edge-fade"),.22),shimmer:i(e.getPropertyValue("--glass-shimmer"),.95),chromaShift:i(e.getPropertyValue("--glass-chroma-shift"),.36),animationSpeed:i(e.getPropertyValue("--glass-animation-speed"),.85),fallbackBlur:i(e.getPropertyValue("--glass-fallback-blur"),24),fallbackSaturation:i(e.getPropertyValue("--glass-fallback-saturation"),205),fallbackContrast:i(e.getPropertyValue("--glass-fallback-contrast"),1.05),fallbackBrightness:i(e.getPropertyValue("--glass-fallback-brightness"),1.03),fallbackHighlightOpacity:i(e.getPropertyValue("--glass-fallback-highlight-opacity"),.35)})}e.s(["normalizeGlassToken",0,n,"readGlassTokenFromStyles",0,o],488098);var l=e.i(975157);let s=`
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = (aPosition + 1.0) * 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`,c=`
precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
uniform float uRefraction;
uniform float uEdgeFade;
uniform float uShimmer;
uniform float uChromaShift;
uniform float uAnimationSpeed;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(12.4, 7.3);
    amplitude *= 0.52;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  vec2 centered = uv * 2.0 - 1.0;
  vec2 pointer = uPointer * 2.0 - 1.0;
  float time = uTime * max(uAnimationSpeed, 0.0);

  vec2 drift = vec2(
    fbm(uv * 4.0 + vec2(time * 0.08, -time * 0.05)) - 0.5,
    fbm(uv * 4.0 + vec2(-time * 0.06, time * 0.07)) - 0.5
  );
  vec2 toPointer = pointer - centered;
  float pointerFalloff = exp(-dot(toPointer, toPointer) * 3.6);
  vec2 warp = drift * (uRefraction * 0.0035) + toPointer * pointerFalloff * (uRefraction * 0.0012);

  float distToEdge = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float edge = 1.0 - smoothstep(0.0, max(uEdgeFade, 0.001), distToEdge);

  float bandA = fbm((uv + warp) * 7.2 + vec2(0.0, time * 0.08));
  float bandB = fbm((uv - warp.yx * 0.8) * 9.4 + vec2(time * 0.04, 0.0));
  float caustic = smoothstep(0.56, 0.92, bandA * 0.7 + bandB * 0.6);
  caustic = pow(caustic, 2.2) * uShimmer;

  float sheen = smoothstep(-0.35, 0.9, dot(normalize(vec2(-0.35, 0.9)), centered + warp * 18.0));
  float sparkle = smoothstep(0.72, 0.98, fbm((uv + warp * 1.7) * 14.0 - time * 0.03));
  float alpha = clamp(caustic * 0.24 + edge * 0.14 + sparkle * 0.06, 0.0, 0.34);

  vec3 color = vec3(0.0);
  color += vec3(1.0, 0.985, 0.98) * caustic * 0.65;
  color += vec3(1.0) * sheen * edge * 0.22;
  color.r += (caustic + sparkle) * uChromaShift * 0.08;
  color.b += (1.0 - caustic) * uChromaShift * 0.04;

  gl_FragColor = vec4(color, alpha);
}
`;function u(e,t,a){let r=e.createShader(t);return r?(e.shaderSource(r,a),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))?r:(e.deleteShader(r),null):null}e.s(["GlassHeaderLayer",0,function({active:e,hairline:r,config:i,className:f}){let d=(0,a.useRef)(null),m=(0,a.useRef)(null),h=(0,a.useRef)({x:.5,y:.5}),[v,g]=(0,a.useState)(!1),[p,b]=(0,a.useState)(null);(0,a.useEffect)(()=>{g(function(){if("u"<typeof document)return!1;let e=document.createElement("canvas");return!!(e.getContext("webgl",{alpha:!0,antialias:!0})??e.getContext("experimental-webgl"))}())},[]),(0,a.useEffect)(()=>{!i&&d.current&&b(o(getComputedStyle(d.current)))},[i,e]);let x=(0,a.useMemo)(()=>n(i??p),[i,p]),y=e&&v&&function(e){if("fallback"===e)return!1;if("u"<typeof navigator)return"webgl"===e;let t=navigator.platform??"",a=navigator.userAgent??"";return!(/iPad|iPhone|iPod/.test(t)||/iPad|iPhone|iPod/.test(a))&&("MacIntel"!==t||!(navigator.maxTouchPoints>1))}(x.engine),w=(0,a.useMemo)(()=>{var t;return t=i?x:void 0,e?t?`saturate(${t.fallbackSaturation}%) blur(${t.fallbackBlur}px) contrast(${t.fallbackContrast}) brightness(${t.fallbackBrightness})`:"saturate(calc(var(--glass-fallback-saturation) * 1%)) blur(calc(var(--glass-fallback-blur) * 1px)) contrast(var(--glass-fallback-contrast)) brightness(var(--glass-fallback-brightness))":"none"},[e,i,x]),k=(0,a.useMemo)(()=>({backdropFilter:w,WebkitBackdropFilter:w}),[w]);return(0,a.useEffect)(()=>{let e=m.current;if(!e||!y)return;let t=e.getContext("webgl",{alpha:!0,antialias:!0,premultipliedAlpha:!0});if(!t)return;let a=function(e){let t=u(e,e.VERTEX_SHADER,s),a=u(e,e.FRAGMENT_SHADER,c);if(!t||!a)return null;let r=e.createProgram();return r?(e.attachShader(r,t),e.attachShader(r,a),e.linkProgram(r),e.deleteShader(t),e.deleteShader(a),e.getProgramParameter(r,e.LINK_STATUS))?r:(e.deleteProgram(r),null):(e.deleteShader(t),e.deleteShader(a),null)}(t);if(!a)return;let r=t.getAttribLocation(a,"aPosition"),n=t.getUniformLocation(a,"uResolution"),i=t.getUniformLocation(a,"uPointer"),o=t.getUniformLocation(a,"uTime"),l=t.getUniformLocation(a,"uRefraction"),f=t.getUniformLocation(a,"uEdgeFade"),d=t.getUniformLocation(a,"uShimmer"),v=t.getUniformLocation(a,"uChromaShift"),g=t.getUniformLocation(a,"uAnimationSpeed"),p=t.createBuffer();if(!p)return void t.deleteProgram(a);t.bindBuffer(t.ARRAY_BUFFER,p),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW);let b=()=>{let a=e.getBoundingClientRect(),r=window.devicePixelRatio||1;e.width=Math.max(1,Math.round(a.width*r)),e.height=Math.max(1,Math.round(a.height*r)),t.viewport(0,0,e.width,e.height)},w=t=>{let a=e.getBoundingClientRect();a.width&&a.height&&(h.current={x:(t.clientX-a.left)/a.width,y:1-(t.clientY-a.top)/a.height})};b(),window.addEventListener("resize",b),window.addEventListener("pointermove",w,{passive:!0}),t.useProgram(a),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA),t.bindBuffer(t.ARRAY_BUFFER,p),t.enableVertexAttribArray(r),t.vertexAttribPointer(r,2,t.FLOAT,!1,0,0);let k=performance.now(),S=0,P=a=>{S=window.requestAnimationFrame(P),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.uniform2f(n,e.width,e.height),t.uniform2f(i,h.current.x,h.current.y),t.uniform1f(o,(a-k)*.001),t.uniform1f(l,x.refraction),t.uniform1f(f,x.edgeFade),t.uniform1f(d,x.shimmer),t.uniform1f(v,x.chromaShift),t.uniform1f(g,x.animationSpeed),t.drawArrays(t.TRIANGLES,0,6)};return S=window.requestAnimationFrame(P),()=>{window.cancelAnimationFrame(S),window.removeEventListener("resize",b),window.removeEventListener("pointermove",w),t.deleteBuffer(p),t.deleteProgram(a)}},[y,x]),(0,t.jsx)("div",{ref:d,"data-active":e?"true":"false","data-hairline":r?"true":"false","data-webgl":y?"true":"false","aria-hidden":"true",className:(0,l.cn)("glass-header-layer absolute inset-0",f),style:k,children:(0,t.jsx)("canvas",{ref:m,className:"glass-header-shader"})})}],808563)},480322,e=>{"use strict";var t=e.i(843476),a=e.i(522016),r=e.i(271645);e.i(668679);var n=e.i(562144),i=e.i(808563),o=e.i(975157);e.s(["Header",0,function({currentPath:e,navItems:l,wordmark:s,copy:c}){let[u,f]=(0,r.useState)(!1),[d,m]=(0,r.useState)(!1),h=(0,r.useRef)(null),v=(0,r.useRef)(!1);(0,r.useEffect)(()=>{let e=()=>m(Math.max(window.scrollY,document.documentElement.scrollTop,document.body.scrollTop)>8);return e(),window.addEventListener("scroll",e,{passive:!0}),()=>window.removeEventListener("scroll",e)},[]),(0,r.useEffect)(()=>{if(!u){v.current&&h.current?.focus(),v.current=!1;return}v.current=!0;let e=e=>{"Escape"===e.key&&f(!1)},t=document.body.style.overflow;return document.body.style.overflow="hidden",window.addEventListener("keydown",e),()=>{document.body.style.overflow=t,window.removeEventListener("keydown",e)}},[u]);let g=()=>f(e=>!e);return(0,t.jsxs)(t.Fragment,{children:[u?(0,t.jsx)("div",{className:"fixed inset-0 z-40 pointer-events-none lg:hidden",children:(0,t.jsx)(i.GlassHeaderLayer,{active:!0,hairline:!1})}):null,(0,t.jsxs)("header",{className:"fixed inset-x-0 top-0 z-50 h-16 pointer-events-none",children:[(0,t.jsx)(i.GlassHeaderLayer,{active:d&&!u,hairline:d&&!u}),(0,t.jsxs)("div",{className:"relative z-10 mx-auto flex h-16 w-full max-w-none items-center justify-between px-5 pointer-events-auto lg:max-w-[var(--rams-page-max)] lg:px-[28px]",children:[(0,t.jsx)(a.default,{href:"/",className:"site-logo-link focus-ring inline-flex items-center",children:(0,t.jsx)(n.RamsWordmark,{surface:"light",nameTone:"accent",wordmark:s})}),(0,t.jsx)("nav",{"aria-label":c.primaryNavigationLabel,className:"hidden lg:block",children:(0,t.jsx)("ul",{className:"flex items-center gap-[24px]",children:l.map(r=>{let n=e===r.href;return(0,t.jsx)("li",{className:"list-none",children:(0,t.jsx)(a.default,{href:r.href,"aria-current":n?"page":void 0,"data-active":n?"true":"false",className:(0,o.cn)("site-nav-link type-nav-link focus-ring relative inline-flex items-center uppercase transition-opacity duration-200 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:transition-transform after:duration-200 hover:opacity-70 hover:after:scale-x-100",n&&"after:scale-x-100 hover:opacity-100"),children:r.label})},r.href)})})}),(0,t.jsxs)("button",{ref:h,type:"button","aria-expanded":u,"aria-controls":"mobile-nav","aria-label":u?c.closeNavigationLabel:c.openNavigationLabel,onClick:g,onTouchEnd:e=>{e.preventDefault(),g()},className:"focus-ring relative z-10 flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] lg:hidden",children:[(0,t.jsx)("span",{className:"sr-only",children:c.menuLabel}),(0,t.jsxs)("span",{"aria-hidden":"true",className:"flex flex-col gap-1.5",children:[(0,t.jsx)("span",{className:(0,o.cn)("block h-0.5 w-5 bg-brand-accent transition-transform motion-reduce:transition-none",u&&"translate-y-2 rotate-45")}),(0,t.jsx)("span",{className:(0,o.cn)("block h-0.5 w-5 bg-brand-accent transition-opacity motion-reduce:transition-none",u&&"opacity-0")}),(0,t.jsx)("span",{className:(0,o.cn)("block h-0.5 w-5 bg-brand-accent transition-transform motion-reduce:transition-none",u&&"-translate-y-2 -rotate-45")})]})]})]})]}),(0,t.jsx)("div",{id:"mobile-nav",hidden:!u,className:(0,o.cn)("fixed inset-x-0 bottom-0 top-16 z-40 isolate overflow-y-auto overscroll-contain px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-8 transition-[opacity,transform] duration-300 motion-reduce:transform-none motion-reduce:transition-none lg:hidden",u?"pointer-events-auto translate-y-0 opacity-100":"pointer-events-none -translate-y-2 opacity-0"),children:(0,t.jsx)("div",{className:"relative z-10",children:(0,t.jsx)("nav",{"aria-label":c.mobileNavigationLabel,className:"block",children:(0,t.jsx)("ul",{className:"flex flex-col gap-4",children:l.map(r=>{let n=e===r.href;return(0,t.jsx)("li",{className:"list-none",children:(0,t.jsx)(a.default,{href:r.href,onClick:()=>f(!1),"aria-current":n?"page":void 0,"data-active":n?"true":"false",className:(0,o.cn)("mobile-nav-link type-nav-link-mobile focus-ring inline-flex uppercase",n&&"underline underline-offset-4"),children:r.label})},r.href)})})})})})]})}])}]);