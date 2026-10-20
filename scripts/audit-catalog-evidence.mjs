import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
const root = new URL("../",import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL("public/anatomy/3d/manifest.json",root)));
const bytes = fs.readFileSync(new URL(".data/z-anatomy/TA2.csv",root));
const norm = s => s.normalize("NFKC").trim().toLowerCase().replace(/\s+/g," ");
const rows = bytes.toString("utf8").split(/\r?\n/).map(l=>l.replace(/^"|"$/g,"").split(";"));
const names = new Map();
for (const row of rows) if (/^\d+$/.test(row[0]) && row[1]) {
  const key=norm(row[1]); const list=names.get(key)||[];list.push({ta2Id:row[0],latin:row[2]||""});names.set(key,list);
}
const seen=new Set();
const structures = Object.fromEntries(manifest.structures.map(s=>{
  assert(!seen.has(s.id),`Duplicate ${s.id}`); seen.add(s.id);
  const matches=names.get(norm(s.english)) || [];
  const latinMatches=Boolean(s.latin && matches.some(r=>norm(r.latin)===norm(s.latin)));
  return [s.id,{englishMatch:matches.length>0,latinMatches,ta2Ids:matches.map(r=>r.ta2Id)}];
}));
const report={checkedAt:"2026-10-19",source:manifest.source,csvSha256:crypto.createHash("sha256").update(bytes).digest("hex"),
  scope:"String comparison with upstream derivative TA2.csv only. No independent FIPAT, translation, geometry, attachment, measurement or clinical validation.",
  counts:{structures:seen.size,englishMatches:Object.values(structures).filter(s=>s.englishMatch).length,latinMatches:Object.values(structures).filter(s=>s.latinMatches).length},structures};
fs.writeFileSync(new URL("src/lib/clinical/catalog-evidence.json",root),JSON.stringify(report));
console.log(JSON.stringify(report.counts));
