import type { PubMedPaper } from "../types.ts";

const VI_TERMS: [RegExp, string][] = [
  [/thoát vị|đĩa đệm/i, "intervertebral disc herniation"],
  [/đau lưng|thắt lưng/i, "low back pain"],
  [/huyết áp|tăng huyết áp/i, "hypertension"],
  [/tiểu đường|đái tháo đường/i, "type 2 diabetes mellitus"],
  [/tim mạch|mạch vành/i, "cardiovascular disease"],
  [/phục hồi|rehab/i, "rehabilitation"],
  [/cơ sinh học|biomechanic/i, "biomechanics"],
  [/sức mạnh|resistance|tạ/i, "resistance training"],
  [/inbody|thành phần cơ thể/i, "body composition"],
  [/xét nghiệm|hba1c|lipid/i, "exercise biomarkers"],
  [/chấn thương|vai|gối|cổ/i, "sports injury"],
];

export function pubmedQuery(userText: string) {
  const extras = VI_TERMS.filter(([re]) => re.test(userText)).map(([, en]) => en);
  const core = extras.length ? extras.join(" OR ") : userText.replace(/\s+/g, " ").slice(0, 180);
  return `(${core}) AND (exercise OR "resistance training" OR rehabilitation)`;
}

const searches = new Map<string, { until: number; result: Promise<PubMedPaper[]> }>();
let requestQueue = Promise.resolve();
let nextRequestAt = 0;

async function ncbiFetch(url: string) {
  const turn = requestQueue.then(async () => {
    const wait = Math.max(0, nextRequestAt - Date.now());
    if (wait) await new Promise(resolve => setTimeout(resolve, wait));
    nextRequestAt = Date.now() + (process.env.NCBI_API_KEY ? 110 : 350);
  });
  requestQueue = turn.catch(() => {});
  await turn;
  return fetch(url, { signal: AbortSignal.timeout(10000) });
}

export function searchPubMed(
  userText: string, retmax = 5, options?: { queryMode: "trusted" },
): Promise<PubMedPaper[]> {
  const term = options?.queryMode === "trusted" ? userText : pubmedQuery(userText);
  const limit = Number.isFinite(retmax) ? Math.max(1, Math.min(10, Math.floor(retmax))) : 5;
  const key = `${limit}:${term}`;
  const now = Date.now();
  const cached = searches.get(key);
  if (cached && cached.until > now) return cached.result;
  for (const [id, entry] of searches) if (entry.until <= now) searches.delete(id);
  if (searches.size >= 32) searches.delete(searches.keys().next().value!);
  const result = fetchPubMed(term, limit);
  searches.set(key, { until: now + 300000, result });
  void result.catch(() => { if (searches.get(key)?.result === result) searches.delete(key); });
  return result;
}

async function fetchPubMed(
  userText: string,
  retmax = 5,
): Promise<PubMedPaper[]> {
  // Only server-owned catalog names and fixed facets may opt out of the legacy
  // question translation/exercise filter. Never pass raw request text in this mode.
  const term = userText;
  const params = new URLSearchParams({
    db: "pubmed",
    retmode: "json",
    retmax: String(retmax),
    sort: "relevance",
    term,
    tool: "pt_medical_agent",
  });
  if (process.env.NCBI_EMAIL) params.set("email", process.env.NCBI_EMAIL);
  if (process.env.NCBI_API_KEY) params.set("api_key", process.env.NCBI_API_KEY);

  const search = await ncbiFetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params}`,
  );
  if (!search.ok) throw new Error(`PubMed search ${search.status}`);
  const found = (await search.json()) as { error?: string; esearchresult?: { idlist?: string[]; ERROR?: string } };
  if (found.error || found.esearchresult?.ERROR || !Array.isArray(found.esearchresult?.idlist)) throw new Error("PubMed search unavailable");
  const ids = found.esearchresult.idlist.filter(id => /^\d+$/.test(id)).slice(0, retmax);
  if (!ids.length) return [];

  const sumParams = new URLSearchParams({
    db: "pubmed",
    retmode: "json",
    id: ids.join(","),
    tool: "pt_medical_agent",
  });
  if (process.env.NCBI_EMAIL) sumParams.set("email", process.env.NCBI_EMAIL);
  if (process.env.NCBI_API_KEY) sumParams.set("api_key", process.env.NCBI_API_KEY);

  const summary = await ncbiFetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${sumParams}`,
  );
  if (!summary.ok) throw new Error(`PubMed summary ${summary.status}`);
  const data = (await summary.json()) as {
    error?: string;
    result?: Record<string, PubMedSummary>;
  };
  if (data.error || ids.some(id => !data.result?.[id]?.title)) throw new Error("PubMed metadata unavailable");

  const abstracts = await fetchAbstracts(ids);

  return ids.filter(pmid => {
    const row = data.result?.[pmid];
    return row?.title && !(row.pubtype ?? []).some(type => /retract|expression of concern/i.test(type)) &&
      !abstracts[pmid]?.withdrawn;
  }).map((pmid) => {
    const row = data.result?.[pmid];
    return {
      pmid,
      title: row?.title ?? "",
      authors: (row?.authors ?? []).slice(0, 4).map((a) => a.name).join(", "),
      journal: row?.fulljournalname || row?.source || "",
      year: (row?.pubdate ?? "").slice(0, 4),
      abstract: abstracts[pmid]?.text ?? "",
      abstractTruncated: abstracts[pmid]?.truncated ?? false,
      publicationTypes: row?.pubtype ?? [],
      retrievedAt: new Date().toISOString(),
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    };
  });
}

