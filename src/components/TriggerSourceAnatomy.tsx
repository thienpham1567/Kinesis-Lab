import { SOURCE_PLATES, type SourcePlateView, type TriggerPointMuscle } from '@/lib/clinical/trigger-point-atlas';

export function TriggerSourceAnatomy({muscle}: {muscle: TriggerPointMuscle}) {
  return (
    <section aria-label="Hình giải phẫu có nguồn" className="space-y-3">
      <header className="border-b border-rule pb-3">
        <p className="eyebrow">Giải phẫu · Nhãn gốc</p>
        <h2 className="mt-2 font-display text-base font-bold text-ink">{muscle.name}</h2>
        <p className="mt-1 font-mono text-[11px] text-slate">{muscle.latinName}</p>
      </header>
      {muscle.plateViews.map(view=><SourcePlateCrop key={`${view.plate}-${view.crop.join('-')}`} view={view}/>) }
      <p className="rounded-md border border-caution/30 bg-caution-soft p-3 text-xs leading-5 text-ink">
        Chưa có hồ sơ nguồn cho từng tọa độ điểm kích hoạt và vùng đau lan; các lớp đánh dấu này được ẩn.
        Hình giải phẫu có nguồn giúp nhận diện cơ; hình không xác định cơ gây đau.
      </p>
    </section>
  );
}

function SourcePlateCrop({view}: {view: SourcePlateView}) {
  const plate=SOURCE_PLATES[view.plate];
  const [x,y,w,h]=view.crop;
  return (
    <figure className="overflow-hidden rounded-md border border-rule bg-white">
      <svg viewBox={`${x} ${y} ${w} ${h}`} className="block w-full" role="img" aria-label={`${plate.title}: ${view.labels.join(', ')}`}>
        <image href={plate.src} x="0" y="0" width={plate.width} height={plate.height}/>
      </svg>
      <figcaption className="space-y-2 border-t border-rule p-3 text-[11px] leading-5 text-slate">
        <p className="font-semibold text-ink">Tìm nhãn: {view.labels.join(' · ')}</p>
        <p>{plate.title}. Khung ảnh được cắt từ hình có nhãn gốc; không vẽ thêm ranh giới hay điểm đau.</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a href={plate.src} target="_blank" rel="noreferrer" className="font-semibold text-cobalt underline">Xem ảnh gốc ↗</a>
          <a href={plate.url} target="_blank" rel="noreferrer" className="underline hover:text-cobalt">{plate.credit}</a>
        </div>
      </figcaption>
    </figure>
  );
}
