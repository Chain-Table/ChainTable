# Diseño visual de la baraja española (uso argentino / truco) para generar un mazo ilustrado propio de 36 cartas

> Alcance: qué tiene que mostrar cada carta para que un jugador argentino de truco la lea al instante, aunque el arte sea 100 % nuevo. El mazo del usuario va del 1 al 7 más caballo (11) y rey (12), sin sotas (10): 4 palos × 9 = 36 cartas.
> Aviso: varias fuentes de coleccionismo (WOPC, IPCS) describen patrones históricos pero **no** documentan carta por carta la distribución de los símbolos. Lo que sale de conocimiento general o de mirar imágenes está marcado en **Inferencias**, no en Hallazgos citados.

## 1. Los cuatro palos: iconografía, colores y pintas

### Takeaway
Palos: oros (moneda de oro), copas (cáliz), espadas (espada recta) y bastos (garrote nudoso, no una vara lisa). **Hay que corregir el supuesto del encargo:** las pintas son **oros 0 cortes, copas 1, espadas 2 y bastos 3**, no 1/2/3/4. Ninguna fuente que encontré establece un "color oficial" por palo: los colores salen de la costumbre del patrón Fournier (espada de hoja azul, basto verde, copa roja y dorada, moneda amarilla).

### Hallazgos citados
- Los cuatro palos son oros, copas, espadas y bastos, normalmente en ese orden. Algunos juegos los agrupan en "cortos" (oros y copas) y "largos" (espadas y bastos). — [Wikipedia ES: Baraja española](https://es.wikipedia.org/wiki/Baraja_espa%C3%B1ola)
- Pintas (cortes en el recuadro): **oros sin cortes, copas uno, espadas dos, bastos tres**. Probablemente aparecieron porque las figuras de cuerpo entero no dejan ver el palo en el extremo de la carta. — [Wikipedia ES](https://es.wikipedia.org/wiki/Baraja_espa%C3%B1ola)
- Mismo dato en inglés: "cups have one interruption, swords two, clubs three, and coins none". La pinta aparece hacia mediados del siglo XVII, y de ahí viene la expresión "le conocí por la pinta". — [Wikipedia EN: Spanish-suited playing cards](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)
- Una tercera fuente lo confirma: "El palo de oros no tiene pintas; el de copas tiene una; el de espadas, dos y tres, el de bastos". La ficha didáctica del Instituto Cervantes también define la "pinta" como la señal del recuadro. — fragmento de búsqueda de [mdzol.com](https://www.mdzol.com/sociedad/2013/9/10/que-secretos-esconden-las-figuras-de-la-baraja-885995.html) (la página dio 403 al abrirla); [Otero Reinoso, marcoELE n.º 12 (PDF)](https://marcoele.com/descargas/12/otero-baraja.pdf)
- Las espadas españolas son **rectas** y los bastos son **garrotes nudosos** ("knobbly cudgels"), no las varas lisas del norte de Italia. Las espadas y los bastos **no se cruzan**, salvo en el 3 de bastos. — [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)
- En el patrón castellano, los oros son monedas con figuras grabadas. En el patrón catalán se cambian por soles o flores. — [Wikipedia ES](https://es.wikipedia.org/wiki/Baraja_espa%C3%B1ola)
- Fournier (patrón castellano) añadió **caras a las monedas, espadas tipo daga y copas rojas**, además de barbas a los reyes, con trajes pseudomedievales. — [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)
- En el patrón catalán moderno (el que más se usa en Argentina y Uruguay, ver punto 5), las copas tienen **forma de huevera**: un cuenco semiesférico sobre un pie corto con base plana. En algunas versiones son amarillas y verdes. — [IPCS Pattern Sheet 21](https://i-p-c-s.org/pattern/ps-21.html); [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)
- Imágenes de los ases Fournier en la ficha de marcoELE: as de copas con un cáliz dorado y rojo con piedras azules; as de espadas con hoja **azul**, empuñadura dorada y cintas enrolladas; as de bastos con un garrote **verde** con franjas roja y amarilla y nudos. En el as de espadas y en el de bastos se ven los cortes del marco. — [Otero Reinoso, marcoELE (PDF, p. 2)](https://marcoele.com/descargas/12/otero-baraja.pdf)

### Inferencias
- Paleta segura y reconocible para los prompts: **espadas** con hoja azul acero o celeste y empuñadura dorada; **bastos** verde y marrón con nudos o brotes; **copas** rojo con dorado; **oros** amarillo dorado con un detalle rojo o una cara en relieve. Es la convención Fournier/Casino que un argentino ve todos los días.
- Recomiendo no confiarle la pinta al modelo de imágenes. Conviene dibujarla como capa vectorial del marco (un rectángulo interior con 0, 1, 2 o 3 cortes arriba y abajo) y componerla en postproducción, para que el conteo salga siempre bien.
- En el diseño Fournier los cortes de la pinta van en los lados cortos del recuadro (arriba y abajo). Lo deduzco de las imágenes del PDF de marcoELE; ningún texto lo dice.

### Gaps
- No encontré ninguna fuente que fije "colores oficiales por palo". Lo de "espadas azules / bastos verdes" es costumbre de fabricante, no norma.
- No hallé una descripción escrita de dónde van exactamente los cortes (posición y largo) en el patrón catalán que usa Casino.

## 2. Cartas numéricas del 1 al 7: distribución de símbolos, índices y reversibilidad

### Takeaway
Los números van arriba a la izquierda y, girados 180°, abajo a la derecha (se ve en las cartas Fournier). La baraja clásica **no es reversible**: las figuras son de cuerpo entero y miran en un solo sentido. No encontré ninguna fuente escrita con el esquema de símbolos de cada carta, así que la tabla de abajo es inferencia y hay que comprobarla contra un mazo físico.

### Hallazgos citados
- Las figuras de la baraja española son **de cuerpo entero**, a diferencia de otras barajas. — [Wikipedia ES](https://es.wikipedia.org/wiki/Baraja_espa%C3%B1ola)
- Hay figuras reversibles, pero no son populares. El único patrón italiano que se vende reversible de forma habitual es el piacentino. — [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)
- En las figuras españolas no hay letras: se identifican por el número del índice (10, 11, 12). — [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards); las imágenes de la sota (10), el caballo (11) y el rey (12) en [marcoELE p. 2](https://marcoele.com/descargas/12/otero-baraja.pdf) muestran el número arriba a la izquierda y el mismo número invertido abajo a la derecha, dentro del recuadro.
- Espadas y bastos no se cruzan en los números, salvo en el 3 de bastos. — [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)
- En el patrón Casino argentino, el **4 de copas** lleva el nombre, la dirección y el logo del fabricante (sirve para fechar los mazos). — [WOPC: Naipes Casino](https://wopc.co.uk/argentina/justorodero/casino)

### Inferencias (conocimiento general, verificar con un mazo Casino o Fournier antes de dar los prompts por buenos)
Distribución habitual de **oros y copas**, símbolos completos y verticales:
- 1: un símbolo grande y ornamentado en el centro.
- 2: dos símbolos alineados en el eje vertical (arriba y abajo).
- 3: tres en vertical, centrados.
- 4: cuatro en las esquinas, formando un rectángulo 2×2.
- 5: cuatro en las esquinas más uno en el centro (como el 5 de un dado).
- 6: dos columnas de tres.
- 7: dos columnas de tres más uno en el centro, entre las filas de arriba y del medio.

Distribución habitual de **espadas y bastos**, símbolos largos y diagonales:
- 1: una sola espada o basto enorme que ocupa casi toda la carta (el "ancho").
- 2: dos piezas largas que se arquean o se ponen en paralelo sin cruzarse.
- 3: es la carta donde se cruzan (en bastos, según la fuente).
- 4 a 7: varias piezas paralelas inclinadas, a veces en dos grupos (arriba y abajo).

Convenciones que conviene respetar:
- No hay índices en las cuatro esquinas: solo dos, arriba a la izquierda y abajo a la derecha (invertido).
- Que el número sea pequeño y quede dentro del recuadro de la pinta.
- Para un juego digital, que no espeje los símbolos: las copas siempre derechas, sin mitad invertida.

### Gaps
- Ni WOPC ni IPCS publican un esquema textual carta por carta del patrón catalán o castellano. Para fijarlo hay que consultar las imágenes de [WOPC Naipes Casino](https://wopc.co.uk/argentina/justorodero/casino) o fotografiar un mazo real.
- No sé con certeza cómo se colocan las espadas en los 4 a 7 del patrón Casino (paralelas o en arco).

## 3. Los ases: el ancho de espada, el ancho de basto, el 1 de oros y los sietes bravos

### Takeaway
En el truco, el orden de arriba es **1 de espada > 1 de basto > 7 de espada > 7 de oro**. En la baraja impresa, los ases son las cartas más decoradas (un solo emblema grande y ornamentado, y en Fournier el as de oros lleva la marca del fabricante). Los sietes bravos no tienen un diseño distinto en las barajas comerciales, así que destacarlos sería una decisión propia del juego.

### Hallazgos citados
- Jerarquía del truco argentino: ancho de espada, ancho de basto, 7 de espada, 7 de oro; después los 3, los 2, los anchos falsos (copa y oro), las figuras (rey, caballo, sota), los sietes falsos (copa y basto) y por último 6, 5 y 4. Se juega con 40 cartas, sin 8, 9 ni comodines. — [Sitio Andino: guía del truco](https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727); [La Nación: valores del truco](https://lanacion.com.ar/lifestyle/valores-del-truco-guia-aprender-jugar-identificando-nid2388979)
- Señas tradicionales: ancho de espada = subir las dos cejas; ancho de basto = guiñar; 7 de espada = mover la boca hacia la comisura derecha; 7 de oro = hacia la izquierda. Esto muestra que esas cuatro cartas tienen identidad propia para el jugador. — [Sitio Andino](https://www.sitioandino.com.ar/lifestyle/guia-definitiva-del-truco-argentino-reglamento-senas-universales-y-las-particularidades-mendoza-n5724727)
- En 2023 se habló de que la ASART podía cambiar el ancho de espada por el 5 de copas como carta máxima, en relación con Messi. El presidente de la ASART lo aclaró después: el ancho de espada sigue siendo la máxima y lo del 5 de copas sería una variante opcional. — [Noticias NQN](https://www.noticiasnqn.com.ar/noticias/2023/01/17/271571-truco-proponen-cambiar-al-ancho-de-espada-como-la-carta-ms-alta)
- As de oros Fournier: una moneda grande con un retrato de perfil, una cinta con "HERACLIO FOURNIER" y una cartela con "VITORIA" (ver imagen). La edición litográfica de 1889 a doce colores llevaba el retrato del propio Fournier en el as de oros. — [marcoELE p. 2](https://marcoele.com/descargas/12/otero-baraja.pdf); síntesis de búsqueda sobre la historia de Fournier ([nhfournier.es](https://www.nhfournier.es/en/?p=2591))
- As de oros del patrón catalán (Casino, Argentina): un **busto femenino coronado dentro de una corona de laurel**, sobre dos cornucopias con frutas, encima de un pedestal con banderas detrás. — [WOPC: Naipes Casino](https://wopc.co.uk/argentina/justorodero/casino); el IPCS lo resume como "moneda coronada con banderas sobre una plataforma decorativa con símbolos mercantiles" ([IPCS PS-21](https://i-p-c-s.org/pattern/ps-21.html))
- As de espadas Fournier: una sola espada grande en diagonal, hoja azul y cintas enrolladas. As de bastos Fournier: un único garrote grande y nudoso en diagonal, en verde con franjas de color. — imágenes en [marcoELE p. 2](https://marcoele.com/descargas/12/otero-baraja.pdf)
- En barajas catalanas antiguas, el as de espadas aparece sostenido por dos leones. — resultado de búsqueda sobre [WOPC: XV-century Spanish-suited cards](https://www.wopc.co.uk/spain/xv-century-spanish-suited-playing-cards) (es un dato histórico, no del patrón moderno)

### Inferencias
- Para que se lea al instante, el **1 de espada y el 1 de basto** tienen que ser la carta más "llena" de su palo: un solo emblema gigante en diagonal, con adornos (cintas, laureles, un escudo). Así se distinguen de los anchos falsos (1 de copa y 1 de oro), que también llevan un solo símbolo grande. Lo que no puede pasar es que el ancho de espada parezca "una espada más".
- Un mazo propio puede destacar los cuatro bravos (1E, 1B, 7E, 7O) con un brillo sutil, un marco dorado o un fondo con aura. Eso es una decisión de diseño del juego. No encontré ninguna fuente que lo documente como tradición, aunque es coherente con la importancia que les dan las señas.
- Conviene que el 7 de espada y el 7 de oro conserven la distribución normal de 7 símbolos (no un emblema único), para no romper la lectura de "es un 7". El realce tiene que ser un adorno, no otra composición.

### Gaps
- No encontré documentación del as de espadas y el as de bastos del patrón Casino argentino (el de WOPC solo describe el as de oros).
- No encontré pruebas de que las barajas comerciales argentinas destaquen los sietes bravos con un diseño especial.

## 4. Figuras: sota (10), caballo (11) y rey (12). El mazo del usuario solo usa el 11 y el 12

### Takeaway
Las figuras son de cuerpo entero, sin letras, identificadas por el número y la pinta. El **caballo** es un jinete montado que levanta el símbolo de su palo. El **rey** es un rey coronado (en Fournier, con barba) de pie, que sostiene el símbolo. Como no hay sotas, no hay confusión posible con el 10, pero conviene que el 11 y el 12 se distingan solo por su silueta: caballo contra persona de pie.

### Hallazgos citados
- La sota equivale a la J y suele ser un paje o escudero. El caballo es un caballero ("horse"). El rey es el rey. Algunas barajas históricas tenían reina. — [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)
- Los caballos pueden llevar caballeros o amazonas. — [Wikipedia ES](https://es.wikipedia.org/wiki/Baraja_espa%C3%B1ola)
- Patrón catalán moderno: a los reyes se les ven las pantorrillas bajo la túnica; las figuras suelen ser lampiñas, de expresión juvenil y suave. — [IPCS PS-21](https://i-p-c-s.org/pattern/ps-21.html)
- Patrón nacional español (antiguo catalán): los reyes llevan túnicas largas que llegan hasta la pinta, y en el caballo de copas a veces aparece la inscripción "AHI VA". — [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)
- Fournier: reyes con barba y trajes pseudomedievales. — [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)
- Imágenes Fournier: el caballo de copas, sobre un caballo marrón, levanta la copa con un brazo; el rey de espadas, con corona, barba blanca y capa azul y roja, sostiene la espada en vertical. — [marcoELE p. 2](https://marcoele.com/descargas/12/otero-baraja.pdf)
- En el patrón Maciá, el caballo de copas mira a la derecha y el de espadas a la izquierda, aunque a veces aparecen invertidos. — [IPCS PS-24](https://i-p-c-s.org/pattern/ps-24.html)

### Inferencias
- Plantilla para el **caballo (11)**: jinete de cuerpo entero sobre un caballo de perfil (o en tres cuartos), con el símbolo del palo bien visible y levantado. El objeto debe ser grande y del color de su palo, y el caballo debe caber entero dentro del recuadro.
- Plantilla para el **rey (12)**: figura de pie, de frente o en tres cuartos, con corona, túnica larga y el símbolo en la mano (espada en vertical, basto al hombro, copa en alto, moneda en la palma).
- Las figuras no deben llevar números ni letras dentro del dibujo: el índice se agrega en postproducción.

### Gaps
- No encontré una descripción completa de qué sostiene cada figura del patrón Casino (en qué mano y en qué postura).

## 5. Diseños de referencia y su estado legal; particularidades argentinas

### Takeaway
En Argentina lo que más se ve es el **patrón catalán moderno** que imprime **Naipes Casino** (Justo Rodero e Hijos, Buenos Aires), además del **castellano de Fournier**, que se copia mucho en Latinoamérica. Los "patrones estándar" se consideran de dominio público, pero las marcas (Fournier, Casino) y las ilustraciones concretas de cada fabricante no se deben copiar: lo seguro es usar solo las convenciones (palos, pintas, distribución, índices) con arte propio.

### Hallazgos citados
- Diseño castellano de Fournier: se encargó a Emilio Soubrier e Ignacio Díaz de Olano (las fechas varían entre 1875 y 1880 según la fuente) y Augusto Rius lo rediseñó en 1889. Esa versión de Rius es la que sigue en uso, y ese mismo año ganó un premio en la Exposición Universal de París. — [WOPC: Castilian pattern](https://wopc.co.uk/spain/castilian); [Hispanopedia: Naipes Heraclio Fournier](https://es.hispanopedia.com/wiki/Naipes_Heraclio_Fournier); [marcoELE p. 3](https://marcoele.com/descargas/12/otero-baraja.pdf) (que da 1877 como fecha del encargo). Wikipedia ES mezcla fechas (1868, 1878) y no es coherente.
- El patrón castellano es de estilo "fantasía medieval", se exportó mucho y está "ampliamente plagiado y copiado en Latinoamérica". — [WOPC: Castilian](https://wopc.co.uk/spain/castilian)
- La marca Fournier pasó a la USPC en 1986 y a Cartamundi el 31/12/2019, así que hoy es una marca comercial vigente. — fragmentos de búsqueda ([laps4.com](https://www.laps4.com/preguntas-y-respuestas/quien-creo-la-baraja-espanola)); WOPC confirma que hoy forma parte de Cartamundi ([WOPC](https://wopc.co.uk/spain/castilian))
- Naipes Casino Estilo Español (40 o 48 cartas) es "la versión típica del patrón catalán español que se usa en Sudamérica, sobre todo en Argentina y Uruguay". Justo Rodero, inmigrante español, fundó la empresa en 1930 y exporta a Uruguay, Paraguay y Chile. Naipes Habana usa exactamente el mismo diseño. — [WOPC: Naipes Casino](https://wopc.co.uk/argentina/justorodero/casino); [WOPC: Justo Rodero](https://wopc.co.uk/argentina/justorodero)
- **Particularidad argentina:** "Naipes Casino Estilo Argentino" (desde 1949) cambia los símbolos estándar por **símbolos gauchescos**. Es un precedente de mazo temático que los argentinos ya conocen. — [WOPC: Justo Rodero / Argentino](https://wopc.co.uk/argentina/justorodero/argentino)
- En Argentina también se fabrican cartas de patrón napolitano, de 50 cartas y con pinta. — [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)
- Wikipedia ES nombra a Justo Rodero e Hijos SAIC (Casino) como la principal productora argentina. — [Wikipedia ES](https://es.wikipedia.org/wiki/Baraja_espa%C3%B1ola)
- Los patrones estándar son diseños de dominio público que imprimieron varios fabricantes. — [Wikipedia EN](https://en.wikipedia.org/wiki/Spanish-suited_playing_cards)
- Recursos en Wikimedia Commons: "Baraja española completa.png" (autor Basquetteur, 2014, patrón castellano redibujado) está bajo **CC BY-SA 3.0** (exige atribución y compartir igual), así que **no** es dominio público. "Baraja-aces.jpg" (fotografía de ases Fournier) la liberó al dominio público su autor, pero eso cubre la foto, no necesariamente el diseño. — [Commons: Baraja española completa.png](https://commons.wikimedia.org/wiki/File:Baraja_espa%C3%B1ola_completa.png); resultado de búsqueda en [Category:SVG playing cards](https://c.enwp.org/wiki/Category:SVG_playing_cards)

### Inferencias
- Para un mazo "100 % propio", basta con usar Fournier y Casino como **referencia de convenciones**, no de trazo. Mejor no meter textos de marca ("HERACLIO FOURNIER", "VITORIA", "CASINO") en el as de oros: hay que poner un emblema propio (por ejemplo, el logo de ChainTable en la moneda).
- La paleta de copas tipo huevera en amarillo y verde (catalán, Casino) o el cáliz rojo y dorado (Fournier) son las dos referencias que un argentino reconoce. Hay que elegir una y mantenerla en todo el mazo.

### Gaps
- No pude confirmar la fecha de muerte de Augusto Rius, así que no sé si sus ilustraciones concretas están en dominio público. Eso hace falta para saber si se pueden calcar.
- No encontré una licencia explícita para el diseño Casino. Hay que asumir que su arte tiene derechos.

## 6. Errores comunes al generar barajas con IA y buenas prácticas

### Takeaway
Las fuentes sobre generación con IA son blogs de proveedores, no estudios. Aun así coinciden en tres cosas: fijar un bloque de estilo idéntico en cada prompt, usar imágenes de referencia y **no** pedirle texto al modelo (los índices se agregan después en vector).

### Hallazgos citados
- Usar la misma estructura de prompt para cada carta y nombrar el estilo artístico cada vez. — [Microsoft Create: tarot cohesivo con Image Creator](https://create.microsoft.com/ar-sa/learn/articles/create-a-cohesive-tarot-card-deck-with-image-creator)
- Un bloque fijo que se pega en cada prompt (técnica, paleta, tipo de línea, ambiente), el encuadre idéntico en todas las cartas y una paleta limitada de 3 a 5 colores. — [MagicShot: diseñar un mazo con IA](https://magicshot.ai/blog/how-to-design-a-tarot-or-oracle-deck-with-ai)
- Subir una imagen de referencia clara, nombrarla en el prompt y decir qué debe cambiar. No conviene alternar a mitad del proyecto entre generar desde cero y generar desde una imagen semilla. — [eduMe: buenas prácticas](https://help.edume.com/ai-image-generation-best-practices)
- El texto generado no es fiable: hay que pedir la carta limpia y agregar el texto con una herramienta de diseño (primero el layout, después el estilo, el texto al final o nunca). — [Yingtu: AI tarot card generator](https://yingtu.ai/en/blog/ai-tarot-card-generator); [Promptzone: trading card](https://www.promptzone.com/khalid_laurent/turning-a-reference-photo-into-a-trading-card-illustration-52fh.md)
- Midjourney permite compartir estilo con el parámetro `--sref` (códigos de referencia de estilo). — síntesis de búsqueda (la fuente concreta es comercial, [Gumroad](https://simplifyerx.gumroad.com/l/aistyles24))

### Inferencias (prácticas recomendadas para este mazo)
- **Riesgo n.º 1: que se cuele la baraja francesa.** Hay que prohibir de forma explícita "hearts, spades, diamonds, clubs, French suits, poker card, letters J Q K A" (en el negative prompt, si el modelo lo admite) y nombrar los objetos de forma literal: "straight sword", "knotted wooden cudgel", "gold coin", "chalice/goblet".
- **Riesgo n.º 2: que el número de símbolos salga mal.** Los modelos difusivos cuentan mal por encima de 3 o 4 objetos. Conviene generar **un solo símbolo por palo** (en alta resolución y con fondo transparente) y armar las cartas del 2 al 7 por composición (con código o vectores) según la tabla de la sección 2. Solo los ases y las figuras (11 y 12) se generan como ilustraciones completas. Con esto bajan los prompts de 36 a unos 4 símbolos + 4 ases + 8 figuras = 16 imágenes.
- **Riesgo n.º 3: texto deformado.** No hay que pedir números, nombres ni marcas al modelo. Los índices (1 a 7, 11, 12), las pintas y el marco se agregan en postproducción como capa vectorial idéntica en todas las cartas.
- **Coherencia:** fijar la relación de aspecto, el bloque de estilo, la paleta y la iluminación; generar palo por palo; reutilizar la semilla o la referencia de estilo, y aprobar primero el as de cada palo como ancla visual.
- **Figuras:** hay que describir la pose y el objeto del palo de forma explícita ("king standing, full body, holding a single upright straight sword in right hand") y pedir "single figure, full body, not mirrored, not double-headed" para que el modelo no copie el diseño reversible del póker.

### Gaps
- No encontré ninguna fuente fiable y verificada sobre el uso de semillas fijas para que un mazo salga coherente. Son prácticas de comunidad, no documentación.
- No encontré guías específicas para generar barajas españolas con IA. Los errores que enumero (palos franceses, conteo) son deducción a partir de cómo funcionan los modelos.

## 7. Proporciones y recomendaciones para el juego digital

### Takeaway
La baraja española física mide unos **62 × 95 mm** (castellana; la catalana, 61 × 95), es decir, una relación de aspecto de ≈ 1 : 1,53 (≈ 2 : 3,06). En digital hay que mantener esa proporción con esquinas redondeadas y un margen de seguridad para el índice y la pinta.

### Hallazgos citados
- Medidas: castellana 95 × 62 mm; Cádiz 95 × 62 mm; catalana 95 × 61 mm (los modelos italianos varían, por ejemplo Nápoles 65 × 44). — [Wikipedia ES](https://es.wikipedia.org/wiki/Baraja_espa%C3%B1ola)
- Versiones del mazo: 40 cartas (1 a 7 más 10, 11 y 12, sin 8 ni 9), 48, 50 (con dos comodines) y 55. — [Wikipedia ES](https://es.wikipedia.org/wiki/Baraja_espa%C3%B1ola)

### Inferencias
- Lienzo recomendado para generar y exportar: **620 × 950 px** (1×) o **1240 × 1900 px** (2×), proporción 62:95. Si el modelo solo admite relaciones estándar, conviene generar en 2:3 y recortar o extender el fondo.
- Radio de esquina de unos 3 a 4 mm en escala real (≈ 5 a 6 % del ancho). Las barajas físicas tienen esquinas redondeadas; lo veo en las fotos, pero no tengo una fuente con la medida.
- Margen de seguridad: el recuadro de la pinta va a unos 4 a 5 mm del borde (≈ 7 % del ancho), con el índice dentro, arriba a la izquierda, y el ilustrador debe dejar libres esas zonas. Que el símbolo central no invada el marco.
- Para la legibilidad en móvil: en abanico se suele ver solo la esquina superior izquierda, así que el índice y algún indicador de palo (un mini símbolo junto al número) tienen que leerse bien a unos 40 px de ancho de carta. Agregar ese mini símbolo junto al índice es una ayuda digital y no es tradicional, pero no rompe la lectura.

### Gaps
- No encontré una fuente con el radio de esquina ni con los márgenes de impresión estándar de Fournier o Casino.
