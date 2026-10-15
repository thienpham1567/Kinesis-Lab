create extension if not exists vector;
create extension if not exists pg_trgm;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int,
  sex text,
  goals text,
  training_level text,
  medical_conditions jsonb not null default '[]'::jsonb,
  medications jsonb not null default '[]'::jsonb,
  orthopedic_issues jsonb not null default '[]'::jsonb,
  red_flags jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists biomarker_records (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  recorded_at date not null default current_date,
  kind text not null check (kind in ('blood_lab', 'inbody')),
  metrics jsonb not null default '{}'::jsonb,
  ai_summary text,
  created_at timestamptz not null default now()
);

create index if not exists biomarker_records_client_idx
  on biomarker_records (client_id, recorded_at desc);

create table if not exists knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null default 'pdf',
  filename text,
  page_count int,
  created_at timestamptz not null default now()
);

create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references knowledge_documents(id) on delete cascade,
  chapter text,
  page int,
  content text not null,
  embedding vector(1536),
  fts tsvector generated always as (to_tsvector('english', coalesce(content, ''))) stored
);

create index if not exists knowledge_chunks_hnsw
  on knowledge_chunks using hnsw (embedding vector_cosine_ops);
create index if not exists knowledge_chunks_fts
  on knowledge_chunks using gin (fts);
create index if not exists knowledge_chunks_document_idx
  on knowledge_chunks (document_id);

create table if not exists consultations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  role text not null,
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists consultations_client_idx
  on consultations (client_id, created_at);

alter table clients enable row level security;
alter table biomarker_records enable row level security;
alter table knowledge_documents enable row level security;
alter table knowledge_chunks enable row level security;
alter table consultations enable row level security;

create or replace function match_knowledge(
  query_embedding vector(1536),
  query_text text,
  match_count int default 8
)
returns table (
  id uuid,
  document_id uuid,
  title text,
  chapter text,
  page int,
  content text,
  score float
)
language sql
stable
as $$
  with semantic as (
    select
      c.id,
      c.document_id,
      d.title,
      c.chapter,
      c.page,
      c.content,
      (1 - (c.embedding <=> query_embedding))::float as sem_score
    from knowledge_chunks c
    join knowledge_documents d on d.id = c.document_id
    where c.embedding is not null
    order by c.embedding <=> query_embedding
    limit 24
  ),
  lexical as (
    select
      c.id,
      c.document_id,
      d.title,
      c.chapter,
      c.page,
      c.content,
      ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text))::float as lex_score
    from knowledge_chunks c
    join knowledge_documents d on d.id = c.document_id
    where query_text is not null
      and length(trim(query_text)) > 0
      and c.fts @@ websearch_to_tsquery('english', query_text)
    order by lex_score desc
    limit 24
  )
  select
    coalesce(s.id, l.id) as id,
    coalesce(s.document_id, l.document_id) as document_id,
    coalesce(s.title, l.title) as title,
    coalesce(s.chapter, l.chapter) as chapter,
    coalesce(s.page, l.page) as page,
    coalesce(s.content, l.content) as content,
    (coalesce(s.sem_score, 0) * 0.7 + coalesce(l.lex_score, 0) * 0.3)::float as score
  from semantic s
  full outer join lexical l on s.id = l.id
  order by score desc
  limit match_count;
$$;
