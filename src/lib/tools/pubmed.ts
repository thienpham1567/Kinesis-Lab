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

export async function searchPubMed(userText: string, retmax = 5): Promise<PubMedPaper[]> {
  const term = pubmedQuery(userText);
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

  const search = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params}`,
    { signal: AbortSignal.timeout(10000) },
  );
  if (!search.ok) throw new Error(`PubMed search ${search.status}`);
  const found = (await search.json()) as { esearchresult?: { idlist?: string[] } };
  const ids = found.esearchresult?.idlist ?? [];
  if (!ids.length) return [];

  const sumParams = new URLSearchParams({
    db: "pubmed",
    retmode: "json",
    id: ids.join(","),
    tool: "pt_medical_agent",
  });
  if (process.env.NCBI_EMAIL) sumParams.set("email", process.env.NCBI_EMAIL);
  if (process.env.NCBI_API_KEY) sumParams.set("api_key", process.env.NCBI_API_KEY);

  const summary = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${sumParams}`,
    { signal: AbortSignal.timeout(10000) },
  );
  if (!summary.ok) throw new Error(`PubMed summary ${summary.status}`);
  const data = (await summary.json()) as {
    result?: Record<string, PubMedSummary>;
  };

  const abstracts = await fetchAbstracts(ids);

  return ids.map((pmid) => {
    const row = data.result?.[pmid];
    return {
      pmid,
      title: row?.title ?? "",
      authors: (row?.authors ?? []).slice(0, 4).map((a) => a.name).join(", "),
      journal: row?.fulljournalname || row?.source || "",
      year: (row?.pubdate ?? "").slice(0, 4),
      abstract: abstracts[pmid] ?? "",
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    };
  });
}

type PubMedSummary = {
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
  const res = await fetch(
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params}`,
    { signal: AbortSignal.timeout(10000) },
  );
  if (!res.ok) return {} as Record<string, string>;
  const xml = await res.text();
  return parseAbstracts(xml);
}

export function parseAbstracts(xml: string) {
  const out: Record<string, string> = {};
  const articles = xml.split(/<PubmedArticle>/).slice(1);
  for (const article of articles) {
    const pmid = article.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1];
    if (!pmid) continue;
    const texts = [...article.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map(
      (m) => stripTags(m[1]),
    );
    out[pmid] = texts.join(" ").slice(0, 1200);
  }
  return out;
}

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

export function formatPubMed(papers: PubMedPaper[]) {
  if (!papers.length) return "";
  return papers
    .map(
      (p) =>
        `[PMID:${p.pmid}] ${p.title} (${p.year})\n${p.url}\n${p.journal}\nPhạm vi: metadata và abstract nếu có; chưa cung cấp toàn văn.\n${p.abstract || "(không có abstract)"}`,
    )
    .join("\n\n");
}
