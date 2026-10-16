alter table biomarker_records drop constraint if exists biomarker_records_kind_check;
alter table biomarker_records
  add constraint biomarker_records_kind_check check (kind in ('blood_lab', 'inbody', 'rom'));
