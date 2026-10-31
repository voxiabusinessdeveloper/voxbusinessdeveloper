-- ==============================================================================
-- VOX BUSINESS DEVELOPER - SISTEMA DE TELEMETRÍA WEB Y RADAR MULTI-SITIO
-- ==============================================================================
-- Ejecuta este script en el SQL Editor de Supabase (https://app.supabase.com)

-- 1. Tabla de Sitios de Monitoreo (Para sitios externos sin crédito o web oficial VOX)
create table if not exists public.telemetria_sitios (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    site_key text unique not null default ('vox_mon_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16)),
    nombre_sitio text not null,
    dominio_url text not null,
    cliente_nombre text default 'VOX / Cliente Directo',
    activo boolean default true not null,
    notas text default ''
);

-- Insertar el sitio oficial de VOX por defecto si no existe
insert into public.telemetria_sitios (site_key, nombre_sitio, dominio_url, cliente_nombre, notas)
values (
    'vox_site_official',
    'VOX Business Developer (Sitio Oficial)',
    'https://voxbusinessdeveloper.com',
    'VOX Corporativo',
    'Portal principal y páginas de servicios de VOX'
)
on conflict (site_key) do nothing;

-- 2. Tabla de Sesiones de Visitantes (1 fila por visita/sesión)
create table if not exists public.telemetria_sesiones (
    id uuid default gen_random_uuid() primary key,
    session_id text unique not null,
    visitor_id text not null,
    site_key text not null,
    dominio text default '',
    started_at timestamp with time zone default timezone('utc'::text, now()) not null,
    last_seen_at timestamp with time zone default timezone('utc'::text, now()) not null,
    duration_seconds integer default 0 not null,
    max_scroll_pct integer default 0 not null check (max_scroll_pct between 0 and 100),
    entry_url text default '',
    current_url text default '',
    referrer text default 'Directo',
    utm_source text default '',
    utm_medium text default '',
    utm_campaign text default '',
    device_type text default 'desktop' check (device_type in ('desktop', 'mobile', 'tablet')),
    os text default '',
    browser text default '',
    screen_res text default '',
    language text default '',
    timezone text default '',
    page_views_count integer default 1 not null,
    clicks_count integer default 0 not null,
    whatsapp_clicks integer default 0 not null,
    form_interacted boolean default false not null,
    converted_to_lead boolean default false not null,
    lead_id uuid,
    lead_nombre text default '',
    lead_correo text default ''
);

-- 3. Tabla de Eventos y Movimientos Paso a Paso (Recorrido, Clics y Coordenadas)
create table if not exists public.telemetria_eventos (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    session_id text not null,
    visitor_id text not null,
    site_key text not null,
    event_type text not null check (event_type in (
        'pageview',
        'section_view',
        'scroll_milestone',
        'click',
        'cta_whatsapp',
        'cta_phone',
        'cta_email',
        'form_start',
        'form_abandon',
        'form_submit'
    )),
    page_url text default '',
    page_path text default '/',
    page_title text default '',
    section_id text default '',
    element_tag text default '',
    element_text text default '',
    element_href text default '',
    click_x_pct numeric(5, 2),
    click_y_pct numeric(5, 2),
    scroll_pct integer,
    metadata jsonb default '{}'::jsonb
);

-- 4. Vincular tabla de leads con session_id y visitor_id (si no existen las columnas)
alter table public.leads add column if not exists session_id text;
alter table public.leads add column if not exists visitor_id text;

-- 5. Habilitar Row Level Security (RLS)
alter table public.telemetria_sitios enable row level security;
alter table public.telemetria_sesiones enable row level security;
alter table public.telemetria_eventos enable row level security;

-- Limpiar políticas previas si se re-ejecuta
drop policy if exists "Permitir gestion de telemetria_sitios" on public.telemetria_sitios;
drop policy if exists "Permitir lectura e ingesta de telemetria_sesiones" on public.telemetria_sesiones;
drop policy if exists "Permitir lectura e ingesta de telemetria_eventos" on public.telemetria_eventos;

create policy "Permitir gestion de telemetria_sitios"
    on public.telemetria_sitios
    for all
    using (true)
    with check (true);

create policy "Permitir lectura e ingesta de telemetria_sesiones"
    on public.telemetria_sesiones
    for all
    using (true)
    with check (true);

create policy "Permitir lectura e ingesta de telemetria_eventos"
    on public.telemetria_eventos
    for all
    using (true)
    with check (true);

-- 6. Función RPC de Ingesta por Lote (Batch Upsert Sesión + Insert Eventos)
create or replace function public.registrar_telemetria_vox(
    p_session jsonb,
    p_events jsonb default '[]'::jsonb
)
returns json
language plpgsql
security definer
as $$
declare
    v_session_id text;
    v_ev jsonb;
begin
    v_session_id := p_session->>'session_id';
    if v_session_id is null or v_session_id = '' then
        return json_build_object('ok', false, 'error', 'missing_session_id');
    end if;

    -- 1. Upsert de la sesión del visitante
    insert into public.telemetria_sesiones (
        session_id,
        visitor_id,
        site_key,
        dominio,
        started_at,
        last_seen_at,
        duration_seconds,
        max_scroll_pct,
        entry_url,
        current_url,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        device_type,
        os,
        browser,
        screen_res,
        language,
        timezone,
        page_views_count,
        clicks_count,
        whatsapp_clicks,
        form_interacted,
        converted_to_lead,
        lead_nombre,
        lead_correo
    )
    values (
        v_session_id,
        coalesce(p_session->>'visitor_id', 'anon'),
        coalesce(p_session->>'site_key', 'vox_site_official'),
        coalesce(p_session->>'dominio', ''),
        coalesce((p_session->>'started_at')::timestamptz, timezone('utc'::text, now())),
        timezone('utc'::text, now()),
        coalesce((p_session->>'duration_seconds')::integer, 0),
        least(100, greatest(0, coalesce((p_session->>'max_scroll_pct')::integer, 0))),
        coalesce(p_session->>'entry_url', ''),
        coalesce(p_session->>'current_url', ''),
        coalesce(p_session->>'referrer', 'Directo'),
        coalesce(p_session->>'utm_source', ''),
        coalesce(p_session->>'utm_medium', ''),
        coalesce(p_session->>'utm_campaign', ''),
        case when (p_session->>'device_type') in ('desktop', 'mobile', 'tablet') then p_session->>'device_type' else 'desktop' end,
        coalesce(p_session->>'os', ''),
        coalesce(p_session->>'browser', ''),
        coalesce(p_session->>'screen_res', ''),
        coalesce(p_session->>'language', ''),
        coalesce(p_session->>'timezone', ''),
        greatest(1, coalesce((p_session->>'page_views_count')::integer, 1)),
        greatest(0, coalesce((p_session->>'clicks_count')::integer, 0)),
        greatest(0, coalesce((p_session->>'whatsapp_clicks')::integer, 0)),
        coalesce((p_session->>'form_interacted')::boolean, false),
        coalesce((p_session->>'converted_to_lead')::boolean, false),
        coalesce(p_session->>'lead_nombre', ''),
        coalesce(p_session->>'lead_correo', '')
    )
    on conflict (session_id) do update set
        last_seen_at = timezone('utc'::text, now()),
        duration_seconds = greatest(public.telemetria_sesiones.duration_seconds, excluded.duration_seconds),
        max_scroll_pct = greatest(public.telemetria_sesiones.max_scroll_pct, excluded.max_scroll_pct),
        current_url = case when excluded.current_url <> '' then excluded.current_url else public.telemetria_sesiones.current_url end,
        page_views_count = greatest(public.telemetria_sesiones.page_views_count, excluded.page_views_count),
        clicks_count = greatest(public.telemetria_sesiones.clicks_count, excluded.clicks_count),
        whatsapp_clicks = greatest(public.telemetria_sesiones.whatsapp_clicks, excluded.whatsapp_clicks),
        form_interacted = (public.telemetria_sesiones.form_interacted or excluded.form_interacted),
        converted_to_lead = (public.telemetria_sesiones.converted_to_lead or excluded.converted_to_lead),
        lead_nombre = case when excluded.lead_nombre <> '' then excluded.lead_nombre else public.telemetria_sesiones.lead_nombre end,
        lead_correo = case when excluded.lead_correo <> '' then excluded.lead_correo else public.telemetria_sesiones.lead_correo end;

    -- 2. Insertar eventos del lote si se enviaron
    if jsonb_typeof(p_events) = 'array' and jsonb_array_length(p_events) > 0 then
        for v_ev in select * from jsonb_array_elements(p_events)
        loop
            insert into public.telemetria_eventos (
                created_at,
                session_id,
                visitor_id,
                site_key,
                event_type,
                page_url,
                page_path,
                page_title,
                section_id,
                element_tag,
                element_text,
                element_href,
                click_x_pct,
                click_y_pct,
                scroll_pct,
                metadata
            )
            values (
                coalesce((v_ev->>'created_at')::timestamptz, timezone('utc'::text, now())),
                v_session_id,
                coalesce(v_ev->>'visitor_id', p_session->>'visitor_id', 'anon'),
                coalesce(v_ev->>'site_key', p_session->>'site_key', 'vox_site_official'),
                case when (v_ev->>'event_type') in (
                    'pageview', 'section_view', 'scroll_milestone', 'click',
                    'cta_whatsapp', 'cta_phone', 'cta_email',
                    'form_start', 'form_abandon', 'form_submit'
                ) then v_ev->>'event_type' else 'click' end,
                coalesce(v_ev->>'page_url', ''),
                coalesce(v_ev->>'page_path', '/'),
                coalesce(v_ev->>'page_title', ''),
                coalesce(v_ev->>'section_id', ''),
                coalesce(v_ev->>'element_tag', ''),
                left(coalesce(v_ev->>'element_text', ''), 140),
                left(coalesce(v_ev->>'element_href', ''), 255),
                case when v_ev->>'click_x_pct' is not null then (v_ev->>'click_x_pct')::numeric(5,2) else null end,
                case when v_ev->>'click_y_pct' is not null then (v_ev->>'click_y_pct')::numeric(5,2) else null end,
                case when v_ev->>'scroll_pct' is not null then (v_ev->>'scroll_pct')::integer else null end,
                coalesce(v_ev->'metadata', '{}'::jsonb)
            );
        end loop;
    end if;

    return json_build_object('ok', true, 'session_id', v_session_id);
end;
$$;

grant execute on function public.registrar_telemetria_vox(jsonb, jsonb) to anon, authenticated;

-- 7. Habilitar Realtime para sesiones y eventos
do $$
begin
    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' 
        and schemaname = 'public' 
        and tablename = 'telemetria_sesiones'
    ) then
        alter publication supabase_realtime add table public.telemetria_sesiones;
    end if;

    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' 
        and schemaname = 'public' 
        and tablename = 'telemetria_eventos'
    ) then
        alter publication supabase_realtime add table public.telemetria_eventos;
    end if;

    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' 
        and schemaname = 'public' 
        and tablename = 'telemetria_sitios'
    ) then
        alter publication supabase_realtime add table public.telemetria_sitios;
    end if;
end $$;

-- 8. Índices para consultas rápidas en el Radar
create index if not exists idx_tel_sesiones_site_key on public.telemetria_sesiones (site_key);
create index if not exists idx_tel_sesiones_last_seen on public.telemetria_sesiones (last_seen_at desc);
create index if not exists idx_tel_sesiones_visitor on public.telemetria_sesiones (visitor_id);
create index if not exists idx_tel_eventos_session_id on public.telemetria_eventos (session_id, created_at asc);
create index if not exists idx_tel_eventos_site_key on public.telemetria_eventos (site_key, created_at desc);
create index if not exists idx_leads_session_id on public.leads (session_id);

