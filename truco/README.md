# Truco

Truco argentino para ChainTable. Usa la misma plataforma que el UNO (mesas, sesiones, sockets, contrato de mesas pagas); esta carpeta guarda lo que es propio del truco.

## Alcance

- Modos: **1 vs 1**, **2 vs 2** y **3 vs 3**.
- **Sin flor**.
- Mazo de **36 cartas**: del 1 al 7, 11 y 12 de espadas, bastos, oros y copas (sin 8, 9 ni 10).
- Partidas a **15 o 30** puntos, a elección del host.

## Contenido

| Ruta | Qué hay |
|---|---|
| [`engine/`](engine/) | Motor del juego: módulo puro (sin sockets ni relojes) con `createMatch`, `act`, `timeout`, `nextHand` y `view`. Tests: `npm run test:truco`. |
| [`docs/reglas.md`](docs/reglas.md) | Reglas completas para implementar: jerarquía, envido, bazas y pardas, cantos y puntos, equipos y pica-pica, máquina de estados de la mano, defaults recomendados y riesgo legal de las mesas pagas. |
| [`docs/prompts-cartas.md`](docs/prompts-cartas.md) | Los 16 prompts para generar el mazo, ya armados para copiar y pegar. |
| [`docs/investigacion/`](docs/investigacion/) | Notas de investigación con las fuentes de cada regla. |

## Plan

1. Motor del juego en `engine/`: módulo puro (sin sockets), con tests de reglas.
2. Integración en el servidor: selector de juego al crear la mesa y el motor enchufado en `server/server.js`.
3. Mesa del truco en el frontend, más el arte de las cartas.
4. Contrato: modo de reparto en partes iguales para equipos, antes del primer deploy.
5. Mesas pagas de truco, después de la consulta legal.
