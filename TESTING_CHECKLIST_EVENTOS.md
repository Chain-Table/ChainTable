# 📋 CHECKLIST DE EVENTOS DEL CONTRATO - Testing End-to-End

## Información del Contrato
- **Dirección**: `0xC34055c565B5789f05dec44585f074d1009Feb89`
- **Red**: Sepolia Testnet
- **Etherscan**: https://sepolia.etherscan.io/address/0xC34055c565B5789f05dec44585f074d1009Feb89

## Eventos del Contrato UnoLobby

El contrato emite los siguientes eventos:

### 1. `LobbyCreated`
```solidity
event LobbyCreated(uint256 indexed lobbyId, address indexed creator, address token, uint256 entryFee, uint16 maxPlayers, Mode mode);
```

### 2. `PlayerJoined`
```solidity
event PlayerJoined(uint256 indexed lobbyId, address indexed player);
```

### 3. `LobbyEnded`
```solidity
event LobbyEnded(uint256 indexed lobbyId, address indexed endedBy, address[] winners);
```

### 4. `Payout`
```solidity
event Payout(uint256 indexed lobbyId, address indexed to, uint256 amount);
```

### 5. `FeeTaken`
```solidity
event FeeTaken(uint256 indexed lobbyId, address indexed to, uint256 amount);
```

---

## 🧪 FLUJO DE TESTING COMPLETO

### FASE 1: Crear Lobby On-Chain

#### Acción del Usuario:
1. ✅ Conectar MetaMask (cuenta A)
2. ✅ Ir a página de Lobbies
3. ✅ Crear lobby con:
   - **Red**: Sepolia
   - **Token**: ETH (nativo)
   - **Entry Fee**: 0.0001 ETH
   - **Max Players**: 2
   - **Mode**: BEAST (95%/5%)
   - **Tipo**: PAID

#### Eventos Esperados en el Contrato:

- [ ] **1 evento `LobbyCreated`**
  - **Verificar en Etherscan**:
    - `lobbyId`: Anotar el número (ej: 17, 18, etc.)
    - `creator`: Dirección de tu cuenta A
    - `token`: `0x0000000000000000000000000000000000000000` (nativo)
    - `entryFee`: `100000000000000` (0.0001 ETH en wei)
    - `maxPlayers`: `2`
    - `mode`: `0` (BEAST)

#### Logs del Servidor Esperados:
```
✅ Lobby creado on-chain. Lobby ID local: xxx, On-chain Lobby ID: [lobbyId del evento]
✅ Player creator has walletAddress: 0x... (cuenta A)
```

#### Datos a Anotar:
- **Lobby ID On-Chain**: ___________
- **Tx Hash createLobby**: ___________
- **Cuenta A (Creator)**: ___________

---

### FASE 2: Unirse al Lobby (Jugador 2)

#### Acción del Usuario:
1. ✅ Cambiar a cuenta B en MetaMask
2. ✅ Refrescar lista de lobbies
3. ✅ Ver lobby creado en la lista
4. ✅ Click en "Unirse" (pagará 0.0001 ETH)

#### Eventos Esperados en el Contrato:

- [ ] **1 evento `PlayerJoined`**
  - **Verificar en Etherscan**:
    - `lobbyId`: Mismo número que en FASE 1
    - `player`: Dirección de cuenta B

#### Logs del Servidor Esperados:
```
✅ Player joined: { username: '...', walletAddress: '0x...' } <- DEBE TENER walletAddress
✅ Player verified on-chain in lobby [lobbyId]
✅ Lobby players count: 2/2
```

#### Datos a Anotar:
- **Tx Hash joinLobby**: ___________
- **Cuenta B (Player 2)**: ___________

#### ⚠️ VERIFICACIÓN CRÍTICA:
El log del servidor **DEBE** mostrar `walletAddress: '0x...'` para ambos jugadores, NO debe ser un username.

---

### FASE 3: Iniciar y Jugar la Partida

#### Acción del Usuario:
1. ✅ Ambos jugadores marcan "Ready"
2. ✅ Partida inicia automáticamente
3. ✅ Jugar hasta que haya un ganador

#### Eventos Esperados:
- **NO hay eventos en el contrato durante el juego** (el juego es off-chain)

#### Logs del Servidor Esperados:
```
✅ Partida iniciada para lobby [lobbyId]
✅ Jugadores: [...]
✅ Ganador: { username: '...', walletAddress: '0x...' }
```

---

### FASE 4: Distribución de Premios (CRÍTICA)

#### Acción Automática del Servidor:
- Al terminar el juego, el servidor llama automáticamente a `contract.endLobby(lobbyId, [winnerAddress])`

#### Eventos Esperados en el Contrato:

