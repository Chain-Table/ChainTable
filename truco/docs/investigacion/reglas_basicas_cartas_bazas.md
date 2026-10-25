# Reglas básicas del truco argentino: jerarquía de cartas, envido, reparto/mano y las tres bazas (con pardas)

Notas para un motor de juego server-side. Variante objetivo: truco argentino **sin flor**, mazo de **36 cartas** (1–7, 11 y 12 de los 4 palos; sin 8, 9 ni 10).

Fuentes principales usadas (abreviaturas en el texto):
- **Pagat**: John McLeod, "Argentinean Truco": https://www.pagat.com/put/truco_ar.html
- **WikiES**: Wikipedia ES, "Truco argentino": https://es.wikipedia.org/wiki/Truco_argentino (el artículo tiene avisos de falta de fuentes y se contradice en varios puntos)
- **WikiEN**: Wikipedia EN, "Truco": https://en.wikipedia.org/wiki/Truco
- **JdS**: "Reglamento de Truco", www.juegosdesalon.com (PDF de 2007 alojado en folkloretradiciones.com.ar): https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf
- **Rentas**: "Reglamento Truco del XXI Encuentro Nacional de Empleados de Rentas" (2017, Catamarca): https://dgrentas.arcat.gob.ar/olimpiadas/reglamentos/truco.pdf
- **LaCapital**: diario La Capital (Rosario), "Cómo jugar al truco…": https://www.lacapital.com.ar/informacion-general/como-jugar-al-truco-las-reglas-del-juego-cartas-mas-popular-la-argentina-n2626548.html/amp
- **SitioAndino**: "Guía definitiva del truco argentino": https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727
- **ArgGob**: Reglamento 2023 de truco (Juegos para Personas Mayores, argentina.gob.ar): https://www.argentina.gob.ar/sites/default/files/2023/04/truco.pdf (solo remite al reglamento de ASART)

## 1. Jerarquía de cartas para las bazas (de mayor a menor) y empates

### Takeaway
Hay un orden fijo de 14 escalones con el mazo de 40. Los 4 primeros son cartas únicas ("bravas"). Del 5.º escalón para abajo **solo cuenta el número, no el palo**: dos cartas del mismo escalón empatan. Con el mazo de 36 desaparece el escalón de los 10 y quedan **13 escalones**. Todas las fuentes coinciden en el orden.

