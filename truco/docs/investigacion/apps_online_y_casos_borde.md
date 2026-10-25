# Truco argentino online: convenciones de apps, integridad de juego y casos borde de reglas

> Notas de investigación (octubre 2026). Convención: lo **documentado** lleva cita inline; lo **inferido** va en "Inferencias". Las fichas de tiendas son texto de marketing del propio desarrollador: sirven para saber qué funciones declaran, no prueban cómo funcionan. Ninguna app relevada publica una política escrita de timeouts/abandono, así que esa parte se apoya sobre todo en inferencias.

## 1. Qué apps son las más populares y qué modos ofrecen

### Takeaway
Las dos familias dominantes son **Truco Blyts** (Blyts, Argentina) y **Truco Argentino de ConectaGames/Web2mil**. Entre las dos cubren 1v1, 2v2 y 3v3, flor opcional, torneos y rankings. Los portales web nuevos (truco.ar, TrucoBits, TrucoReal) repiten el patrón: 1v1/2v2/3v3, 15 o 30 puntos, con o sin flor. "La Gran Truco", "Truco Gaucho" y "Truco Venado" no aparecieron como apps de truco argentino identificables.

### Cited Findings
- **Truco Blyts (Blyts, Vicente López)**: en 2017 tenía "casi nueve millones de descargas" y según sus creadores "siempre está entre los top 10 del ránking de Argentina". Ofrecía multijugador contra desconocidos y modo offline contra la máquina, y en ese momento estaba desarrollando el online 2 parejas — [Aire de Santa Fe, 9/1/2017](https://www.airedesantafe.com.ar/ocio/la-app-truco-que-ya-es-viral-n27031)
- La ficha actual de Truco Blyts declara "¡Modo de juego 2 vs 2 ONLINE!", "Modo de juego 3 vs 3" (3v3 agregado en v6.0.256, mayo 2024), "Mandale las señas a tu compañero", "Chat global", ranking, torneos diarios, torneos privados entre amigos, "Más de 180 jugadores virtuales" (bots con personalidades), "Orejeo de cartas" y "Gira Nacional". Hay versiones recientes de 2026 ("nuevo mundial 2026!", "Nueva Copa Argentina!", "Ahora podes elegir nombre de usuario") — [App Store, Truco Blyts](https://apps.apple.com/us/app/-/id732850167)
- **Truco Argentino (Web2mil / ConectaGames)**: "Se puede jugar un mano a mano (1 contra 1)" o "en equipo, de a dos o tres jugadores (4 o 6 jugadores en total)". En 6 jugadores "se puede elegir si jugar pico a pico o no". "¡Elegí si jugar con flor o no!". Los puntos para ganar "pueden ser 10, 20, 30 o 40". Tiene bots siempre disponibles, torneos, Ranking Diario con premios hasta el 3.er puesto, Ranking Semanal, Modo Espectador (v6.22.9, febrero 2025) y mejoras de reconexión — [App Store AR, Truco Argentino](https://apps.apple.com/ar/app/truco-argentino/id490975530)
- El mismo desarrollador publica **Truco Venezolano** (2 o 4 jugadores, con flor, "Flor Reservada", "Contraflor al Resto", rankings diario y semanal, "smoother reconnections" en v6.22.37, junio 2025) — [App Store, Truco Venezolano](https://apps.apple.com/app/id490979419)
- **Truco Argentino Multitorneo (Cibernatural S.L.)**: solo "uno contra uno a 15 puntos sin flor", con torneos de 5 rondas sin inscripción previa — [App Store, Multitorneo](https://apps.apple.com/us/app/-/id1384494458)
- **truco.ar (web)**: "Mano a mano", "Por parejas", "Por tríos". Mesas privadas con código. Partida a 30 (15 malas + 15 buenas). Pica-pica en 3v3. La página principal no menciona la flor — [truco.ar](https://truco.ar/)
- **TrucoBits (web)**: al crear la mesa se elige "la modalidad (1v1, 2v2 o 3v3), los puntos (15 o 30) y si jugás con flor o sin flor". También tiene matchmaking para completar mesas — [TrucoBits, cómo jugar con amigos](https://trucobits.com/blog/como-jugar-al-truco-online-con-amigos)
- **TrucoReal (web, por dinero)**: "Juega por dinero real", mesas "desde centavos hasta torneos de bastante valor", 2/4/6 jugadores, partidas a 15 o 30. El sitio no identifica al operador ni una licencia — [TrucoReal](https://trucoreal.com/)
- **Steam**: "Truco Argentino" (Agustin Rambaldo, julio 2025, US$3,49) trae IA y flor opcional, con etiqueta "Online PvP" — [Steam](https://store.steampowered.com/app/3734820)
- Muchas apps de "Truco" en las tiendas son de **truco paulista/mineiro (Brasil)**, otra variante: Truco GameVelvet, Truco ZingPlay, Truco Brasil, entre otras — [GameVelvet](https://apps.apple.com/us/app/-/id641801046), [ZingPlay](https://apps.apple.com/app/id1594138003)
- El reglamento de los Juegos Evita (Personas Mayores, 2023) se juega por parejas mixtas "a 30 puntos (15 malas y 15 buenas)" y remite al "Reglamento Oficial de la Asociación Argentina de Truco (ASART)" — [Reglamento Truco 2023, argentina.gob.ar](https://www.argentina.gob.ar/sites/default/files/2023/04/truco.pdf)

### Inferences
- El "default de mercado" para el truco argentino online es **30 puntos (15 malas / 15 buenas)**, con 15 como modo rápido. La flor es **opcional** y suele venir desactivada por defecto en modos rápidos/1v1, como hace Multitorneo. 10/20/40 (ConectaGames) es una excepción.
- El 3v3 con pica-pica configurable es un diferencial reciente: Blyts lo agregó en 2024 y ConectaGames lo tiene como opción.

### Gaps
- No encontré cifras de descargas actuales (2024–2026) de Blyts ni de ConectaGames, y no pude cargar la ficha de Google Play de Blyts (404 con el ID que probé).
- "La Gran Truco", "Truco Gaucho" y "Truco Venado" no aparecieron como apps de truco argentino. Puede que los nombres no sean exactos.
- No pude relevar los portales Juegos.com.ar, Zonajuegos, Mundijuegos ni Casual Arena: las búsquedas no devolvieron sus páginas de reglas.

## 2. Temporizadores de turno y qué pasa en timeout

### Takeaway
Casi no hay documentación pública. El único dato concreto es de Multitorneo: **30 s por turno**, respuesta automática del envido a los 3 s y "perder los puntos" de la mano si se vence el tiempo. ConectaGames solo menciona de pasada un "temporizador extra", sin detalles.

### Cited Findings
- Multitorneo: "Aumentar Tiempo de Turno a 30 segundos" (v1.7.0, 2020). También "la respuesta automática en 3 segundos para decir los tantos del envido" y "perder los puntos cuando se pase el tiempo para jugar la mano" — [App Store, Multitorneo](https://apps.apple.com/us/app/-/id1384494458)
- ConectaGames: "arreglamos el temporizador extra en modo retrato" (v6.22.4). La nota confirma que existe un timer con tiempo extra, pero no da duraciones — [App Store AR, Truco Argentino](https://apps.apple.com/ar/app/truco-argentino/id490975530)
- truco.ar, TrucoBits y TrucoReal no publican límites de tiempo. TrucoReal incluso recomienda como estrategia leer los tiempos de respuesta del rival — [truco.ar](https://truco.ar/), [TrucoReal](https://trucoreal.com/)
- En torneos presenciales la tolerancia de llegada es de 20 minutos y después se pierde el partido — [Reglamento torneo, Consejo](https://archivo.consejo.org.ar/deportes/files/8TORNEO_Reg.pdf)

### Inferences
- **Hay que decidir qué pasa en cada tipo de momento**. Propuesta determinista para una mesa paga:
  - *Jugar carta*: 20–30 s más un banco de tiempo extra por partida (por ejemplo 60 s acumulables, al estilo del "temporizador extra" de ConectaGames). Al vencer, la opción más defendible es **jugar automáticamente la carta de menor valor** (regla fija, sin IA) o **irse al mazo**. Multitorneo hace lo segundo: el jugador pierde los puntos de la mano.
  - *Responder un canto (quiero/no quiero)*: al vencer, **"no quiero" automático**. Es el resultado de menor riesgo para el que se quedó sin tiempo y no regala información.
  - *Declarar envido*: conviene **no pedirle nada al jugador** y calcular el tanto automáticamente. Multitorneo también lo automatiza (3 s).
  - *Cantar flor*: también automático, porque cantarla es obligatorio (ver sección 6).
- Para mesas pagas: después de N timeouts consecutivos (por ejemplo 2–3), considerar al jugador **ausente** y aplicar la política de abandono (sección 3), así nadie puede ganar arrastrando la partida.
- Si el timer corre en el cliente, se presta a trampas. **El servidor es la autoridad del reloj** y el cliente solo lo muestra.

### Gaps
- No encontré duraciones de timer ni qué pasa en timeout para Blyts ni ConectaGames, ni reseñas que lo describan.

## 3. Desconexión y abandono en partidas por equipos

### Takeaway
Las apps anuncian "reconexión" (ConectaGames 2025) y bots siempre disponibles, pero no publican qué pasa si un jugador se va. La única regla escrita oficial es la presencial: **el que no se presenta pierde 30-0**.

### Cited Findings
- ConectaGames: "Mejoramos la estabilidad en las reconexiones" (v6.22.4/6.22.9) y Truco Venezolano anuncia "smoother reconnections". El pitch dice "bots siempre disponibles" — [Truco Argentino iOS](https://apps.apple.com/ar/app/truco-argentino/id490975530), [Truco Venezolano](https://apps.apple.com/app/id490979419)
- Multitorneo se vende con torneos "sin la obligación de tener que jugar a riesgo de perder por abandono". Eso implica que en otros modos sí se pierde por abandono — [Multitorneo](https://apps.apple.com/us/app/-/id1384494458)
- truco.ar solo muestra "Conexión perdida. Intentando reconectar..." — [truco.ar](https://truco.ar/)
- TrucoBits: "Si falta gente, podés completar con el matchmaking" — [TrucoBits](https://trucobits.com/blog/como-jugar-al-truco-online-con-amigos)
- Juegos Evita: "En caso de no presentación de un equipo, el resultado de la partida será de treinta- cero (30-0) a favor del equipo presente". Puntaje de tabla: ganador 2, perdedor 1, no presentado 0 — [Reglamento 2023](https://www.argentina.gob.ar/sites/default/files/2023/04/truco.pdf)
- Un usuario de Steam se queja de que, cuando el juego se cuelga, la única salida es abandonar y eso cuenta como derrota — [Steam Community, Truco Argentino](https://steamcommunity.com/app/3734820)

### Inferences
- Para una mesa **paga** con pozo en contrato, recomiendo:
  1. **Ventana de reconexión** de 60–120 s por desconexión, con un tope acumulado por partida. Mientras tanto corre el timer normal y se aplican los defaults de timeout (no quiero / carta mínima o mazo).
  2. Si se supera la ventana, el **equipo del ausente pierde la partida** (30-0 o el marcador que corresponda) y el pozo va al otro equipo. Es el equivalente directo del "no presentado" presencial y lo más fácil de liquidar on-chain.
  3. **No reemplazar por bot en mesas pagas**: un bot cambia la calidad del juego y da pie a disputas, como el "abandono estratégico" para que entre un bot más fuerte o más débil. En mesas gratis, el reemplazo por bot es razonable y es lo que el mercado ofrece.
  4. En 2v2/3v3 el compañero que se queda no debería perder su stake si demuestra que se mantuvo conectado. Esto es una decisión de producto: o el equipo pierde entero (simple y determinista), o se reembolsa al compañero desde el stake del ausente (más justo, pero más complejo y abre la puerta a colusión). **Default sugerido: el equipo pierde entero**, más un registro de reputación/abandonos que bloquee temporalmente el acceso a mesas pagas.
- Si se cae el servidor (falla nuestra, no del jugador), conviene una regla explícita de **anulación y reembolso** del pozo.

### Gaps
- No hay fuentes públicas sobre reemplazo por bot, esperas ni penalizaciones de reputación en Blyts ni ConectaGames. Las búsquedas en Reddit y foros no dieron resultados útiles.

## 4. Señas entre compañeros: señas predefinidas, chat y cartas visibles

### Takeaway
En el truco real **las señas están permitidas** y forman parte del juego. Las apps lo resuelven de dos formas opuestas: (a) **botones de seña privados** para el equipo (Blyts, TrucoBits, TrucoReal), o (b) **mostrar las cartas del compañero**, que reemplaza las señas (truco.ar, y ConectaGames como alternativa).

### Cited Findings
- Reglamento: "Es posible señalar a los compañeros las cartas que se tienen... está permitido que los jugadores elaboren su propio código". Lista las señas clásicas: cejas = as de espadas, guiño = as de bastos, labios a derecha/izquierda = 7 de espadas/oros, etc. También advierte que "las señas... también pueden observarlas los contrarios" — [Reglamento de Truco, juegosdesalon.com (PDF)](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Juegos Evita: "los compañeros de equipo se pueden comunicar en forma discreta mediante señas y gestos" — [argentina.gob.ar, Juegos Evita Truco](https://www.argentina.gob.ar/turismoydeportes/juegosevita/truco)
- Blyts: "Mandale las señas a tu compañero" — [App Store](https://apps.apple.com/us/app/-/id732850167)
- ConectaGames: "Podés mirar las cartas de tu compañero pulsando en sus cartas, como alternativa a hacer las señas del truco". También tiene chat de lobby desactivable, filtro de chat "menos tóxico" y regalos durante la partida — [App Store AR](https://apps.apple.com/ar/app/truco-argentino/id490975530)
- truco.ar: "Las cartas y el envido de tus compañeros están a la vista", porque online no hay señas. La excepción son las manos de pica-pica (1v1) — [truco.ar](https://truco.ar/)
- TrucoBits: "botones en pantalla que mandan mensajes cortos a tu compañero", como "tengo ancho", "me faltan puntos" o "cantá". "Son privadas del equipo — el rival no las ve" — [TrucoBits 2v2 y señas](https://trucobits.com/blog/reglas-truco-2v2-senas)
- TrucoReal: señas digitales con "íconos o botones discretos" — [TrucoReal](https://trucoreal.com/)

### Inferences
- En el truco presencial, las señas tienen un **riesgo intrínseco**: el rival puede verlas. Los botones privados eliminan ese riesgo, y mostrar las cartas elimina además la incertidumbre dentro del equipo. Las dos opciones cambian la estrategia respecto del juego real. Para mesas pagas, lo importante es que **todos los jugadores tengan exactamente la misma información**. Lo que hay que evitar es un canal lateral (Discord, llamada) solo para algunos.
- **Default recomendado**: mostrar las cartas del compañero dentro del equipo y además un set fijo de señas/emotes predefinidas. Nada de chat libre de equipo en mesas pagas. Así el canal externo no aporta ventaja, porque la información ya es completa dentro del equipo, y se neutraliza la colusión intra-equipo, que igual es legal. Alternativa más "purista": botones de seña privados con un set cerrado, como Blyts/TrucoBits.
- El chat libre con rivales, si existe, debería tener filtro (como ConectaGames) y poder silenciarse.

### Gaps
- No encontré la lista exacta de señas de Blyts ni si incluye "orejeo" del compañero.

## 5. Antitrampa, colusión, multicuentas, rankings y denuncias

### Takeaway
Las apps casuales tienen rankings (diario/semanal, con premios en ConectaGames) y filtros de chat, pero **no publican políticas anticolusión**. El único sitio por dinero relevado (TrucoReal) solo afirma que usa un RNG y "partidas auditadas", sin detalles ni operador identificable.

### Cited Findings
- ConectaGames: el Ranking Diario "ofrece premios hasta el tercer puesto" y un ícono de trofeo marca "las mesas que ganan puntos para la clasificación semanal" — [App Store AR](https://apps.apple.com/ar/app/truco-argentino/id490975530)
- Multitorneo: ascenso por rondas, donde perder una partida devuelve al jugador a la Ronda 1, con un costo de entrada en puntos — [App Store, Multitorneo](https://apps.apple.com/us/app/-/id1384494458)
- TrucoReal: "Usamos un generador de probabilidades automático para la repartida de cartas, lo que te garantiza que nunca otro jugador te va a ganar con trampa", más "partidas auditadas". No describe política de colusión ni multicuentas, y la página /legal no muestra términos sustantivos — [TrucoReal](https://trucoreal.com/), [TrucoReal /legal](https://trucoreal.com/legal)
- Reglamento presencial: en pica-pica, "el bando al que pertenezca un jugador que se inmiscuya en el pica-pica de otros pierde, y tiene que devolver los tantos... el equipo no infractor cobrará 4 tantos". Es un antecedente de sanción por pasar información fuera de lo permitido — [Reglamento juegosdesalon (PDF)](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)

### Inferences
- Vectores de colusión típicos en truco online, y mitigaciones:
  - **Chip dumping / soft-play** entre un jugador y su "rival" (en 1v1 o con un compañero ajeno en 2v2): un mismo par de cuentas que se repite mucho, "no quiero" sistemáticos ante cantos débiles, mazo temprano repetido. Mitigar con matchmaking aleatorio en mesas pagas públicas, límites de repetición del mismo par y análisis post-partida.
  - **Multicuenta en 2v2/3v3** (una persona controla a un rival y a un compañero, o a dos rivales): wallets distintas no prueban identidad. Mitigar con heurísticas (IP/dispositivo, wallets fondeadas desde la misma fuente) y KYC si el marco legal lo exige (sección 8).
  - **Canal lateral en mesas de pareja**: queda neutralizado si las cartas del compañero ya son visibles (sección 4).
  - **Fuga del mazo**: el servidor nunca le manda al cliente cartas ajenas, salvo las del compañero si así se decide. El reparto debería ser verificable (commit-reveal del seed) para que "partidas auditadas" sea algo concreto.
  - **Abandono estratégico** cuando el equipo va perdiendo: con la regla de la sección 3 (abandono = derrota) se vuelve irrelevante.
- Rankings: ELO/Glicko por modo (1v1 por separado de 2v2) es la convención general de juegos competitivos. No encontré qué sistema usan las apps de truco.

### Gaps
- No encontré documentación de sistemas de denuncia/reportes ni de rating (ELO u otro) en Blyts ni ConectaGames.

## 6. Flujo de UI de los cantos y declaración del envido

### Takeaway
La convención online es **una botonera de cantos** (Envido, Real Envido, Falta Envido, Flor, Truco, Retruco, Vale Cuatro, Quiero, No Quiero, Irse al mazo) que solo habilita los cantos legales en cada momento. El envido se **calcula y canta automáticamente** (Multitorneo, truco.ar) y se resuelve el "el envido está primero" ofreciendo envido como respuesta al truco en la primera baza.

### Cited Findings
- truco.ar: atajos de teclado "123 (jugar carta), E (envido), T (truco), Q (quiero), N (no quiero), M (mazo)" y botón "Mazo" — [truco.ar](https://truco.ar/)
- Multitorneo: "respuesta automática en 3 segundos para decir los tantos del envido" — [App Store](https://apps.apple.com/us/app/-/id1384494458)
- Reglamento, envido primero: "Si un jugador grita truco antes de que un miembro del otro bando haya dicho envido, puede contestar al envido contrario, y después de terminado el envido, hay que contestar el truco anterior" — [Reglamento juegosdesalon (PDF)](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Reglamento, ventana del envido: "No se puede echar envido después de jugada la primera carta o después de haber querido el truco". Sección 18: cada jugador puede cantar flor, envido o jugar carta "hasta que juega una carta... ya no se admite que se cante flor o envido, aunque sí responder a esos cantos" — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Reglamento, declaración: "Concluidos los envites, los jugadores anuncian el valor de su jugada. Cuando un jugador tiene una jugada peor que otra declarada... basta que diga son buenas". Gana el mano en caso de empate. "El ganador del envido debe mostrar sus cartas antes de anotarse los puntos. Si se hubiera equivocado al cantar el valor ganaría el equipo contrario" — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Reglamento, palabras: "Deben utilizarse las palabras precisas para cada canto"; quedan prohibidos los equívocos ("quieto", "trulo", "florcita"). "En el truco no puede retrucarse sin haber manifestado antes claramente que se aceptaba la anterior diciendo quiero". En cambio, en el envido subir implica aceptar lo anterior — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Reglamento, flor: cantarla es obligatorio ("El jugador que tiene flor debe cantarla para evitar una penalización"). Anula el envido y deja el truco "en suspenso". Existe "pido flor" al final de la mano para penalizar a quien la ocultó — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Las versiones con IA/bots y personajes (Blyts: "Más de 180 jugadores virtuales") son el estándar. No encontré documentación sobre audios de "cantos" o voces en las fichas relevadas — [Blyts](https://apps.apple.com/us/app/-/id732850167)

### Inferences
- **UI recomendada** (determinista y a prueba de "palabras equívocas"):
  - Botones contextuales calculados por el servidor a partir del estado. Ejemplo: en la primera baza, ante "Truco" del rival, el que responde ve `[Quiero] [No quiero] [Retruco] [Envido] [Real envido] [Falta envido]`, y los tres últimos abren la subfase de envido ("el envido está primero"). Al cerrarse el envido, vuelve la respuesta pendiente al truco.
  - En el truco, **"Retruco" implica "Quiero + Retruco"**: un solo botón equivale a "quiero retruco", así se cumple que hay que aceptar antes de subir.
  - **Envido automático**: el servidor compara los tantos y anuncia el resultado. Para conservar el sabor, se puede mostrar el canto en orden ("27", "son buenas" / "33") siguiendo el orden de mano, pero **sin permitir mentir**. En el presencial, mentir se castiga al mostrar las cartas ("ganaría el equipo contrario"). Online, permitirlo solo agrega una forma de equivocarse y una superficie de disputa.
  - **Flor automática** cuando está habilitada: es obligatoria, así que el servidor la canta por el jugador. Esto también elimina el "pido flor".
  - Mostrar las cartas del envido ganador al final de la mano (o al instante), solo como confirmación visual.
- Audio de cantos (voces "¡Quiero retruco!") es un plus de ambientación. No encontré qué apps lo tienen.

### Gaps
- No encontré capturas ni documentación sobre cómo Blyts o ConectaGames presentan "el envido está primero" ni si permiten declarar el envido a mano.

## 7. Ambigüedades de reglas y "reglas de la casa": opciones y default recomendado

### Takeaway
Las reglas divergen sobre todo en la falta envido, los puntos por irse al mazo, los encadenamientos del envido, el manejo de la flor, el fin de partida a mitad de mano y el pica-pica. Para un juego con dinero, cada punto tiene que quedar **fijado en reglas visibles antes de entrar a la mesa** y ser **calculado por el servidor**, nunca "acordado".

### Cited Findings y opciones (por tema)

**7.1 Falta envido: cuánto vale**
- Opción A: vale "el número de tantos necesarios para que el bando que va por delante gane el chico" — [Reglamento juegosdesalon](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf). Con la misma lógica, la contraflor al resto apuesta "la diferencia entre 30 y la anotación más alta de los dos bandos" — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Opción B: "Algunos jugadores apuestan a que el bando ganador lo será también de la partida, aunque vaya por detrás" (la falta gana el chico entero) — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Opción C (variante popular, de fuentes divulgativas vistas solo en resumen de búsqueda, no verificado): si el rival del ganador está en malas, la falta gana el chico; si no, suma lo que le falta al perdedor... o al que va adelante, según la fuente — resumen de búsqueda sobre [laps4: ¿Cuándo son buenas?](https://www.laps4.com/preguntas-y-respuestas/cuando-son-buenas-en-el-truco) (no se pudo abrir: 403)
- truco.ar la define solo como "lo que falta". En pica-pica, "la falta envido vale 6" — [truco.ar](https://truco.ar/); coincide con [juegosdesalon](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- **Default recomendado**: **A**, falta = `meta − max(puntos_A, puntos_B)`, calculado al momento de resolver, con mínimo 1. Es la regla del reglamento más citado, es determinista y no depende de malas/buenas. Mostrar el valor numérico en el botón ("Falta envido (7)"). En pica-pica, tope de 6.

**7.2 Falta envido no querida / tabla de "no quiero"**
- Reglamento: "no quiero" al primer envite da 1 tanto. Si hubo revires, se cobra lo "querido" hasta ese momento. "Si un equipo dice real envido o incluso falta envido y el otro contesta no quiero, el primer equipo gana 1 tanto". Envido → falta envido → no quiero da 2. Real envido → falta → no quiero da 3 — [Reglamento juegosdesalon](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- **Default**: implementar exactamente esa tabla: no querido = suma de los cantos ya aceptados implícitamente, o 1 si no hubo ninguno. Publicarla como tabla en la ayuda.

**7.3 ¿Se puede cantar "envido" dos veces? Encadenamientos**
- Reglamento: ante envido o real envido, las respuestas válidas son quiero, envido (+2), real envido (+3), falta envido o no quiero, y se puede seguir subiendo "sucesivamente". Pero "Envido envido: dicho por un mismo jugador vale por un envido simple" — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- La convención popular (no documentada en fuentes relevadas) limita a **un solo "envido-envido"** y luego real/falta.
- **Default**: secuencia permitida `Envido → (Envido)? → (Real envido)? → (Falta envido)?`, con como máximo un envido repetido y un real envido, siempre de forma creciente. Topea el valor (máximo 2+2+3 = 7 más la falta) y simplifica la máquina de estados. Hacerlo configurable solo si hace falta.

**7.4 "El envido está primero"**
- Reglamento: se puede responder envido a un truco no contestado en primera baza, y después se contesta el truco. Una vez querido el truco o jugada la carta propia, ya no se puede cantar envido — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Conflicto interno del mismo reglamento: §11 dice "No hay envido si todos los jugadores han descartado, 'callados', la primera carta" (la ventana es colectiva), mientras que §18 limita la ventana por jugador.
- **Default**: ventana **por jugador**: cada uno puede cantar envido hasta jugar su primera carta, y se puede responder al truco con envido mientras el truco no esté querido y estemos en primera baza. El último en tener ventana es el pie del equipo que no es mano.

**7.5 Puntos por irse al mazo**
- Reglamento: "Si los dos jugadores de un bando se van a baraja y no se ha gritado o cantado truco, el otro bando cobra 1 tanto". Si hay truco querido, se cobra su valor. Si se va solo uno, el compañero sigue jugando solo — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Variante (fuente divulgativa, vista solo en resumen de búsqueda): si todavía no terminó la ventana del envido, irse al mazo cuesta **2** (1 envido no querido + 1 truco); si ya terminó, 1 — resumen de búsqueda de laps4 (URL exacta no verificada; la página [laps4 "¿Qué vale más en el truco?"](https://www.laps4.com/preguntas-y-respuestas/que-vale-mas-en-el-truco) dio 403)
- **Default recomendado**: **la variante de 2 puntos en primera baza** si el que se va todavía podía cantar envido y nadie lo cantó. Si no, el valor del truco vigente (1 sin truco, o lo querido). Motivo: sin esto, irse al mazo de entrada con buen envido rival es gratis, y en juego por dinero se vuelve una herramienta para negar puntos. Mostrarlo en el botón ("Mazo (−2)"). En equipos, **irse al mazo es por equipo** (botón único que retira al equipo), porque el "se va uno y el otro sigue solo" agrega estados con poco valor online.

**7.6 ¿Quién puede cantar truco / retruco? Orden y "pie"**
- Reglamento: "Un jugador puede cantar truco en cualquier momento" (lo usual es desde la segunda baza). Cualquier rival puede contestar y su respuesta obliga al equipo. Retruco solo lo canta el equipo que dijo quiero al truco, y vale cuatro el que quiso el retruco — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- El "pie" "suele actuar como capitán y estratega del equipo", pero el reglamento no le da exclusividad para cantar — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- **Default**: cualquier jugador puede cantar truco **en su turno** (también antes de tirar), y el equipo que tiene "la palabra" (el que aceptó) puede subir **en cualquier turno propio**. Respuesta: cualquier miembro del equipo rival. El primero que responde obliga al equipo y el servidor bloquea respuestas concurrentes. Que cada canto online solo se pueda hacer en el turno propio evita condiciones de carrera.

**7.7 Mostrar las cartas del envido**
- Reglamento: el ganador "debe mostrar sus cartas antes de anotarse los puntos" y, si declaró mal, gana el contrario — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- **Default**: declaración automática y siempre veraz, y el servidor muestra las cartas que componen el tanto ganador al cerrar la mano. No hay escenario de "mentir el tanto".

**7.8 Empates de envido en equipos**
- Reglamento: "en caso de igualdad gana el mano (es decir, entre dos jugadores que tienen los mismos puntos de envido gana el que se encuentra primero en esa ronda)" — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- TrucoBits: "gana el equipo que tiene el jugador con más envido" — [TrucoBits](https://trucobits.com/blog/reglas-truco-2v2-senas)
- **Default**: el tanto del equipo es el máximo entre sus jugadores. Si empata, gana el jugador más cercano al mano en el orden de juego. Igual con la flor.

**7.9 Empates de bazas (pardas)**
- Reglamento: si se empata la primera, gana quien gane la siguiente. Si se empatan las tres, gana el equipo del mano. "Si se empata la primera baza y la segunda no, no es necesario jugar la tercera" — [ídem](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- truco.ar: si hay empate, gana quien ganó la primera ronda, o "el equipo mano" si todas empatan — [truco.ar](https://truco.ar/)
- Hay un caso no cubierto explícitamente: primera ganada por A, segunda parda. La convención es que gana quien ganó la primera, y coincide con truco.ar. **Default**: la regla de truco.ar más "parda en primera ⇒ define la segunda; si la segunda también es parda, define la tercera; todo pardo ⇒ mano".

**7.10 Fin de partida a mitad de mano**
- truco.ar (contexto pica-pica): "La partida termina inmediatamente cuando un equipo llega a 30" — [truco.ar](https://truco.ar/)
- Reglamento: el envido se anota al mostrar las cartas, es decir, al final de la mano ("antes de anotarse los puntos") — [juegosdesalon](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- **Default**: los puntos de envido/flor se acreditan **al resolverse**, y si alcanzan la meta, **la partida termina en ese momento** sin jugar el truco. Es determinista y evita jugar bazas "sin valor". Además conviene definir el orden de anotación cuando los dos equipos podrían llegar a la meta en la misma mano: envido/flor primero, después truco (por orden cronológico).

**7.11 Flor**
- Reglamento: obligatoria, anula el envido, deja el truco en suspenso. Contraflor, contraflor al resto, "con flor me achico"/"con flor quiero" y "pido flor". "Muchos jugadores prefieren eliminarla de sus partidas a causa de lo mucho que incide en ella la suerte" — [juegosdesalon](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Las apps la ofrecen como opción (ConectaGames: "¡Elegí si jugar con flor o no!"; TrucoBits: "con flor es el estilo clásico argentino; sin flor es más ágil"). Multitorneo juega sin flor — [ConectaGames](https://apps.apple.com/ar/app/truco-argentino/id490975530), [TrucoBits](https://trucobits.com/blog/como-jugar-al-truco-online-con-amigos), [Multitorneo](https://apps.apple.com/us/app/-/id1384494458)
- Hay inconsistencias de valores entre fuentes: el vocabulario del mismo reglamento dice que la contraflor apuesta "3 tantos adicionales" y §12 dice "6 tantos (o 9 si hubiera tres flores)" — [juegosdesalon](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- **Default**: **sin flor** en mesas pagas (menos azar, menos estados ambiguos). Si se habilita: flor = 3 automática, contraflor = 6, contraflor al resto = falta, sin "flor reservada" ni "pido flor".

**7.12 Pica-pica (3v3)**
- Reglamento: se alterna redondo / pica-pica. Deja de jugarse pica-pica "cuando un bando llega a las 10 buenas (25 tantos)", "en algunos lugares... cuando se ha anotado 15 tantos". En pica-pica la falta vale 6 — [juegosdesalon](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- truco.ar: pica-pica cuando un equipo tiene entre 5 y 24 puntos — [truco.ar](https://truco.ar/)
- ConectaGames permite activar o desactivar el pico a pico — [App Store AR](https://apps.apple.com/ar/app/truco-argentino/id490975530)
- **Default**: 3v3 con pica-pica **desactivado por defecto**. Si se activa, umbral 5–24 (truco.ar) y falta = 6.

**7.13 Palabras equívocas / cantos erróneos**
- Reglamento: penalizaciones por términos equívocos, por mencionar "flor" sin tenerla, etc. — [juegosdesalon](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- **Default**: no aplica, porque la botonera solo ofrece acciones legales. Es una ventaja del formato online que conviene mencionar en la ayuda.

**7.14 Meta y estructura**
- 30 (15 malas + 15 buenas) es el estándar reglamentario y el de truco.ar. "La partida se gana cuando un equipo consigue dos chicos" en el formato clásico — [Juegos Evita 2023](https://www.argentina.gob.ar/sites/default/files/2023/04/truco.pdf), [juegosdesalon](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf), [truco.ar](https://truco.ar/)
- **Default**: una sola partida a 30 (opción 15 para rápidas). Al mejor de 3 chicos solo si se ofrece explícitamente.

### Inferences
- Para el smart contract solo importa **quién ganó** (y eventualmente si hubo abandono o anulación). Las reglas de juego viven off-chain en el servidor. Conviene versionar el ruleset (por ejemplo `ruleset_id` en el registro de la mesa) para que cualquier disputa se resuelva con la versión de reglas exacta aceptada al entrar.
- Cada opción configurable multiplica los casos de prueba. Para el MVP pago: 1v1 y 2v2, a 15/30, sin flor, sin pica-pica, falta = meta − máximo, mazo en primera = 2, envido automático, cartas del compañero visibles más señas predefinidas.

### Gaps
- No pude obtener el texto del **Reglamento Oficial de ASART** (la referencia que usan los Juegos Evita). El reglamento de juegosdesalon.com es una fuente secundaria, sin fecha, con algunas inconsistencias internas.
- No pude verificar las páginas de laps4 (403). Las variantes que vienen de ahí (falta según malas/buenas, mazo = 2) están marcadas como no verificadas.
- No encontré qué reglas exactas (falta, mazo, encadenamientos) implementan Blyts y ConectaGames.

## 8. Nota legal (bandera, no asesoramiento): ¿el truco por dinero es juego de azar en Argentina?

### Takeaway
**Bandera roja.** En Argentina el juego con apuestas se regula a nivel provincial y CABA. Las definiciones relevadas (CABA Ley 538, Santa Fe 2023) **incluyen juegos de destreza** cuando se apuesta dinero por un premio, así que el argumento "es habilidad, no azar" probablemente no saca al truco del régimen. Operar sin autorización puede encuadrar en el **art. 301 bis del Código Penal** (3 a 6 años de prisión). Hace falta consultar a un abogado antes de lanzar mesas pagas para usuarios en Argentina.

### Cited Findings
- CABA, Ley 538: alcanza "a los juegos de azar, destreza y apuestas mutuas, en los que, con la finalidad de obtener un premio, se comprometen cantidades de dinero" (cita tomada de un resumen de búsqueda; conviene verificar el texto completo) — [Boletín Oficial CABA, norma 9885](https://boletinoficial.buenosaires.gob.ar/normativaba/norma/9885)
- Santa Fe, ley de 2023: según el resumen de búsqueda, su definición de juego online incluye juegos donde predomina la destreza — [Boletín Oficial Santa Fe, Ley 14235](https://www.santafe.gob.ar/boletinoficial/ver.php?seccion=2023%2F2023-12-20ley14235-2023.html)
- La regulación es jurisdiccional (provincias + CABA). Dossier legislativo nacional de la Biblioteca del Congreso — [BCN Dossier 306, juegos de azar (oct. 2024)](https://bcn.gob.ar/uploads/adjuntos/Dossier-306-legis-nacional-juegos-de-azar-oct-2024.pdf); [Derecho en Zapatillas](https://www.derechoenzapatillas.com/2019/como-esta-regulado-el-juego-online-ahora-se-habilitaron-los-dominios-bet-ar-para-apuestas/)
- Art. 301 bis CP: prisión de 3 a 6 años para quien "explotare, administrare, operare o de cualquier manera organizare" juegos de azar sin autorización. Se aplica contra plataformas online (bloqueos FEJA/LOTBA, 537 sitios bloqueados en PBA) — [Diario Judicial, 31/7/2026](https://www.diariojudicial.com/news-81130-una-mala-apuesta); [FOCUS GN, FEJA bloqueó casinos ilegales](https://focusgn.com/latinoamerica/argentina-feja-apuestas-ilegales); [FOCUS GN, FEJA y LOTBA](https://focusgn.com/latinoamerica/bloquean-seis-plataformas-de-apuestas-ilegales-en-48-horas-tras-una-investigacion-conjunta-de-feja-y-lotba)
- Proyecto 6396-D-2025: propone ampliar el 301 bis a la promoción y publicidad. Está en trámite y su aprobación no está confirmada — [HCDN 6396-D-2025](https://www4.hcdn.gob.ar/dependencias/dsecretaria/Periodo2025/PDF2025/TP2025/6396-D-2025.pdf)
- TrucoReal afirma que jugar al truco por plata online es legal, pero sin citar normas y con interés comercial evidente. No es fuente confiable — [TrucoReal, cómo jugar por plata](https://trucoreal.com/como-jugar-por-plata)

### Inferences
- Que el pozo lo custodie y pague un smart contract (no custodial) **no cambia necesariamente** la calificación de "organizar" juego con apuesta. El que opera el servidor y el matchmaking podría ser visto como organizador. Comisión (rake) cero no elimina el riesgo, aunque puede influir.
- Mitigaciones habituales, sin evaluación legal: geobloqueo de jurisdicciones sin licencia, verificación de mayoría de edad, y dejar las mesas pagas solo para jurisdicciones donde el juego de destreza con premio esté explícitamente permitido.

### Gaps
- No encontré un dictamen ni un precedente específico sobre el **truco** por dinero online (destreza vs. azar). No verifiqué el texto completo de la Ley 538 ni el estado actual del proyecto de ley nacional de 2026 mencionado en un resumen de búsqueda.
