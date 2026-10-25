# Arbitrar el truco sin flor desde el servidor

El truco argentino sin flor, con mazo de 36 cartas y partidas a 15 o 30, se puede especificar completo como una máquina de estados determinista. Tiene 13 escalones de fuerza, un envido que vale de 0 a 7 o de 20 a 33, tres bazas con una sola regla de pardas ("gana el que ganó la primera baza decidida; si todo es pardo, gana el mano"), una cadena de envido acotada a E‑E‑R‑F con tabla fija de puntos, truco 2/3/4 querido y 1/2/3 no querido, e irse al mazo con un precio que se calcula. Las fuentes (Pagat, el reglamento de juegosdesalon.com, el reglamento de los Juegos Bonaerenses 2026, Wikipedia y diarios argentinos) coinciden en todo lo que decide quién gana una baza o una mano. Discrepan en cuatro puntos que ChainTable tiene que fijar por configuración y mostrar antes de que alguien se siente: cuánto vale la falta envido, cuánto cuesta irse al mazo, cuántas veces se puede reenvidar y cuándo se juega pica‑pica en 3v3. Ninguna app publica cómo maneja timers, desconexiones o colusión, así que esa capa es diseño propio. La recomendación: el servidor es dueño del reloj, no responder equivale a "no quiero", abandonar pierde la partida y el pozo, y el envido lo calcula el servidor. Sacar los 10 no rompe ninguna regla (solo desaparece el escalón de las sotas), pero es una variante de casa y la UI tiene que avisarlo. Hay dos riesgos fuera del reglamento. El contrato actual no sabe repartir el pozo en partes iguales entre los miembros de un equipo. Y las mesas pagas tienen un riesgo legal serio en Argentina, porque las leyes relevadas alcanzan también a los juegos de destreza con premio. El apéndice trae el paquete de prompts para ilustrar las 36 cartas con el estilo del UNO de ChainTable.

> Convención de este documento: **[D]** = convención documentada con fuente; **[I]** = inferencia o decisión de diseño (sin fuente que la respalde directamente); **[U]** = decisión ya tomada por el usuario.

## Trece escalones de fuerza y un envido que nunca vale entre 8 y 19

