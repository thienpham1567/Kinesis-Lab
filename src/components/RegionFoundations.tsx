import {
  REGION_FOUNDATIONS,
  type AnatomyRegionId,
} from "@/lib/clinical/anatomy-atlas";
import { ANATOMY_REGION_EVIDENCE } from "@/lib/clinical/evidence-anatomy";

/** Kiến thức nền của vùng, diễn đạt lại từ các nguồn trong hồ sơ vùng; [n] là số thứ tự nguồn. */
export function RegionFoundations({
  regionId,
  regionName,
}: {
  regionId: AnatomyRegionId;
  regionName: string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-display text-sm font-bold text-ink">Kiến thức nền</h3>
      <ul className="space-y-1.5 rounded-md border border-rule bg-canvas/60 p-3.5 text-xs leading-6 text-slate">
        {REGION_FOUNDATIONS[regionId].map((item) => (
          <li key={item.text}>
            • {item.text}{" "}
            {item.sourceRefs.map((number) => {
              const source = ANATOMY_REGION_EVIDENCE[regionId].sources[number - 1];
              return (
                <a
                  key={number}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  title={`${source.title} · Đối chiếu ${source.checkedAt}`}
                  className="ml-1 font-mono text-cobalt underline underline-offset-2"
                  aria-label={`Nguồn ${number} cho kiến thức nền vùng ${regionName}`}
                >
                  [{number}]
                </a>
              );
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}