##### MODO BEAST (1 ganador):

- [ ] **1 evento `FeeTaken`** (comisión 5%)
  - **Verificar**:
    - `lobbyId`: Mismo número
    - `to`: `devWallet` address
    - `amount`: `10000000000000` (5% de 0.0002 ETH total = 0.00001 ETH)

- [ ] **1 evento `Payout`** (premio al ganador 95%)
  - **Verificar**:
    - `lobbyId`: Mismo número
    - `to`: Dirección del **ganador** (cuenta A o B)
    - `amount`: `190000000000000` (95% de 0.0002 ETH = 0.00019 ETH)

- [ ] **1 evento `LobbyEnded`**
  - **Verificar**:
    - `lobbyId`: Mismo número
    - `endedBy`: Dirección del servidor autorizado
    - `winners`: Array con **1 dirección** (0x... del ganador)
      - ⚠️ **CRÍTICO**: NO debe ser array vacío `[]`
      - ⚠️ **CRÍTICO**: Debe ser dirección Ethereum válida, NO username

#### Logs del Servidor Esperados:
```
✅ [PRIZE DEBUG] game.winners: [{ username: '...', walletAddress: '0x...' }]
✅ [PRIZE DEBUG] game.players with walletAddress: 
    Player 0: walletAddress = 0x...
    Player 1: walletAddress = 0x...
✅ Distributing prizes for onchainLobbyId: [lobbyId]
✅ Distributing prizes for winners: ['0x...'] <- DEBE tener dirección válida
✅ Transaction hash: 0x...
```

#### Datos a Anotar:
- **Tx Hash endLobby**: ___________
- **Ganador Address**: ___________
- **Premio Recibido**: ___________
- **Fee Recibido (devWallet)**: ___________

---

## 🔍 VERIFICACIÓN EN ETHERSCAN

### Para cada transacción, verificar:

#### 1. **Transacción `createLobby`**
```
URL: https://sepolia.etherscan.io/tx/[TX_HASH]

Eventos:
✅ LobbyCreated con lobbyId correcto
```

#### 2. **Transacción `joinLobby`**
```
URL: https://sepolia.etherscan.io/tx/[TX_HASH]

Eventos:
✅ PlayerJoined con player correcto
```

#### 3. **Transacción `endLobby`** ⭐ MÁS IMPORTANTE
```
URL: https://sepolia.etherscan.io/tx/[TX_HASH]

Eventos ESPERADOS (debe tener los 3):
✅ FeeTaken    - devWallet recibe 5%
✅ Payout      - ganador recibe 95%
✅ LobbyEnded  - con winners array NO vacío

VERIFICAR en "Logs" tab:
- Cantidad de logs: DEBE ser 3 (no solo 1)
- Decodificar datos del evento LobbyEnded:
  - winners[0] DEBE ser una dirección 0x... válida
  - winners array DEBE tener length = 1
```

---

## ❌ PROBLEMAS CONOCIDOS (YA RESUELTOS)

### Problema 1: ABI Incorrecto ✅ RESUELTO
- **Síntoma**: Error "data signature does not match function"
- **Causa**: Frontend llamaba `endLobby(lobbyId, winners, mode)` pero contrato espera `endLobby(lobbyId, winners)`
- **Solución**: Corregido en `src/hooks/useGame.ts`

### Problema 2: Join Incorrecto ✅ RESUELTO
- **Síntoma**: `PlayerJoined` evento no aparece
- **Causa**: Frontend usaba `sendTransaction` en vez de `contract.joinLobby()`
- **Solución**: Corregido en `src/pages/Lobbies.tsx`

### Problema 3: Winners Array Vacío ✅ RESUELTO
- **Síntoma**: `endLobby` se ejecuta pero sin eventos `Payout`
- **Causa**: `game.winners[].walletAddress` era `undefined`
- **Razón**: Cliente no enviaba `walletAddress` al servidor
- **Solución**: Actualizado `socketService.ts` y `useSocket.ts` para enviar walletAddress

---

## 🎯 CRITERIOS DE ÉXITO

Para considerar el testing exitoso, **TODAS** estas condiciones deben cumplirse:

### ✅ Fase 1 - Creación
- [ ] Evento `LobbyCreated` aparece en Etherscan
- [ ] Lobby ID se extrae correctamente del evento
- [ ] Servidor muestra "On-chain Lobby ID: [número]"

### ✅ Fase 2 - Join
- [ ] Evento `PlayerJoined` aparece en Etherscan
- [ ] Servidor muestra `walletAddress: '0x...'` (NO username)
- [ ] Ambos jugadores tienen `walletAddress` válido en logs