type PubMedSummary = {
  pubtype?: string[];
  title?: string;
  authors?: { name: string }[];
  fulljournalname?: string;
  source?: string;
  pubdate?: string;
};

async function fetchAbstracts(ids: string[]) {
  const params = new URLSearchParams({
    db: "pubmed",
    retmode: "xml",
    rettype: "abstract",
    id: ids.join(","),
    tool: "pt_medical_agent",
  });
  if (process.env.NCBI_EMAIL) params.set("email", process.env.NCBI_EMAIL);
  if (process.env.NCBI_API_KEY) params.set("api_key", process.env.NCBI_API_KEY);
  const res = await ncbiFetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params}`,
  );
  if (!res.ok) return {} as Record<string, AbstractRecord>;
  const xml = await res.text();
  return parseAbstractRecords(xml);
}

type AbstractRecord = { text: string; truncated: boolean; withdrawn: boolean };
function parseAbstractRecords(xml: string) {
  const out: Record<string, AbstractRecord> = {};
  const articles = xml.split(/<PubmedArticle>/).slice(1);
  for (const article of articles) {
    const pmid = article.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1];
    if (!pmid) continue;
    const texts = [...article.matchAll(/<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g)].map(
      (m) => {
        const label = m[1].match(/Label="([^"]+)"/)?.[1];
        return `${label ? `${stripTags(label)}: ` : ""}${stripTags(m[2])}`;
      },
    );
    const text = texts.join("\n");
    const limit = 16000;
    out[pmid] = {
      text: text.length > limit ? `${text.slice(0, 12000)}\n[... phần giữa abstract bị lược ...]\n${text.slice(-4000)}` : text,
      truncated: text.length > limit,
      withdrawn: /RefType="(?:RetractionIn|ExpressionOfConcernIn)"/.test(article),
    };
  }
  return out;
}

export function parseAbstracts(xml: string) {
  return Object.fromEntries(Object.entries(parseAbstractRecords(xml)).map(([id, record]) => [id, record.text]));
}

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

export function formatPubMed(papers: PubMedPaper[]) {
  if (!papers.length) return "";
  return papers
    .map(
      (p) =>
        `[PMID:${p.pmid}] ${p.title} (${p.year})\n${p.url}\n${p.journal}\nLoại bài do PubMed ghi: ${p.publicationTypes?.join(", ") || "chưa có metadata loại bài"}. Không tự suy mức chắc chắn từ loại bài.\nPhạm vi: ${p.abstract ? "metadata và abstract" : "chỉ metadata, không có abstract"}; chưa cung cấp toàn văn.${p.abstractTruncated ? " Abstract dài đã lược phần giữa; không suy chi tiết bị lược." : ""}\n${p.abstract || "(không có abstract)"}`,
    )
    .join("\n\n");
}
