-- Ensure enums
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='app_role') THEN CREATE TYPE public.app_role AS ENUM ('admin_central','admin_sede','usuario_normal'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='estado_consulta') THEN CREATE TYPE public.estado_consulta AS ENUM ('pendiente','en_proceso','escalado','finalizado'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='estado_respuesta_type') THEN CREATE TYPE public.estado_respuesta_type AS ENUM ('sin_conflicto','con_conflicto','requiere_escalacion'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='tipo_notificacion') THEN CREATE TYPE public.tipo_notificacion AS ENUM ('nueva_consulta','recordatorio','escalacion','finalizacion'); END IF; END $$;

-- Tables
CREATE TABLE IF NOT EXISTS public.sedes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_sede TEXT NOT NULL,
  direccion TEXT,
  correo_contacto TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_usuario TEXT NOT NULL,
  correo_electronico TEXT NOT NULL UNIQUE,
  rol public.app_role NOT NULL DEFAULT 'usuario_normal',
  sede_id UUID REFERENCES public.sedes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_area TEXT NOT NULL,
  sede_id UUID NOT NULL REFERENCES public.sedes(id) ON DELETE CASCADE,
  responsable_area TEXT,
  correo_contacto TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clientes_actuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_cliente TEXT NOT NULL,
  ruc TEXT NOT NULL,
  tipo_servicio TEXT,
  sede_id UUID NOT NULL REFERENCES public.sedes(id) ON DELETE CASCADE,
  area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
  fecha_registro TIMESTAMPTZ DEFAULT now(),
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_potencial_cliente TEXT NOT NULL,
  ruc_potencial_cliente TEXT NOT NULL,
  tipo_servicio TEXT,
  usuario_solicitante UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  fecha_consulta TIMESTAMPTZ DEFAULT now(),
  estado_final public.estado_consulta DEFAULT 'pendiente',
  tiene_conflicto BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id UUID NOT NULL REFERENCES public.consultas(id) ON DELETE CASCADE,
  usuario_respondedor UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  estado_respuesta public.estado_respuesta_type NOT NULL,
  comentario TEXT,
  fecha_respuesta TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(consulta_id, usuario_respondedor)
);

CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notificacion_nombre TEXT NOT NULL,
  usuario_destinatario UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo_notificacion public.tipo_notificacion NOT NULL,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE CASCADE,
  fecha_envio TIMESTAMPTZ DEFAULT now(),
  estado TEXT DEFAULT 'pendiente',
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento TEXT NOT NULL,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE SET NULL,
  usuario_responsable UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  fecha_evento TIMESTAMPTZ DEFAULT now(),
  detalle JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Trigger to create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre_usuario, correo_electronico, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_usuario', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'rol')::public.app_role, 'usuario_normal')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'rol')::public.app_role, 'usuario_normal')
  );

  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach update triggers
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sedes_updated_at') THEN
  CREATE TRIGGER update_sedes_updated_at BEFORE UPDATE ON public.sedes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_usuarios_updated_at') THEN
  CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_areas_updated_at') THEN
  CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON public.areas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clientes_updated_at') THEN
  CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes_actuales
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_consultas_updated_at') THEN
  CREATE TRIGGER update_consultas_updated_at BEFORE UPDATE ON public.consultas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF; END $$;