### ✅ Fase 3 - Juego
- [ ] Partida inicia sin errores
- [ ] Ganador determinado correctamente
- [ ] Servidor registra ganador con `walletAddress`

### ✅ Fase 4 - Premios (CRÍTICO)
- [ ] Transacción `endLobby` se ejecuta sin revert
- [ ] Aparecen **3 eventos** en Etherscan:
  - [ ] `FeeTaken` (5% a devWallet)
  - [ ] `Payout` (95% a ganador)
  - [ ] `LobbyEnded` (con winners array NO vacío)
- [ ] Balance del ganador aumenta en ~0.00019 ETH
- [ ] Balance de devWallet aumenta en ~0.00001 ETH
- [ ] Balance del contrato NO aumenta (se distribuye todo)

### ⚠️ RED FLAGS - Si ves esto, HAY UN PROBLEMA:

❌ **Solo 1 evento en endLobby** (solo `LobbyEnded`, sin `Payout` ni `FeeTaken`)
- Causa: winners array está vacío

❌ **Server log muestra**: `Distributing prizes for winners: []`
- Causa: `game.winners[].walletAddress` es undefined

❌ **Server log muestra**: `walletAddress: undefined` o `walletAddress: 'username123'`
- Causa: Cliente no está enviando walletAddress correctamente

❌ **Balance del contrato aumenta después de endLobby**
- Causa: Premios no se distribuyeron

---

## 📊 MONITOREO DEL BALANCE DEL CONTRATO

Antes de testing:
```bash
cast balance 0xC34055c565B5789f05dec44585f074d1009Feb89 --rpc-url https://eth-sepolia.g.alchemy.com/v2/***REMOVED***_RMOnSv4KFEu
```

Balance actual conocido: **0.001045 ETH** (acumulado de ~70 lobbies sin distribuir)

### Después del testing exitoso:
- Balance **NO debe cambiar** si solo haces 1 lobby de 0.0002 ETH y lo distribuyes
- O si distribuimos los fondos atrapados, el balance debe **disminuir** a casi 0

---

## 🚀 COMANDOS ÚTILES PARA TESTING

### 1. Verificar balance del contrato:
```bash
cast balance 0xC34055c565B5789f05dec44585f074d1009Feb89 --rpc-url https://eth-sepolia.g.alchemy.com/v2/***REMOVED***_RMOnSv4KFEu
```

### 2. Ver logs de una transacción:
```bash
cast receipt [TX_HASH] --rpc-url https://eth-sepolia.g.alchemy.com/v2/***REMOVED***_RMOnSv4KFEu
```

### 3. Ver jugadores de un lobby:
```bash
cast call 0xC34055c565B5789f05dec44585f074d1009Feb89 "getLobbyPlayers(uint256)" [LOBBY_ID] --rpc-url https://eth-sepolia.g.alchemy.com/v2/***REMOVED***_RMOnSv4KFEu
```

### 4. Reiniciar servidor con logs:
```bash
cd server && node server.js
```

### 5. Ver logs del servidor en tiempo real:
```bash
tail -f server/logs.txt  # si lo configuraste
# O simplemente observa la terminal donde corre el servidor
```

---

## 📝 PLANTILLA DE REPORTE DE TESTING

```markdown
## Testing Report - [Fecha]

### Lobby Testeado
- Lobby ID On-Chain: ___
- Creator: 0x___
- Player 2: 0x___
- Entry Fee: 0.0001 ETH
- Mode: BEAST

### Transacciones
- createLobby: https://sepolia.etherscan.io/tx/0x___
- joinLobby: https://sepolia.etherscan.io/tx/0x___
- endLobby: https://sepolia.etherscan.io/tx/0x___

### Eventos Verificados
- [x] LobbyCreated
- [x] PlayerJoined
- [x] FeeTaken
- [x] Payout
- [x] LobbyEnded

### Distribución de Premios
- Ganador: 0x___
- Premio recibido: 0.00019 ETH ✅
- Fee devWallet: 0.00001 ETH ✅
- Winners array en endLobby: ['0x___'] ✅

### Resultado: ✅ ÉXITO / ❌ FALLO
```

---

## 🔧 PRÓXIMOS PASOS SI FALLA

Si el testing falla:

1. **Verificar logs del servidor** - buscar walletAddress undefined
2. **Verificar código en browser console** - ver qué se envía al servidor
3. **Revisar getUserSession()** - confirmar que tiene walletAddress
4. **Verificar socketService** - confirmar que emite walletAddress
5. **Reiniciar servidor** - asegurar que tiene el código actualizado

---

**Última actualización**: 11 de octubre de 2025
**Contrato**: UnoLobby v1.0
**Red**: Sepolia Testnet