### Cited Findings
- Orden de mayor a menor: ancho de espada (1♠), ancho de basto (1 de bastos), 7 de espada, 7 de oro, treses (todos iguales), doses (todos iguales), 1 de oro y 1 de copa (iguales), reyes (12), caballos (11), sotas (10), 7 de copa y 7 de basto (iguales), seises, cincos, cuatros. "Below the top four, only rank counts, not suit." — [Pagat](https://www.pagat.com/put/truco_ar.html)
- El mismo orden figura en: [WikiES](https://es.wikipedia.org/wiki/Truco_argentino); [WikiEN](https://en.wikipedia.org/wiki/Truco) ("Ancho de espada, Ancho de basto, 7 de espadas, 7 de oros, 3s, 2s, Anchos falsos, Reyes, Caballos, Sotas, Sietes falsos, 6s, 5s, 4s"); [LaCapital](https://www.lacapital.com.ar/informacion-general/como-jugar-al-truco-las-reglas-del-juego-cartas-mas-popular-la-argentina-n2626548.html/amp); [SitioAndino](https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727)
- JdS: "Las demás cartas se ordenan del modo siguiente, sin importar el palo: treses, doses, ases (sólo los de copas y oros), reyes, caballos, sotas, sietes (sólo los de copas y bastos), seis, cincos y cuatros." Nombres: "cartas bravas" = 1♠, 1 de bastos, 7♠, 7 de oros; "falsos" = ases y sietes no bravos; "negras" = sotas, caballos y reyes. — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Las 12, 11 y 10 son escalones distintos (rey > caballo > sota), no uno solo: "Kings, horses, valets (ranked 12, 11, 10; each rank is equal across suits)" — [Pagat](https://www.pagat.com/put/truco_ar.html); también en [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- La Asociación Argentina de Truco (ASART) tiene un "Reglamento Oficial", y los torneos oficiales del Estado se rigen por él ("Esta disciplina se regirá por el Reglamento Oficial de la Asociación Argentina de Truco (ASART)") — [ArgGob](https://www.argentina.gob.ar/sites/default/files/2023/04/truco.pdf). No pude leer el texto: asart.com.ar rechazó la conexión.
- En 2023 se propuso subir el 5 de copas a carta máxima ("Truco Messi"). Según la cobertura de prensa que vi en resultados de búsqueda, en el reglamento de ASART el 5 de copas sigue junto a los demás cincos y el cambio sería opcional. Solo lo vi en snippets — [SitioAndino (andino-sports)](https://www.sitioandino.com.ar/andino-sports/buscan-cambiar-las-reglas-del-truco-que-el-5-copas-sea-la-carta-mas-valiosa-n5644819). Ignorar para el motor.

### Inferences
- Tabla de fuerza propuesta para el motor con mazo de 36. Un número mayor gana; mismo número = empate:

| Fuerza | Cartas (36) | Cant. |
|---|---|---|
| 13 | 1 de espada | 1 |
| 12 | 1 de basto | 1 |
| 11 | 7 de espada | 1 |
| 10 | 7 de oro | 1 |
| 9 | 3 (los 4 palos) | 4 |
| 8 | 2 (los 4 palos) | 4 |
| 7 | 1 de oro, 1 de copa | 2 |
| 6 | 12 (los 4 palos) | 4 |
| 5 | 11 (los 4 palos) | 4 |
| 4 | 7 de copa, 7 de basto | 2 |
| 3 | 6 (los 4) | 4 |
| 2 | 5 (los 4) | 4 |
| 1 | 4 (los 4) | 4 |
| | **Total** | **36** |

  Con el mazo de 40, los 10 entrarían como un escalón entre el 11 y los 7 falsos.
- Los 4 escalones superiores tienen una sola carta, así que solo pueden empatar cartas con fuerza ≤ 9.

### Gaps
- No pude consultar el texto del Reglamento Oficial de ASART (asart.com.ar no respondió). Las fuentes secundarias coinciden en todo el orden, así que el riesgo es bajo.

## 2. Valores del envido

### Takeaway
Las cartas 1–7 valen su número y las figuras (10, 11, 12) valen 0. Con dos cartas del mismo palo, el envido es la suma de esas dos más 20. Sin dos del mismo palo, es la carta de mayor valor. El máximo es 33 (7+6 del mismo palo). Valores posibles: **{0,1,…,7} ∪ {20,21,…,33}**. Nunca aparecen 8–19.

### Cited Findings
- "Pips 1–7 count face value; pictures (10–12) count zero"; dos del mismo palo = suma + 20; si no, la carta más alta; "Highest possible is 33 (7 and 6 of one suit); lowest is 0." — [Pagat](https://www.pagat.com/put/truco_ar.html)
- JdS: "Para la flor y el envido las cartas negras valen 0"; "el envido más alto vale 33 tantos". — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- "La puntuación más alta será 33, que se dará teniendo un 7 y un 6 del mismo palo." — [LaCapital](https://www.lacapital.com.ar/informacion-general/como-jugar-al-truco-las-reglas-del-juego-cartas-mas-popular-la-argentina-n2626548.html/amp)
- Regla del valor de las cartas: "las cartas valen su número, salvo 10, 11 y 12, que valen 0". Cálculo: dos o más del mismo palo, se suman dos y se agregan 20; tres palos distintos, vale la más alta — [WikiES](https://es.wikipedia.org/wiki/Truco_argentino); igual en [WikiEN](https://en.wikipedia.org/wiki/Truco)
- **Tres cartas del mismo palo sin flor:** se toman las dos mejores del palo más 20. Ejemplo de Pagat: "6-3-2 of a suit gives 29" — [Pagat](https://www.pagat.com/put/truco_ar.html). JdS: quien tiene flor y juega envido tiene "20 puntos más el valor de sus dos cartas más altas" — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- La regla del +20 aplica también a dos figuras del mismo palo: si las tres son figuras pero dos comparten palo, el envido vale 20 y no 0 — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf) (el texto dice "si dos de las figuras son del mismo palo, la mano…" y está cortado en la extracción; lo confirma el cálculo general de Pagat).
- Empates de envido: gana el mano, o el jugador más cercano al mano en el orden de juego; "the dealer loses all ties" — [Pagat](https://www.pagat.com/put/truco_ar.html). JdS: "en caso de igualdad gana el mano (es decir, entre dos jugadores que tienen los mismos puntos de envido gana el que se encuentra primero en esa ronda)" — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Flor (tres del mismo palo, se canta antes de la primera baza y reemplaza al envido) es opcional y se acuerda antes de jugar — [Pagat](https://www.pagat.com/put/truco_ar.html), [WikiES](https://es.wikipedia.org/wiki/Truco_argentino), [Rentas](https://dgrentas.arcat.gob.ar/olimpiadas/reglamentos/truco.pdf) ("Debes estar de acuerdo ambos equipos sino se jugará sin flor"). **En este motor se ignora:** tres cartas del mismo palo se tratan como envido normal (las dos mejores + 20).

### Inferences
- Función de referencia:
  `envido(mano) = max( max(valorEnv(c)), max sobre pares del mismo palo de (20 + valorEnv(a) + valorEnv(b)) )`, con `valorEnv(c) = c.numero <= 7 ? c.numero : 0`. El `max` sobre todos los pares del mismo palo cubre el caso de tres del mismo palo sin lógica especial.
- La distribución exacta la calculé enumerando todas las manos posibles de 3 cartas (script propio, no viene de las fuentes). Probabilidad (%) de cada valor de envido:

| Envido | 40 cartas (9880 manos) | 36 cartas (7140 manos) |
|---|---|---|
| 0 | 1.09 | 0.45 |
| 1 | 1.50 | 1.06 |
| 2 | 2.47 | 2.07 |
| 3 | 3.68 | 3.42 |
| 4 | 5.14 | 5.10 |
| 5 | 6.84 | 7.11 |
| 6 | 8.79 | 9.47 |
| 7 | 10.97 | 12.16 |
| 20 | 3.68 | 1.51 |
| 21 | 3.77 | 3.08 |
| 22 | 3.77 | 3.08 |
| 23 | 5.10 | 4.71 |
| 24 | 5.10 | 4.71 |
| 25 | 6.48 | 6.39 |
| 26 | 6.48 | 6.39 |
| 27 | 7.89 | 8.12 |
| 28 | 4.13 | 5.04 |
| 29 | 4.25 | 5.21 |
| 30 | 2.87 | 3.53 |
| 31 | 2.96 | 3.64 |
| 32 | 1.50 | 1.85 |
| 33 | 1.54 | 1.90 |
| ≥ 20 (algún par del mismo palo) | 59.51 | 59.16 |
| 3 del mismo palo ("flor", ignorada) | 4.86 | 4.71 |

### Gaps
- Ninguno relevante para el cálculo. Las fuentes coinciden.

## 3. Variante de 36 cartas (sin 8, 9 ni 10): qué cambia

### Takeaway
Sacar los 10 **no cambia ninguna regla**. En la jerarquía solo desaparece el escalón de las sotas. En el envido las figuras ya valían 0, así que los valores posibles son los mismos (0–7 y 20–33) y solo se mueve la distribución. 36 cartas alcanzan de sobra para 6 jugadores × 3 cartas = 18. Wikipedia ES incluso menciona quitar los 10 como práctica conocida para 2 o 4 jugadores.

### Cited Findings
- Mazo estándar: baraja española de 40, "sin ochos, nueves, ni comodines". "Para jugar de a dos o cuatro, se pueden retirar los dieces." — [WikiES](https://es.wikipedia.org/wiki/Truco_argentino). Es el único precedente que encontré de la variante sin 10.
- En la jerarquía, los 10 son un escalón propio (sotas, entre caballos y 7 falsos) — [Pagat](https://www.pagat.com/put/truco_ar.html), [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- En el envido, los 10, 11 y 12 valen 0 — [Pagat](https://www.pagat.com/put/truco_ar.html), [WikiES](https://es.wikipedia.org/wiki/Truco_argentino)
- La sota tiene un papel propio solo en el **truco uruguayo**: allí la sota del palo de la muestra es una "pieza" (perica) que vale más que el ancho de espada. En el argentino no existe la muestra — [WikiEN](https://en.wikipedia.org/wiki/Truco)
- En 6 jugadores (dos equipos de 3, sentados alternados) se reparten 3 cartas a cada uno. También existe la modalidad "pica-pica": tres duelos 1 contra 1 entre jugadores enfrentados — [Pagat](https://www.pagat.com/put/truco_ar.html), [WikiES](https://es.wikipedia.org/wiki/Truco_argentino)

### Inferences
- **Jerarquía:** pasa de 14 a 13 escalones. El 11 queda inmediatamente arriba de los 7 falsos. Hay menos cartas de rango medio-bajo, así que las demás pesan un poco más.
- **Envido:** los valores posibles no cambian. Con menos figuras sube la probabilidad de envidos altos (28–33: de 17.25% a 21.17%) y de 7 "sueltos" (de 10.97% a 12.16%). Bajan el 0 (de 1.09% a 0.45%) y el 20 (de 3.68% a 1.51%), porque ahora el 20 solo sale con 11+12 del mismo palo. La probabilidad de tener algún par del mismo palo casi no cambia (59.5% contra 59.2%).
- **Empates:** hay 4 cartas menos de rango repetido, así que las pardas son algo menos frecuentes. No lo cuantifiqué.
- **Suficiencia del mazo:** 6 × 3 = 18 de 36 (sobran 18); 4 × 3 = 12; 2 × 3 = 6. No hace falta otro mazo para ningún número de jugadores.
- **Reglas que mencionan el 10:** en el truco argentino básico no encontré ninguna regla que dependa específicamente del 10. Solo aparece dentro de "figuras/negras" (valen 0) y como escalón de la jerarquía. No se rompe nada.

### Gaps
- No encontré un reglamento formal que defina un mazo de 36 cartas para 6 jugadores. WikiES solo lo menciona, sin fuente, para 2 o 4 jugadores. Es una variante de casa y hay que documentarla como tal en la UI.

## 4. Reparto, mano, pie, sentido de juego y rotación

### Takeaway
En el truco argentino se juega **en sentido antihorario ("hacia la derecha")**. El que da mezcla, el jugador a su **izquierda** corta, y reparte **3 cartas a cada uno, de a una, empezando por su derecha**. El **mano** es el jugador a la derecha del que da: recibe la primera carta, juega primero y gana los empates. En la mano siguiente da el jugador a la derecha del dador anterior, es decir, el mano anterior, y el nuevo mano es el siguiente a la derecha.

### Cited Findings
- "Play is anticlockwise." Se reparten 3 cartas a cada jugador, de a una, en sentido antihorario. El mano es el jugador a la derecha del que da y sale en la primera baza. "The dealing turn passes to the right after each hand." — [Pagat](https://www.pagat.com/put/truco_ar.html)
- "Todo el juego del truco se realiza en sentido contrario al de las agujas del reloj. El jugador a la derecha del dador es el mano y cuenta con ciertas preferencias en el juego (por ejemplo, en caso de empate gana el mano), además de ser el primero en jugar." — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Reparto y corte: "El dador baraja las cartas y da a cortar el mazo al contrario situado a su izquierda… Al cortar no pueden dejarse menos de tres cartas en cada parte del corte." "el dador reparte tres cartas a cada jugador, de una en una y empezando por la derecha." Si una carta cae boca arriba, quien la recibe puede pedir que se reparta de nuevo — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- "Se comienza repartiendo 3 cartas a cada jugador hacia la derecha"; "el que está a la derecha de quien reparte es 'mano'"; el corte lo hace el jugador de la izquierda — [LaCapital](https://www.lacapital.com.ar/informacion-general/como-jugar-al-truco-las-reglas-del-juego-cartas-mas-popular-la-argentina-n2626548.html/amp)
- Rotación: "el siguiente a su derecha es el nuevo 'mano'" — [SitioAndino](https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727). "The turn to deal is then passed counterclockwise, so the hand of the first round is the foot of the second" — [WikiEN](https://en.wikipedia.org/wiki/Truco)
- **Pie.** Hay un desacuerdo de definición:
  - Pagat lo define como el último jugador de cada equipo (el dador y el jugador a su izquierda) y dice que suele ser el capitán — [Pagat](https://www.pagat.com/put/truco_ar.html). JdS y Rentas dicen lo mismo: "Pie: Último jugador de cada bando; suele actuar como capitán y estratega del equipo" — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf), [Rentas](https://dgrentas.arcat.gob.ar/olimpiadas/reglamentos/truco.pdf).
  - WikiEN lo equipara al dador, desde la óptica de 2 jugadores: "The hand is always the player on the right of the foot" — [WikiEN](https://en.wikipedia.org/wiki/Truco).
  - Las dos definiciones coinciden en 1 contra 1.
- **Primer dador:** se sortea. Pagat menciona "drawing kings": da primero el primero que saca un rey — [Pagat](https://www.pagat.com/put/truco_ar.html), [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- **Inconsistencias de WikiES:** define al mano como "el jugador a la derecha de quien baraja" y también como el primero que recibe carta (equivalentes), pero en otro punto como el más cercano al mazo "hacia la izquierda" (contradictorio). Tampoco fija el sentido de juego de forma consistente — [WikiES](https://es.wikipedia.org/wiki/Truco_argentino). Prevalecen Pagat y JdS.
- Asientos: las parejas se sientan enfrentadas (en 4) y los equipos de 3 alternados (en 6) — [Pagat](https://www.pagat.com/put/truco_ar.html), [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)

### Inferences
- Modelo para el servidor: asientos `0..n-1` en orden antihorario, de modo que el asiento `i+1` está a la derecha de `i`, con equipos alternados (`team = i % 2`).
  - `dealer_k = (dealer_0 + k) mod n` para la mano k.
  - `mano = (dealer + 1) mod n`.
  - Orden de reparto y de juego: `mano, mano+1, …, dealer`.
  - Pies: el dador y el jugador a su izquierda, `dealer - 1` (el último de cada equipo en jugar).
- Online no hace falta simular el corte ni la carta boca arriba: basta con un shuffle criptográficamente seguro en el servidor. El orden de reparto de a una no afecta la distribución si el mazo está bien mezclado.

### Gaps
- No encontré fuentes que traten la rotación cuando un jugador abandona en 6 jugadores. Queda fuera de alcance.

## 5. Las tres bazas: quién sale, cómo se gana y todos los casos de parda

### Takeaway
Gana la mano el equipo que gana 2 de 3 bazas. El ganador de una baza sale en la siguiente. Si la baza es parda, vuelve a salir quien salió en esa baza, que en la práctica es siempre el **mano original** (ver Inferences). La regla general con pardas es "la primera vale doble/oro": con una parda gana quien ganó la primera baza decidida; con dos pardas gana quien ganó la restante; con tres pardas gana el equipo del mano.

### Cited Findings
- Sale el mano en la primera baza; los demás juegan en sentido antihorario; gana la carta más alta y el ganador sale en la siguiente. No hace falta seguir palo — [Pagat](https://www.pagat.com/put/truco_ar.html)
- "en la primera baza, juega la primera carta el mano, en la segunda y en la tercera, sale el que ha ganado la anterior. Si la primera resultó empatada vuelve a iniciar la segunda el mano." — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Si la baza es parda, "The player who led the previous trick leads again" — [Pagat](https://www.pagat.com/put/truco_ar.html). "The same mano then leads the next trick." — [WikiEN](https://en.wikipedia.org/wiki/Truco)
- Resolución con pardas según Pagat — [Pagat](https://www.pagat.com/put/truco_ar.html):
  - "One tied trick: the team that wins the earlier of the other two tricks wins."
  - "Two tied tricks: the winner of the single untied trick wins."
  - "All three tied: the mano's team wins."
  - "If the first two tricks are split by a tie, the third is not played."
- WikiEN: "If one of the games ends in a parda, the team that won the earlier of the other two tricks wins the round… often referred to as 'primera vale doble'"; "In the case of two pardas (ties), the winner of the remaining trick wins the round"; "In case of three pardas, the mano wins the round"; "If one team wins the first two tricks, the third is not played." — [WikiEN](https://en.wikipedia.org/wiki/Truco)
- JdS: "si en la primera se empata, hay que ganar la siguiente"; "Si hay un empate, el truco lo gana el bando vencedor en la baza siguiente. Si se empatan las tres bazas, gana el equipo del mano. Si se empata la primera baza y la segunda no, no es necesario jugar la tercera; tampoco es necesario hacerlo si un bando gana las dos primeras bazas" — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- LaCapital — [LaCapital](https://www.lacapital.com.ar/informacion-general/como-jugar-al-truco-las-reglas-del-juego-cartas-mas-popular-la-argentina-n2626548.html/amp):
  - "Si hay empate en la primera mano, quien gane la segunda (o la tercera en caso de que no se defina) será el ganador."
  - "Si se gana la primera mano, se pierde la segunda y se empata la tercera, el que ganó la primera será el ganador."
  - "Si las 3 manos son empate, gana quien sea mano."
- WikiES lo resume igual: parda en la 1.ª, decide la 2.ª; parda en 1.ª y 2.ª, decide la 3.ª; tres pardas, gana el mano; si A gana una y empata las otras, gana A — [WikiES](https://es.wikipedia.org/wiki/Truco_argentino)
- Cuidado con el **truque español**: los PDFs de pueblos de España (Navarrevisca, Villar de Cañas) usan reglas parecidas, pero son otro juego. No usarlos como fuente (resultados de búsqueda: https://www.navarrevisca.es/wp-content/uploads/2016/03/truco.pdf, https://www.villardecanas.es/fiestas/truque.pdf).

### Inferences
- **Tabla de decisión completa.** Cada baza tiene resultado A (gana el equipo A), B (gana el equipo B) o P (parda); "Mano" es el equipo del mano. Los casos simétricos (A↔B) se resuelven igual:

| 1.ª | 2.ª | 3.ª | Ganador | ¿Se juega la 3.ª? | Regla |
|---|---|---|---|---|---|
| A | A | — | A | No | 2 bazas |
| A | P | — | A | No | parda en 2.ª: gana el que ganó la 1.ª |
| P | A | — | A | No | parda en 1.ª: decide la 2.ª |
| A | B | A | A | Sí | 2 bazas |
| A | B | B | B | Sí | 2 bazas |
| A | B | P | A | Sí | parda en 3.ª: gana el que ganó la 1.ª |
| P | P | A | A | Sí | dos pardas: decide la restante |
| P | P | P | Mano | Sí | tres pardas: gana el mano |

  Las 8 filas más sus simétricas cubren todas las secuencias posibles: 3 resultados por baza con corte anticipado.
- **Algoritmo compacto,** derivado de las reglas citadas y equivalente a la tabla:
  - Corte anticipado: después de 2 bazas la mano termina **salvo** que sean (A,B), (B,A) o (P,P).
  - Ganador al terminar: el equipo con más bazas ganadas. Si empatan en bazas ganadas (1-1 o 0-0), gana el ganador de la primera baza no parda. Si no hay ninguna, gana el equipo del mano.
  - Comprobación: (A,P) da A 1-0; (P,A) da A 1-0; (A,B,P) da 1-1 y la primera decidida es A; (P,P,A) da A; (P,P,P) da Mano.
- **Quién sale tras una parda:** las únicas secuencias en que se sigue jugando después de una parda son P→2.ª baza y (P,P)→3.ª baza. En ambos casos el que salió en la baza parda era el mano original. Por eso las tres formulaciones de las fuentes dan el mismo resultado ("vuelve a salir el mano" de JdS, "sale el que salió la anterior" de Pagat, "the same mano" de WikiEN). Implementación: `leader_next = (resultado == P) ? leader_actual : ganador_de_la_baza`.
- Dentro de una baza, el jugador que "ganó" es quien jugó la carta más alta. Si hay empate dentro del mismo equipo, ver la sección 6.
- Los cantos (truco/retruco/vale cuatro, envido, irse al mazo) cortan este flujo. Quedan fuera de esta nota: irse al mazo o un "no quiero" terminan la mano antes.

### Gaps
- No encontré ninguna fuente argentina que dé un ganador distinto en algún caso de parda. Coinciden Pagat, WikiEN, WikiES, JdS y LaCapital.
- Hay una variante informal de 4/6 jugadores en la que tras una parda sale "el que empardó" (el jugador del par empatado más cercano al mano). No la encontré documentada y no la incluyo.

## 6. Empates dentro de una baza entre compañeros vs. entre rivales (juego en equipo)

### Takeaway
La baza es **parda solo si la carta más alta la comparten jugadores de equipos distintos**. Si la carta más alta la comparten solo compañeros, gana su equipo, y sale en la baza siguiente el que jugó primero esa carta.

### Cited Findings
- "If the highest cards come from the same team, that team wins, and whoever played the first of those cards leads next. If opposing teams hold the highest cards, the trick is tied and belongs to neither side." — [Pagat](https://www.pagat.com/put/truco_ar.html)
- "Cuando más de uno juega la carta mayor, ganan si son del mismo bando, y si son contrarios, empatan (baza parda)." — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- "If these tied cards were played by the same team, that team wins the trick. Otherwise, the trick is called a draw, parda." — [WikiEN](https://en.wikipedia.org/wiki/Truco)

### Inferences
- Algoritmo: `max = mayor fuerza jugada`; `top = jugadores con fuerza == max`. Si todos los de `top` son del mismo equipo, gana ese equipo y el ganador de la baza (quien sale después) es el primero de `top` en el orden de juego. Si no, la baza es parda.
- Caso límite: en 6 jugadores, si A1 y A2 juegan un 3 y B1 también, `top` incluye a los dos equipos, así que es parda aunque A tenga "más" cartas máximas. Ninguna fuente lo trata explícitamente, pero se deduce de la redacción literal ("if opposing teams hold the highest cards").
- No importan las cartas inferiores al máximo. Una carta baja de un compañero nunca rompe un empate.

### Gaps
- Ninguna fuente trata el caso de tres o más cartas máximas con mayoría de un equipo. Lo resolví por lectura literal (parda).

## 7. Fin anticipado de la mano y cartas no jugadas

### Takeaway
Si una mano se decide antes de la 3.ª baza (o antes de la 2.ª, al irse al mazo), **no se juegan ni se muestran las cartas restantes**. La única obligación de mostrar es la del **ganador del envido**, que debe enseñar las cartas que lo justifican al terminar la mano, aunque no las haya jugado. Quien se va al mazo tira sus cartas boca abajo.

### Cited Findings
- "If the first two tricks are split by a tie, the third is not played." — [Pagat](https://www.pagat.com/put/truco_ar.html). "If one team wins the first two tricks, the third is not played." — [WikiEN](https://en.wikipedia.org/wiki/Truco). "no es necesario jugar la tercera" — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf)
- Las cartas jugadas quedan boca arriba frente a cada jugador durante la mano: "Las bazas no se recogen sino que se dejan, boca arriba, delante del que las ha jugado." — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf); "The cards remain face-up on the table during the round." — [WikiEN](https://en.wikipedia.org/wiki/Truco)
- Pagat no trata el caso de las cartas no jugadas; solo dice que al final de la mano se muestran las cartas ganadoras de envido (y de flor) — [Pagat](https://www.pagat.com/put/truco_ar.html)
- Mostrar el envido:
  - "El ganador del envido debe mostrar sus cartas antes de anotarse los puntos. Si se hubiera equivocado al cantar el valor ganaría el equipo contrario" — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf).
  - WikiES: si no se muestran "al terminar las cartas" y el rival lo reclama, los puntos pasan al rival; en parejas, solo muestra quien tiene el envido ganador — [WikiES](https://es.wikipedia.org/wiki/Truco_argentino).
  - WikiEN: "The cards must be shown at or before the end of the hand" — [WikiEN](https://en.wikipedia.org/wiki/Truco).
- Irse al mazo: "Tirar las cartas, boca abajo, junto al mazo sobrante del reparto, para indicar que se abandona la mano" — [JdS](https://www.folkloretradiciones.com.ar/reglamento%20truco.pdf), [Rentas](https://dgrentas.arcat.gob.ar/olimpiadas/reglamentos/truco.pdf)

### Inferences
- Para el servidor: al cerrar la mano, revelar solo las cartas jugadas (ya públicas) y, si hubo envido querido, las cartas del ganador que forman su envido: las dos del palo, o la carta más alta si no tiene par. Si el ganador ya jugó esas cartas, no hace falta revelar nada más. Online se puede validar automáticamente: el servidor conoce el envido real, así que la penalización por "cantar mal" solo aplica si se permite cantar un valor libre.
- Las demás cartas no jugadas quedan ocultas. Revelarlas filtraría información (estilo de juego, mentiras en el envido) que en la mesa real no se ve.

### Gaps
- No encontré un reglamento que diga explícitamente "las cartas no jugadas no se muestran". Se deduce de que las fuentes solo obligan a mostrar el envido ganador y de que al irse al mazo las cartas van boca abajo. Habría que confirmarlo con el reglamento de ASART, que no pude consultar.
