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

-- ============================================================================
-- RUTA ESTRELLA: Verificación de negocio sin registro formal (Chile)
-- Documentada de un caso real, paso por paso. Es la rama verif_alternativa
-- país=Chile que el diagnóstico asigna a un negocio sin documentación formal.
-- ============================================================================
with ins_steps as (
  insert into public.knowledge_steps
    (slug, titulo, instruccion, nombre_actual_boton, trampa, comportamiento_a_evitar, canal, estado_editorial)
  values
    ('wa-verif-iniciar',
     'Iniciar la verificación del negocio',
     'En business.facebook.com → Centro de seguridad → Verificación del negocio → Iniciar. Sirve para subir los límites de mensajería, no para arrancar (el número se asocia sin verificar).',
     'Centro de seguridad → Verificación del negocio',
     'La verificación NO bloquea operar: ya puedes usar el número sin ella. No la inicies si no tienes cómo respaldar nombre + dirección/teléfono con documentos.',
     'No inicies múltiples solicitudes: cada rechazo endurece el siguiente.',
     'whatsapp', 'aprobado'),
    ('wa-verif-tipo-negocio',
     'Elegir el tipo de negocio: Sociedad unipersonal (DBA)',
     'En "Selecciona tu tipo de negocio", elige "Sociedad unipersonal" (un solo propietario que opera bajo un nombre comercial / DBA).',
     'Selecciona tu tipo de negocio → Sociedad unipersonal',
     'NO elijas "Institución" aunque seas edtech/educación: esa categoría exige registro institucional formal que no tienes.',
     'No declares un tipo de empresa (sociedad, LLC) que no puedas documentar.',
     'whatsapp', 'aprobado'),
    ('wa-verif-registrado',
     'Está registrado oficialmente -> "Aún no registrado"',
     'Si tu negocio no tiene constitución legal formal, elige "Aún no registrado (una persona lo representa)". Te lleva a verificación por persona representante.',
     'Tu negocio esta registrado oficialmente -> Aun no registrado',
     'NO elijas "Registrado" sin documentos gubernamentales de registro: te exige papeles que no tienes y es callejón sin salida.',
     'No mientas diciendo "Registrado": el siguiente paso pide el documento de registro.',
     'whatsapp', 'aprobado'),
    ('wa-verif-nombre-legal',
     'Nombre legal = TU nombre, marca = nombre comercial (LA CLAVE)',
     'En "Nombre del negocio" pon TU NOMBRE LEGAL (persona natural). En "Nombre del negocio alternativo" pon la marca/nombre comercial.',
     'Nombre del negocio (legal) + Nombre alternativo (comercial)',
     'EL ERROR #1: poner la marca como nombre legal. Eso hace que Meta exija documentos CON la marca (que no existen sin constituir empresa). Con el nombre legal = tu nombre, tus documentos personales (registro tributario, boletas) sí califican.',
     'No pongas la marca/nombre de fantasía en el campo de nombre legal.',
     'whatsapp', 'aprobado'),
    ('wa-verif-direccion',
     'Ingresar la dirección (calle + código postal + comuna)',
     'El formulario pide calle + código postal + comuna, sin número de calle. Usa una dirección real que puedas respaldar con un documento.',
     'Información del negocio → Dirección',
     'Como no pide número, la dirección se cruza a nivel calle/comuna/código postal: basta con que esos calcen con tu documento. No te preocupes si el número exacto no está en el formulario.',
     'No inventes una dirección que no puedas respaldar con un documento.',
     'whatsapp', 'aprobado'),
    ('wa-verif-telefono-url',
     'Teléfono (el mismo de Meta) + URL del sitio activo',
     'Usa el MISMO teléfono que registraste en Meta, y la URL de tu sitio web (debe estar activo y cargar).',
     'Información del negocio → Teléfono y sitio web',
     'En la ruta sin registro formal, tu presencia online (dominio + web) sustituye al registro. Un sitio caído resta. Usa el mismo teléfono en todo (Meta, WhatsApp, documentos).',
     'No uses un teléfono o URL que no puedas verificar después.',
     'whatsapp', 'aprobado'),
    ('wa-verif-confirmacion-correo',
     'Elegir confirmación por correo del dominio (@tudominio)',
     'Como método de confirmación de conexión, elige "Correo electrónico @tudominio". Es lo más fuerte: prueba que controlas el dominio del negocio.',
     'Elige cómo confirmar tu conexión → Correo electrónico',
     'Si no tienes buzón en el dominio, usa "Verificación del dominio" (DNS). Las opciones de teléfono/SMS/WhatsApp también sirven, pero el correo del dominio es el más sólido.',
     null,
     'whatsapp', 'aprobado'),
    ('wa-verif-doc-nombre',
     'Documento 1 (nombre): registro tributario a tu nombre',
     'Sube un documento oficial con tu nombre legal. En Chile: Certificado de Inicio de Actividades o Situación Tributaria del SII. Tipo: "Registro o licencia del negocio".',
     'Subir documentos → Verifica el nombre legal',
     'Verifica si YA tienes Inicio de Actividades (de trabajos previos con boletas de honorarios): muchos lo tienen sin recordarlo y NO necesitan constituir empresa. Si el documento muestra una dirección vieja, responde "No" a si incluye la dirección y úsalo solo para el nombre.',
     'NO subas comprobantes de transacción (pagos, settlement, boletas de venta a clientes): no llevan tu nombre legal como titular y se rechazan.',
     'whatsapp', 'aprobado'),
    ('wa-verif-doc-direccion',
     'Documento 2 (dirección/teléfono): factura de servicios con el número de Meta',
     'Sube una factura de servicios públicos (cuenta de teléfono/internet) con tu nombre + el MISMO número registrado en Meta. Tipo: "Factura de servicios públicos".',
     'Subir documentos → Verificar dirección o teléfono',
     'El requisito es "teléfono O dirección": si tu factura tiene el número EXACTO de Meta, calza por teléfono aunque el número de la calle difiera. Elige la boleta que contenga ese número.',
     'No uses boletas de proveedores (registro de dominio/hosting): muestran la dirección del VENDEDOR, no la tuya.',
     'whatsapp', 'aprobado'),
    ('wa-verif-confirmar-codigo',
     'Confirmar el correo del dominio con el código',
     'Meta envía un código de confirmación a tu correo @dominio (válido 60 minutos). Ingrésalo para enviar la solicitud.',
     'Confirmar dirección de correo electrónico',
     'Revisa también spam. Si el código expira, pide uno nuevo.',
     null,
     'whatsapp', 'aprobado'),
    ('wa-verif-enviado',
     'Solicitud enviada → revisión ~2 días laborables',
     'La revisión de Meta tarda aproximadamente 2 días laborables. Te avisan el resultado por el estado de la verificación y por correo.',
     'Información enviada',
     'No reenvíes ni inicies otra solicitud mientras esperas: se interpreta como reintento y endurece el criterio. Mientras tanto, ya puedes operar el número.',
     'No abras una segunda solicitud en paralelo.',
     'whatsapp', 'aprobado')
  returning id, slug
),
ins_route as (
  insert into public.routes (nombre, rama, canal, pais, proceso)
  values ('WhatsApp · verificación de negocio sin registro formal · Chile', 'verif_alternativa', 'whatsapp', 'Chile', 'verificacion_portafolio')
  returning id
)
insert into public.route_steps (route_id, step_id, orden)
select (select id from ins_route), s.id, x.orden
from ins_steps s
join (values
  ('wa-verif-iniciar', 1), ('wa-verif-tipo-negocio', 2), ('wa-verif-registrado', 3),
  ('wa-verif-nombre-legal', 4), ('wa-verif-direccion', 5), ('wa-verif-telefono-url', 6),
  ('wa-verif-confirmacion-correo', 7), ('wa-verif-doc-nombre', 8), ('wa-verif-doc-direccion', 9),
  ('wa-verif-confirmar-codigo', 10), ('wa-verif-enviado', 11)
) as x(slug, orden) on x.slug = s.slug;
