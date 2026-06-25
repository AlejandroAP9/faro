-- Anti-abuso: un reporte por (Paso, reportante). El contador pasa a reflejar
-- reportantes DISTINTOS, no inserciones crudas (que un solo usuario podía spamear).

alter table public.deviation_reports
  add constraint uq_deviation_step_reporter unique (step_id, reporter_id);
