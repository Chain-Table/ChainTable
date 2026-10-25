# Truco argentino por equipos: 2v2, 3v3 (redondo / pica-pica), asientos, cantos y reglas de equipo (sin flor)

Nota de fuentes: casi no hay un reglamento "federativo" único y accesible. La fuente escrita más completa es el "Reglamento de Truco" de juegosdesalon.com, republicado por varios sitios (folkloretradiciones.com.ar, casi.com.ar, el blog martesdeasadoytruco). Abajo se cita como **[Reglamento JdS]**. También se usaron: pagat.com (John McLeod), Wikipedia ES (marcada por falta de fuentes), el reglamento de Truco de los Juegos Bonaerenses 2026 (Provincia de Buenos Aires, modalidad parejas, **con flor** y a 40 tantos; aquí solo se usa para reglas de equipo/procedimiento), el reglamento de un torneo del Consejo Profesional de Ciencias Económicas de CABA (sin flor), truco.ar (sitio de juego online que dice seguir el "reglamento ASART"), una nota de Sitio Andino y un foro (UTNianos) para mostrar desacuerdos.

## 1. Asientos, sentido de juego, rotación de dador y mano

### Takeaway
Los compañeros se alternan en la mesa (A B A B / A B A B A B), así cada jugador tiene enfrente a un rival. El juego corre en sentido antihorario: la mano es el jugador a la derecha del dador, y el reparto pasa a la derecha en cada mano, así que el que fue mano reparte la siguiente. El "pie" es el último jugador de cada equipo en orden de juego. Las fuentes coinciden en esto.