-- Enable RLS
ALTER TABLE public.sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_actuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if exist
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='usuarios' AND policyname='Usuarios pueden ver su propio perfil') THEN DROP POLICY "Usuarios pueden ver su propio perfil" ON public.usuarios; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='usuarios' AND policyname='Admin central puede crear usuarios') THEN DROP POLICY "Admin central puede crear usuarios" ON public.usuarios; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='usuarios' AND policyname='Admin sede crea usuarios normales') THEN DROP POLICY "Admin sede crea usuarios normales" ON public.usuarios; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sedes' AND policyname='Todos pueden ver sedes') THEN DROP POLICY "Todos pueden ver sedes" ON public.sedes; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sedes' AND policyname='Solo admin central puede crear sedes') THEN DROP POLICY "Solo admin central puede crear sedes" ON public.sedes; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sedes' AND policyname='Solo admin central puede actualizar sedes') THEN DROP POLICY "Solo admin central puede actualizar sedes" ON public.sedes; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sedes' AND policyname='Solo admin central puede eliminar sedes') THEN DROP POLICY "Solo admin central puede eliminar sedes" ON public.sedes; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes_actuales' AND policyname='Admins pueden ver clientes') THEN DROP POLICY "Admins pueden ver clientes" ON public.clientes_actuales; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes_actuales' AND policyname='Admins pueden crear clientes') THEN DROP POLICY "Admins pueden crear clientes" ON public.clientes_actuales; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes_actuales' AND policyname='Admins pueden actualizar clientes') THEN DROP POLICY "Admins pueden actualizar clientes" ON public.clientes_actuales; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='clientes_actuales' AND policyname='Admins pueden eliminar clientes') THEN DROP POLICY "Admins pueden eliminar clientes" ON public.clientes_actuales; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='areas' AND policyname='Todos pueden ver áreas') THEN DROP POLICY "Todos pueden ver áreas" ON public.areas; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='areas' AND policyname='Admins pueden crear áreas') THEN DROP POLICY "Admins pueden crear áreas" ON public.areas; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='areas' AND policyname='Admins pueden actualizar áreas') THEN DROP POLICY "Admins pueden actualizar áreas" ON public.areas; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='consultas' AND policyname='Usuarios pueden ver sus consultas') THEN DROP POLICY "Usuarios pueden ver sus consultas" ON public.consultas; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='consultas' AND policyname='Usuarios autenticados pueden crear consultas') THEN DROP POLICY "Usuarios autenticados pueden crear consultas" ON public.consultas; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='consultas' AND policyname='Admins pueden actualizar consultas') THEN DROP POLICY "Admins pueden actualizar consultas" ON public.consultas; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='respuestas' AND policyname='Admins pueden ver respuestas') THEN DROP POLICY "Admins pueden ver respuestas" ON public.respuestas; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='respuestas' AND policyname='Admins pueden crear respuestas') THEN DROP POLICY "Admins pueden crear respuestas" ON public.respuestas; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='respuestas' AND policyname='Admins pueden actualizar respuestas') THEN DROP POLICY "Admins pueden actualizar respuestas" ON public.respuestas; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notificaciones' AND policyname='Usuarios pueden ver sus notificaciones') THEN DROP POLICY "Usuarios pueden ver sus notificaciones" ON public.notificaciones; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notificaciones' AND policyname='Sistema puede crear notificaciones') THEN DROP POLICY "Sistema puede crear notificaciones" ON public.notificaciones; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notificaciones' AND policyname='Usuarios pueden actualizar sus notificaciones') THEN DROP POLICY "Usuarios pueden actualizar sus notificaciones" ON public.notificaciones; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='auditoria' AND policyname='Admin central puede ver auditoría') THEN DROP POLICY "Admin central puede ver auditoría" ON public.auditoria; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='auditoria' AND policyname='Sistema puede crear auditoría') THEN DROP POLICY "Sistema puede crear auditoría" ON public.auditoria; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Usuarios pueden ver sus roles') THEN DROP POLICY "Usuarios pueden ver sus roles" ON public.user_roles; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admin central puede crear roles') THEN DROP POLICY "Admin central puede crear roles" ON public.user_roles; END IF; END $$;

-- Create fresh policies
CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.usuarios FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin_central') OR public.has_role(auth.uid(), 'admin_sede'));
CREATE POLICY "Admin central puede crear usuarios" ON public.usuarios FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin_central'));
CREATE POLICY "Admin sede crea usuarios normales" ON public.usuarios FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin_sede') AND rol = 'usuario_normal');
CREATE POLICY "Usuarios pueden actualizar su perfil" ON public.usuarios FOR UPDATE
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin_central'));

CREATE POLICY "Todos pueden ver sedes" ON public.sedes FOR SELECT USING (true);
CREATE POLICY "Solo admin central puede crear sedes" ON public.sedes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin_central'));
CREATE POLICY "Solo admin central puede actualizar sedes" ON public.sedes FOR UPDATE USING (public.has_role(auth.uid(), 'admin_central'));
CREATE POLICY "Solo admin central puede eliminar sedes" ON public.sedes FOR DELETE USING (public.has_role(auth.uid(), 'admin_central'));

