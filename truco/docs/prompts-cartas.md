# Prompts para las cartas del truco

Prompts listos para copiar y pegar: cada bloque es un prompt completo. Salen del apéndice de [`reglas.md`](reglas.md#apéndice-prompt-para-generar-las-cartas), que explica el porqué de cada decisión.

## Cómo usarlos

1. Generá primero el **as de cada palo** y elegí el que más te guste: ese es el ancla de estilo de su palo.
2. Pasale al modelo 2 o 3 cartas del UNO (`public/cards/`) como **imagen de referencia de estilo** (en Midjourney, `--sref`).
3. Si el modelo acepta negative prompt, usá el de abajo en todas las imágenes.
4. No le pidas texto ni números al modelo: el marco, las pintas (oros 0 cortes, copas 1, espadas 2, bastos 3) y los números se agregan después como capa vectorial.
5. Las cartas del 2 al 7 no se generan: se arman por código repitiendo el emblema del palo (sección 1).

Formatos: emblemas 1024 × 1024 (fondo transparente si se puede); ases y figuras 1024 × 1536 (`--ar 2:3`).

## Negative prompt

```text
hearts, spades, diamonds, clubs symbols, French playing card suits, poker card, Anglo-American card layout, letters J Q K A, text, letters, numbers, words, captions, logo, brand name, watermark, signature, card frame, border, mirrored double-headed court figure, reversible figure, cropped body, half body, katana, curved sword, sabre, smooth stick, baseball bat, golf club, mug, heart-shaped cup, extra objects, duplicated suit objects, extra limbs, extra fingers, photorealistic, 3D render, gradient background, busy background, texture noise
```

## 1. Emblemas de palo (4)

### 1. Emblema de espadas

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #3e8cc4. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a STRAIGHT double-edged European sword (Spanish-deck style): light steel-blue blade, gold crossguard and pommel, short red-and-gold ribbon on the grip. Never a katana, never a curved sabre. A single straight double-edged sword alone, isolated, perfectly upright and vertical, centered, front view, filling 80% of the canvas height, no characters, no hands, nothing else in the scene. Transparent background (or the flat #3e8cc4 background if transparency is not supported).
```

### 2. Emblema de bastos

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #65d50d. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a thick KNOTTED wooden cudgel (rustic club with knobbly bumps), warm brown wood, a few small green leaves sprouting, one red and one yellow band. Never a smooth stick, baton, bat or golf club. A single knotted wooden cudgel alone, isolated, perfectly upright and vertical, centered, front view, filling 80% of the canvas height, no characters, no hands, nothing else in the scene. Transparent background (or the flat #65d50d background if transparency is not supported).
```

### 3. Emblema de copas

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #e93540. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is an upright golden CHALICE / goblet on a short stem and flat foot, with a few blue gems on the bowl. Never a mug, never a heart shape. A single golden chalice alone, isolated, perfectly upright and vertical, centered, front view, filling 80% of the canvas height, no characters, no hands, nothing else in the scene. Transparent background (or the flat #e93540 background if transparency is not supported).
```

### 4. Emblema de oros

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #ffc107. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a thick round GOLD COIN with a raised rim, rich amber and orange gold tones with dark brown engraving lines and a small red ring around the center, the center medallion left blank and smooth. Never a diamond shape, never a sun with a face. A single gold coin alone, isolated, perfectly upright and vertical, centered, front view, filling 80% of the canvas height, no characters, no hands, nothing else in the scene. Transparent background (or the flat #ffc107 background if transparency is not supported).
```

## 2. Ases (4)

### 5. 1 de espada

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #3e8cc4. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a STRAIGHT double-edged European sword (Spanish-deck style): light steel-blue blade, gold crossguard and pommel, short red-and-gold ribbon on the grip. Never a katana, never a curved sabre. ACE OF SWORDS, the most prestigious card of the deck: ONE single huge straight double-edged sword placed diagonally from lower-left to upper-right, filling most of the card, ornate gold crossguard, long red and gold ribbons wrapped around the blade, a laurel wreath at the base, a few small sparkles. Exactly one sword, nothing else.
```

### 6. 1 de basto

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #65d50d. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a thick KNOTTED wooden cudgel (rustic club with knobbly bumps), warm brown wood, a few small green leaves sprouting, one red and one yellow band. Never a smooth stick, baton, bat or golf club. ACE OF CLUBS (Spanish deck): ONE single huge knotted wooden cudgel placed diagonally from lower-left to upper-right, filling most of the card, fresh green leaves sprouting from the knots, red and yellow ribbons wrapped around it, a laurel wreath at the base. Exactly one cudgel, nothing else.
```

### 7. 1 de copa

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #e93540. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is an upright golden CHALICE / goblet on a short stem and flat foot, with a few blue gems on the bowl. Never a mug, never a heart shape. ACE OF CUPS (Spanish deck): ONE single large upright golden chalice centered, elegant but simple, blue gems on the bowl, small decorative leaves at the foot. Less ornate than a royal emblem. Exactly one chalice, nothing else.
```

### 8. 1 de oro

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #ffc107. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a thick round GOLD COIN with a raised rim, rich amber and orange gold tones with dark brown engraving lines and a small red ring around the center, the center medallion left blank and smooth. Never a diamond shape, never a sun with a face. ACE OF COINS (Spanish deck): ONE single large gold coin centered, a small crown on top, two short ribbons flowing from the sides, a laurel branch below, the coin's center medallion completely blank and smooth. Exactly one coin, nothing else.
```

## 3. Reyes — 12 (4)

### 9. Rey de espada

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #3e8cc4. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a STRAIGHT double-edged European sword (Spanish-deck style): light steel-blue blade, gold crossguard and pommel, short red-and-gold ribbon on the grip. Never a katana, never a curved sabre. Single figure, FULL BODY from head to feet fully visible (for horses: all four legs and hooves visible), standing on a simple soft ground shadow, figure fills about 75% of the canvas height, not mirrored, not double-headed, not a reversible court card, the suit object large, clearly visible and in its suit colors, exactly ONE suit object in the image. A cartoon samurai-like cat wearing a straw hat with a small gold crown on top of the hat as a KING, standing upright in three-quarter view, golden crown, long royal robe reaching the ankles, holding a single straight double-edged sword upright in the right hand, point up.
```

### 10. Rey de basto

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #65d50d. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a thick KNOTTED wooden cudgel (rustic club with knobbly bumps), warm brown wood, a few small green leaves sprouting, one red and one yellow band. Never a smooth stick, baton, bat or golf club. Single figure, FULL BODY from head to feet fully visible (for horses: all four legs and hooves visible), standing on a simple soft ground shadow, figure fills about 75% of the canvas height, not mirrored, not double-headed, not a reversible court card, the suit object large, clearly visible and in its suit colors, exactly ONE suit object in the image. A cartoon gorilla wearing dark sunglasses as a KING, standing upright in three-quarter view, golden crown, long royal robe reaching the ankles, resting a single knotted wooden cudgel on the shoulder.
```

### 11. Rey de copa

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #e93540. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is an upright golden CHALICE / goblet on a short stem and flat foot, with a few blue gems on the bowl. Never a mug, never a heart shape. Single figure, FULL BODY from head to feet fully visible (for horses: all four legs and hooves visible), standing on a simple soft ground shadow, figure fills about 75% of the canvas height, not mirrored, not double-headed, not a reversible court card, the suit object large, clearly visible and in its suit colors, exactly ONE suit object in the image. A cartoon bear holding a smartphone with a blank screen in one hand as a KING, standing upright in three-quarter view, golden crown, long royal robe reaching the ankles, raising a single golden chalice high with the other hand.
```

### 12. Rey de oro

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #ffc107. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a thick round GOLD COIN with a raised rim, rich amber and orange gold tones with dark brown engraving lines and a small red ring around the center, the center medallion left blank and smooth. Never a diamond shape, never a sun with a face. Single figure, FULL BODY from head to feet fully visible (for horses: all four legs and hooves visible), standing on a simple soft ground shadow, figure fills about 75% of the canvas height, not mirrored, not double-headed, not a reversible court card, the suit object large, clearly visible and in its suit colors, exactly ONE suit object in the image. A cartoon anthropomorphic bull with small horns as a KING, standing upright in three-quarter view, golden crown, long royal robe reaching the ankles, presenting a single big gold coin on the open palm.
```

## 4. Caballos — 11 (4)

### 13. Caballo de espada

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #3e8cc4. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a STRAIGHT double-edged European sword (Spanish-deck style): light steel-blue blade, gold crossguard and pommel, short red-and-gold ribbon on the grip. Never a katana, never a curved sabre. Single figure, FULL BODY from head to feet fully visible (for horses: all four legs and hooves visible), standing on a simple soft ground shadow, figure fills about 75% of the canvas height, not mirrored, not double-headed, not a reversible court card, the suit object large, clearly visible and in its suit colors, exactly ONE suit object in the image. A cartoon shiba inu dog in light armor as a KNIGHT riding a chunky cartoon horse shown in side view, the rider holding a single straight double-edged sword raised high above the head.
```

### 14. Caballo de basto

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #65d50d. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a thick KNOTTED wooden cudgel (rustic club with knobbly bumps), warm brown wood, a few small green leaves sprouting, one red and one yellow band. Never a smooth stick, baton, bat or golf club. Single figure, FULL BODY from head to feet fully visible (for horses: all four legs and hooves visible), standing on a simple soft ground shadow, figure fills about 75% of the canvas height, not mirrored, not double-headed, not a reversible court card, the suit object large, clearly visible and in its suit colors, exactly ONE suit object in the image. A cartoon opossum with a folded blank newspaper under one arm as a KNIGHT riding a chunky cartoon horse shown in side view, the rider holding a single knotted wooden cudgel raised high above the head.
```

### 15. Caballo de copa

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #e93540. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is an upright golden CHALICE / goblet on a short stem and flat foot, with a few blue gems on the bowl. Never a mug, never a heart shape. Single figure, FULL BODY from head to feet fully visible (for horses: all four legs and hooves visible), standing on a simple soft ground shadow, figure fills about 75% of the canvas height, not mirrored, not double-headed, not a reversible court card, the suit object large, clearly visible and in its suit colors, exactly ONE suit object in the image. A cartoon sleepy developer character in a hoodie as a KNIGHT riding a chunky cartoon horse shown in side view, the rider holding a single golden chalice (not a mug) raised high above the head.
```

### 16. Caballo de oro

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #ffc107. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is a thick round GOLD COIN with a raised rim, rich amber and orange gold tones with dark brown engraving lines and a small red ring around the center, the center medallion left blank and smooth. Never a diamond shape, never a sun with a face. Single figure, FULL BODY from head to feet fully visible (for horses: all four legs and hooves visible), standing on a simple soft ground shadow, figure fills about 75% of the canvas height, not mirrored, not double-headed, not a reversible court card, the suit object large, clearly visible and in its suit colors, exactly ONE suit object in the image. A cartoon fox in a round astronaut bubble helmet as a KNIGHT riding a chunky cartoon horse shown in side view, the rider holding a single big gold coin raised high above the head.
```

## Plan B: carta numérica completa

Solo si preferís no armar las numéricas por código. Contá los objetos de cada resultado y regenerá si el número está mal. Ejemplo para el **7 de copas** (cambiá el palo, la cantidad y la disposición):

```text
Flat 2D cartoon illustration for a playful crypto/web3 card game, hand-inked bold black outlines with slightly varying line weight, flat colors with soft two-tone cel shading and a thin cool rim light, simple rounded shapes, expressive slightly smug or grumpy faces with heavy-lidded eyes, meme-culture humor, sticker-like look with a thin white die-cut outline around the main subject so it pops on a same-hue background, clean edges, no texture, no gradients in the background, no photorealism, no 3D render. Solid flat background color #e93540. Subject centered, fully visible, the outer 12% of the canvas left completely empty for a frame added later. Absolutely no text, no letters, no numbers, no logos, no watermark, no border, no frame, no card layout. The suit object is an upright golden CHALICE / goblet on a short stem and flat foot, with a few blue gems on the bowl. Never a mug, never a heart shape. A Spanish-suited playing card face illustration (artwork area only): exactly 7 identical golden chalices and nothing else, arranged in two vertical columns of three, plus one more centered between the top row and the middle row. All objects the same size, evenly spaced, upright. Count carefully: exactly 7. No characters, no text, no numbers, no frame, no border.
```

En este caso sacá `duplicated suit objects` del negative prompt.