### Cited Findings
- Partidas de cuatro: "dos parejas enfrentadas cuyos lugares se alternan en la mesa". Seis jugadores: "dos bandos de tres y se sientan de modo que queden enfrentados jugadores de distinto equipo". El reglamento admite 2, 3, 4, 6 u 8 jugadores. — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf) (mismo texto en [casi.com.ar](https://www.casi.com.ar/sites/default/files/Reglamento%20Truco.pdf))
- "Todo el juego del truco se realiza en sentido contrario al de las agujas del reloj. El jugador a la derecha del dador es el mano [...] El último jugador de cada bando es el pie, que suele actuar como capitán y estratega del equipo." El dador da a cortar al rival de su izquierda y reparte de a una carta empezando por la derecha. — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- 2v2: los compañeros se sientan enfrentados, el juego es antihorario y "the turn to deal passes to the right after each hand". El pie es el dador o el jugador a la izquierda del dador. 3v3: "Each team consists of three players seated alternately around the table". — [pagat.com](https://www.pagat.com/put/truco_ar.html)
- Juegos Bonaerenses: el primer dador se sortea (gana la carta más alta). Reparte tres cartas a cada uno, de a una por vuelta, "comenzando por el jugador sentado a su derecha y que será llamado mano. El que da las cartas se lo llama PIE". Después las cartas se dan "siguiendo por turno por la derecha del primero que las dio". Las parejas "deberán sentarse alternados (frente a frente)". — [Reglamento Truco, Juegos Bonaerenses 2026](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf)
- Wikipedia ES (6 jugadores o parejas): "el jugador más cerca del mazo hacia la izquierda es mano". — [Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino)
- Online, truco.ar: la mano es "el que está a la derecha del repartidor" y "el pie de cada equipo cierra la ronda". — [truco.ar](https://truco.ar/reglas)

### Inferences
- Modelo para el servidor: asientos `0..N-1` numerados en el orden de juego (antihorario visto desde arriba), equipo = `asiento % 2`. Dador `d`, mano = `(d+1) % N`, orden de juego de la primera baza = `mano, mano+1, …, d`. En la mano siguiente, `d' = (d+1) % N`, o sea que reparte quien fue mano.
- Pies: el pie de un equipo es su miembro que juega último en la baza 1. Siempre es el dador (`d`) para su equipo y `d-1` para el otro equipo. En las bazas 2 y 3 el orden empieza por el ganador de la baza anterior, pero el "pie" tradicional se define por la primera baza.
- En 3v3, el rival que un jugador tiene "enfrente" es el asiento `(i+3) % 6`, que por paridad siempre es del otro equipo.

### Gaps
- No encontré una regla escrita sobre quién reparte primero en online. Lo tradicional es el sorteo (Juegos Bonaerenses).

## 2. Quién puede cantar y responder envido y truco en equipo; respuestas que obligan al equipo; respuestas contradictorias

### Takeaway
Según las fuentes escritas principales, **cualquier jugador** puede cantar envido o truco, o responderlos, y su palabra obliga a todo el equipo ([Reglamento JdS], pagat). Hay una costumbre extendida, recogida en Wikipedia y discutida en foros, de que el envido "lo canta el pie". Es una variante o convención estratégica, no la norma de los reglamentos. El envido solo se inicia durante la primera baza, antes de que el jugador que lo canta haya jugado su carta. Se puede *responder* aunque ya se haya jugado. Ninguna fuente resuelve qué pasa si dos compañeros responden distinto: eso lo tiene que fijar el diseño online.

### Cited Findings
- Envido: "Cualquier jugador tiene la posibilidad de contestar a las propuestas de envido. Tanto los envites como las respuestas comprometen a todo el bando en el cual juega el que los hizo. No se puede echar envido después de jugada la primera carta o después de haber querido el truco." — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- El mismo reglamento: cada jugador, en su turno, puede cantar envido o jugar carta "hasta que juega una carta, ya que en este caso se empieza a jugar el truco y ya no se admite que se cante flor o envido, aunque sí responder a esos cantos". — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- La republicación del mismo reglamento dice que el envido debe iniciarse mientras se desarrolla la primera baza. Cuando el último jugador de un bando (su pie) ya jugó carta en la primera baza, ese bando ya no puede iniciarlo. Quienes ya jugaron pueden responder. — [martesdeasadoytruco (Reglamento JdS)](https://martesdeasadoytruco.blogspot.com/2011/03/reglamento-de-truco.html)
- "Any player may bet or answer a bet on the Envido, and all bets and answers are made on behalf of the partnership." En la práctica, el pie suele decidir las apuestas a partir de las señas. — [pagat.com](https://www.pagat.com/put/truco_ar.html)
- Postura contraria: "los jugadores con el derecho a cantarlo serán los pie de cada equipo (3v3 o 2v2)". El envido "no será dado por alto a no ser que un pie lo cante", y quien ya jugó su carta "no podrá cantar envido, salvo que sea para responder al envido cantado por el rival". — [Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino) (artículo marcado por falta de referencias)
- Foro: hay jugadores que afirman "solamente puede cantarlo el pié" y otros que dicen "El envido lo puede cantar cualquiera". Uno sostiene que el primer y segundo jugador (de a cuatro) no pueden cantarlo, salvo la falta envido. — [UTNianos](https://www.utnianos.com.ar/foro/tema-truco-argentino-duda-existencial?page=2)
- "El envido está primero": "Si un jugador grita truco antes de que un miembro del otro bando haya dicho envido, puede contestar al envido contrario, y después de terminado el envido, hay que contestar el truco anterior." — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf). Online, truco.ar: si cantan truco "y todavía no jugaste tu primera carta, podés responder con envido". — [truco.ar](https://truco.ar/reglas)
- Truco: "Un jugador puede cantar truco en cualquier momento [...] Cualquier jugador del bando contrario puede contestar y su respuesta obliga a todo su equipo." El retruco lo canta solo el equipo que dijo quiero al truco. El vale cuatro, el que dijo quiero al retruco. "Cada uno de los cantos debe aceptarse explícitamente con la palabra quiero y sólo después puede 'retrucarse'." — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- pagat: cualquier jugador puede cantar Truco, y "Either member of the opposing team can answer on behalf of the team". Las subidas las hace el equipo que aceptó por última vez (se puede decir "Quiero, Retruco"). — [pagat.com](https://www.pagat.com/put/truco_ar.html)
- Juegos Bonaerenses: "solamente puede retrucar el bando previamente convidado". "Retrucar sin decir previamente el QUIERO es ilícito." "Si no se responde nada se considerará no querida la invitación hecha." Preguntarle al compañero "¿tenés envido?" "es considerado canto". — [Juegos Bonaerenses 2026](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf)
- Sobre cantar truco fuera de turno, el foro está dividido. Unos dicen que se canta "cuando es su turno" o que lo canta "el que juega en ese momento". Otros sostienen que vale en cualquier momento. — [UTNianos p.3](https://www.utnianos.com.ar/foro/tema-truco-argentino-duda-existencial?page=3)
- El reglamento citado en el foro dice que, de a compañeros, "es el pie quien debe dirigir el juego". Es un texto pegado por un usuario, de procedencia no verificada. — [UTNianos](https://www.utnianos.com.ar/foro/tema-truco-argentino-duda-existencial?page=2)
- Respuestas contradictorias entre compañeros (uno dice "quiero" y otro "no quiero"): no aparece en ninguna fuente consultada, ni en los reglamentos JdS y Juegos Bonaerenses ni en pagat ni en Wikipedia. La búsqueda dirigida tampoco dio resultados.

### Inferences (defaults recomendados para online)
- **Iniciar envido:** puede hacerlo cualquier jugador **en su turno** de la baza 1, si todavía no jugó su carta, el envido no se cantó todavía en esa mano y no hay un truco ya querido. Además, cuando el rival canta truco en la baza 1, el equipo que responde puede contestar "envido" (el envido está primero) si el jugador que responde todavía no jugó su carta. Esto da en la práctica la regla de JdS/pagat y deja que el pie sea la última oportunidad sin prohibir a los demás. La variante "solo el pie" se puede ofrecer como opción de sala, pero no como default.
- **Cantar truco:** solo en el turno propio (variante estricta). Evita condiciones de carrera y es lo que defienden varios jugadores. Las subidas solo puede hacerlas el equipo que tiene "el quiero", y en un turno en el que le toque actuar a alguno de sus miembros o inmediatamente al aceptar ("Quiero retruco" como acción atómica).
- **Responder:** cualquier miembro del equipo desafiado. El servidor acepta **la primera respuesta válida que llega**, con número de secuencia o versión del estado. Las siguientes se rechazan por obsoletas. Es determinista y coincide con "su respuesta obliga a todo su equipo". Alternativa más ordenada, como opción: solo responde el "siguiente rival en orden" o el pie. Conviene mostrar en la interfaz que el compañero está respondiendo.
- **Timeout sin respuesta = "no quiero"**, como en los Juegos Bonaerenses ("Si no se responde nada se considerará no querida").

### Gaps
- No hay fuente sobre respuestas contradictorias simultáneas. La regla de "primera respuesta gana" es una recomendación de diseño, no tradición documentada.
- Tampoco hay fuente firme sobre si el truco fuera de turno es válido. Es costumbre de mesa.

## 3. Declaración del envido en equipo: orden, "son buenas", empates

### Takeaway
Una vez querido el envido, declara primero la mano y después sigue el orden antihorario. Un jugador solo necesita decir su tanto si supera al mejor ya cantado por el otro equipo. Si no, dice "son buenas". Si el que va ganando es su compañero, calla. El tanto de cada equipo es el mejor tanto individual de sus miembros. Los empates los gana el jugador que está antes en el orden desde la mano, es decir, el más cercano a la mano. Hay un desacuerdo menor entre "jugador mano" y "equipo mano". La mayoría y las fuentes escritas lo resuelven a nivel individual.

### Cited Findings
- "Concluidos los envites, los jugadores anuncian el valor de su jugada. Cuando un jugador tiene una jugada peor que otra declarada, no es necesario que cante la suya, basta que diga son buenas [...] en caso de igualdad gana el mano (es decir, entre dos jugadores que tienen los mismos puntos de envido gana el que se encuentra primero en esa ronda)." — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- El ganador del envido debe mostrar las cartas antes de anotarse los puntos. Si cantó mal, el envido lo gana el equipo contrario. — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- "The mano speaks first, followed by the other players in anticlockwise rotation." Si el valor más alto hasta ese momento es de tu compañero, no hace falta declarar salvo que un rival lo supere. Empate: "the one earlier in anticlockwise order around the table from the Mano to the dealer has priority". — [pagat.com](https://www.pagat.com/put/truco_ar.html)
- Wikipedia: después del primero declara "el más cercano del equipo contrario". Quien no supera dice "me paso", y si un pie no supera dice "son buenas", lo que cierra el envido. El cuarto jugador no está obligado a cantar si ya está resuelto. "De haber un empate entre 2 jugadores de distintos equipos, el jugador mano será quien gane." — [Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino)
- Juegos Bonaerenses: "Cuando el envido es querido el que sea mano es el que comenzará a cantar los puntos". "En caso de empate [...] ganará la mano." Si el ganador del envido se va a baraja sin mostrar las cartas, pierde los tantos. — [Juegos Bonaerenses 2026](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf)
- Disputa en foro sobre un ejemplo (asientos A-B-C-D, equipo A-C mano, B y C con 33): unos dicen que gana C "porque el equipo A-C es mano" y otros que gana B "porque B es mano de C". La mayoría dice B: "El tema de ser mano o no es individual, no por equipos." — [UTNianos](https://www.utnianos.com.ar/foro/tema-truco-argentino-duda-existencial?page=2)
- Online, truco.ar: "El equipo mano declara primero". Si gana o empata, el otro dice "son buenas". El ganador muestra las cartas del tanto al terminar la mano. — [truco.ar](https://truco.ar/reglas)

### Inferences (algoritmo recomendado)
- El servidor conoce todas las manos, así que puede calcular el resultado sin pedir declaraciones: `best(team) = max(tanto(p))`. Gana el tanto mayor, y en empate gana el jugador con menor índice en el orden `mano, mano+1, …, dador`. Para la experiencia de usuario, conviene simular la declaración tradicional: recorrer en orden desde la mano; quien pertenece al equipo que va perdiendo y supera al mejor actual "canta" su número; los demás del equipo perdedor dicen "son buenas"; los del equipo que va ganando se saltean. El recorrido termina cuando el último jugador del equipo perdedor pasa.
- Revelación: mostrar automáticamente solo las cartas del tanto ganador, al final de la mano o en el momento, según la opción elegida. Online no tiene sentido declarar en falso, porque el servidor valida.

### Gaps
- No hay fuente que diga si el tanto declarado por un jugador que no gana debe revelarse. Online no hace falta.

## 4. 3v3: redondo y pica-pica (también "punta y hacha", "de punta", "mano de punta", "tres puntas", "sexto")

### Takeaway
En 3v3 se alternan manos **redondas** (equipo contra equipo con las reglas de parejas) y manos de **pica-pica**: tres duelos 1v1, cada jugador contra el rival de enfrente, y los puntos de cada duelo van al total de su equipo. Cuándo se juega varía mucho según la fuente. La versión más citada es "desde que algún equipo tiene 5 hasta que alguno llega a 25 (10 buenas)". Otras: desde el inicio hasta 25; solo hasta los 15; o solo cuando hay alguien en buenas. Durante el pica-pica la falta envido vale 6 fijos y los demás jugadores no pueden intervenir (penalidad: el equipo infractor devuelve lo cobrado y el otro cobra 4). Fuera de esa banda de puntos, o con algún equipo en 25 o más, solo se juega redondo.

### Cited Findings
- Reglamento JdS: "En el primer juego parcial, llamado redondo, participan todos los jugadores, el siguiente se llama pica-pica y en el dadas las tres cartas a cada uno de los jugadores, juega individualmente contra el jugador rival que está sentado enfrente. El resto de jugadores no pueden hacerles observación alguna: el bando al que pertenezca un jugador que se inmiscuya en el pica-pica de otros pierde, y tiene que devolver los tantos que se hubieran cobrado; el equipo no infractor cobrará 4 tantos." — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Mismo texto: "Cuando un bando llega a las 10 buenas (25 tantos), deja de jugarse pica-pica y sólo se juegan redondos. En algunos lugares, se deja de jugar pica-pica en cuanto uno de los bandos entra en buenas, es decir, cuando se ha anotado 15 tantos." "Cuando se juega el pica-pica la falta envido vale 6 tantos". También se juegan así partidas de 8 jugadores. — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Inicio en 5: según la republicación del reglamento, el pica-pica empieza cuando un equipo alcanza 5 puntos. — [martesdeasadoytruco](https://martesdeasadoytruco.blogspot.com/2011/03/reglamento-de-truco.html). El glosario de Wikipedia dice que se juega "luego de las primeras 5 malas y hasta las últimas 10 buenas", y el propio artículo reconoce que eso no coincide con su sección principal. — [Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino)
- pagat: Pica-pica ("De Punta" o "Punta y Hacha") son "three games of two-player Truco played in succession". Juega primero la mano contra su rival de enfrente, después el vecino de la derecha de la mano y por último el dador contra el suyo. "The scores for these three separate deals of Truco are added to the totals of the players' teams." "When either team reaches 10 buenas (25 points) or more, only redonda is played." El partido termina al llegar a 15 buenas (30). pagat no dice nada sobre envido dentro del pica-pica. — [pagat.com](https://www.pagat.com/put/truco_ar.html)
- truco.ar (online): con un equipo entre 5 y 24 puntos se alternan manos redondas y de pica-pica. Los duelos son "1 vs 1 simultáneos" entre jugadores enfrentados y los puntos suman al marcador global. En los duelos la falta envido vale 6 fijos. Al llegar a 30 la partida termina en el acto. — [truco.ar](https://truco.ar/reglas)
- Sitio Andino da otra versión: la "punta" se habilita solo cuando ambos equipos están en buenas o uno en buenas y el otro en malas. Agrega que clubes y federaciones competitivas suelen prohibir la punta de 6 por las señas cruzadas ilegales. "Jugar de punta" es el término de Cuyo; "Pica-Pica"/"Punta y Hacha", el de Buenos Aires, La Pampa y Patagonia. — [Sitio Andino](https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727) (nota de estilo de vida, no reglamento)
- Reglamento citado en foro (procedencia no verificada): "Cuando se juega el pica pica todos los demás jugadores deben permanecer ajenos a la partida en ese momento". En la vuelta de punta "juega primero aquél que sea mano en ese momento". — [UTNianos](https://www.utnianos.com.ar/foro/tema-truco-argentino-duda-existencial?page=2)
- Desacuerdos detectados:
  - **Inicio:** desde la 2.ª mano ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)); desde que alguien tiene 5 ([martesdeasadoytruco](https://martesdeasadoytruco.blogspot.com/2011/03/reglamento-de-truco.html), [truco.ar](https://truco.ar/reglas)); solo con alguien en buenas ([Sitio Andino](https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727)).
  - **Fin:** cuando alguien llega a 25 ([JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf), [pagat](https://www.pagat.com/put/truco_ar.html), [truco.ar](https://truco.ar/reglas)) o a 15 ("en algunos lugares", JdS).
  - **Duelos:** sucesivos ([pagat](https://www.pagat.com/put/truco_ar.html)) o simultáneos ([truco.ar](https://truco.ar/reglas)).

### Inferences (cómo implementarlo y default recomendado)
- **Reparto:** un solo reparto de 18 cartas, 3 por jugador como siempre. Cada duelo es un truco 1v1 completo con su propio envido (falta envido = 6 fijos), truco/retruco/vale cuatro e irse al mazo. Los puntos de cada duelo se suman al equipo del ganador.
- **Duelos y mano de cada duelo:** con asientos `0..5` y mano `m`, los duelos son `(m, m+3)`, `(m+1, m+4)` y `(m+2, m+5=dador)`. Mano de cada duelo: el jugador del par que está antes en el orden desde la mano (`m`, `m+1`, `m+2`). Es coherente con "juega primero aquél que sea mano en ese momento". pagat menciona al dador en el tercer duelo sin aclarar quién sale. Esto es inferencia.
- **Secuencial vs simultáneo:** online conviene **secuencial** en el orden de pagat. Así los otros cuatro miran sin intervenir, el chat de equipo queda bloqueado durante los duelos ajenos y el fin de partida es determinista. Simultáneo es más rápido, pero complica los timers y el corte en 30. Si se elige simultáneo, hay que aplicar los resultados en un orden fijo (duelo 1, 2, 3) para resolver quién llega primero a 30.
- **Fin de partida:** cortar en cuanto un equipo llega a 30, aunque falten duelos ([truco.ar](https://truco.ar/reglas): "la partida termina en el acto"). Como el pica-pica se deja de jugar con 25 o más, un duelo con un equipo en 24 puede cerrar el partido (envido + vale cuatro). La falta envido fija en 6 limita ese salto.
- **Falta envido en redondo:** la regla normal de falta del juego (la cubren otras notas). En pica-pica, 6 fijos.
- **Interferencia:** online no se puede "inmiscuir" si el servidor bloquea señas y chat de los no participantes. La penalidad de 4 tantos no hace falta implementarla.
- **Default recomendado:** opción de sala `picaPica: off | clásico`, con **default = clásico** para 3v3: alternar redondo y pica-pica (la primera mano de la partida siempre redonda) mientras **algún equipo tenga ≥ 5 y ninguno tenga ≥ 25** (rango 5–24, el que usan truco.ar y la republicación del reglamento JdS y que coincide en su extremo superior con pagat). Fuera de ese rango, siempre redondo. Si se vuelve al rango después de una mano de pica-pica, la siguiente es redonda (alternancia estricta). Ofrecer "sin pica-pica" para quien quiera 3v3 puro. La variante "corte en 15" puede ser un tercer valor de la opción si se pide.
- **Alternancia:** guardar un flag `lastHandWasPicaPica` en el estado de la partida. La mano siguiente es pica-pica solo si el flag es falso y el marcador está en el rango.
- **Dador:** sigue rotando de a uno en cada mano, sea redonda o pica-pica (inferencia: ninguna fuente lo trata aparte).

### Gaps
- Ninguna fuente detalla quién es mano en cada duelo, si el pie sigue existiendo en pica-pica (en 1v1 no tiene sentido) ni si una mano de pica-pica "cuenta" para la alternancia cuando el rango se abre a mitad de partida. Todo eso es inferencia.
- No encontré reglas oficiales de apps (Blyts, Truco Argentino de Web2mil, ZingPlay) sobre pica-pica. La ficha de Blyts menciona el modo 3 vs 3 pero no el pica-pica. — [Truco Blyts, App Store](https://apps.apple.com/app/id732850167)

## 5. Mazo para 3v3: ¿alcanza?

### Takeaway
El truco argentino usa la baraja española de **40 cartas**: 1–7, 10, 11 y 12 en cuatro palos, sin 8, 9 ni comodines. La premisa de un mazo de 36 (1–7, 11, 12) es incorrecta, porque falta la sota (10). En 3v3 se reparten 18 cartas y quedan 22. Incluso con 36 alcanzaría. En 8 jugadores (4v4) serían 24.

### Cited Findings
- "Se utilizará un mazo de cuarenta (40) cartas españolas." El orden incluye "LOS REYES, LOS CABALLOS, LAS SOTAS". — [Juegos Bonaerenses 2026](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf)
- "Baraja: Española. Nº de naipes: 40 cartas. Jugadores: 2, 3, 4, 6 u 8". — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- La baraja es de 40 naipes, sin 8, 9 ni comodines. — [Sitio Andino](https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727)

### Inferences
- 6 × 3 = 18 de 40 (45 %). No hay problema de suficiencia. El mazo de 40 es obligatorio para que la jerarquía (las sotas entre los caballos y los 7 falsos) y el envido (figuras = 0) sean correctos.

### Gaps
- Ninguno.

## 6. Casos límite de equipo: abandono o desconexión, compañero faltante, irse al mazo individual vs. de equipo, mostrar cartas, comunicación y señas

### Takeaway
Tradicionalmente un jugador puede **irse al mazo individualmente** y su compañero sigue defendiendo solo. La mano se pierde por mazo cuando se va todo el equipo. Las **señas están permitidas** como parte del juego, pero los rivales también pueden verlas. Lo que no se permite es hablar del juego con palabras reservadas: preguntar "¿tenés envido?" ya cuenta como canto. No hay reglas tradicionales para desconexiones. Los torneos presenciales usan tolerancia y después partido perdido, o reemplazo avisado.

### Cited Findings
- Mazo individual: "Si en un bando un jugador se va a baraja y el otro no, éste queda solo en el juego defendiendo con sus cartas la suerte del equipo. Si los dos jugadores de un bando se van a baraja y no se ha gritado o cantado truco, el otro bando cobra 1 tanto." — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- pagat: en 4 jugadores, abandonar ocurre solo si ambos miembros ponen las cartas boca abajo. En 6, "all three players of the team must put their cards face down". — [pagat.com](https://www.pagat.com/put/truco_ar.html)
- Juegos Bonaerenses: "Podrán irse a baraja los que quieran siguiendo el curso del tiro mientras queden con cartas los contrarios". Si antes de jugar carta un bando se va "a baraja" sin decir palabra, el bando contrario cobra 2 tantos. Si el ganador del envido se va a baraja sin mostrar, pierde esos tantos. — [Juegos Bonaerenses 2026](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf)
- Online, truco.ar: el rival suma 1 punto sin cantos, o 2 si todavía no se jugó la primera carta (el envido no cantado). Si hubo truco aceptado, suma su valor. — [truco.ar](https://truco.ar/reglas)
- Señas permitidas: "Es posible señalar a los compañeros las cartas que se tienen. Tales señas pueden variar de un lugar a otro y está permitido que los jugadores elaboren su propio código [...] las señas para informar a los compañeros también pueden observarlas los contrarios." Al recibir las cartas, cada jugador "lo comunicará por señas a su compañero o compañeros, al tiempo que observa las de los otros jugadores". — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Señas clásicas (lista del Reglamento JdS, prácticamente igual en pagat, Wikipedia y Sitio Andino):
  - as (ancho) de espadas: levantar las cejas
  - as de bastos: guiñar un ojo (el derecho, según Sitio Andino)
  - 7 de espadas: labios o comisura a la derecha
  - 7 de oros: labios a la izquierda
  - cualquier 3: morder el labio inferior
  - cualquier 2: labios como para besar
  - as de oros o de copas ("anchos falsos"): abrir un poco la boca
  - malas cartas: cerrar los ojos
  - buen envido: inclinar la cabeza (JdS) o fruncir la nariz (Sitio Andino)
  - Wikipedia agrega "sonarse los dedos" para los 4.
  - Fuentes: [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [pagat.com](https://www.pagat.com/put/truco_ar.html); [Sitio Andino](https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727); [Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino)
- pagat: el pie suele recibir las señas y decidir. Los compañeros pueden hacer señas falsas. En 6, los demás le pasan señas al pie, que indica a sus compañeros qué jugar. — [pagat.com](https://www.pagat.com/put/truco_ar.html)
- Hablar: "No se podrá repetir por ejemplo en la primera mano ¿tenés envido? a un compañero. Esto es considerado canto." Pasada la primera mano, cualquiera puede hablar del envido sin falta. Las palabras reservadas (quiero, no quiero, truco, etc.) obligan. — [Juegos Bonaerenses 2026](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf); [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Online, truco.ar no usa señas: "las cartas y el envido de tu compañero están a la vista" en 2v2 y en las manos redondas de 3v3. En pica-pica no se ven. — [truco.ar](https://truco.ar/reglas). Blyts, en cambio, ofrece señas: "Mandale las señas a tu compañero". — [Truco Blyts, App Store](https://apps.apple.com/app/id732850167)
- Ausencia o abandono (torneo presencial, sin flor): tolerancia de 20 minutos por llegada tarde; "pasado ese tiempo, y sin mediar una justa causa, se le dará por perdido el partido". Se puede designar un reemplazante avisando con 30 minutos de anticipación. — [Reglamento 8.º Torneo de Truco, Consejo Profesional de Cs. Económicas CABA](https://archivo.consejo.org.ar/deportes/files/8TORNEO_Reg.pdf)
- Jugar con un compañero de menos: los reglamentos no lo contemplan. El único formato asimétrico es el de 3 jugadores ("gallo" o "pata de gallo"): uno solo contra dos, recibe 4 cartas y descarta una. — [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino)

### Inferences (defaults recomendados para online)
- **Irse al mazo:** implementar el mazo **individual**. El jugador entrega sus cartas y queda fuera de la mano, y el equipo sigue con los que quedan. Cuando el último miembro activo de un equipo se va, el equipo pierde la mano y el rival cobra el valor vigente: 1 sin truco querido, el valor del truco querido si lo hubo, y la regla de 2 si se van antes de cantar o jugar en la baza 1 sin que se haya cantado envido, según las otras notas de puntaje. Agregar un atajo "nos vamos" que pueda usar cualquier miembro y que obligue al equipo, para no hacer esperar. En pica-pica, el mazo solo afecta al duelo propio.
- **Mostrar cartas al compañero:** en la mesa no existe como acción permitida; solo se usan señas, que pueden ser falsas y que el rival puede ver. Online hay tres opciones: (a) cartas del compañero visibles, como truco.ar; es simple, pero cambia el juego, porque quita el engaño y la lectura de señas; (b) **botones de señas** con la lista clásica, visibles solo para los compañeros, como Blyts; (c) nada. **Recomendación:** (b), con la posibilidad de hacer señas falsas. Durante el pica-pica, bloquear las señas y el chat de equipo hacia y desde los jugadores en duelo.
- Comunicación externa (voz por Discord): no se puede impedir. Por eso conviene que el canal oficial de señas sea completo, así el juego queda parejo entre quienes usan voz y quienes no.
- **Desconexión o abandono:** no hay tradición que aplicar, así que es decisión de diseño. Recomendación: timer de turno, y al vencer, si hay un canto pendiente, se toma como "no quiero" (Juegos Bonaerenses: sin respuesta es no querido). Si es turno de jugar carta, depende de la política del proyecto. El commit reciente "Turnos sin jugadas automáticas" sugiere que ChainTable evita jugadas automáticas; en ese caso, al vencer el timer el jugador se considera "ido al mazo" individualmente y su equipo sigue. Hay que dar una ventana de reconexión de N minutos (análoga a la tolerancia de 20 minutos del torneo). Si no vuelve, el equipo pierde la partida por abandono. **No** permitir jugar 2v1 o 3v2 toda la partida por diseño. Un reemplazo solo antes de empezar o entre partidas.
- En partidas con apuesta o premio, el abandono debería resolverse como derrota del equipo del que abandona, para evitar abusos (salirse cuando se va perdiendo).

### Gaps
- No encontré reglas de apps online sobre desconexión o abandono por equipos, ni normas tradicionales sobre jugar con un compañero de menos.
- Nadie lista una "prohibición de mostrar cartas al compañero" como regla expresa. Se deduce de que el único medio legítimo que describen las fuentes son las señas y de que hablar del envido en la primera baza cuenta como canto.