CREATE POLICY "Admins pueden ver clientes" ON public.clientes_actuales FOR SELECT USING (public.has_role(auth.uid(), 'admin_central') OR public.has_role(auth.uid(), 'admin_sede'));
CREATE POLICY "Admins pueden crear clientes" ON public.clientes_actuales FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin_central') OR public.has_role(auth.uid(), 'admin_sede'));
CREATE POLICY "Admins pueden actualizar clientes" ON public.clientes_actuales FOR UPDATE USING (public.has_role(auth.uid(), 'admin_central') OR public.has_role(auth.uid(), 'admin_sede'));
CREATE POLICY "Admins pueden eliminar clientes" ON public.clientes_actuales FOR DELETE USING (public.has_role(auth.uid(), 'admin_central') OR public.has_role(auth.uid(), 'admin_sede'));

CREATE POLICY "Todos pueden ver áreas" ON public.areas FOR SELECT USING (true);
CREATE POLICY "Admins pueden crear áreas" ON public.areas FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin_central') OR public.has_role(auth.uid(), 'admin_sede'));
CREATE POLICY "Admins pueden actualizar áreas" ON public.areas FOR UPDATE USING (public.has_role(auth.uid(), 'admin_central') OR public.has_role(auth.uid(), 'admin_sede'));

CREATE POLICY "Usuarios pueden ver sus consultas" ON public.consultas FOR SELECT USING (auth.uid() = usuario_solicitante OR public.has_role(auth.uid(), 'admin_central') OR public.has_role(auth.uid(), 'admin_sede'));
CREATE POLICY "Usuarios autenticados pueden crear consultas" ON public.consultas FOR INSERT WITH CHECK (auth.uid() = usuario_solicitante);
CREATE POLICY "Admins pueden actualizar consultas" ON public.consultas FOR UPDATE USING (public.has_role(auth.uid(), 'admin_central') OR public.has_role(auth.uid(), 'admin_sede'));

CREATE POLICY "Admins pueden ver respuestas" ON public.respuestas FOR SELECT USING (public.has_role(auth.uid(), 'admin_central') OR public.has_role(auth.uid(), 'admin_sede'));
CREATE POLICY "Admins pueden crear respuestas" ON public.respuestas FOR INSERT WITH CHECK (auth.uid() = usuario_respondedor AND (public.has_role(auth.uid(), 'admin_central') OR public.has_role(auth.uid(), 'admin_sede')));
CREATE POLICY "Admins pueden actualizar respuestas" ON public.respuestas FOR UPDATE USING (auth.uid() = usuario_respondedor OR public.has_role(auth.uid(), 'admin_central'));

CREATE POLICY "Usuarios pueden ver sus notificaciones" ON public.notificaciones FOR SELECT USING (auth.uid() = usuario_destinatario);
CREATE POLICY "Sistema puede crear notificaciones" ON public.notificaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuarios pueden actualizar sus notificaciones" ON public.notificaciones FOR UPDATE USING (auth.uid() = usuario_destinatario);

CREATE POLICY "Admin central puede ver auditoría" ON public.auditoria FOR SELECT USING (public.has_role(auth.uid(), 'admin_central'));
CREATE POLICY "Sistema puede crear auditoría" ON public.auditoria FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios pueden ver sus roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin_central'));
CREATE POLICY "Admin central puede crear roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin_central'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usuarios_sede ON public.usuarios(sede_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_clientes_sede ON public.clientes_actuales(sede_id);
CREATE INDEX IF NOT EXISTS idx_clientes_ruc ON public.clientes_actuales(ruc);
CREATE INDEX IF NOT EXISTS idx_consultas_usuario ON public.consultas(usuario_solicitante);
CREATE INDEX IF NOT EXISTS idx_consultas_estado ON public.consultas(estado_final);
CREATE INDEX IF NOT EXISTS idx_respuestas_consulta ON public.respuestas(consulta_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON public.notificaciones(usuario_destinatario);
CREATE INDEX IF NOT EXISTS idx_notificaciones_estado ON public.notificaciones(estado);
CREATE INDEX IF NOT EXISTS idx_auditoria_consulta ON public.auditoria(consulta_id);