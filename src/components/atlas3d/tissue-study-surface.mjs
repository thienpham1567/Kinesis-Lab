import { TISSUE_DETAIL_MAPS } from "./tissue-detail-config.mjs";
/** @param {string} kind */
export function studySurfaceCode(kind) {
  const key = Object.hasOwn(TISSUE_DETAIL_MAPS, kind) ? kind : "bone";
  const config = TISSUE_DETAIL_MAPS[key];
  return {
    uniform: config.uniform,
    pars: `
    uniform float studyEnabled;
    uniform sampler2D studyAlbedo;
    uniform sampler2D studyDetail;
    varying vec3 vStudyPosition;
    varying vec3 vStudyNormal;
    vec3 studyWeights(vec3 n) {
      vec3 w = pow(abs(normalize(n)), vec3(6.0));
      return w / max(w.x + w.y + w.z, 0.0001);
    }
    // C1 periodic crossfade. Explicit unwrapped gradients avoid fract-induced mip spikes.
    vec3 studyAlbedoTile(vec2 uv, vec2 dx, vec2 dy) {
      vec2 t = fract(uv);
      vec2 w = 0.5 - 0.5*cos(6.28318530718*t);
      vec3 a = textureGrad(studyAlbedo,t,dx,dy).rgb;
      vec3 b = textureGrad(studyAlbedo,fract(t+vec2(.5,0)),dx,dy).rgb;
      vec3 c = textureGrad(studyAlbedo,fract(t+vec2(0,.5)),dx,dy).rgb;
      vec3 d = textureGrad(studyAlbedo,fract(t+vec2(.5,.5)),dx,dy).rgb;
      return mix(mix(d,b,w.y),mix(c,a,w.y),w.x);
    }
    vec3 studyColor(vec3 p, vec3 w) {
      vec3 q = p / .03;
      vec3 dx=dFdx(q), dy=dFdy(q);
      return studyAlbedoTile(q.zy,dx.zy,dy.zy)*w.x +
        studyAlbedoTile(q.xz,dx.xz,dy.xz)*w.y + studyAlbedoTile(q.xy,dx.xy,dy.xy)*w.z;
    }
    vec4 studyPacked(vec2 uv, vec2 dx, vec2 dy) {
      return textureGrad(studyDetail, uv, dx, dy);
    }
    vec3 studyDecodedNormal(vec4 p) { return vec3(p.r,p.g,p.a)*2.0-1.0; }
    vec3 studySurfaceGradient(vec3 p, vec3 n, vec3 w, out float roughness, out float studyNormalVariance) {
      vec3 q = p / ${config.scale.toFixed(5)};
      vec3 dx=dFdx(q), dy=dFdy(q);
      vec4 px=studyPacked(q.zy,dx.zy,dy.zy), py=studyPacked(q.xz,dx.xz,dy.xz), pz=studyPacked(q.xy,dx.xy,dy.xy);
      vec3 nx=studyDecodedNormal(px), ny=studyDecodedNormal(py), nz=studyDecodedNormal(pz);
      // Convert tangent-space slopes into world gradients before projecting onto the actual surface.
      vec3 gx=vec3(0.0,nx.y,nx.x)/max(nx.z,.25);
      vec3 gy=vec3(ny.x,0.0,ny.y)/max(ny.z,.25);
      vec3 gz=vec3(nz.x,nz.y,0.0)/max(nz.z,.25);
      vec3 gradient=gx*w.x+gy*w.y+gz*w.z;
      gradient-=n*dot(n,gradient);
      float footprint=max(length(dx),length(dy));
      float detailFade=1.0-smoothstep(.08,.35,footprint);
      roughness=dot(vec3(px.b,py.b,pz.b),w);
      studyNormalVariance=dot(max(vec3(0.0),vec3(1.0)-vec3(dot(nx,nx),dot(ny,ny),dot(nz,nz))),w);
      return normalize(n+gradient*detailFade);
    }
  `,
    fragment: `
    if (studyEnabled > 0.5) {
      vec3 worldNormal=normalize(vStudyNormal);
      vec3 weights=studyWeights(worldNormal);
      ${kind === "muscle" ? "diffuseColor.rgb = mix(diffuseColor.rgb, studyColor(vStudyPosition, weights) * .85, .7);" : ""}
      float surfaceRoughness, studyNormalVariance;
      vec3 surfaceNormal=studySurfaceGradient(vStudyPosition,worldNormal,weights,surfaceRoughness,studyNormalVariance);
      normal=normalize(mat3(viewMatrix)*surfaceNormal);
      roughnessFactor=clamp(sqrt(surfaceRoughness*surfaceRoughness+studyNormalVariance*.12),.18,.85);
    }
  `,
  };
}
