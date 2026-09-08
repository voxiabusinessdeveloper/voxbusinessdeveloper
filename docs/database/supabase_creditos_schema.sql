-- ==============================================================================
-- VOX BUSINESS DEVELOPER - SISTEMA DE CRÉDITOS, COBRANZA Y CONTROL DE SITIOS
-- ==============================================================================
-- Ejecuta este script en el SQL Editor de Supabase (https://app.supabase.com)

-- 1. Tabla de Créditos y Sitios Web
create table if not exists public.creditos_sitios (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    site_key text unique not null default ('vox_site_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16)),
    cliente_nombre text not null,
    dominio_url text not null,
    contacto_telefono text,
    contacto_correo text,
    total_meses integer not null default 8 check (total_meses > 0),
    meses_pagados integer not null default 0 check (meses_pagados >= 0),
    monto_mensual numeric(10, 2) not null default 1000.00 check (monto_mensual >= 0),
    dia_corte integer not null default 1 check (dia_corte between 1 and 31),
    proximo_vencimiento date,
    estado text not null default 'activo' check (estado in ('activo', 'en_gracia', 'suspendido', 'liquidado')),
    motivo_suspension text default '',
    notas text default '',
    plan_nombre text default 'Página Web Financiada'
);

-- 2. Tabla de Historial de Pagos de Créditos
create table if not exists public.historial_pagos_credito (
    id uuid default gen_random_uuid() primary key,
    credito_id uuid references public.creditos_sitios(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    numero_cuota integer not null check (numero_cuota > 0),
    monto numeric(10, 2) not null check (monto > 0),
    metodo_pago text not null default 'transferencia_spei' check (metodo_pago in ('transferencia_spei', 'efectivo', 'oxxo', 'tarjeta', 'otro')),
    comprobante_ref text default '',
    fecha_pago date default current_date not null,
    notas text default '',
    registrado_por text default 'admin'
);

-- 3. Habilitar Row Level Security (RLS)
alter table public.creditos_sitios enable row level security;
alter table public.historial_pagos_credito enable row level security;

-- 4. Limpiar políticas previas
drop policy if exists "Solo administradores pueden gestionar creditos_sitios" on public.creditos_sitios;
drop policy if exists "Solo administradores pueden gestionar historial_pagos_credito" on public.historial_pagos_credito;
drop policy if exists "Permitir gestion completa de creditos_sitios" on public.creditos_sitios;
drop policy if exists "Permitir gestion completa de historial_pagos_credito" on public.historial_pagos_credito;

-- 5. Políticas de seguridad para administradores y dashboard
create policy "Permitir gestion completa de creditos_sitios"
    on public.creditos_sitios
    for all
    using (true)
    with check (true);

create policy "Permitir gestion completa de historial_pagos_credito"
    on public.historial_pagos_credito
    for all
    using (true)
    with check (true);

-- 6. Función RPC Pública y Segura para el Script Killswitch (vox-license.js)
-- Esta función permite al script del cliente consultar UNICAMENTE el estado y nombre sin exponer montos o datos privados
create or replace function public.verificar_licencia_sitio(p_site_key text)
returns json
language plpgsql
security definer
as $$
declare
    v_record record;
begin
    select site_key, estado, cliente_nombre, motivo_suspension, dominio_url
    into v_record
    from public.creditos_sitios
    where site_key = p_site_key
    limit 1;

    if not found then
        return json_build_object(
            'valido', false,
            'estado', 'no_encontrado',
            'mensaje', 'Licencia no registrada o clave inválida.'
        );
    end if;

    return json_build_object(
        'valido', true,
        'site_key', v_record.site_key,
        'estado', v_record.estado, -- 'activo', 'en_gracia', 'suspendido', 'liquidado'
        'cliente', v_record.cliente_nombre,
        'motivo', coalesce(v_record.motivo_suspension, '')
    );
end;
$$;

-- Permitir a usuarios anónimos (sitios clientes) invocar la función RPC de verificación
grant execute on function public.verificar_licencia_sitio(text) to anon, authenticated;

-- 7. Triggers para actualizar 'updated_at' automáticamente
create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp_creditos_sitios on public.creditos_sitios;
create trigger set_timestamp_creditos_sitios
before update on public.creditos_sitios
for each row
execute procedure public.trigger_set_timestamp();

-- 8. Habilitar Realtime para reflejar cambios en vivo en el Dashboard
do $$
begin
    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' 
        and schemaname = 'public' 
        and tablename = 'creditos_sitios'
    ) then
        alter publication supabase_realtime add table public.creditos_sitios;
    end if;

    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' 
        and schemaname = 'public' 
        and tablename = 'historial_pagos_credito'
    ) then
        alter publication supabase_realtime add table public.historial_pagos_credito;
    end if;
end $$;

-- 9. Índices para acelerar búsquedas
create index if not exists idx_creditos_site_key on public.creditos_sitios (site_key);
create index if not exists idx_creditos_estado on public.creditos_sitios (estado);
create index if not exists idx_creditos_proximo_vencimiento on public.creditos_sitios (proximo_vencimiento);
create index if not exists idx_historial_credito_id on public.historial_pagos_credito (credito_id);
