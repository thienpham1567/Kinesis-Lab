import {PAIN_SITE_CULPRIT_MAP, type PainSiteId} from '@/lib/clinical/trigger-point-atlas';
import {MusclePlateCredit} from './MusclePlateCredit';

type BodySide='both'|'anterior'|'posterior';

/** Symptom-region navigation only. No trigger coordinates, referral shapes or muscle footprints. */
export function TriggerPainLocator({selectedId,side,onSide,onSelect}: {
  selectedId:PainSiteId;side:BodySide;onSide:(side:BodySide)=>void;onSelect:(id:PainSiteId)=>void;
}) {
  return (
    <section aria-label="Chọn vùng triệu chứng" className="space-y-3">
      <header>
        <h2 className="font-display text-sm font-bold text-ink">Vùng triệu chứng để tra cứu</h2>
        <p className="mt-1 text-xs leading-5 text-slate">Chọn tên vùng ở phía trên hoặc vùng tô trên hình. Màu tô là vùng tra cứu do app biên soạn.</p>
      </header>
      <div role="group" aria-label="Mặt cơ thể" className="inline-flex rounded-md border border-rule bg-canvas p-1 text-xs">
        {([{id:'both',label:'2 mặt'},{id:'anterior',label:'Trước'},{id:'posterior',label:'Sau'}] as const).map(item=>(
          <button key={item.id} type="button" aria-pressed={side===item.id} onClick={()=>onSide(item.id)}
            className={`rounded px-3 py-1.5 font-semibold ${side===item.id?'bg-sheet text-ink shadow-2xs':'text-slate'}`}>{item.label}</button>
        ))}
      </div>
      <div className={`grid gap-2 ${side==='both'?'grid-cols-2':'grid-cols-1'}`}>
        {(['anterior','posterior'] as const).filter(view=>side==='both'||side===view).map(view=>(
          <figure key={view} className="rounded-md border border-rule bg-white">
            <figcaption className="p-2 text-center text-[11px] font-semibold text-slate">{view==='anterior'?'Mặt trước':'Mặt sau'}</figcaption>
            <svg viewBox="0 0 900 1620" className={`w-full ${side==='both'?'max-h-[340px]':'max-h-[520px]'}`} role="group" aria-label={`Vùng triệu chứng — ${view==='anterior'?'trước':'sau'}`}>
              <image href={`/anatomy/muscles-${view}.png`} x="0" y="0" width="900" height="1620"/>
              {PAIN_SITE_CULPRIT_MAP.filter(site=>site.view===view).map(site=>(
                <path key={site.id} d={site.zoneD} fill={site.id===selectedId?'var(--color-caution)':'transparent'} fillOpacity={0.2}
                  stroke="var(--color-caution)" strokeWidth={site.id===selectedId?5:3} className="cursor-pointer"
                  role="button" tabIndex={0} aria-label={`Tra cứu: ${site.shortName}`} aria-pressed={site.id===selectedId}
                  onClick={()=>onSelect(site.id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(site.id);}}}>
                  <title>{site.name}</title>
                </path>
              ))}
            </svg>
          </figure>
        ))}
      </div>
      <p className="text-xs leading-5 text-slate">Vị trí triệu chứng không xác định cơ gây đau. Hình nền là bản vẽ lại lớp nông, không dùng để tìm cơ sâu hoặc vị trí ấn.</p>
      <MusclePlateCredit note="Vùng chọn do app vẽ để tra cứu triệu chứng; không mô tả vùng đau lan hoặc ranh giới cơ có nguồn."/>
    </section>
  );
}
