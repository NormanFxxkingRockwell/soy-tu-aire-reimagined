(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,468750,t=>{"use strict";var e=t.i(694359),r=t.i(631320);let i={};t.s(["getTextureBatchBindGroup",0,function(t,a,n){let o=0x811c9dc5;for(let e=0;e<a;e++)o^=t[e].uid,o=Math.imul(o,0x1000193)>>>0;return i[o]||function(t,a,n,o){let s={},u=0;for(let e=0;e<o;e++){let i=e<a?t[e]:r.Texture.EMPTY.source;s[u++]=i.source,s[u++]=i.style}let l=new e.BindGroup(s);return i[n]=l,l}(t,a,o,n)}])},787323,737024,918102,996108,660728,628028,394433,240940,345284,t=>{"use strict";var e,r=t.i(124314);class i{constructor(t){"number"==typeof t?this.rawBinaryData=new ArrayBuffer(t):t instanceof Uint8Array?this.rawBinaryData=t.buffer:this.rawBinaryData=t,this.uint32View=new Uint32Array(this.rawBinaryData),this.float32View=new Float32Array(this.rawBinaryData),this.size=this.rawBinaryData.byteLength}get int8View(){return this._int8View||(this._int8View=new Int8Array(this.rawBinaryData)),this._int8View}get uint8View(){return this._uint8View||(this._uint8View=new Uint8Array(this.rawBinaryData)),this._uint8View}get int16View(){return this._int16View||(this._int16View=new Int16Array(this.rawBinaryData)),this._int16View}get int32View(){return this._int32View||(this._int32View=new Int32Array(this.rawBinaryData)),this._int32View}get float64View(){return this._float64Array||(this._float64Array=new Float64Array(this.rawBinaryData)),this._float64Array}get bigUint64View(){return this._bigUint64Array||(this._bigUint64Array=new BigUint64Array(this.rawBinaryData)),this._bigUint64Array}view(t){return this[`${t}View`]}destroy(){this.rawBinaryData=null,this.uint32View=null,this.float32View=null,this.uint16View=null,this._int8View=null,this._uint8View=null,this._int16View=null,this._int32View=null,this._float64Array=null,this._bigUint64Array=null}static sizeOf(t){switch(t){case"int8":case"uint8":return 1;case"int16":case"uint16":return 2;case"int32":case"uint32":case"float32":return 4;default:throw Error(`${t} isn't a valid view type`)}}}t.s(["ViewableBuffer",0,i],737024);var a=t.i(649864),n=t.i(148446);function o(t,e,r,i){if(r??(r=0),i??(i=Math.min(t.byteLength-r,e.byteLength)),7&r||7&i)if(3&r||3&i)new Uint8Array(e).set(new Uint8Array(t,r,i));else{let a=i/4;new Float32Array(e,0,a).set(new Float32Array(t,r,a))}else{let a=i/8;new Float64Array(e,0,a).set(new Float64Array(t,r,a))}}t.s(["fastCopy",0,o],918102);let s={normal:"normal-npm",add:"add-npm",screen:"screen-npm"};var u=((e=u||{})[e.DISABLED=0]="DISABLED",e[e.RENDERING_MASK_ADD=1]="RENDERING_MASK_ADD",e[e.MASK_ACTIVE=2]="MASK_ACTIVE",e[e.INVERSE_MASK_ACTIVE=3]="INVERSE_MASK_ACTIVE",e[e.RENDERING_MASK_REMOVE=4]="RENDERING_MASK_REMOVE",e[e.NONE=5]="NONE",e);function l(t,e){return"no-premultiply-alpha"===e.alphaMode&&s[t]||t}t.s(["BLEND_TO_NPM",0,s,"STENCIL_MODES",0,u],996108),t.s(["getAdjustedBlendModeBlend",0,l],660728);var f=t.i(729281);function c(t,e){if(0===t)throw Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");let r=e.createShader(e.FRAGMENT_SHADER);try{for(;;){let i="precision mediump float;\nvoid main(void){\nfloat test = 0.1;\n%forloop%\ngl_FragColor = vec4(0.0);\n}".replace(/%forloop%/gi,function(t){let e="";for(let r=0;r<t;++r)r>0&&(e+="\nelse "),r<t-1&&(e+=`if(test == ${r}.0){}`);return e}(t));if(e.shaderSource(r,i),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))break;t=t/2|0}}finally{e.deleteShader(r)}return t}t.s(["checkMaxIfStatementsInShader",0,c],628028);let d=null;function h(){if(d)return d;let t=(0,f.getTestContext)();return d=c(d=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),t),t.getExtension("WEBGL_lose_context")?.loseContext(),d}t.s(["getMaxTexturesPerBatch",0,h],394433);class v{constructor(){this.ids=Object.create(null),this.textures=[],this.count=0}clear(){for(let t=0;t<this.count;t++){let e=this.textures[t];this.textures[t]=null,this.ids[e.uid]=null}this.count=0}}t.s(["BatchTextureArray",0,v],240940);class m{constructor(){this.renderPipeId="batch",this.action="startBatch",this.start=0,this.size=0,this.textures=new v,this.blendMode="normal",this.topology="triangle-strip",this.canBundle=!0}destroy(){this.textures=null,this.gpuBindGroup=null,this.bindGroup=null,this.batcher=null,this.elements=null}}let x=[],p=0;function b(){return p>0?x[--p]:new m}function g(t){t.elements=null,x[p++]=t}n.GlobalResourceRegistry.register({clear:()=>{if(x.length>0)for(let t of x)t&&t.destroy();x.length=0,p=0}});let _=0,y=class t{constructor(e){this.uid=(0,r.uid)("batcher"),this.dirty=!0,this.batchIndex=0,this.batches=[],this._elements=[],(e={...t.defaultOptions,...e}).maxTextures||((0,a.deprecation)("v8.8.0","maxTextures is a required option for Batcher now, please pass it in the options"),e.maxTextures=h());const{maxTextures:n,attributesInitialSize:o,indicesInitialSize:s}=e;this.attributeBuffer=new i(4*o),this.indexBuffer=new Uint16Array(s),this.maxTextures=n}begin(){this.elementSize=0,this.elementStart=0,this.indexSize=0,this.attributeSize=0;for(let t=0;t<this.batchIndex;t++)g(this.batches[t]);this.batchIndex=0,this._batchIndexStart=0,this._batchIndexSize=0,this.dirty=!0}add(t){this._elements[this.elementSize++]=t,t._indexStart=this.indexSize,t._attributeStart=this.attributeSize,t._batcher=this,this.indexSize+=t.indexSize,this.attributeSize+=t.attributeSize*this.vertexSize}checkAndUpdateTexture(t,e){let r=t._batch.textures.ids[e._source.uid];return(!!r||0===r)&&(t._textureId=r,t.texture=e,!0)}updateElement(t){this.dirty=!0;let e=this.attributeBuffer;t.packAsQuad?this.packQuadAttributes(t,e.float32View,e.uint32View,t._attributeStart,t._textureId):this.packAttributes(t,e.float32View,e.uint32View,t._attributeStart,t._textureId)}break(t){let e=this._elements;if(!e[this.elementStart])return;let r=b(),i=r.textures;i.clear();let a=e[this.elementStart],n=l(a.blendMode,a.texture._source),o=a.topology;4*this.attributeSize>this.attributeBuffer.size&&this._resizeAttributeBuffer(4*this.attributeSize),this.indexSize>this.indexBuffer.length&&this._resizeIndexBuffer(this.indexSize);let s=this.attributeBuffer.float32View,u=this.attributeBuffer.uint32View,f=this.indexBuffer,c=this._batchIndexSize,d=this._batchIndexStart,h="startBatch",v=[],m=this.maxTextures;for(let a=this.elementStart;a<this.elementSize;++a){let x=e[a];e[a]=null;let p=x.texture._source,g=l(x.blendMode,p),y=n!==g||o!==x.topology;if(p._batchTick===_&&!y){x._textureId=p._textureBindLocation,c+=x.indexSize,x.packAsQuad?(this.packQuadAttributes(x,s,u,x._attributeStart,x._textureId),this.packQuadIndex(f,x._indexStart,x._attributeStart/this.vertexSize)):(this.packAttributes(x,s,u,x._attributeStart,x._textureId),this.packIndex(x,f,x._indexStart,x._attributeStart/this.vertexSize)),x._batch=r,v.push(x);continue}p._batchTick=_,(i.count>=m||y)&&(this._finishBatch(r,d,c-d,i,n,o,t,h,v),h="renderBatch",d=c,n=g,o=x.topology,(i=(r=b()).textures).clear(),v=[],++_),x._textureId=p._textureBindLocation=i.count,i.ids[p.uid]=i.count,i.textures[i.count++]=p,x._batch=r,v.push(x),c+=x.indexSize,x.packAsQuad?(this.packQuadAttributes(x,s,u,x._attributeStart,x._textureId),this.packQuadIndex(f,x._indexStart,x._attributeStart/this.vertexSize)):(this.packAttributes(x,s,u,x._attributeStart,x._textureId),this.packIndex(x,f,x._indexStart,x._attributeStart/this.vertexSize))}i.count>0&&(this._finishBatch(r,d,c-d,i,n,o,t,h,v),d=c,++_),this.elementStart=this.elementSize,this._batchIndexStart=d,this._batchIndexSize=c}_finishBatch(t,e,r,i,a,n,o,s,u){t.gpuBindGroup=null,t.bindGroup=null,t.action=s,t.batcher=this,t.textures=i,t.blendMode=a,t.topology=n,t.start=e,t.size=r,t.elements=u,++_,this.batches[this.batchIndex++]=t,o.add(t)}finish(t){this.break(t)}ensureAttributeBuffer(t){4*t<=this.attributeBuffer.size||this._resizeAttributeBuffer(4*t)}ensureIndexBuffer(t){t<=this.indexBuffer.length||this._resizeIndexBuffer(t)}_resizeAttributeBuffer(t){let e=new i(Math.max(t,2*this.attributeBuffer.size));o(this.attributeBuffer.rawBinaryData,e.rawBinaryData),this.attributeBuffer=e}_resizeIndexBuffer(t){let e=this.indexBuffer,r=Math.max(t,1.5*e.length);r+=r%2;let i=r>65535?new Uint32Array(r):new Uint16Array(r);if(i.BYTES_PER_ELEMENT!==e.BYTES_PER_ELEMENT)for(let t=0;t<e.length;t++)i[t]=e[t];else o(e.buffer,i.buffer);this.indexBuffer=i}packQuadIndex(t,e,r){t[e]=r+0,t[e+1]=r+1,t[e+2]=r+2,t[e+3]=r+0,t[e+4]=r+2,t[e+5]=r+3}packIndex(t,e,r,i){let a=t.indices,n=t.indexSize,o=t.indexOffset,s=t.attributeOffset;for(let t=0;t<n;t++)e[r++]=i+a[t+o]-s}destroy(t={}){if(null!==this.batches){for(let t=0;t<this.batchIndex;t++)g(this.batches[t]);this.batches=null,this.geometry.destroy(!0),this.geometry=null,t.shader&&(this.shader?.destroy(),this.shader=null);for(let t=0;t<this._elements.length;t++)this._elements[t]&&(this._elements[t]._batch=null);this._elements=null,this.indexBuffer=null,this.attributeBuffer.destroy(),this.attributeBuffer=null}}};y.defaultOptions={maxTextures:null,attributesInitialSize:4,indicesInitialSize:6},t.s(["Batch",0,m,"Batcher",0,y],787323);var S=t.i(485465),B=t.i(64957),w=t.i(860406);let I=new Float32Array(1),T=new Uint32Array(1);class A extends w.Geometry{constructor(){const t=new S.Buffer({data:I,label:"attribute-batch-buffer",usage:B.BufferUsage.VERTEX|B.BufferUsage.COPY_DST,shrinkToFit:!1});super({attributes:{aPosition:{buffer:t,format:"float32x2",stride:24,offset:0},aUV:{buffer:t,format:"float32x2",stride:24,offset:8},aColor:{buffer:t,format:"unorm8x4",stride:24,offset:16},aTextureIdAndRound:{buffer:t,format:"uint16x2",stride:24,offset:20}},indexBuffer:new S.Buffer({data:T,label:"index-batch-buffer",usage:B.BufferUsage.INDEX|B.BufferUsage.COPY_DST,shrinkToFit:!1})})}}t.s(["BatchGeometry",0,A],345284)},197828,275392,633219,t=>{"use strict";var e=t.i(347760),r=t.i(787323),i=t.i(345284),a=t.i(281491),n=t.i(268372),o=t.i(394111),s=t.i(355443),u=t.i(277953),l=t.i(965654);class f extends l.Shader{constructor(t){super({glProgram:(0,a.compileHighShaderGlProgram)({name:"batch",bits:[n.colorBitGl,(0,o.generateTextureBatchBitGl)(t),s.roundPixelsBitGl]}),gpuProgram:(0,a.compileHighShaderGpuProgram)({name:"batch",bits:[n.colorBit,(0,o.generateTextureBatchBit)(t),s.roundPixelsBit]}),resources:{batchSamplers:(0,u.getBatchSamplersUniformGroup)(t)}}),this.maxTextures=t}}t.s(["DefaultShader",0,f],275392);let c=null,d=class t extends r.Batcher{constructor(e){super(e),this.geometry=new i.BatchGeometry,this.name=t.extension.name,this.vertexSize=6,c??(c=new f(e.maxTextures)),this.shader=c}packAttributes(t,e,r,i,a){let n=a<<16|65535&t.roundPixels,o=t.transform,s=o.a,u=o.b,l=o.c,f=o.d,c=o.tx,d=o.ty,{positions:h,uvs:v}=t,m=t.color,x=t.attributeOffset,p=x+t.attributeSize;for(let t=x;t<p;t++){let a=2*t,o=h[a],x=h[a+1];e[i++]=s*o+l*x+c,e[i++]=f*x+u*o+d,e[i++]=v[a],e[i++]=v[a+1],r[i++]=m,r[i++]=n}}packQuadAttributes(t,e,r,i,a){let n=t.texture,o=t.transform,s=o.a,u=o.b,l=o.c,f=o.d,c=o.tx,d=o.ty,h=t.bounds,v=h.maxX,m=h.minX,x=h.maxY,p=h.minY,b=n.uvs,g=t.color,_=a<<16|65535&t.roundPixels;e[i+0]=s*m+l*p+c,e[i+1]=f*p+u*m+d,e[i+2]=b.x0,e[i+3]=b.y0,r[i+4]=g,r[i+5]=_,e[i+6]=s*v+l*p+c,e[i+7]=f*p+u*v+d,e[i+8]=b.x1,e[i+9]=b.y1,r[i+10]=g,r[i+11]=_,e[i+12]=s*v+l*x+c,e[i+13]=f*x+u*v+d,e[i+14]=b.x2,e[i+15]=b.y2,r[i+16]=g,r[i+17]=_,e[i+18]=s*m+l*x+c,e[i+19]=f*x+u*m+d,e[i+20]=b.x3,e[i+21]=b.y3,r[i+22]=g,r[i+23]=_}_updateMaxTextures(t){this.shader.maxTextures!==t&&(c=new f(t),this.shader=c)}destroy(){this.shader=null,super.destroy()}};d.extension={type:[e.ExtensionType.Batcher],name:"default"},t.s(["DefaultBatcher",0,d],197828),t.s(["GCManagedHash",0,class{constructor(t){this.items=Object.create(null);const{renderer:e,type:r,onUnload:i,priority:a,name:n}=t;this._renderer=e,e.gc.addResourceHash(this,"items",r,a??0),this._onUnload=i,this.name=n}add(t){return!this.items[t.uid]&&(this.items[t.uid]=t,t.once("unload",this.remove,this),t._gcLastUsed=this._renderer.gc.now,!0)}remove(t,...e){if(!this.items[t.uid])return;let r=t._gpuData[this._renderer.uid];r&&(this._onUnload?.(t,...e),r.destroy(),t._gpuData[this._renderer.uid]=null,this.items[t.uid]=null)}removeAll(...t){Object.values(this.items).forEach(e=>e&&this.remove(e,...t))}destroy(...t){this.removeAll(...t),this.items=Object.create(null),this._renderer=null,this._onUnload=null}}],633219)},281491,694571,919273,649008,338939,158313,241183,383438,401560,268372,394111,355443,t=>{"use strict";var e=t.i(481107),r=t.i(527076),i=t.i(485830);function a(t,e,r){if(t)for(let a in t){let n=e[a.toLocaleLowerCase()];if(n){let e=t[a];"header"===a&&(e=e.replace(/@in\s+[^;]+;\s*/g,"").replace(/@out\s+[^;]+;\s*/g,"")),r&&n.push(`//----${r}----//`),n.push(e)}else(0,i.warn)(`${a} placement hook does not exist in shader`)}}t.s(["addBits",0,a],694571);let n=/\{\{(.*?)\}\}/g;function o(t){let e={};return(t.match(n)?.map(t=>t.replace(/[{()}]/g,""))??[]).forEach(t=>{e[t]=[]}),e}function s(t,e){let r,i=/@in\s+([^;]+);/g;for(;null!==(r=i.exec(t));)e.push(r[1])}function u(t,e,r=!1){let i=[];s(e,i),t.forEach(t=>{t.header&&s(t.header,i)}),r&&i.sort();let a=i.map((t,e)=>`       @location(${e}) ${t},`).join("\n"),n=e.replace(/@in\s+[^;]+;\s*/g,"");return n.replace("{{in}}",`
${a}
`)}function l(t,e){let r,i=/@out\s+([^;]+);/g;for(;null!==(r=i.exec(t));)e.push(r[1])}function f(t,e){let r=[];l(e,r),t.forEach(t=>{t.header&&l(t.header,r)});let i=0,a=r.sort().map(t=>t.indexOf("builtin")>-1?t:`@location(${i++}) ${t}`).join(",\n"),n=r.sort().map(t=>`       var ${t.replace(/@.*?\s+/g,"")};`).join("\n"),o=`return VSOutput(
            ${r.sort().map(t=>{let e;return` ${(e=/\b(\w+)\s*:/g.exec(t))?e[1]:""}`}).join(",\n")});`,s=e.replace(/@out\s+[^;]+;\s*/g,"");return(s=(s=s.replace("{{struct}}",`
${a}
`)).replace("{{start}}",`
${n}
`)).replace("{{return}}",`
${o}
`)}function c(t,e){let r=t;for(let t in e){let i=e[t];r=i.join("\n").length?r.replace(`{{${t}}}`,`//-----${t} START-----//
${i.join("\n")}
//----${t} FINISH----//`):r.replace(`{{${t}}}`,"")}return r}t.s(["compileHooks",0,o],919273),t.s(["compileInputs",0,u],649008),t.s(["compileOutputs",0,f],338939),t.s(["injectBits",0,c],158313);let d=Object.create(null),h=new Map,v=0;function m({template:t,bits:e}){var r,i;let a,n,o,s=p(t,e);if(d[s])return d[s];let{vertex:l,fragment:c}=(r=t,a=(i=e).map(t=>t.vertex).filter(t=>!!t),n=i.map(t=>t.fragment).filter(t=>!!t),o=u(a,r.vertex,!0),{vertex:o=f(a,o),fragment:u(n,r.fragment,!0)});return d[s]=b(l,c,e),d[s]}function x({template:t,bits:e}){let r=p(t,e);return d[r]||(d[r]=b(t.vertex,t.fragment,e)),d[r]}function p(t,e){return e.map(t=>(h.has(t)||h.set(t,v++),h.get(t))).sort((t,e)=>t-e).join("-")+t.vertex+t.fragment}function b(t,e,r){let i=o(t),n=o(e);return r.forEach(t=>{a(t.vertex,i,t.name),a(t.fragment,n,t.name)}),{vertex:c(t,i),fragment:c(e,n)}}t.s(["compileHighShader",0,m,"compileHighShaderGl",0,x],241183);let g=`
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}

        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);

        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`,_=`
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;

    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {

        {{start}}

        var outColor:vec4<f32>;

        {{main}}

        var finalColor:vec4<f32> = outColor * vColor;

        {{end}}

        return finalColor;
      };
`,y=`
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;

        {{start}}

        vColor = vec4(1.);

        {{main}}

        vUV = uv;

        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`,S=`

    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {

        {{start}}

        vec4 outColor;

        {{main}}

        finalColor = outColor * vColor;

        {{end}}
    }
`;t.s(["fragmentGPUTemplate",0,_,"fragmentGlTemplate",0,S,"vertexGPUTemplate",0,g,"vertexGlTemplate",0,y],383438);let B={name:"global-uniforms-bit",vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}},w={name:"global-uniforms-ubo-bit",vertex:{header:`
          uniform globalUniforms {
            mat3 uProjectionMatrix;
            mat3 uWorldTransformMatrix;
            vec4 uWorldColorAlpha;
            vec2 uResolution;
          };
        `}},I={name:"global-uniforms-bit",vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}};t.s(["globalUniformsBit",0,B,"globalUniformsBitGl",0,I,"globalUniformsUBOBitGl",0,w],401560),t.s(["compileHighShaderGlProgram",0,function({bits:t,name:r}){return new e.GlProgram({name:r,...x({template:{vertex:y,fragment:S},bits:[I,...t]})})},"compileHighShaderGpuProgram",0,function({bits:t,name:e}){let i=m({template:{fragment:_,vertex:g},bits:[B,...t]});return r.GpuProgram.from({name:e,vertex:{source:i.vertex,entryPoint:"main"},fragment:{source:i.fragment,entryPoint:"main"}})}],281491);let T={name:"color-bit",vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},A={name:"color-bit",vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}};t.s(["colorBit",0,T,"colorBitGl",0,A],268372);let U={},E={};t.s(["generateTextureBatchBit",0,function(t){return U[t]||(U[t]={name:"texture-batch-bit",vertex:{header:`
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `},fragment:{header:`
                @in @interpolate(flat) vTextureId: u32;

                ${function(t){let e=[];if(1===t)e.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;"),e.push("@group(1) @binding(1) var textureSampler1: sampler;");else{let r=0;for(let i=0;i<t;i++)e.push(`@group(1) @binding(${r++}) var textureSource${i+1}: texture_2d<f32>;`),e.push(`@group(1) @binding(${r++}) var textureSampler${i+1}: sampler;`)}return e.join("\n")}(t)}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${function(t){let e=[];if(1===t)e.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");else{e.push("switch vTextureId {");for(let r=0;r<t;r++)r===t-1?e.push("  default:{"):e.push(`  case ${r}:{`),e.push(`      outColor = textureSampleGrad(textureSource${r+1}, textureSampler${r+1}, vUV, uvDx, uvDy);`),e.push("      break;}");e.push("}")}return e.join("\n")}(t)}
            `}}),U[t]},"generateTextureBatchBitGl",0,function(t){return E[t]||(E[t]={name:"texture-batch-bit",vertex:{header:`
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `},fragment:{header:`
                in float vTextureId;

                uniform sampler2D uTextures[${t}];

            `,main:`

                ${function(t){let e=[];for(let r=0;r<t;r++)r>0&&e.push("else"),r<t-1&&e.push(`if(vTextureId < ${r}.5)`),e.push("{"),e.push(`	outColor = texture(uTextures[${r}], vUV);`),e.push("}");return e.join("\n")}(t)}
            `}}),E[t]}],394111);let M={name:"round-pixels-bit",vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32>
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},C={name:"round-pixels-bit",vertex:{header:`
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}};t.s(["roundPixelsBit",0,M,"roundPixelsBitGl",0,C],355443)},235066,790532,t=>{"use strict";let e={name:"local-uniform-bit",vertex:{header:`

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,main:`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,end:`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `}},r={...e,vertex:{...e.vertex,header:e.vertex.header.replace("group(1)","group(2)")}},i={name:"local-uniform-bit",vertex:{header:`

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,main:`
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `,end:`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `}};t.s(["localUniformBit",0,e,"localUniformBitGl",0,i,"localUniformBitGroup2",0,r],235066);let a={name:"texture-bit",vertex:{header:`

        struct TextureUniforms {
            uTextureMatrix:mat3x3<f32>,
        }

        @group(2) @binding(2) var<uniform> textureUniforms : TextureUniforms;
        `,main:`
            uv = (textureUniforms.uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
            @group(2) @binding(0) var uTexture: texture_2d<f32>;
            @group(2) @binding(1) var uSampler: sampler;


        `,main:`
            outColor = textureSample(uTexture, uSampler, vUV);
        `}},n={name:"texture-bit",vertex:{header:`
            uniform mat3 uTextureMatrix;
        `,main:`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
        uniform sampler2D uTexture;


        `,main:`
            outColor = texture(uTexture, vUV);
        `}};t.s(["textureBit",0,a,"textureBitGl",0,n],790532)},277953,t=>{"use strict";var e=t.i(432543);let r={};t.s(["getBatchSamplersUniformGroup",0,function(t){let i=r[t];if(i)return i;let a=new Int32Array(t);for(let e=0;e<t;e++)a[e]=e;return r[t]=new e.UniformGroup({uTextures:{value:a,type:"i32",size:t}},{isStatic:!0})}])},635656,239391,t=>{"use strict";var e=t.i(485830),r=t.i(846820);t.s(["ensureAttributes",0,function(t,i){for(let r in t.attributes){let a=t.attributes[r],n=i[r];n?(a.format??(a.format=n.format),a.offset??(a.offset=n.offset),a.instance??(a.instance=n.instance)):(0,e.warn)(`Attribute ${r} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`)}!function(t){let{buffers:e,attributes:i}=t,a={},n={};for(let t in e){let r=e[t];a[r.uid]=0,n[r.uid]=0}for(let t in i){let e=i[t];a[e.buffer.uid]+=(0,r.getAttributeInfoFromFormat)(e.format).stride}for(let t in i){let e=i[t];e.stride??(e.stride=a[e.buffer.uid]),e.start??(e.start=n[e.buffer.uid]),n[e.buffer.uid]+=(0,r.getAttributeInfoFromFormat)(e.format).stride}}(t)}],635656);var i=t.i(996108);let a=[];a[i.STENCIL_MODES.NONE]=void 0,a[i.STENCIL_MODES.DISABLED]={stencilWriteMask:0,stencilReadMask:0},a[i.STENCIL_MODES.RENDERING_MASK_ADD]={stencilFront:{compare:"equal",passOp:"increment-clamp"},stencilBack:{compare:"equal",passOp:"increment-clamp"}},a[i.STENCIL_MODES.RENDERING_MASK_REMOVE]={stencilFront:{compare:"equal",passOp:"decrement-clamp"},stencilBack:{compare:"equal",passOp:"decrement-clamp"}},a[i.STENCIL_MODES.MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"equal",passOp:"keep"},stencilBack:{compare:"equal",passOp:"keep"}},a[i.STENCIL_MODES.INVERSE_MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"not-equal",passOp:"keep"},stencilBack:{compare:"not-equal",passOp:"keep"}},t.s(["GpuStencilModesToPixi",0,a],239391)},228353,792715,531873,233156,287784,t=>{"use strict";var e=t.i(455364),r=t.i(485465),i=t.i(64957);t.s(["UboSystem",0,class{constructor(t){this._syncFunctionHash=Object.create(null),this._adaptor=t,this._systemCheck()}_systemCheck(){if(!(0,e.unsafeEvalSupported)())throw Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}ensureUniformGroup(t){let e=this.getUniformGroupData(t);t.buffer||(t.buffer=new r.Buffer({data:new Float32Array(e.layout.size/4),usage:i.BufferUsage.UNIFORM|i.BufferUsage.COPY_DST}))}getUniformGroupData(t){return this._syncFunctionHash[t._signature]||this._initUniformGroup(t)}_initUniformGroup(t){let e=t._signature,r=this._syncFunctionHash[e];if(!r){let i=Object.keys(t.uniformStructures).map(e=>t.uniformStructures[e]),a=this._adaptor.createUboElements(i),n=this._generateUboSync(a.uboElements);r=this._syncFunctionHash[e]={layout:a,syncFunction:n}}return this._syncFunctionHash[e]}_generateUboSync(t){return this._adaptor.generateUboSync(t)}syncUniformGroup(t,e,a){let n=this.getUniformGroupData(t);t.buffer||(t.buffer=new r.Buffer({data:new Float32Array(n.layout.size/4),usage:i.BufferUsage.UNIFORM|i.BufferUsage.COPY_DST}));let o=null;return e||(e=t.buffer.data,o=t.buffer.dataInt32),a||(a=0),n.syncFunction(t.uniforms,e,o,a),!0}updateUniformGroup(t){if(t.isStatic&&!t._dirtyId)return!1;t._dirtyId=0;let e=this.syncUniformGroup(t);return t.buffer.update(),e}destroy(){this._syncFunctionHash=null}}],228353);let a=[{type:"mat3x3<f32>",test:t=>void 0!==t.value.a,ubo:`
            var matrix = uv[name].toArray(true);
            data[offset] = matrix[0];
            data[offset + 1] = matrix[1];
            data[offset + 2] = matrix[2];
            data[offset + 4] = matrix[3];
            data[offset + 5] = matrix[4];
            data[offset + 6] = matrix[5];
            data[offset + 8] = matrix[6];
            data[offset + 9] = matrix[7];
            data[offset + 10] = matrix[8];
        `,uniform:`
            gl.uniformMatrix3fv(ud[name].location, false, uv[name].toArray(true));
        `},{type:"vec4<f32>",test:t=>"vec4<f32>"===t.type&&1===t.size&&void 0!==t.value.width,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
            data[offset + 2] = v.width;
            data[offset + 3] = v.height;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height) {
                cv[0] = v.x;
                cv[1] = v.y;
                cv[2] = v.width;
                cv[3] = v.height;
                gl.uniform4f(ud[name].location, v.x, v.y, v.width, v.height);
            }
        `},{type:"vec2<f32>",test:t=>"vec2<f32>"===t.type&&1===t.size&&void 0!==t.value.x,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y) {
                cv[0] = v.x;
                cv[1] = v.y;
                gl.uniform2f(ud[name].location, v.x, v.y);
            }
        `},{type:"vec4<f32>",test:t=>"vec4<f32>"===t.type&&1===t.size&&void 0!==t.value.red,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
            data[offset + 3] = v.alpha;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                cv[3] = v.alpha;
                gl.uniform4f(ud[name].location, v.red, v.green, v.blue, v.alpha);
            }
        `},{type:"vec3<f32>",test:t=>"vec3<f32>"===t.type&&1===t.size&&void 0!==t.value.red,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                gl.uniform3f(ud[name].location, v.red, v.green, v.blue);
            }
        `}];function n(t,e){return`
        for (let i = 0; i < ${t*e}; i++) {
            data[offset + (((i / ${t})|0) * 4) + (i % ${t})] = v[i];
        }
    `}t.s(["uniformParsers",0,a],792715),t.s(["createUboSyncFunction",0,function(t,e,r,i){let n=[`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `],o=0;for(let s=0;s<t.length;s++){let u=t[s],l=u.data.name,f=!1,c=0;for(let t=0;t<a.length;t++)if(a[t].test(u.data)){c=u.offset/4,n.push(`name = "${l}";`,`offset += ${c-o};`,a[t][e]||a[t].ubo),f=!0;break}if(!f)if(u.data.size>1)c=u.offset/4,n.push(r(u,c-o));else{let t=i[u.data.type];c=u.offset/4,n.push(`
                    v = uv.${l};
                    offset += ${c-o};
                    ${t};
                `)}o=c}return Function("uv","data","dataInt32","offset",n.join("\n"))}],531873);let o={f32:`
        data[offset] = v;`,i32:`
        dataInt32[offset] = v;`,"vec2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];`,"vec3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];`,"vec4<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];`,"vec2<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];`,"vec3<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];`,"vec4<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];
        dataInt32[offset + 3] = v[3];`,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 4] = v[2];
        data[offset + 5] = v[3];`,"mat3x3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];
        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];`,"mat4x4<f32>":`
        for (let i = 0; i < 16; i++) {
            data[offset + i] = v[i];
        }`,"mat3x2<f32>":n(3,2),"mat4x2<f32>":n(4,2),"mat2x3<f32>":n(2,3),"mat4x3<f32>":n(4,3),"mat2x4<f32>":n(2,4),"mat3x4<f32>":n(3,4)},s={...o,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `};t.s(["uboSyncFunctionsSTD40",0,o,"uboSyncFunctionsWGSL",0,s],233156);var u=t.i(595932),l=t.i(124314);class f extends u.default{constructor({buffer:t,offset:e,size:r}){super(),this.uid=(0,l.uid)("buffer"),this._resourceType="bufferResource",this._touched=0,this._resourceId=(0,l.uid)("resource"),this._bufferResource=!0,this.destroyed=!1,this.buffer=t,this.offset=0|e,this.size=r,this.buffer.on("change",this.onBufferChange,this)}onBufferChange(){this._resourceId=(0,l.uid)("resource"),this.emit("change",this)}destroy(t=!1){this.destroyed=!0,t&&this.buffer.destroy(),this.emit("change",this),this.buffer=null,this.removeAllListeners()}}t.s(["BufferResource",0,f],287784)}]);