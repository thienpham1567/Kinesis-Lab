// Local operator command. --prepare downloads/validates public sources only.
// --apply explicitly writes the prepared collection; never touches client data.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';
import { extractArticle, chunkPassages, stableUuid, sha256 } from './lib/evidence-corpus.mjs';
import { createAppLoader } from './lib/load-app-module.mjs';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
const ai = createAppLoader()('src/lib/ai/openrouter.ts');
const dir = '.data/evidence-corpus';
mkdirSync(dir, { recursive: true });
const registryFile = 'src/lib/knowledge/corpus.json';
const selected = [
  { pmcid: 'PMC7719906', doi: '10.1136/bjsports-2020-102955', year: '2020', kind: 'guideline-summary', topics: ['physical-activity', 'chronic-conditions'],
    canonicalUrl: 'https://doi.org/10.1136/bjsports-2020-102955' },
  { pmcid: 'PMC10684665', doi: '10.1007/s10926-023-10124-4', year: '2023', kind: 'systematic-review', topics: ['chronic-primary-low-back-pain', 'exercise'],
    canonicalUrl: 'https://doi.org/10.1007/s10926-023-10124-4' },
  { doi: '10.3389/fphys.2025.1611468', year: '2025', kind: 'experimental-study', topics: ['resistance-training', 'lateral-deltoid'],
    canonicalUrl: 'https://doi.org/10.3389/fphys.2025.1611468',
    verifiedLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    licenseVerifiedAt: 'https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1611468/full' },
];
async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { 'User-Agent': 'KinesisLab-EvidenceImporter/1.0' } });
  if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
  return response.text();
}
if (process.argv.includes('--prepare')) {
  const sources = [];
  for (const source of selected) {
    if (!source.pmcid) {
      const params = new URLSearchParams({ query: `DOI:${source.doi}`, format: 'json' });
      const found = JSON.parse(await fetchText(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?${params}`));
      source.pmcid = found.resultList?.result?.find(r => r.doi?.toLowerCase() === source.doi)?.pmcid;
    }
    assert.match(source.pmcid ?? '', /^PMC\d+$/);
    const xmlFile = `${dir}/${source.pmcid}.xml`;
    const xml = existsSync(xmlFile) ? readFileSync(xmlFile, 'utf8') : await fetchText(`https://www.ebi.ac.uk/europepmc/webservices/rest/${source.pmcid}/fullTextXML`);
    const article = extractArticle(xml, { verifiedLicenseUrl: source.verifiedLicenseUrl });
    assert.equal(article.doi.toLowerCase(), source.doi.toLowerCase(), 'Source DOI mismatch');
    const contentSha256 = sha256(xml);
    const documentId = stableUuid(`${ai.EMBEDDING_NAMESPACE}:${source.doi}:${contentSha256}`);
    const chunks = chunkPassages(article.passages).map((chunk, i) => ({
      id: stableUuid(`${documentId}:${i}:${chunk.content}`), document_id: documentId,
      chapter: `${chunk.chapter} · §${chunk.paragraph}${chunk.part > 1 ? `.${chunk.part}` : ''}`,
      page: null, content: chunk.content,
    }));
    const metadata = { ...source, title: article.title, authors: article.authors, license: article.license, licenseUrl: article.licenseUrl,
      documentId, contentSha256, checkedAt: '2026-10-26', retrievedAt: new Date().toISOString(),
      access: 'Retrieved full-text JATS XML; indexed narrative paragraphs and abstract only. Tables, figures, reference lists and supplements excluded. Retrieval is not a complete clinical appraisal.',
      extractionVersion: 'jats-narrative-v1', reviewedBy: null, chunkCount: chunks.length };
    writeFileSync(xmlFile, xml);
    writeFileSync(`${dir}/${documentId}.json`, JSON.stringify({ metadata, chunks }));
    sources.push(metadata);
    console.log(JSON.stringify({ prepared: source.pmcid, doi: source.doi, license: article.license, chunks: chunks.length }));
  }
  mkdirSync('src/lib/knowledge', { recursive: true });
  writeFileSync(registryFile, JSON.stringify({ namespace: ai.EMBEDDING_NAMESPACE, model: ai.MODELS.embedding,
    dimensions: ai.EMBEDDING_DIMENSIONS, sources }, null, 2) + '\n');
  console.log(JSON.stringify({ action: 'prepare-only', sources: sources.length, chunks: sources.reduce((n,s)=>n+s.chunkCount,0), databaseWrites: 0 }));
} else if (process.argv.includes('--apply')) {
  assert.ok(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY, 'Missing Supabase configuration');
  const corpus = JSON.parse(readFileSync(registryFile));
  assert.equal(corpus.namespace, ai.EMBEDDING_NAMESPACE, 'Prepared corpus model/format mismatch');
  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: docs, error } = await db.from('knowledge_documents').select('id,source_type');
  if (error) throw new Error(`Cannot inspect existing corpus: ${error.code}`);
  if (docs.some(d => d.source_type !== corpus.namespace || !corpus.sources.some(s => s.documentId === d.id))) {
    throw new Error('Existing corpus includes incompatible/unregistered documents. No rows changed; explicit reindex/migration required.');
  }
  for (const source of corpus.sources) {
    const prepared = JSON.parse(readFileSync(`${dir}/${source.documentId}.json`));
    assert.equal(prepared.metadata.contentSha256, source.contentSha256);
    assert.equal(prepared.chunks.length, source.chunkCount);
    const { error: docError } = await db.from('knowledge_documents').upsert({ id: source.documentId, title: source.title,
      source_type: corpus.namespace, filename: source.canonicalUrl, page_count: null });
    if (docError) throw new Error(`Document write failed: ${docError.code}`);
    const { data: existing, error: chunkError } = await db.from('knowledge_chunks').select('id').eq('document_id', source.documentId).not('embedding', 'is', null);
    if (chunkError) throw new Error(`Cannot inspect chunks: ${chunkError.code}`);
    const ids = new Set(existing.map(c => c.id));
    const pending = prepared.chunks.filter(c => !ids.has(c.id));
    for (let start = 0; start < pending.length; start += 8) {
      const batch = pending.slice(start, start + 8);
      const vectors = await ai.embedTexts(batch.map(c => c.content), { task: 'document', titles: batch.map(c => `${source.title} · ${c.chapter}`) });
      const { error: insertError } = await db.from('knowledge_chunks').upsert(batch.map((c, i) => ({ ...c, embedding: vectors[i] })));
      if (insertError) throw new Error(`Chunk write failed: ${insertError.code}`);
    }
    const { count, error: countError } = await db.from('knowledge_chunks').select('id', { count: 'exact', head: true }).eq('document_id', source.documentId).not('embedding', 'is', null);
    if (countError || count !== source.chunkCount) throw new Error('Corpus verification count mismatch');
    console.log(JSON.stringify({ imported: source.pmcid, chunks: count, newlyEmbedded: pending.length, model: ai.MODELS.embedding, dimensions: ai.EMBEDDING_DIMENSIONS }));
  }
  const receipt = { checkedAt: new Date().toISOString(), namespace: corpus.namespace, sources: corpus.sources.length,
    chunks: corpus.sources.reduce((n,s)=>n+s.chunkCount,0), status: 'verified', containsClientData: false };
  writeFileSync(`${dir}/ingestion-receipt.json`, JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt));
} else {
  throw new Error('Choose --prepare (read sources) or --apply (write prepared corpus).');
}
