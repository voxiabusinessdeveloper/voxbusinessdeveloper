-- ==============================================================================
-- VOX BUSINESS DEVELOPER - ESQUEMA DE BASE DE DATOS PARA LEADS Y PROSPECTOS
-- ==============================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase (https://app.supabase.com)

-- 1. Crear tabla de leads
create table if not exists public.leads (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    nombre text not null,
    correo text not null,
    telefono text,
    empresa text,
    servicio text not null,
    tipo_financiamiento text default 'recurso_propio', -- 'recurso_propio', 'credito_financiamiento', 'requiere_asesoria'
    mensaje text,
    estado text default 'nuevo' check (estado in ('nuevo', 'en_revision', 'contactado', 'cotizado', 'cerrado', 'descartado')),
    notas text default '',
    origen_url text
);

-- 2. Habilitar Row Level Security (RLS) para proteger los datos
alter table public.leads enable row level security;

-- 3. Limpiar políticas existentes si se re-ejecuta
drop policy if exists "Permitir insercion publica de leads" on public.leads;
drop policy if exists "Solo administradores autenticados pueden ver y gestionar leads" on public.leads;

-- 4. Política 1: Permitir que cualquier visitante del sitio web envíe sus datos (INSERT)
create policy "Permitir insercion publica de leads" on public.leads
    for insert
    with check (true);

-- 5. Política 2: Solo usuarios autenticados con cuenta en Supabase Auth pueden ver, editar y borrar (SELECT, UPDATE, DELETE)
create policy "Solo administradores autenticados pueden ver y gestionar leads" on public.leads
    for all
    using (auth.role() = 'authenticated');

-- 6. Habilitar la publicación en tiempo real (Realtime) de forma segura si no está agregada
do $$
begin
    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' 
        and schemaname = 'public' 
        and tablename = 'leads'
    ) then
        alter publication supabase_realtime add table public.leads;
    end if;
end $$;

-- 7. Crear índices para optimizar búsquedas y ordenamiento por fecha y estado
create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_servicio on public.leads (servicio);
create index if not exists idx_leads_estado on public.leads (estado);
