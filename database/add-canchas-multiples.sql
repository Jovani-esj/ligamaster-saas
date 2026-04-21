-- Script para migrar las Canchas a un modelo Multi-Liga
-- Este script permite que una misma cancha sea asignada a varias ligas administradas por el mismo usuario.

-- 1. Añadir owner_id a canchas si no existe (para saber quién es el dueño de la instalación, independiente de la liga)
ALTER TABLE public.canchas ADD COLUMN IF NOT EXISTS owner_id UUID;

-- 2. Asignar el dueño de la cancha basándonos en el dueño de la liga a la que pertenece actualmente
UPDATE public.canchas c
SET owner_id = l.owner_id
FROM public.ligas l
WHERE c.liga_id = l.id AND c.owner_id IS NULL;

-- 3. Hacer liga_id opcional (ya no será obligatorio porque la relación principal será mediante liga_canchas)
ALTER TABLE public.canchas ALTER COLUMN liga_id DROP NOT NULL;

-- 4. Crear la tabla puente para soportar Múltiples Ligas por Cancha
CREATE TABLE IF NOT EXISTS public.liga_canchas (
    liga_id UUID REFERENCES public.ligas(id) ON DELETE CASCADE,
    cancha_id UUID REFERENCES public.canchas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (liga_id, cancha_id)
);

-- 5. Migrar los datos existentes: Insertar las relaciones actuales en la tabla puente
INSERT INTO public.liga_canchas (liga_id, cancha_id)
SELECT liga_id, id FROM public.canchas
WHERE liga_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 6. Habilitar RLS en la tabla puente
ALTER TABLE public.liga_canchas ENABLE ROW LEVEL SECURITY;

-- 7. Crear Políticas de Seguridad
-- Política SELECT
DROP POLICY IF EXISTS "Ver liga_canchas" ON public.liga_canchas;
CREATE POLICY "Ver liga_canchas"
ON public.liga_canchas FOR SELECT
USING (true); -- Permitir ver las relaciones públicamente o podrías restringirlo al owner

-- Política INSERT
DROP POLICY IF EXISTS "Insertar liga_canchas" ON public.liga_canchas;
CREATE POLICY "Insertar liga_canchas"
ON public.liga_canchas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ligas l 
    WHERE l.id = liga_canchas.liga_id AND l.owner_id = auth.uid()
  )
);

-- Política DELETE
DROP POLICY IF EXISTS "Eliminar liga_canchas" ON public.liga_canchas;
CREATE POLICY "Eliminar liga_canchas"
ON public.liga_canchas FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.ligas l 
    WHERE l.id = liga_canchas.liga_id AND l.owner_id = auth.uid()
  )
);

-- 8. Asegurar RLS en la tabla canchas modificada
DROP POLICY IF EXISTS "Los dueños pueden ver y editar sus canchas" ON public.canchas;
CREATE POLICY "Los dueños pueden ver y editar sus canchas"
ON public.canchas FOR ALL
USING (owner_id = auth.uid() OR liga_id IN (SELECT id FROM public.ligas WHERE owner_id = auth.uid()));
