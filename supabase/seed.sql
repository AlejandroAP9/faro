-- Seed ILUSTRATIVO (no son instrucciones verificadas de Meta).
-- Sirve para ver el sistema funcionando. Reemplázalo con conocimiento real.
-- Opcional: ejecútalo en el SQL editor de Supabase tras aplicar las migraciones.

with ins_steps as (
  insert into public.knowledge_steps
    (slug, titulo, instruccion, nombre_actual_boton, trampa, comportamiento_a_evitar, canal, estado_editorial)
  values
    ('wa-crear-business-portfolio',
     'Crear el Business Portfolio',
     'Entra a business.facebook.com con una cuenta personal de Facebook con buena reputación. Crea un nuevo Business Portfolio con el nombre legal del negocio del cliente.',
     'Configuración del negocio → Business Portfolio (antes "Business Manager")',
     'El menú se renombró de "Business Manager" a "Business Portfolio"; mucho tutorial viejo todavía dice "Business Manager".',
     'No crear el portfolio desde una cuenta de Facebook recién creada o sin historial: dispara revisión de integridad inmediata.',
     'whatsapp', 'aprobado'),
    ('wa-verificar-negocio',
     'Verificar el negocio (Business Verification)',
     'En Centro de seguridad, inicia la verificación del negocio. Sube documentación legal que coincida EXACTAMENTE con el nombre del portfolio.',
     'Centro de seguridad → Verificación del negocio',
     'Si el nombre del documento no calza al 100% con el del portfolio, Meta rechaza sin decir por qué.',
     'No reenviar documentos distintos en intentos seguidos: cada rechazo endurece el siguiente.',
     'whatsapp', 'aprobado'),
    ('wa-numero-dedicado',
     'Conseguir un número dedicado',
     'Consigue un número de teléfono que NUNCA haya estado registrado en la app de WhatsApp.',
     null,
     'Reutilizar el número personal del dueño es el error #1: si ese número ya tuvo WhatsApp, queda inhabilitado para la API.',
     'No registrar el número en la app de WhatsApp "para probar" antes de conectarlo a la API: lo quema para siempre.',
     'whatsapp', 'aprobado'),
    ('wa-elegir-bsp',
     'Elegir y conectar un BSP',
     'Elige un BSP disponible en el país del cliente. Conéctalo al portfolio siguiendo su embedded signup.',
     'Embedded signup del BSP (no desde el panel de Meta directamente)',
     'No todos los BSP operan en todos los países; elegir uno sin cobertura local obliga a rehacer todo.',
     'No conectar dos BSP al mismo número: genera conflicto de propiedad y bloquea la WABA.',
     'whatsapp', 'aprobado'),
    ('wa-crear-waba-display-name',
     'Crear la WABA y el display name',
     'Crea la WhatsApp Business Account vía el BSP y define el display name según las políticas de nombre de Meta.',
     'WhatsApp Manager → Configuración del perfil → Nombre para mostrar',
     'Un display name que parece marca genérica o engañoso queda "Pendiente" indefinidamente.',
     'No usar palabras como "Oficial" o "WhatsApp" en el display name: rechazo casi seguro.',
     'whatsapp', 'aprobado'),
    ('wa-calentamiento-inicial',
     'Calentamiento de las primeras 48-72h',
     'Arranca con volumen bajo y SOLO conversaciones iniciadas por el usuario. Sube el volumen gradualmente.',
     null,
     'La cuenta puede estar "activa" y aun así caer en las primeras 24h si el patrón parece broadcast masivo.',
     'No mandar plantillas masivas el día 1 ni comprar listas: causa más común de bloqueo post-activación.',
     'whatsapp', 'aprobado')
  returning id, slug
),
ins_route as (
  insert into public.routes (nombre, rama, canal)
  values ('WhatsApp · cuenta nueva · estándar', 'estandar', 'whatsapp')
  returning id
)
insert into public.route_steps (route_id, step_id, orden)
select (select id from ins_route), s.id, x.orden
from ins_steps s
join (values
  ('wa-crear-business-portfolio', 1),
  ('wa-verificar-negocio', 2),
  ('wa-numero-dedicado', 3),
  ('wa-elegir-bsp', 4),
  ('wa-crear-waba-display-name', 5),
  ('wa-calentamiento-inicial', 6)
) as x(slug, orden) on x.slug = s.slug;

insert into public.rescue_playbooks
  (tipo_restriccion, diagnostico, documentacion_a_presentar, plantilla_apelacion, tiempo_espera, criterio_irrecuperable)
values
  ('integridad',
   'La cuenta o el portfolio quedan "Restringidos" por integridad, normalmente antes del primer mensaje.',
   'Documento legal del negocio que coincida con el nombre del portfolio + comprobante de domicilio.',
   'Sé breve y factual: identifica el negocio, su actividad legítima y adjunta la documentación. Pide revisión manual citando el ID del caso.',
   '24-48h tras enviar la apelación. No reenviar mientras esté en revisión.',
   'Si tras 2 apelaciones bien documentadas sigue rechazada en ~10 días, empezar con un portfolio nuevo.'),
  ('verificacion',
   'La verificación del negocio se rechaza repetidamente.',
   'Documento que coincida EXACTAMENTE con el nombre del portfolio.',
   'Confirma que nombre legal, dirección y teléfono del documento son idénticos a los del portfolio. Corrige el portfolio antes de reapelar.',
   'Esperar la resolución completa (4+ días) antes de reintentar.',
   'Si el negocio no puede producir documentación que calce, usar la rama de verificación alternativa.'),
  ('comportamiento',
   'La cuenta cae DESPUÉS de activarse por patrón de comportamiento (parece broadcast/spam).',
   'Capturas del flujo conversacional real, opt-in de los contactos y descripción del caso de uso.',
   'Demuestra que los mensajes son solicitados y que hay opt-in. Aporta evidencia del calentamiento gradual.',
   'Se revisa en ~24h. Bajar el volumen a cero mientras tanto.',
   'Si la calidad cae a roja de forma reincidente, migrar a un número nuevo y rehacer el calentamiento.');
