-- ==============================================================================
-- VOX BUSINESS DEVELOPER - MIGRACIÓN RLS DE SEGURIDAD (HARDENING EN PRODUCCIÓN)
-- ==============================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase (https://app.supabase.com)
--
-- OBJETIVO:
-- 1. Eliminar la inserción anónima abierta 'WITH CHECK (true)' en la tabla leads.
-- 2. Asegurar que las inserciones provengan exclusivamente del backend (Vercel Function con Service Role)
--    o administradores autenticados.
-- 3. Proteger la privacidad de los leads contra consultas no autorizadas.

-- 1. Habilitar RLS si no estaba activo
alter table public.leads enable row level security;

-- 2. Eliminar la política permisiva anterior
drop policy if exists "Permitir insercion publica de leads" on public.leads;
drop policy if exists "Permitir insercion segura de leads por backend o admin" on public.leads;
drop policy if exists "Solo administradores autenticados pueden ver y gestionar leads" on public.leads;

-- 3. Política de Inserción: Solo usuarios autenticados (Admin) o llamadas con service_role
-- Nota: Las llamadas desde la Vercel Function utilizando la SUPABASE_SERVICE_ROLE_KEY
-- omiten RLS por diseño en Supabase de manera segura en el servidor.
-- Para accesos vía cliente autenticado:
create policy "Permitir insercion para usuarios autorizados" on public.leads
    for insert
    to authenticated
    with check (true);

-- 4. Política de Gestión Total: Solo administradores autenticados pueden consultar, editar o borrar
create policy "Solo administradores autenticados pueden ver y gestionar leads" on public.leads
    for all
    to authenticated
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- 5. Validaciones de integridad a nivel de esquema
alter table public.leads alter column nombre set not null;
alter table public.leads alter column correo set not null;
alter table public.leads alter column servicio set not null;

-- 6. Índices de rendimiento
create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_servicio on public.leads (servicio);
create index if not exists idx_leads_estado on public.leads (estado);