Todas las fuentes dan el mismo orden de fuerza para las bazas. Arriba van cuatro cartas únicas, las "bravas": **ancho de espada, ancho de basto, 7 de espada y 7 de oro**. Les siguen los treses, los doses, los "anchos falsos" (1 de oro y 1 de copa), los reyes, los caballos, las sotas, los "sietes falsos" (7 de copa y 7 de basto) y, al fondo, seises, cincos y cuatros. **Debajo de las cuatro bravas solo cuenta el número, no el palo**: dos cartas del mismo escalón empatan ([Pagat](https://www.pagat.com/put/truco_ar.html); [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [Wikipedia EN](https://en.wikipedia.org/wiki/Truco)). Con el mazo de 36 desaparece el escalón de las sotas y quedan 13. Como las cuatro bravas son cartas únicas, solo pueden empatar cartas de fuerza 9 o menos. La propuesta de 2023 de convertir el 5 de copas en carta máxima ("truco Messi") quedó, según la ASART, como variante opcional, así que el motor la ignora ([Noticias NQN](https://www.noticiasnqn.com.ar/noticias/2023/01/17/271571-truco-proponen-cambiar-al-ancho-de-espada-como-la-carta-ms-alta)).

| Fuerza | Cartas (mazo de 36) | Cant. | Nombre de mesa |
|---|---|---|---|
| 13 | 1 de espada | 1 | ancho de espada |
| 12 | 1 de basto | 1 | ancho de basto |
| 11 | 7 de espada | 1 | siete bravo |
| 10 | 7 de oro | 1 | siete bravo |
| 9 | 3 (los cuatro palos) | 4 | treses |
| 8 | 2 (los cuatro palos) | 4 | doses |
| 7 | 1 de oro, 1 de copa | 2 | anchos falsos |
| 6 | 12 (los cuatro palos) | 4 | reyes |
| 5 | 11 (los cuatro palos) | 4 | caballos |
| 4 | 7 de copa, 7 de basto | 2 | sietes falsos |
| 3 | 6 | 4 | |
| 2 | 5 | 4 | |
| 1 | 4 | 4 | |
| | **Total** | **36** | |

El envido sale de una regla sin excepciones. **Las cartas del 1 al 7 valen su número y las figuras valen 0. Dos cartas del mismo palo suman su valor más 20. Si no hay dos del mismo palo, vale la carta más alta.** El máximo es **33** (7 y 6 del mismo palo) y el mínimo 0 ([Pagat](https://www.pagat.com/put/truco_ar.html); [La Capital](https://www.lacapital.com.ar/informacion-general/como-jugar-al-truco-las-reglas-del-juego-cartas-mas-popular-la-argentina-n2626548.html/amp)). Como no hay flor, tres cartas del mismo palo se tratan como envido normal: se toman las dos mejores más 20 (el ejemplo de Pagat: "6‑3‑2 of a suit gives 29"). Dos figuras del mismo palo valen 20, no 0 ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)). Los valores posibles son {0…7} ∪ {20…33}: **nunca aparece un envido entre 8 y 19**. Eso sirve como invariante de test.

```ts
const valorEnv = (c: Card) => (c.num <= 7 ? c.num : 0);
function tanto(mano: Card[]): number {           // [D] Pagat; cubre 3 del mismo palo sin caso especial
  let best = Math.max(...mano.map(valorEnv));
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++)
    if (mano[i].palo === mano[j].palo) best = Math.max(best, 20 + valorEnv(mano[i]) + valorEnv(mano[j]));
  return best;
}
```

El mazo estándar del truco es el de **40 cartas** ([Reglamento Juegos Bonaerenses 2026](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf); [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)). El mazo de 36 que eligió el usuario [U] es una variante de casa con un solo precedente escrito: Wikipedia ES dice, sin fuente, que "para jugar de a dos o cuatro, se pueden retirar los dieces" ([Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino)). Igual no rompe nada. En la jerarquía solo desaparece un escalón. En el envido las figuras ya valían 0, así que el conjunto de valores no cambia. Ninguna regla del truco argentino depende del 10, que solo tiene un papel propio en el truco uruguayo ([Wikipedia EN](https://en.wikipedia.org/wiki/Truco)). Y alcanza de sobra: 6 jugadores × 3 cartas = 18 de 36. Lo único que se mueve es la distribución. Enumerando las 7140 manos posibles (un cálculo hecho para esta investigación, no tomado de una fuente), la probabilidad de un envido de 28 a 33 sube del 17,25 % al 21,17 %, y el 20 cae del 3,68 % al 1,51 %, porque ahora solo sale con 11+12 del mismo palo. La probabilidad de tener algún par del mismo palo casi no cambia (59,5 % contra 59,2 %). La recomendación [I] es mostrar "Mazo de 36 (sin 10)" en el lobby y en la ayuda.

## El mano sale primero y gana todos los empates

El truco se juega **en sentido antihorario**. Quien da mezcla, el rival de su izquierda corta y el dador reparte tres cartas de a una, empezando por su derecha. **El mano es el jugador a la derecha del dador**: recibe primero, sale en la primera baza y gana los empates. El reparto rota hacia la derecha, así que quien fue mano reparte la mano siguiente ([Pagat](https://www.pagat.com/put/truco_ar.html); [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [Wikipedia EN](https://en.wikipedia.org/wiki/Truco)). Los compañeros se sientan alternados: enfrentados en 2v2 y A‑B‑A‑B‑A‑B en 3v3, así cada jugador tiene enfrente a un rival ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [Juegos Bonaerenses](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf)). El "pie" es el último jugador de cada equipo en orden de juego: el dador y el jugador a su izquierda. Tradicionalmente hace de capitán, pero no tiene ningún derecho exclusivo ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [truco.ar](https://truco.ar/reglas)). Wikipedia ES lo equipara al dador, y en 1v1 las dos definiciones coinciden. El primer dador se sortea ([Juegos Bonaerenses](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf)). Online, el corte y la carta que cae boca arriba no tienen sentido: alcanza con un shuffle criptográfico en el servidor [I].

El modelo de asientos [I] numera `0..N-1` en el orden de juego, con `equipo = asiento % 2`. Para la mano `k`: `dador = (dador0 + k) % N`, `mano = (dador + 1) % N`, el orden de la primera baza es `mano, mano+1, …, dador`, y los pies son `dador` y `dador - 1`. En 3v3, el rival de enfrente del asiento `i` es `(i + 3) % 6`, que por paridad siempre es del otro equipo.

### Las pardas se resuelven con una sola regla

Gana la mano el equipo que gana dos bazas. El ganador de una baza sale en la siguiente, y no hace falta seguir palo. Para las pardas, cinco fuentes coinciden en el mismo criterio ([Pagat](https://www.pagat.com/put/truco_ar.html); [Wikipedia EN](https://en.wikipedia.org/wiki/Truco); [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [La Capital](https://www.lacapital.com.ar/informacion-general/como-jugar-al-truco-las-reglas-del-juego-cartas-mas-popular-la-argentina-n2626548.html/amp); [truco.ar](https://truco.ar/reglas)). **Con una parda gana quien ganó la primera baza decidida, con dos pardas gana quien ganó la restante y con tres pardas gana el equipo del mano.** Si las dos primeras bazas definen la mano, la tercera no se juega. Después de una parda vuelve a salir quien salió en esa baza. En las únicas secuencias en que se sigue jugando después de una parda, (P) y (P,P), ese jugador es siempre el mano original, así que "vuelve a salir el mano" (JdS) y "sale el que salió la anterior" (Pagat) dan lo mismo.

| 1.ª | 2.ª | 3.ª | Ganador | ¿Se juega la 3.ª? | Regla |
|---|---|---|---|---|---|
| A | A | — | A | No | dos bazas |
| A | P | — | A | No | parda en 2.ª: gana el que ganó la 1.ª |
| P | A | — | A | No | parda en 1.ª: decide la 2.ª |
| A | B | A | A | Sí | dos bazas |
| A | B | B | B | Sí | dos bazas |
| A | B | P | A | Sí | parda en 3.ª: gana el que ganó la 1.ª |
| P | P | A | A | Sí | dos pardas: decide la restante |
| P | P | P | equipo del mano | Sí | tres pardas |

Estas 8 filas y sus simétricas (A↔B) cubren todas las secuencias posibles. **En juego por equipos, una baza es parda solo si la carta más alta la comparten jugadores de equipos distintos.** Si la comparten solo compañeros, la gana ese equipo, y sale en la baza siguiente el que tiró esa carta primero ([Pagat](https://www.pagat.com/put/truco_ar.html); [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)). Ninguna fuente trata el caso de tres cartas máximas repartidas entre los dos equipos con mayoría de uno (por ejemplo, en 3v3, dos treses de A y uno de B). Leyendo la regla al pie de la letra ("if opposing teams hold the highest cards"), eso es parda [I].

```ts
type Res = 0 | 1 | 'P';
function resolverBaza(jugadas: { seat: number; card: Card }[]): { res: Res; lider?: number } {
  const max = Math.max(...jugadas.map(j => fuerza(j.card)));
  const top = jugadas.filter(j => fuerza(j.card) === max);           // en orden de juego
  const equipos = new Set(top.map(j => j.seat % 2));
  return equipos.size === 1 ? { res: (top[0].seat % 2) as Res, lider: top[0].seat } : { res: 'P' };
}
function ganadorMano(r: Res[], equipoMano: 0 | 1): 0 | 1 | null {  // null = se sigue jugando
  const a = r.filter(x => x === 0).length, b = r.filter(x => x === 1).length;
  if (a === 2) return 0;
  if (b === 2) return 1;
  if (r.length === 2 && a + b === 1) return a ? 0 : 1;              // (X,P) o (P,X)
  if (r.length < 3) return null;                                     // 1 baza, (A,B), (B,A) o (P,P)
  if (a !== b) return a > b ? 0 : 1;                                 // (P,P,X)
  const primera = r.find(x => x !== 'P');                            // (A,B,P)
  return primera !== undefined ? (primera as 0 | 1) : equipoMano;    // (P,P,P)
}
// después de una baza: lider = res === 'P' ? liderActual : lider de resolverBaza
```

Cuando la mano termina antes de tiempo, **no se muestran las cartas no jugadas**. La única obligación de mostrar es la del ganador del envido, que enseña las cartas que lo justifican. Las cartas de quien se va al mazo van boca abajo ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino)). Ningún reglamento dice textualmente "no se muestran", pero se deduce de lo anterior [I]. Además, revelarlas filtraría información (estilo de juego, mentiras en el envido) que en una mesa real nadie ve.

## Cada canto tiene un precio fijo: envido, truco y mazo

### La ventana del envido se cierra con la propia carta

El envido existe solo en la primera baza. **Cada jugador puede iniciarlo hasta jugar su primera carta, y puede responderlo aunque ya la haya jugado.** Una vez querido el truco, no hay más envido ([Juegos Bonaerenses §7.2](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf); [Pagat](https://www.pagat.com/put/truco_ar.html); [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)). Pagat agrega que tampoco puede iniciarlo quien ya cantó o aceptó un truco. **"El envido está primero"**: si un equipo canta truco en la primera baza y el envido todavía no se cantó, el rival puede contestar con envido. Se resuelve el envido completo y después se contesta el truco que quedó en suspenso ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [truco.ar](https://truco.ar/reglas)). Las fuentes no aclaran si puede invocarlo un jugador que ya tiró su carta. Wikipedia da dos condiciones distintas, mientras que Juegos Bonaerenses y Pagat atan la ventana a la carta propia. El default es que **no** [I], para que la regla sea la misma en los dos casos. El mismo reglamento JdS se contradice: en un lugar la ventana es colectiva ("no hay envido si todos descartaron callados") y en otro es por jugador. Se adopta la ventana por jugador, que es la más precisa. Con ella, en la práctica, la última oportunidad de cantar envido la tiene el pie del equipo que no es mano.

### La cadena E‑E‑R‑F y su tabla de puntos

La regla de puntos tiene consenso. **Querido** vale la suma de lo cantado (envido 2, real envido 3, falta variable). **No querido** vale 1 si hubo un solo canto, o la suma de todo lo cantado antes del último canto, porque cada reenvite acepta implícitamente el anterior ([Juegos Bonaerenses §7.9, §10](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf); [Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino); [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)). Lo que no tiene consenso es la gramática. Pagat permite cualquier cantidad de envidos seguidos de cualquier cantidad de reales envidos. JdS deja contestar un real envido con un envido. Sitio Andino lista el triple envido. Las tablas de Wikipedia y de Juegos Bonaerenses, en cambio, usan la cadena clásica. **Default: `E{0,2} R? F?`** (como mucho dos envidos, un real envido y una falta al final), siempre creciente y con cada canto hecho por el equipo contrario al del canto anterior [D + I]. Tiene tres efectos: limita el valor sin falta a 7, cubre las tablas oficiales y deja la máquina de estados chica. La falta solo admite quiero o no quiero. Si un mismo jugador dice "envido envido", vale un solo envido ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)). Online ese caso no existe, porque cada botón es un canto. La Capital publica valores no queridos más altos (E‑E = 3, E‑R = 3, E‑E‑R = 5), pero eso contradice a todas las demás fuentes y se descarta ([La Capital](https://www.lacapital.com.ar/informacion-general/como-jugar-al-truco-las-reglas-del-juego-cartas-mas-popular-la-argentina-n2626548.html)).

| Cadena | Querido | No querido |
|---|---|---|
| E | 2 | 1 |
| R | 3 | 1 |
| F | falta | 1 |
| E‑E | 4 | 2 |
| E‑R | 5 | 2 |
| E‑F | falta | 2 |
| R‑F | falta | 3 |
| E‑E‑R | 7 | 4 |
| E‑E‑F | falta | 4 |
| E‑R‑F | falta | 5 |
| E‑E‑R‑F | falta | 7 |

```ts
const VAL = { E: 2, R: 3 } as const;
const GRAMATICA = /^E{0,2}R?F?$/;                      // y no vacía
function puntosEnvido(chain: ('E'|'R'|'F')[], falta: number) {
  const suma = (xs: typeof chain) => xs.reduce((s, c) => s + (c === 'F' ? 0 : VAL[c]), 0);
  const Q = chain.includes('F') ? falta : suma(chain);  // la falta reemplaza la suma
  const NQ = chain.length === 1 ? 1 : suma(chain.slice(0, -1));
  return { Q, NQ };
}
```

### La falta envido tiene cinco convenciones: conviene fijar una por meta

La falta es el punto más disputado. La convención más citada en Argentina es **"en malas es partido"**: si el que va adelante (el puntero) todavía está en malas, la falta querida gana la partida. Si el puntero ya está en buenas, vale lo que le falta al puntero para llegar a 30, y se suma al ganador del envido ([Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino); [Juegos Bonaerenses §9.2](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf); [La Capital](https://www.lacapital.com.ar/informacion-general/como-jugar-al-truco-las-reglas-del-juego-cartas-mas-popular-la-argentina-n2626548.html)). Las alternativas documentadas son cuatro. La "simple" vale lo que le falta al puntero para ganar, sin malas ([Pagat](https://www.pagat.com/put/truco_ar.html); cuerpo del [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)). Otra vale lo que le falta al puntero para entrar en buenas (glosario de JdS; "variante del Litoral" en Wikipedia). La mendocina "a lo grande" le da al ganador lo que le falta a él mismo para llegar a 30 ([Sitio Andino](https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727)). Y en la última la falta siempre vale la partida (JdS). Una de las notas de investigación prefería la simple para todo, por determinista. Este informe adopta **"en malas es partido" a 30**, porque es la convención reglamentaria argentina (Juegos Bonaerenses) y la que espera un jugador local. A 15, donde ninguna fuente define buenas ni malas, se adopta la **simple** [I]. El costo de "en malas es partido" en una mesa paga es la varianza: una sola falta querida al principio decide todo el pozo. Por eso conviene ofrecer `SIMPLE` también a 30 como opción del host y mostrar el valor en el botón ("Falta envido (12)").

```ts
function falta(m: Match, ganador: 0 | 1): number {      // se calcula al resolver el envido
  if (m.faltaFija) return m.faltaFija;                  // 6 en pica-pica [D]
  const L = Math.max(...m.scores);
  if (m.target === 30 && m.faltaMode === 'MALAS_ES_PARTIDO' && L < 15)
    return m.target - m.scores[ganador];                // gana la partida
  return Math.max(1, m.target - L);                     // lo que le falta al puntero
}
```

Dos ejemplos a 30. Con 10 a 8, los dos equipos están en malas y la falta querida termina la partida, la gane quien la gane. Con 18 a 8, la falta vale 12: si gana el puntero llega a 30, y si gana el colista pasa a 20. A 15, con 9 a 4, la falta vale 6: el puntero llegaría a 15 y el colista a 10. La falta no querida nunca depende del marcador. La Capital agrega que la falta "no se puede cantar en la primera ronda", pero ninguna otra fuente lo dice y se ignora.

### El recuento lo hace el servidor, en el orden de la mesa

Después del "quiero", el mano declara primero y se sigue en orden antihorario. Quien no supera la mejor cifra del rival dice "son buenas", y quien tiene un compañero ganando no necesita declarar. Un empate lo gana el jugador más cercano al mano: "the dealer loses all ties" ([Pagat](https://www.pagat.com/put/truco_ar.html); [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [Juegos Bonaerenses §7.4–7.6](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf)). En un foro se discutió si el empate es "por equipo mano" o "por jugador", y la mayoría respondió que "el tema de ser mano o no es individual" ([UTNianos](https://www.utnianos.com.ar/foro/tema-truco-argentino-duda-existencial?page=2)). En la mesa física, el ganador muestra sus cartas, y si cantó mal los puntos van al rival ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)). Online ese castigo pierde sentido: el servidor conoce todas las manos. La recomendación [I], en línea con Multitorneo, que automatiza la declaración ([App Store](https://apps.apple.com/us/app/-/id1384494458)), es que el servidor calcule y anuncie. Se recorre la mesa desde el mano: el jugador del equipo que va perdiendo que supera la mejor cifra "canta" su número, el que no la supera dice "son buenas" y los del equipo que va ganando se saltean. No se puede mentir. La cifra declarada es pública, como en la mesa. Las cartas que componen el tanto ganador se muestran **al final de la mano** (o al terminar la partida, si el envido la terminó), así no se regala información para las bazas que faltan.

### Truco, retruco y vale cuatro: sube solo quien tiene el quiero

El truco vale **2 querido y 1 no querido**, el retruco **3 y 2**, el vale cuatro **4 y 3**, y una mano sin truco cantado vale 1 ([Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino); [Juegos Bonaerenses §11–14](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf); [Pagat](https://www.pagat.com/put/truco_ar.html)). **Solo puede subir el equipo que aceptó la última apuesta**, y subir sin haber dicho "quiero" es ilícito ("Quiero retruco", no "Retruco"). Se puede subir en el acto o más adelante ([Juegos Bonaerenses §13.1–13.2](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf); [Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)). Si no hay respuesta, el canto se considera no querido ([Juegos Bonaerenses §6.6](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf)). Pagat permite tirar una carta y contestar después, y en la mesa se canta fuera de turno. Online conviene restringir [I] por dos razones: evitar condiciones de carrera y tener una UI que solo muestre acciones legales. **Se canta solo en el turno propio, antes de tirar la carta. Con un canto pendiente no se juegan cartas. "Quiero retruco" y "Quiero vale cuatro" son un solo botón atómico.** Una fórmula resume todo el puntaje del truco: con `nivel` aceptado `n ∈ {0,1,2,3}`, el valor de la mano es `V(n) = n === 0 ? 1 : n + 1`, y un "no quiero" a la subida pendiente le da al que cantó exactamente `V(n)`.

### Irse al mazo cuesta V(nivel) más el envido que se niega

Irse al mazo equivale a no querer todo lo pendiente. Sin truco cantado, el rival cobra 1 ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)). Con truco querido, cobra el valor vigente. Existe además una convención extendida que evita que irse de entrada sea gratis cuando el rival tiene buen envido: **irse al mazo antes de que se juegue el envido cuesta 2**, mientras no haya ninguna carta en la mesa (Juegos Bonaerenses §6.1: irse "antes de jugar ninguna carta" da 2 tantos al rival; [truco.ar](https://truco.ar/reglas): 2 "si todavía no se jugó la primera carta"). El default [I] lo vuelve una sola fórmula:

```ts
function puntosMazo(h: Hand): number {                  // los cobra el equipo rival
  const extra = h.envido.state === 'PENDING' ? puntosEnvido(h.envido.chain, 0).NQ
              : (h.played[0].length === 0 && h.envido.state === 'NONE' && h.truco.level === 0) ? 1 : 0;
  return V(h.truco.level) + extra;
}
```

El envido querido y ya resuelto se conserva. Al cerrar, el servidor verifica las cartas del envido, así que no aplica la pérdida por "irse sin mostrar" de Juegos Bonaerenses §7.7. Hay una asimetría intencional: un "no quiero" al truco en la primera baza no suma el punto extra, porque el equipo podía contestar con envido y eligió no hacerlo. Las fuentes tampoco lo agregan.

### El envido se anota primero y puede cortar la partida

Se juega a 15 o a 30 según se acuerde [U]. **El envido se anota antes que el truco: si con él un equipo llega a la meta, gana y el truco de esa mano no cuenta** ([Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino); [Pagat](https://www.pagat.com/put/truco_ar.html)). Online [I], los puntos del envido se acreditan cuando se resuelve, sea querido o no querido. Si alcanzan la meta, la partida termina en ese momento. El resultado es el mismo que anotar al final de la mano con prioridad del envido, y se evita jugar bazas que ya no valen nada. Un envido no querido también puede cerrar una partida (29 + 1). El marcador se recorta a la meta: nunca "33 de 30". A 30 hay **malas de 0 a 14 y buenas de 15 en adelante** (JdS: "10 buenas = 25 tantos"), y se muestra como "8 malas" o "3 buenas" ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [Juegos Evita 2023](https://www.argentina.gob.ar/sites/default/files/2023/04/truco.pdf)). A 15 ninguna fuente define buenas ni malas: se juega sin ellas [I]. El formato clásico es "dos chicos de 30" ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)), pero el mercado online ofrece una sola partida a 15 o a 30 ([TrucoBits](https://trucobits.com/blog/como-jugar-al-truco-online-con-amigos)). Default: **una sola partida** [I].

## Una máquina de estados de cuatro fases cubre la mano entera

La mano tiene cuatro fases: `PLAYING` (alguien tiene el turno de tirar o cantar), `ENVIDO_PENDING`, `TRUCO_PENDING` y `HAND_OVER`. El "envido está primero" se modela con un solo flag, `trucoSuspended`: el envido se anida dentro de un truco pendiente y, cuando se cierra, la mano vuelve a `TRUCO_PENDING`. La especificación sale de las reglas citadas arriba. Las guardas que restringen al turno propio son decisiones [I].

```ts
type Team = 0 | 1;
interface Match {
  mode: '1v1' | '2v2' | '3v3'; target: 15 | 30; scores: [number, number];
  dealer: number; faltaMode: 'MALAS_ES_PARTIDO' | 'SIMPLE'; picaPica: boolean;
  lastHandWasPicaPica: boolean; rulesetId: string; faltaFija?: number;
}
interface Hand {
  order: number[];             // asientos en orden de juego desde el mano (redonda: N; duelo: 2)
  mano: number; baza: 1 | 2 | 3; leader: number; turn: number;
  played: Map<number, Card>[]; // por baza
  results: Res[];
  phase: 'PLAYING' | 'ENVIDO_PENDING' | 'TRUCO_PENDING' | 'HAND_OVER';
  envido: { state: 'NONE' | 'PENDING' | 'DONE'; chain: ('E'|'R'|'F')[]; lastCaller: Team | null };
  truco:  { level: 0 | 1 | 2 | 3; pendingBy: Team | null; quieroOwner: Team | null };
  trucoSuspended: boolean;
}
const V = (n: number) => (n === 0 ? 1 : n + 1);
const jugo = (h: Hand, s: number) => h.played[0].has(s);   // ya tiró en la 1.ª baza
```

En la tabla, "J" es el jugador con el turno, "R" es cualquier miembro del equipo que tiene que responder y `t` es el equipo del que actúa. Después de **cada** anotación se ejecuta `checkMatchEnd()`: si un equipo llega a la meta, `MATCH_OVER` inmediato.

| Fase | Acción (quién) | Guarda | Efecto | Fase siguiente |
|---|---|---|---|---|
| PLAYING | `JUGAR(c)` (J) | c está en su mano | registra la carta y pasa el turno; si la baza se completó, `resolverBaza`; al cerrar la 1.ª baza, envido `NONE`→`DONE`; si `ganadorMano` ≠ null, el ganador suma `V(level)` | PLAYING / HAND_OVER |
| PLAYING | `ENVIDO(x)` (J) | `baza==1 ∧ ¬jugo(J) ∧ envido.state=='NONE' ∧ truco.level==0` | `chain=[x]`, `lastCaller=t` | ENVIDO_PENDING |
| PLAYING | `TRUCO` (J) | `level<3 ∧ (level==0 ∨ quieroOwner==t)` | `pendingBy=t` | TRUCO_PENDING |
| PLAYING | `MAZO` (J) | — | el rival suma `puntosMazo` | HAND_OVER |
| ENVIDO_PENDING | `QUIERO` (R) | — | recuento automático; el ganador suma `Q`; `state='DONE'` | `trucoSuspended ? TRUCO_PENDING : PLAYING` |
| ENVIDO_PENDING | `NO_QUIERO` (R) | — | `lastCaller` suma `NQ`; `state='DONE'` | ídem |
| ENVIDO_PENDING | `ENVIDO(x)` (R) | `GRAMATICA.test(chain+x)` | `chain.push(x)`, `lastCaller=t` | ENVIDO_PENDING |
| ENVIDO_PENDING | `MAZO` (R) | — | el rival suma `NQ + V(level)` | HAND_OVER |
| TRUCO_PENDING | `QUIERO` (R) | — | `level++`, `quieroOwner=t`, `pendingBy=null` | PLAYING |
| TRUCO_PENDING | `QUIERO_Y_SUBIR` (R) | `level ≤ 1` | `level++`, `quieroOwner=t`, `pendingBy=t` | TRUCO_PENDING |
| TRUCO_PENDING | `NO_QUIERO` (R) | — | `pendingBy` suma `V(level)` | HAND_OVER |
| TRUCO_PENDING | `ENVIDO(x)` (R, "está primero") | `baza==1 ∧ level==0 ∧ envido.state=='NONE' ∧ ¬jugo(actor)` | `trucoSuspended=true`, `chain=[x]`, `lastCaller=t` | ENVIDO_PENDING |
| TRUCO_PENDING | `MAZO` (R) | — | el rival suma `puntosMazo` | HAND_OVER |
| PLAYING | timeout de J | — | igual que `MAZO` de su equipo | HAND_OVER |
| *_PENDING | timeout de R | — | igual que `NO_QUIERO` | según la fila |
| HAND_OVER | (servidor) | — | revela las cartas del envido ganador; `dealer++`; decide si la próxima es redonda o pica‑pica | nueva mano |

Hay cuatro invariantes que conviene testear. Nunca hay dos cantos pendientes a la vez. `quieroOwner` siempre es el equipo que aceptó por última vez. El envido nunca se inicia con `truco.level ≥ 1`. Y una mano sin falta nunca reparte más de 11 puntos: 7 de un E‑E‑R querido más 4 del vale cuatro. El punto extra del mazo solo existe si no se cantó envido, así que nunca se suma a esos 7. Las acciones ilegales no se rechazan con error: directamente no se ofrecen. La botonera la calcula el servidor a partir del estado, y eso elimina de raíz las "palabras equívocas" que el reglamento JdS sanciona ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)). Por ejemplo, ante un truco en la primera baza, el que responde ve `[Quiero] [Quiero retruco] [No quiero] [Envido] [Real envido] [Falta envido (n)] [Mazo (−2)]`.

## En 2v2 y 3v3 canta cualquiera, pero la primera respuesta obliga al equipo

Los reglamentos escritos dicen que **cualquier jugador puede cantar o responder envido y truco, y su palabra obliga a todo el equipo** ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [Pagat](https://www.pagat.com/put/truco_ar.html)). La costumbre de que "el envido lo canta el pie" está en Wikipedia ES y se discute en foros, pero ningún reglamento la recoge ([Wikipedia ES](https://es.wikipedia.org/wiki/Truco_argentino); [UTNianos](https://www.utnianos.com.ar/foro/tema-truco-argentino-duda-existencial?page=2)). Queda fuera del default. Ninguna fuente resuelve qué pasa si un compañero dice "quiero" y otro "no quiero" al mismo tiempo. La recomendación [I] es que **valga la primera respuesta válida que llega al servidor**: cada acción lleva la versión del estado, y las que llegan con una versión vieja se rechazan. Es determinista, respeta que la respuesta "obliga a todo su equipo" y la UI muestra "tu compañero está respondiendo". El tanto de cada equipo es el mejor tanto individual de sus miembros, y un empate lo gana el jugador más cercano al mano ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [TrucoBits](https://trucobits.com/blog/reglas-truco-2v2-senas)).

Tradicionalmente, **irse al mazo es individual**: el compañero sigue solo y el equipo pierde la mano cuando se fueron todos ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [Pagat](https://www.pagat.com/put/truco_ar.html)). Las notas no coinciden en qué conviene online. Una propone mantener el mazo individual con un atajo "nos vamos", y las otras dos, un mazo de equipo. Este informe adopta **mazo de equipo** [I]: cualquier miembro, en su turno o al responder un canto, retira al equipo entero. Elimina el estado "jugador fuera de la mano", con poco valor online, y coincide con la condición de Pagat de que todo el equipo tiene que tirar las cartas para abandonar.

### Pica‑pica: activado en 3v3 a 30, duelos en secuencia y falta de 6

En 3v3 se alternan manos **redondas** (equipo contra equipo) y manos de **pica‑pica**: tres duelos 1v1, cada jugador contra el rival de enfrente, y los puntos de cada duelo van al total del equipo ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [Pagat](https://www.pagat.com/put/truco_ar.html)). Durante el pica‑pica, **la falta envido vale 6 fijos** y nadie más puede intervenir. Al equipo que se entromete, el reglamento lo castiga con devolver lo cobrado y le da 4 tantos al rival ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [truco.ar](https://truco.ar/reglas)). Las fuentes no coinciden en cuándo se juega. Para el inicio, JdS dice desde la segunda mano, truco.ar y la republicación del reglamento dicen desde que un equipo tiene 5, y Sitio Andino, solo con alguien en buenas. Para el fin, la mayoría dice cuando un equipo llega a 25 (10 buenas), y "en algunos lugares" a 15. Para los duelos, Pagat los juega en secuencia y truco.ar en simultáneo ([martesdeasadoytruco](https://martesdeasadoytruco.blogspot.com/2011/03/reglamento-de-truco.html); [Sitio Andino](https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727)). En el mercado, ConectaGames lo deja como opción ("se puede elegir si jugar pico a pico o no", [App Store](https://apps.apple.com/ar/app/truco-argentino/id490975530)) y truco.ar lo aplica siempre.

Las notas también se dividen sobre el default: una recomienda activarlo y otra desactivarlo para las mesas pagas. Este informe lo deja **activado por defecto en 3v3 a 30 (opción del host)**. Sin él, el 3v3 pierde lo que lo distingue, y su costo de implementación es bajo, porque cada duelo es una instancia de la misma máquina de estados de 1v1 con `faltaFija = 6`. La franja es 5–24, la de truco.ar y la republicación del reglamento, que en el extremo superior coincide con Pagat. La primera mano siempre es redonda y la alternancia es estricta [D + I]. **En partidas a 15, sin pica‑pica** [I]: ninguna fuente define una franja para 15, y la franja 5–24 no tiene equivalente obvio.

```ts
const esPicaPica = (m: Match) => m.mode === '3v3' && m.picaPica && m.target === 30
  && !m.lastHandWasPicaPica && Math.max(...m.scores) >= 5 && Math.max(...m.scores) < 25;
// duelos con mano m y N=6, en secuencia (orden de Pagat): (m, m+3), (m+1, m+4), (m+2, m+5 = dador)
// el mano de cada duelo es el primero del par; después de cada duelo, checkMatchEnd()
```

Los duelos van **en secuencia** [I]. Así los cuatro que no juegan miran sin intervenir y el corte en 30 es determinista: la partida termina apenas un equipo llega, aunque falten duelos ([truco.ar](https://truco.ar/reglas): "la partida termina en el acto"). Un mazo dentro de un duelo afecta solo a ese duelo, y el dador rota de a uno igual que en una mano redonda. Quién es mano en cada duelo es inferencia: Pagat nombra el orden de los duelos pero no aclara quién sale.

## Las apps no publican timers ni políticas de abandono

El mercado se reparte entre **Truco Blyts** (casi nueve millones de descargas en 2017, con 3v3 agregado en 2024 y señas al compañero) y **Truco Argentino de ConectaGames** (1v1/2v2/3v3, flor opcional, "pico a pico" opcional, metas de 10 a 40, reconexión y modo espectador) ([Aire de Santa Fe](https://www.airedesantafe.com.ar/ocio/la-app-truco-que-ya-es-viral-n27031); [App Store Blyts](https://apps.apple.com/us/app/-/id732850167); [App Store ConectaGames](https://apps.apple.com/ar/app/truco-argentino/id490975530)). Los portales web nuevos repiten el patrón: 1v1/2v2/3v3, 15 o 30 puntos, con o sin flor ([TrucoBits](https://trucobits.com/blog/como-jugar-al-truco-online-con-amigos); [truco.ar](https://truco.ar/)). El alcance que eligió el usuario coincide con ese estándar de mercado. El único dato público de timers es de Multitorneo: **30 segundos por turno**, declaración del envido automática a los 3 segundos y pérdida de los puntos de la mano si se vence el tiempo ([App Store Multitorneo](https://apps.apple.com/us/app/-/id1384494458)). ConectaGames solo menciona de pasada un "temporizador extra". Nadie publica qué pasa cuando un jugador abandona una partida por equipos. La única regla escrita es la presencial: el equipo que no se presenta pierde 30‑0 ([Juegos Evita 2023](https://www.argentina.gob.ar/sites/default/files/2023/04/truco.pdf)), y en torneo hay 20 minutos de tolerancia ([Consejo Profesional CABA](https://archivo.consejo.org.ar/deportes/files/8TORNEO_Reg.pdf)).

La política que se propone [I] sigue esos precedentes y el criterio de ChainTable de no hacer jugadas automáticas (commit `965846f`, "Turnos sin jugadas automáticas"). **El reloj vive en el servidor**, que da 30 s por acción más un banco de 60 s por jugador y por partida, y el cliente solo lo muestra. Si vence el tiempo para responder un canto, cuenta como "no quiero" (Juegos Bonaerenses §6.6). Si vence el tiempo para jugar o cantar, el equipo se va al mazo, que es el equivalente de "perder los puntos de la mano" de Multitorneo. Nunca se tira una carta automática. El envido no requiere ninguna acción, porque se calcula solo. Con 3 timeouts seguidos, el jugador pasa a "ausente". Ante una desconexión hay una ventana de reconexión de 90 s, con un tope acumulado de 180 s por partida, y mientras tanto el timer sigue corriendo con las reglas anteriores. Si la ausencia supera la ventana, **el equipo del ausente pierde la partida y el pozo**, que es el equivalente online del 30‑0 presencial. No se permite seguir jugando 2v1 o 3v2, y en mesas pagas no se reemplaza a nadie por un bot, porque un bot cambia la calidad del juego e invita al "abandono estratégico". Si la falla es del servidor, la partida se anula y se reembolsa.

**Señas.** En la mesa física las señas están permitidas, pero el rival también puede verlas ([Reglamento JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); [Juegos Evita](https://www.argentina.gob.ar/turismoydeportes/juegosevita/truco)). Las apps resolvieron eso de dos formas opuestas. Unas usan botones de seña privados del equipo: Blyts, o TrucoBits, cuyos mensajes "el rival no ve" ([TrucoBits](https://trucobits.com/blog/reglas-truco-2v2-senas)). Otras muestran las cartas del compañero, como truco.ar y, como alternativa, ConectaGames ([truco.ar](https://truco.ar/); [App Store ConectaGames](https://apps.apple.com/ar/app/truco-argentino/id490975530)). Las notas proponen defaults distintos. Para mesas pagas, este informe adopta **cartas del compañero visibles más un set cerrado de mensajes rápidos al equipo ("cantá", "quiero", "andate", "jugá alto"), sin chat libre de equipo y con todo bloqueado durante el pica‑pica** [I]. El motivo es de integridad, no de sabor. Un canal externo como Discord no se puede impedir, pero si el equipo ya tiene la información completa, ese canal no da ninguna ventaja, y así todos juegan con la misma información. La variante purista, con botones de seña privados y sin cartas visibles, puede ofrecerse en mesas gratis más adelante.

**Colusión y auditoría.** Ninguna app relevada publica una política anticolusión. TrucoReal, que juega por dinero, solo menciona "partidas auditadas" sin dar detalles ([TrucoReal](https://trucoreal.com/)). Los vectores probables [I] son tres: el *chip dumping* o *soft‑play* entre "rivales" que se conocen (muchos "no quiero" ante cantos débiles, mazos tempranos repetidos), la multicuenta en 2v2/3v3 y el abandono estratégico, que ya queda cubierto por la regla de abandono. Las mitigaciones son matchmaking aleatorio en mesas pagas públicas, un límite de repetición del mismo par de wallets, heurísticas de IP, dispositivo y origen de fondos, y análisis posterior a la partida. A eso se suman tres reglas de servidor. El servidor nunca envía cartas ajenas, salvo las del compañero. Publica el hash de la semilla del reparto antes de la mano y la semilla después (commit‑reveal), para que "partida auditada" sea verificable. Y guarda un `ruleset_id` por mesa, para que cualquier disputa se resuelva con las reglas exactas que se aceptaron al entrar.

**El contrato actual no sirve todavía para mesas de equipo.** En `contracts/ChainTable.sol`, `endLobby` solo paga en dos modos. `BEAST` le da el 95 % a exactamente un ganador, que sirve para 1v1. `CLASSIC` reparte 60/20/15 entre hasta 3 ganadores **ordenados**, así que una pareja ganadora en 2v2 cobraría 75 % y 20 % en lugar de mitad y mitad. Un trío en 3v3 cobraría 60/20/15. Además, el referee no puede anular una mesa ya empezada: el único reembolso posible es `refundExpired`, después de 1 día. Para truco por equipos hace falta un modo de **reparto en partes iguales entre los ganadores** y, si se quiere el reembolso inmediato por falla del servidor, una función de anulación del referee. Según la memoria del proyecto, el contrato pago todavía no está desplegado, así que es el momento de cambiarlo.

## Tabla consolidada de defaults

| # | Tema | Default recomendado | Origen | Alternativas configurables |
|---|---|---|---|---|
| 1 | Mazo | 36 cartas (1–7, 11, 12), declarado en la UI | [U]; precedente en Wikipedia ES | 40 cartas (estándar) |
| 2 | Flor | No existe; 3 del mismo palo = las dos mejores + 20 | [U]; cálculo [D] Pagat | — |
| 3 | Jerarquía | 13 escalones de la tabla | [D] | — |
| 4 | Sentido, mano, rotación | Antihorario; mano a la derecha del dador; el dador rota a la derecha | [D] | — |
| 5 | Primer dador | Sorteo con RNG del servidor | [D] sorteo + [I] RNG | — |
| 6 | Asientos | Alternados, `equipo = asiento % 2` | [D] | — |
| 7 | Pardas | Tabla de 8 casos; tres pardas = equipo del mano | [D] | — |
| 8 | Empate de compañeros en una baza | Gana su equipo; sale el que tiró primero | [D] | — |
| 9 | Varias cartas máximas de ambos equipos | Parda | [I] lectura literal | — |
| 10 | Cartas no jugadas | No se revelan | [I] | — |
| 11 | Inicio del envido | Cualquier jugador, en su turno de la 1.ª baza, antes de tirar su carta; sin truco querido | [D] + turno propio [I] | "Solo el pie" (Wikipedia, no recomendado) |
| 12 | "El envido está primero" | Solo si el que responde no tiró su carta | [D] + [I] | — |
| 13 | Gramática del envido | `E{0,2} R? F?` | [D] tablas Wikipedia/GBA | Pagat `E* R* F?` |
| 14 | Puntos del envido | Tabla Q/NQ de arriba | [D] | — |
| 15 | Falta a 30 | "En malas es partido"; en buenas, 30 − puntero | [D] Wikipedia/GBA/La Capital | `SIMPLE`, entrar en buenas, a lo grande |
| 16 | Falta a 15 | 15 − puntero, mínimo 1 | [I] (simple de Pagat aplicada a 15) | — |
| 17 | Buenas/malas | A 30: buenas desde 15; a 15: no hay | [D] / [I] | — |
| 18 | Recuento del envido | Automático, desde el mano, "son buenas" simulado; empate al más cercano al mano | [D] orden + [I] automático | — |
| 19 | Mostrar el envido | Cartas del tanto ganador al final de la mano | [D] mostrar + [I] momento | Mostrarlas en el acto |
| 20 | Anotación | Envido al resolverse; fin de partida inmediato si llega a la meta | [D] prioridad + [I] momento | — |
| 21 | Truco, valores | 2/1, 3/2, 4/3; sin truco, 1 | [D] | — |
| 22 | Quién sube | Solo el equipo que tiene el quiero; "Quiero retruco" atómico | [D] + botón [I] | — |
| 23 | Cuándo cantar truco | Solo en el turno propio, antes de tirar | [I] | Fuera de turno (mesa física) |
| 24 | Cartas con canto pendiente | Bloqueadas | [I] (Pagat permite tirar y contestar después) | — |
| 25 | Quién responde en equipo | Cualquier miembro; vale la primera respuesta válida | [D] cualquiera + [I] primera | Solo el pie |
| 26 | Irse al mazo | De equipo; en el turno propio o al responder | [I] (la tradición es individual) | Individual con "nos vamos" |
| 27 | Puntos del mazo | `V(nivel)` + NQ del envido pendiente, o +1 si todavía no se tiró ninguna carta, sin envido ni truco cantado | [D] GBA §6.1 / truco.ar + fórmula [I] | `mazoPrimeraVale2 = off` |
| 28 | Estructura | Partida única a 15 o 30 (la elige el host) | [U] + [I] | Mejor de tres chicos |
| 29 | Pica‑pica | Activado en 3v3 a 30, franja 5–24, alternancia estricta, la 1.ª mano redonda | [D] truco.ar/JdS + [I] | Desactivado; corte en 15 |
| 30 | Pica‑pica a 15 | Desactivado | [I] | — |
| 31 | Duelos | En secuencia, en el orden de Pagat; mano = primero del par | [D] orden + [I] mano | Simultáneos |
| 32 | Falta en pica‑pica | 6 fijos | [D] | — |
| 33 | Señas | Cartas del compañero visibles + mensajes rápidos cerrados; nada en pica‑pica | [I] (precedentes: truco.ar, ConectaGames) | Botones de seña privados (Blyts/TrucoBits) |
| 34 | Chat | Sin chat libre de equipo en mesas pagas; chat con rivales filtrado y silenciable | [I] | — |
| 35 | Timer | 30 s por acción + 60 s de banco por partida, controlado por el servidor | [D] 30 s Multitorneo + [I] | — |
| 36 | Timeout al responder | "No quiero" | [D] GBA §6.6 | — |
| 37 | Timeout al jugar | Mazo del equipo (sin carta automática) | [I] (análogo a Multitorneo) | Tirar la carta más baja |
| 38 | Ausencia | 3 timeouts seguidos = ausente | [I] | — |
| 39 | Reconexión | 90 s por caída, 180 s acumulados por partida | [I] | — |
| 40 | Abandono | El equipo pierde la partida y el pozo | [I] (análogo al 30‑0 de Juegos Evita) | — |
| 41 | Bots | Nunca en mesas pagas | [I] | Reemplazo en mesas gratis |
| 42 | Falla del servidor | Anulación y reembolso | [I]; requiere cambiar el contrato | — |
| 43 | Reparto | Shuffle criptográfico + commit‑reveal de la semilla | [I] | — |
| 44 | Versión de reglas | `ruleset_id` guardado por mesa | [I] | — |
| 45 | Pozo en equipos | Partes iguales entre los ganadores | [I]; hoy el contrato no lo soporta | — |

## Riesgo legal: la destreza no saca al truco por dinero del régimen de juego

*Esto es una bandera para revisar con un abogado, no asesoramiento legal.* En Argentina, el juego con apuestas lo regulan las provincias y la CABA ([BCN, Dossier 306](https://bcn.gob.ar/uploads/adjuntos/Dossier-306-legis-nacional-juegos-de-azar-oct-2024.pdf)). La Ley 538 de CABA alcanza, según un resumen de búsqueda que hay que contrastar con el texto completo, a "los juegos de azar, **destreza** y apuestas mutuas, en los que, con la finalidad de obtener un premio, se comprometen cantidades de dinero" ([Boletín Oficial CABA](https://boletinoficial.buenosaires.gob.ar/normativaba/norma/9885)). La ley santafesina de 2023 incluye en su definición de juego online los juegos donde predomina la destreza ([Boletín Oficial Santa Fe, Ley 14235](https://www.santafe.gob.ar/boletinoficial/ver.php?seccion=2023%2F2023-12-20ley14235-2023.html)). Por eso el argumento "el truco es habilidad, no azar" probablemente no alcance para sacar las mesas pagas de esos regímenes. Operar sin autorización puede encuadrar en el **art. 301 bis del Código Penal (3 a 6 años de prisión)** para quien "explotare, administrare, operare o de cualquier manera organizare" juegos sin autorización, y la norma se está aplicando contra plataformas online ([Diario Judicial](https://www.diariojudicial.com/news-81130-una-mala-apuesta); [FOCUS GN](https://focusgn.com/latinoamerica/argentina-feja-apuestas-ilegales)). Hay además un proyecto en trámite para extender la figura a la publicidad ([HCDN 6396‑D‑2025](https://www4.hcdn.gob.ar/dependencias/dsecretaria/Periodo2025/PDF2025/TP2025/6396-D-2025.pdf)). Que el pozo lo custodie un contrato no custodial no cambia necesariamente quién "organiza": el operador del servidor, del matchmaking y del referee puede ser visto como organizador, cobre o no comisión. ChainTable hoy cobra un 5 % (`FEE_PERCENT` en `contracts/ChainTable.sol`). No se encontró ningún dictamen específico sobre truco por dinero online. Las preguntas para el abogado son: si hace falta licencia y en qué jurisdicción, si conviene geobloquear Argentina u otras jurisdicciones para las mesas pagas, si hay que verificar mayoría de edad o hacer KYC, y qué efecto tiene la comisión. Hasta tener esas respuestas, las mesas gratis no tienen este riesgo y pueden salir primero.

## Conclusión

La dificultad de llevar el truco online no está en las reglas de juego, que son estables desde hace décadas y caben en dos funciones puras (`resolverBaza`, `ganadorMano`) y una tabla de 16 transiciones. Está en lo que la mesa física resuelve con la palabra: quién respondió primero, cuánto vale la falta "acá", si irse al mazo de entrada cuesta uno o dos, qué pasa con el que se levantó. Online, cada uno de esos acuerdos tiene que pasar a ser un parámetro versionado y visible. Para una mesa paga, una regla que no se fijó de antemano se convierte en una disputa sobre plata. Lo inesperado de la investigación es que el tramo más tradicional del juego, las señas, es también el de mayor riesgo de integridad. Mostrar las cartas del compañero, algo que un purista rechazaría, es la forma más simple de que todos jueguen con la misma información. El orden de trabajo que sale de todo esto es: 1v1 con la máquina de estados, después 2v2, después 3v3 con pica‑pica, que reutiliza la instancia 1v1. El cambio de reparto del contrato y la consulta legal van en paralelo, antes de abrir cualquier mesa paga.

---

## Apéndice: Prompt para generar las cartas

### Las 36 cartas y cómo se produce cada una

La estrategia que recomiendan las notas es generar con el modelo solo lo que necesita ilustración: **4 emblemas de palo, 4 ases y 8 figuras (caballo 11 y rey 12 de cada palo), 16 imágenes en total**. Las 24 cartas numéricas del 2 al 7 se componen por código: el emblema del palo se repite según una plantilla, y el marco, las pintas y los números van en una capa vectorial idéntica para todas las cartas. El motivo es práctico. Los modelos de difusión cuentan mal por encima de 3 o 4 objetos, y el texto que generan sale deforme ([Yingtu](https://yingtu.ai/en/blog/ai-tarot-card-generator); [MagicShot](https://magicshot.ai/blog/how-to-design-a-tarot-or-oracle-deck-with-ai)).

| Valor | Espadas | Bastos | Copas | Oros | Producción |
|---|---|---|---|---|---|
| 1 | 1 de espada (ancho, brava) | 1 de basto (ancho, brava) | 1 de copa (ancho falso) | 1 de oro (ancho falso) | IA: prompt de as |
| 2 | 2 de espada | 2 de basto | 2 de copa | 2 de oro | composición |
| 3 | 3 de espada | 3 de basto (cruzados) | 3 de copa | 3 de oro | composición |
| 4 | 4 de espada | 4 de basto | 4 de copa | 4 de oro | composición |
| 5 | 5 de espada | 5 de basto | 5 de copa | 5 de oro | composición |
| 6 | 6 de espada | 6 de basto | 6 de copa | 6 de oro | composición |
| 7 | 7 de espada (brava) | 7 de basto (falso) | 7 de copa (falso) | 7 de oro (brava) | composición (+ realce opcional) |
| 11 | caballo de espada | caballo de basto | caballo de copa | caballo de oro | IA: prompt de figura |
| 12 | rey de espada | rey de basto | rey de copa | rey de oro | IA: prompt de figura |

### Plantilla de la carta (capa vectorial, no la dibuja el modelo)

El lienzo final mide **1240 × 1900 px**, proporción 62:95, la de la baraja española física de 62 × 95 mm ([Wikipedia ES, Baraja española](https://es.wikipedia.org/wiki/Baraja_espa%C3%B1ola)). Esa proporción (0,653) es prácticamente la de las cartas del UNO de ChainTable (`public/cards/*.png`, 198 × 300 = 0,66), así que el truco puede usar el mismo hueco de carta en la mesa: a 300 px de alto, la carta mide unos 196 px de ancho. Las esquinas van redondeadas con un radio del 6 % del ancho (unos 74 px). El fondo es un **color plano por palo**, como en el UNO. La propuesta es reutilizar los cuatro colores que ya tienen las cartas del UNO, porque además coinciden con los colores tradicionales de cada palo: **espadas azul `#3e8cc4`, bastos verde `#65d50d`, copas rojo `#e93540` y oros amarillo `#ffc107`** [I; colores tomados de los PNG del UNO]. El marco de la pinta es un rectángulo interior a unos 87 px del borde (7 % del ancho), con **cortes en los lados cortos, arriba y abajo: oros 0, copas 1, espadas 2 y bastos 3** ([Wikipedia ES](https://es.wikipedia.org/wiki/Baraja_espa%C3%B1ola); [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)). Que los cortes vayan arriba y abajo se deduce de imágenes Fournier, no de un texto. El índice lleva el número en Lilita One, blanco con contorno negro como en el UNO, **arriba a la izquierda y abajo a la derecha girado 180°**, solo en dos esquinas, como la baraja española. Al lado del número va un mini emblema del palo, una ayuda digital no tradicional para leer la carta en abanico a 40 px de ancho. La ilustración tiene que dejar libre el 12 % exterior del lienzo.

Las cartas numéricas se arman colocando el emblema en estas posiciones, normalizadas dentro del marco (x e y de 0 a 1). Es una inferencia de conocimiento general: **conviene verificarla contra un mazo Casino o Fournier antes de dar el layout por bueno**. Oros y copas van siempre derechos: 1 = (0.5, 0.5) grande; 2 = (0.5, 0.28), (0.5, 0.72); 3 = (0.5, 0.2), (0.5, 0.5), (0.5, 0.8); 4 = (0.3, 0.28), (0.7, 0.28), (0.3, 0.72), (0.7, 0.72); 5 = el 4 más (0.5, 0.5); 6 = dos columnas, x 0.3/0.7 e y 0.2/0.5/0.8; 7 = el 6 más (0.5, 0.35). Espadas y bastos son piezas largas en diagonal, paralelas o en arco y **sin cruzarse, salvo en el 3 de bastos** ([Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)). Los emblemas no se espejan: una copa nunca va cabeza abajo.

### Bloque maestro de estilo (pegarlo igual en cada prompt)

```text
STYLE: flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines
with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light,
simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture
humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a
same-hue background, clean edges, no texture, no gradients in the background, no photorealism,
no 3D render. Solid flat background color {BG_HEX}. Subject centered, fully visible, the outer 12% of
the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers,
no logos, no watermark, no border, no frame, no card layout.
```

### Bloques de palo (se combinan con el bloque maestro)

```text
SUIT_ESPADAS: BG_HEX #3e8cc4. The suit object is a STRAIGHT double-edged European sword (Spanish-deck
style): light steel-blue blade, gold crossguard and pommel, short red-and-gold ribbon on the grip.
Never a katana, never a curved sabre.

SUIT_BASTOS: BG_HEX #65d50d. The suit object is a thick KNOTTED wooden cudgel (rustic club with
knobbly bumps), warm brown wood, a few small green leaves sprouting, one red and one yellow band.
Never a smooth stick, baton, bat or golf club.

SUIT_COPAS: BG_HEX #e93540. The suit object is an upright golden CHALICE / goblet on a short stem
and flat foot, with a few blue gems on the bowl. Never a mug, never a heart shape.

SUIT_OROS: BG_HEX #ffc107. The suit object is a thick round GOLD COIN with a raised rim, rich amber
and orange gold tones with dark brown engraving lines and a small red ring around the center, the
center medallion left blank and smooth. Never a diamond shape, never a sun with a face.
```

### Prompts de emblema (4 imágenes, 1024 × 1024, fondo transparente si el modelo lo permite)

```text
[STYLE block] [SUIT_* block]
A single {suit object} alone, isolated, perfectly upright and vertical, centered, front view,
filling 80% of the canvas height, no characters, no hands, nothing else in the scene.
Transparent background (or the flat BG_HEX if transparency is not supported).
```

Cada emblema se genera vertical. El código lo rota para las diagonales de espadas y bastos.

### Prompts de ases (4 imágenes, 1024 × 1536, o `--ar 2:3`)

```text
[STYLE block] [SUIT_ESPADAS block]
ACE OF SWORDS, the most prestigious card of the deck: ONE single huge straight double-edged sword placed
diagonally from lower-left to upper-right, filling most of the card, ornate gold crossguard, long red and
gold ribbons wrapped around the blade, a laurel wreath at the base, a few small sparkles.
Exactly one sword, nothing else.

[STYLE block] [SUIT_BASTOS block]
ACE OF CLUBS (Spanish deck): ONE single huge knotted wooden cudgel placed diagonally from lower-left to
upper-right, filling most of the card, fresh green leaves sprouting from the knots, red and yellow
ribbons wrapped around it, a laurel wreath at the base. Exactly one cudgel, nothing else.

[STYLE block] [SUIT_COPAS block]
ACE OF CUPS (Spanish deck): ONE single large upright golden chalice centered, elegant but simple,
blue gems on the bowl, small decorative leaves at the foot. Less ornate than a royal emblem.
Exactly one chalice, nothing else.

[STYLE block] [SUIT_OROS block]
ACE OF COINS (Spanish deck): ONE single large gold coin centered, a small crown on top, two short
ribbons flowing from the sides, a laurel branch below, the coin's center medallion completely blank
and smooth (a logo will be added later). Exactly one coin, nothing else.
```

El centro del as de oros queda liso a propósito, para poner el logo de ChainTable como vector. Las notas recomiendan no copiar textos de marca como "HERACLIO FOURNIER" o "CASINO", que son marcas vigentes ([WOPC](https://wopc.co.uk/spain/castilian)). *Opcional:* en barajas catalanas antiguas, el as de espadas lo sostienen dos leones ([WOPC](https://www.wopc.co.uk/spain/xv-century-spanish-suited-playing-cards)). Se puede reemplazar a los leones por dos personajes del elenco, agregando "held up by two small cartoon characters on each side" al prompt del as de espadas.

### Prompts de figuras (8 imágenes, 1024 × 1536, o `--ar 2:3`)

El elenco es una sugerencia [I] que reutiliza los personajes del UNO y suma otros de la cultura cripto. Conviene subir 2 o 3 cartas del UNO como **imagen de referencia de estilo** (`--sref` en Midjourney, imagen de referencia en otros modelos) y reemplazar las descripciones por los personajes reales si difieren. A diferencia del UNO, donde los personajes aparecen recortados a media altura, **las figuras españolas son de cuerpo entero** ([Wikipedia ES](https://es.wikipedia.org/wiki/Baraja_espa%C3%B1ola)). El 11 y el 12 se tienen que distinguir solo por la silueta: jinete a caballo contra figura de pie.

```text
FIGURE RULES (append to every figure prompt): single figure, FULL BODY from head to feet fully visible
(for horses: all four legs and hooves visible), standing on a simple soft ground shadow, figure fills
about 75% of the canvas height, not mirrored, not double-headed, not a reversible court card, the suit
object large, clearly visible and in its suit colors, exactly ONE suit object in the image.

KING TEMPLATE (12): [STYLE] [SUIT_*] [FIGURE RULES] A cartoon {CHARACTER} as a KING, standing upright in
three-quarter view, golden crown, long royal robe reaching the ankles, {POSE WITH SUIT OBJECT}.

KNIGHT TEMPLATE (11): [STYLE] [SUIT_*] [FIGURE RULES] A cartoon {CHARACTER} as a KNIGHT riding a chunky
cartoon horse shown in side view, the rider {POSE WITH SUIT OBJECT} raised high above the head.
```

| Carta | {CHARACTER} | {POSE WITH SUIT OBJECT} |
|---|---|---|
| Rey de espada | samurai-like cat wearing a straw hat with a small gold crown on top of the hat | holding a single straight double-edged sword upright in the right hand, point up |
| Rey de basto | gorilla wearing dark sunglasses | resting a single knotted wooden cudgel on the shoulder |
| Rey de copa | bear holding a smartphone with a blank screen in one hand | raising a single golden chalice high with the other hand |
| Rey de oro | anthropomorphic bull with small horns (bull-market vibe) | presenting a single big gold coin on the open palm |
| Caballo de espada | shiba inu dog in light armor | holding a single straight double-edged sword |
| Caballo de basto | opossum with a folded blank newspaper under one arm | holding a single knotted wooden cudgel |
| Caballo de copa | sleepy developer character in a hoodie (the "GM mug" character, without any text) | holding a single golden chalice (not a mug) |
| Caballo de oro | fox in a round astronaut bubble helmet ("to the moon") | holding a single big gold coin |

En la ilustración no puede aparecer texto: nada de "GM" en la taza, ni titulares en el diario, ni contenido en la pantalla del celular. Conviene mantener la orientación consistente en cada palo, por ejemplo con los caballos de espadas y oros mirando a la izquierda y los de copas y bastos a la derecha. Hay que evitar personajes con derechos de autor (Pepe, el Doge de la foto original). Un shiba inu genérico no tiene ese problema.

### Plan B: generar una carta numérica completa

Para generar las numéricas sin componer, se puede usar esta plantilla. Hay que **contar los objetos de cada resultado y regenerar si el número está mal**. El marco, las pintas y los números se siguen agregando como vector.

```text
[STYLE block] [SUIT_* block]
A Spanish-suited playing card face illustration (artwork area only): exactly {N} identical {suit object}s
and nothing else, arranged as follows: {LAYOUT}. All objects the same size, evenly spaced, {upright for
cups and coins | parallel diagonal for swords and clubs, not crossing}. Count carefully: exactly {N}.
No characters, no text, no numbers, no frame, no border.
```

Ejemplo de `{LAYOUT}` para el 7 de copas: "two vertical columns of three, plus one more centered between the top row and the middle row". Para el 5 de oros: "one at each corner of a rectangle plus one in the exact center, like the five on a die". Para el 3 de bastos: "three cudgels, two of them crossing in an X and one vertical in the middle".

### Negative prompt (en todos, si el modelo lo admite)

```text
hearts, spades, diamonds, clubs symbols, French playing card suits, poker card, Anglo-American card
layout, letters J Q K A, text, letters, numbers, words, captions, logo, brand name, watermark, signature,
card frame, border, mirrored double-headed court figure, reversible figure, cropped body, half body,
katana, curved sword, sabre, smooth stick, baseball bat, golf club, mug, heart-shaped cup,
extra objects, duplicated suit objects, extra limbs, extra fingers, photorealistic, 3D render,
gradient background, busy background, texture noise
```

En la plantilla de numéricas hay que sacar "duplicated suit objects" del negative.

### Realce opcional de las cuatro bravas

Destacar el **1 de espada, el 1 de basto, el 7 de espada y el 7 de oro** es una decisión de diseño propia, **opcional**. Ninguna baraja comercial lo hace, aunque es coherente con la identidad que les dan las señas tradicionales ([Sitio Andino](https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727)). Conviene resolverlo en la capa vectorial y no en el prompt, así se puede activar o desactivar sin regenerar nada: un marco dorado metálico en lugar del marco de la pinta, un aura radial suave detrás del emblema y una pequeña estrella junto al índice. Los dos sietes bravos **conservan la distribución normal de 7 emblemas**. El realce es un adorno, no otra composición, para no romper la lectura de "es un 7". Si se prefiere un aura ilustrada para los ases bravos, se agrega al prompt: "a soft golden radial glow and a few light rays behind the object, subtle, still a flat background". No hace falta indicar el orden entre las cuatro: los jugadores ya lo conocen.

### Lista de control antes de aprobar el mazo

Primero se aprueba el as de cada palo como ancla visual y después se genera palo por palo con la misma referencia de estilo ([eduMe](https://help.edume.com/ai-image-generation-best-practices)). Antes de cerrar hay que revisar varias cosas. Las espadas son rectas y los bastos son garrotes nudosos. Las copas y los oros nunca aparecen invertidos. No hay ningún palo francés. Las figuras son de cuerpo entero, no reversibles y sin texto. Cada figura tiene un solo objeto de palo. Los cortes de la pinta son 0/1/2/3 (oros/copas/espadas/bastos). Los índices están solo arriba a la izquierda y abajo a la derecha (girado). El 11 se distingue del 12 a 40 px de ancho. Y el 3 de bastos es la única carta con piezas cruzadas.
