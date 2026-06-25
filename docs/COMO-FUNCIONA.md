# 🔦 Cómo funciona Faro

> Guía conceptual. Si vienes a entender QUÉ es Faro y CÓMO encaja todo, empieza aquí.
> Para trabajar en el código, mira también [AGENTS.md](../AGENTS.md).

## La idea en una frase

Faro es un **GPS para el laberinto de Meta**: le dice a un implementador, paso a paso,
exactamente qué hacer para activar un número de WhatsApp/Instagram sin que lo bloqueen,
**con la trampa de cada paso señalizada**.

## El insight que lo explica todo

Ese "mapa" no existe en ningún lado. Meta no lo publica, cambia los nombres de los botones
sin avisar y bloquea sin decir por qué. Entonces el mapa lo **dibuja un experto** (el editor)
y se **mantiene vivo con los reportes de quienes lo usan**.

Faro es ese mapa: vivo y compartido. El faro es la luz; las trampas son las rocas señalizadas.

## Faro tiene DOS caras

| Cara | Quién | Qué hace |
|---|---|---|
| **Editor** | El experto (la fuente de verdad) | En `/admin/conocimiento` escribe el conocimiento (los "Pasos") |
| **Implementador** | El usuario | Crea un proyecto por cliente y **sigue la guía**; no necesita saber lo que el editor sabe |

El editor no es el usuario del wizard. Es la **fuente**. Faro empaqueta su cerebro para quien no lo tiene.

## Los bloques de conocimiento (el motor)

Piénsalo como piezas de Lego reutilizables:

- **Paso** — la pieza atómica. Instrucción + *dónde* (nombre actual del botón) + **⚠ la trampa**
  + **⛔ qué evitar**.
  > Ej: *"Crear el Business Portfolio. Dónde: Configuración → Business Portfolio. ⚠ Antes se
  > llamaba 'Business Manager'. ⛔ No lo hagas desde una cuenta nueva: dispara revisión de integridad."*
- **Ruta** — una secuencia ordenada de Pasos para un caso. Cada ruta se clasifica por:
  - **proceso**: `activacion_numero` (llevar el número a producción, el core) vs
    `verificacion_portafolio` (verificar el Business Portfolio, otro trámite). **No se mezclan.**
  - **canal**: WhatsApp / Instagram.
  - **rama**: estándar / rehabilitación (cuenta con restricción previa) / verificación alternativa
    (sin documentación formal) / por BSP.
  - **país**: una cuenta chilena recibe la ruta chilena si existe.
- **Playbook de rescate** — qué hacer cuando ya te bloquearon, según el tipo de restricción
  (integridad / verificación / comportamiento).

**La gracia:** un mismo Paso se reutiliza en muchas rutas. Si Meta cambia un botón, **editas el
Paso una vez** y todas las rutas que lo usan quedan al día.

## El recorrido del implementador (lo que ve el usuario)

Sigamos a un implementador con su cliente "Pizzería Don Pepe":

1. **Crea el proyecto** → cliente, canal (WhatsApp), país (Chile).
2. **Diagnóstico** → 5 preguntas sobre la cuenta (¿restricción previa? ¿número ya usado en
   WhatsApp? ¿documentación formal? ¿historial de automatización? ¿antigüedad?). Faro calcula un
   **semáforo de riesgo** 🟢🟡🔴 y **elige la ruta automáticamente** según las respuestas y el país.
3. **Wizard** → recorre la ruta Paso a Paso. En cada uno ve la instrucción, **la trampa** y qué
   evitar. Marca "hecho" o reporta "esto cambió".
4. **Checkpoint** → al terminar, lista de verificación + protocolo de calentamiento (primeras 48-72h:
   volumen bajo, solo conversaciones iniciadas por el usuario, nada que parezca broadcast).
5. **Producción** ✅ → el agente queda vivo.
6. **Si lo bloquean** → entra a **modo rescate**: elige el tipo de restricción → ve el playbook
   (qué documento presentar, cómo redactar la apelación, cuánto esperar, cuándo declarar irrecuperable).

## Cómo se mantiene vivo (la red colectiva)

Cuando un implementador encuentra que un Paso ya no funciona, aprieta **"esto cambió"**. Eso
incrementa un contador en ese Paso. En la **vista de curaduría** del editor, los Pasos con más
reportes (o más viejos sin verificar) suben arriba: el editor sabe exactamente qué revisar.

Con ~20 usuarios activos, el editor se entera de un cambio de Meta **antes** de que le llegue como
queja. Cada nuevo usuario hace el producto más valioso para los anteriores: ese es el foso.

## Por qué está diseñado así

- **El conocimiento es el producto**, no el software. Las trampas son el oro: lo que al experto le
  parece obvio es exactamente lo que a otro lo bloquea.
- **El experto no es el usuario; es la fuente.** Por eso el wizard es para el implementador que NO
  tiene esa experiencia.
- **Se vende certeza, no eficiencia.** El valor es "de cero a producción sin bloqueo", reproducible.

## Mapa mental rápido

```
Editor  ──escribe──>  Pasos  ──se ensamblan en──>  Rutas (proceso·canal·rama·país)
                        │                              │
                        │                              ▼
                   Playbooks                      Diagnóstico ──asigna──> Wizard
                   de rescate                     (semáforo + ruta)        │
                        ▲                                                   ▼
                        └──────────  Implementador  ◀── recorre Paso a Paso ──┘
                                          │
                                    "esto cambió" ──> contador ──> curaduría (vuelve al editor)
```

## Preguntas frecuentes (FAQ)

**¿Faro usa IA para generar los pasos o el diagnóstico?**
No. Cero IA en el producto. Los Pasos los escribe un humano (el editor) y se guardan en la
base de datos; Faro solo los **muestra** en orden, no los genera. El diagnóstico (semáforo +
ruta) lo calcula una **función de TypeScript puro**: mismas respuestas, mismo resultado, siempre.

**¿Necesito una API key de OpenAI/OpenRouter o de algún modelo?**
No. Faro no usa ningún LLM en tiempo de ejecución. Lo único que necesita para correr es un
proyecto de Supabase (el plan gratis alcanza de sobra).

**¿Faro se conecta a la API de Meta?**
No, nunca. Faro no toca Meta. Es una **guía**: te dice qué hacer y tú lo haces a mano en tu
navegador. Es deliberado: automatizar acciones dentro de Meta reproduce justo el comportamiento
robótico que dispara los bloqueos.

**¿Tengo que darle a Faro mi usuario y clave de Meta?**
No, jamás. Hay **dos sesiones distintas que no se mezclan**: inicias sesión en **Faro** (tu cuenta
de Faro, para tener tus proyectos) y, por separado, inicias sesión en **Meta**
(business.facebook.com, en tu propio navegador) para hacer la activación. Faro nunca te pide ni ve
tus credenciales de Meta.

**Entonces, ¿qué hace exactamente Faro?**
Te muestra la ruta paso a paso con la trampa de cada paso, lleva tu progreso, y te da el playbook
de rescate si te bloquean. El "motor" es el **conocimiento curado**, no una automatización. Faro
guía, tú ejecutas.

**¿De dónde sale el conocimiento?**
Lo cura un editor humano (la fuente de verdad) y la **red de usuarios** lo mantiene vivo: cuando
alguien marca "esto cambió", ese Paso sube en la cola de curaduría del editor.
