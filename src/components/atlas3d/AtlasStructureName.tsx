import {
  atlasDisplayNames,
  atlasSourceName,
  type AtlasNamedStructure,
} from "@/lib/clinical/atlas-names";

/** Shared readable pair for headings/readouts; native options use the text helper. */
export function AtlasStructureName({
  structure,
  className = "",
}: {
  structure: AtlasNamedStructure;
  className?: string;
}) {
  const { vietnamese, english } = atlasDisplayNames(structure);
  return (
    <span
      className={`block min-w-0 break-words ${className}`}
      title={atlasSourceName(structure)}
      data-atlas-name
    >
      <span lang={vietnamese ? "vi" : "en"} className="block leading-snug">
        {vietnamese ?? english}
      </span>
      {vietnamese && (
        <span
          lang="en"
          className="mt-0.5 block text-xs font-normal leading-5 text-slate"
        >
          {english}
        </span>
      )}
    </span>
  );
}

export function AtlasSourceNames({
  structure,
}: {
  structure: AtlasNamedStructure;
}) {
  return (
    <details className="text-xs leading-5 text-slate">
      <summary className="min-h-10 cursor-pointer py-2 font-semibold text-cobalt">
        Tên nguồn đầy đủ · English / Latin
      </summary>
      <dl className="space-y-2 break-words pb-2">
        <div>
          <dt className="font-semibold text-ink">English</dt>
          <dd lang="en">{structure.english}</dd>
        </div>
        {structure.latin && (
          <div>
            <dt className="font-semibold text-ink">Latin</dt>
            <dd lang="la" className="italic">
              {structure.latin}
            </dd>
          </div>
        )}
      </dl>
    </details>
  );
}
