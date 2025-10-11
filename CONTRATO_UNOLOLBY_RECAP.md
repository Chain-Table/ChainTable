# 📘 RECAP COMPLETO: Contrato UnoLobby en Sepolia

## 🔧 Información del Contrato

- **Dirección**: `0xC34055c565B5789f05dec44585f074d1009Feb89`
- **Red**: Sepolia Testnet
- **Chain ID**: 11155111
- **Etherscan**: https://sepolia.etherscan.io/address/0xC34055c565B5789f05dec44585f074d1009Feb89

---

## 📋 FUNCIONALIDADES DEL CONTRATO

### 1️⃣ **createLobby(address token, uint256 entryFee, uint16 maxPlayers, Mode mode)**

**Qué hace:**
- Crea un nuevo lobby on-chain
- Incrementa `lobbyCount` y retorna el nuevo `lobbyId`
- NO requiere pago en este momento
- Guarda configuración del lobby

**Parámetros:**
- `token`: `address(0)` para ETH nativo, o dirección de token ERC20
- `entryFee`: Cantidad en wei (ej: 100000000000000 = 0.0001 ETH)
- `maxPlayers`: Número de jugadores (mínimo 2)
- `mode`: `0` = BEAST (1 ganador), `1` = CLASSIC (hasta 3 ganadores)

**Evento emitido:**
```solidity
LobbyCreated(uint256 indexed lobbyId, address indexed creator, address token, uint256 entryFee, uint16 maxPlayers, Mode mode)
```

**Ejemplo de uso:**
```typescript
const tx = await contract.createLobby(
  ethers.ZeroAddress,        // ETH nativo
  ethers.parseEther("0.0001"), // 0.0001 ETH
  3,                          // 3 jugadores máx
  0                           // BEAST mode
);
```

---

### 2️⃣ **joinLobby(uint256 lobbyId)**

**Qué hace:**
- Permite a un jugador unirse a un lobby existente
- **REQUIERE PAGO**: debe enviar el `entryFee` exacto
- Para ETH nativo: enviar value en la transacción
- Para ERC20: debe haber hecho `approve` primero
- Registra al jugador en `lobby.players[]`
- Marca `lobby.joined[player] = true`

**Parámetros:**
- `lobbyId`: ID del lobby a unirse

**Valor a enviar:**
- Si es ETH nativo: `msg.value` debe ser exactamente `entryFee`
- Si es ERC20: `msg.value` debe ser 0, y debe haber aprobado el contrato

**Evento emitido:**
```solidity
PlayerJoined(uint256 indexed lobbyId, address indexed player)
```

**Validaciones:**
- ✅ Lobby debe estar `OPEN` (no `ENDED`)
- ✅ Jugador NO debe haberse unido antes
- ✅ Lobby NO debe estar lleno (`players.length < maxPlayers`)
- ✅ Debe enviar exactamente `entryFee`

**Ejemplo de uso (ETH nativo):**
```typescript
const tx = await contract.joinLobby(lobbyId, {
  value: ethers.parseEther("0.0001")
});
```

---

### 3️⃣ **endLobby(uint256 lobbyId, address[] calldata winners)**

**Qué hace:**
- Finaliza el lobby y distribuye los premios
- Calcula comisión del 5% para `devWallet`
- Distribuye el 95% restante según el modo:
  - **BEAST**: 95% al único ganador
  - **CLASSIC**: 60% / 20% / 15% entre 1-3 ganadores
- Cambia estado del lobby a `ENDED`

**Restricción de acceso:**
- Solo puede llamarlo:
  - El creador del lobby
  - Una dirección autorizada (servidor backend)
  - El owner del contrato

**Parámetros:**
- `lobbyId`: ID del lobby a finalizar
- `winners`: Array de direcciones ganadoras
  - BEAST: **DEBE** tener exactamente 1 ganador
  - CLASSIC: **DEBE** tener entre 1 y 3 ganadores

**Eventos emitidos:**
```solidity
FeeTaken(uint256 indexed lobbyId, address indexed to, uint256 amount)  // 5% a devWallet
Payout(uint256 indexed lobbyId, address indexed to, uint256 amount)    // Premios a ganadores
LobbyEnded(uint256 indexed lobbyId, address indexed endedBy, address[] winners)
```

**Validaciones:**
- ✅ Lobby debe estar `OPEN`
- ✅ Debe haber al menos 2 jugadores
- ✅ Cantidad de ganadores debe ser válida para el modo
- ✅ Todos los ganadores deben haber participado (`joined[winner] == true`)
- ✅ No puede haber ganadores duplicados

**Distribución BEAST (ejemplo con 3 jugadores x 0.0001 ETH = 0.0003 ETH total):**
```
Total pool: 0.0003 ETH
Fee (5%):   0.000015 ETH → devWallet
Prize (95%): 0.000285 ETH → ganador
```

**Distribución CLASSIC (ejemplo con 3 jugadores x 0.0001 ETH = 0.0003 ETH total):**
```
Total pool: 0.0003 ETH
Fee (5%):    0.000015 ETH → devWallet
Remaining:   0.000285 ETH
  - 1st (60%): 0.000171 ETH → ganador[0]
  - 2nd (20%): 0.000057 ETH → ganador[1]
  - 3rd (15%): 0.0000427 ETH → ganador[2]
  - Rounding leftover → devWallet
```

**Ejemplo de uso:**
```typescript
const winners = ["0x1eb8ff5966feb81a5326d311d238370717701ad8"];
const tx = await contract.endLobby(lobbyId, winners);
```

---

### 4️⃣ **cancelLobby(uint256 lobbyId)**

**Qué hace:**
- Cancela un lobby y reembolsa a todos los jugadores
- Cada jugador recibe de vuelta su `entryFee`
- Cambia estado a `ENDED`

**Restricción de acceso:**
- Solo puede llamarlo:
  - El creador del lobby
  - Una dirección autorizada
  - El owner del contrato

**Eventos emitidos:**
```solidity
Payout(uint256 indexed lobbyId, address indexed to, uint256 amount)  // Por cada reembolso
LobbyEnded(uint256 indexed lobbyId, address indexed endedBy, address[] winners) // winners = []
```

---

### 5️⃣ **getLobbyPlayers(uint256 lobbyId) → address[]**

**Qué hace:**
- Retorna array de todas las direcciones que se unieron al lobby
- Función `view` (no cuesta gas, solo lectura)

**Ejemplo de uso:**
```typescript
const players = await contract.getLobbyPlayers(lobbyId);
console.log(players); // ["0xabc...", "0xdef..."]
```

---

### 6️⃣ **setAuthorized(address who, bool ok)** (solo Owner)

**Qué hace:**
- Autoriza/desautoriza direcciones para llamar `endLobby` y `cancelLobby`
- **Uso**: Autorizar el servidor backend para finalizar lobbies automáticamente

**Ejemplo:**
```typescript
// Autorizar servidor backend
await contract.setAuthorized("0xServerAddress", true);
```

---

### 7️⃣ **setDevWallet(address _devWallet)** (solo Owner)

**Qué hace:**
- Cambia la dirección que recibe las comisiones del 5%

---

## 🔍 ESTADOS DEL LOBBY

```solidity
enum LobbyState {
  OPEN,   // 0 - Lobby abierto, se pueden unir jugadores
  ENDED   // 1 - Lobby finalizado, no se puede modificar
}
```

## 🎮 MODOS DE JUEGO

```solidity
enum Mode {
  BEAST,    // 0 - Un solo ganador recibe el 95%
  CLASSIC   // 1 - Hasta 3 ganadores (60%/20%/15%)
}
```

---

## 📊 FLUJO TÍPICO DE UN LOBBY

### Escenario: 3 jugadores, BEAST mode, 0.0001 ETH cada uno

#### 1. **Crear Lobby** (Jugador A)
```typescript
tx = await contract.createLobby(
  ethers.ZeroAddress,           // ETH nativo
  ethers.parseEther("0.0001"),  // Entry fee
  3,                            // Max players
  0                             // BEAST
);
// Evento: LobbyCreated(lobbyId=17, creator=0xbf9a..., ...)
```

#### 2. **Unirse al Lobby** (Jugador A - auto join después de crear)
```typescript
// El creador NO se une automáticamente, debe hacer joinLobby también
tx = await contract.joinLobby(17, { value: ethers.parseEther("0.0001") });
// Evento: PlayerJoined(lobbyId=17, player=0xbf9a...)
```

#### 3. **Otros jugadores se unen** (Jugador B y C)
```typescript
// Jugador B
tx = await contract.joinLobby(17, { value: ethers.parseEther("0.0001") });
// Evento: PlayerJoined(lobbyId=17, player=0x1eb8...)

// Jugador C
tx = await contract.joinLobby(17, { value: ethers.parseEther("0.0001") });
// Evento: PlayerJoined(lobbyId=17, player=0xabc...)
```

**Estado actual del contrato:**
- Balance: 0.0003 ETH
- Lobby 17 players: [0xbf9a..., 0x1eb8..., 0xabc...]

#### 4. **Jugar off-chain** (en el servidor Node.js)
- Los jugadores juegan la partida UNO
- Servidor determina el ganador: 0x1eb8...

#### 5. **Finalizar y Distribuir** (Servidor autorizado)
```typescript
tx = await contract.endLobby(17, ["0x1eb8ff5966feb81a5326d311d238370717701ad8"]);

// Eventos emitidos:
// 1. FeeTaken(lobbyId=17, to=devWallet, amount=0.000015)
// 2. Payout(lobbyId=17, to=0x1eb8..., amount=0.000285)
// 3. LobbyEnded(lobbyId=17, endedBy=server, winners=["0x1eb8..."])
```

**Resultado final:**
- ✅ Ganador (0x1eb8...) recibe: 0.000285 ETH
- ✅ DevWallet recibe: 0.000015 ETH
- ✅ Balance del contrato: 0 ETH (todo distribuido)
- ✅ Lobby 17 state: ENDED

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

### Error: "incorrect value"
**Causa**: El `msg.value` enviado no coincide exactamente con `entryFee`
**Solución**: Enviar el valor exacto en wei
```typescript
// ❌ Mal
contract.joinLobby(17, { value: "100000000000000" }); // string no funciona

// ✅ Bien
contract.joinLobby(17, { value: ethers.parseEther("0.0001") });
```

### Error: "already joined"
**Causa**: La dirección ya llamó `joinLobby` para este lobby
**Solución**: Cada dirección solo puede unirse una vez

### Error: "lobby full"
**Causa**: Ya hay `maxPlayers` jugadores en el lobby
**Solución**: Crear un nuevo lobby

### Error: "lobby not open"
**Causa**: El lobby ya fue finalizado (`state == ENDED`)
**Solución**: No se puede modificar un lobby finalizado

### Error: "Not authorized to end lobby"
**Causa**: La dirección que llama `endLobby` no es:
- El creador
- Una dirección autorizada
- El owner
**Solución**: Autorizar el servidor con `setAuthorized(serverAddress, true)`

### Error: "BEAST needs 1 winner"
**Causa**: En modo BEAST, el array `winners` debe tener exactamente 1 elemento
**Solución**: Pasar solo el ganador: `[winnerAddress]`

### Error: "winner not participant"
**Causa**: Una dirección en el array `winners` no hizo `joinLobby`
**Solución**: Solo incluir direcciones que están en `lobby.players[]`

---

## 🧪 TESTING EN SEPOLIA

### Lobby Actual en Sepolia

Basado en tus transacciones:

**Lobby ID**: 17
**Creator**: `0xbf9a40bf3eeb8c0c9bad4a9a8ad23bed2fa8fd78`
**Entry Fee**: 0.0001 ETH
**Max Players**: 3
**Mode**: BEAST (0)

**Jugadores que se han unido:**
1. ✅ `0x1eb8ff5966feb81a5326d311d238370717701ad8`

**Jugadores que faltan**: 2 más (o mínimo 1 más para poder finalizar)

### ¿Qué falta para completar este lobby?

#### Opción A: Unir más jugadores (RECOMENDADO)
1. El creador (`0xbf9a...`) debe hacer `joinLobby(17)` con 0.0001 ETH
2. O cualquier otra cuenta puede unirse

```typescript
// Desde la cuenta del creador u otra cuenta
await contract.joinLobby(17, { value: ethers.parseEther("0.0001") });
```

#### Opción B: Finalizar con solo 2 jugadores
Si ya tienes 2 jugadores (incluyendo el creador que se haya unido):

```typescript
// Desde servidor autorizado o creador
const winner = "0x1eb8ff5966feb81a5326d311d238370717701ad8"; // o quien ganó
await contract.endLobby(17, [winner]);
```

---

## 🔐 VERIFICAR AUTORIZACIÓN DEL SERVIDOR

Para que el servidor backend pueda llamar `endLobby`, debe estar autorizado:

```bash
# Verificar si está autorizado
cast call 0xC34055c565B5789f05dec44585f074d1009Feb89 \
  "authorized(address)(bool)" \
  [DIRECCION_DEL_SERVIDOR] \
  --rpc-url https://eth-sepolia.g.alchemy.com/v2/***REMOVED***

# Autorizar (desde cuenta owner)
cast send 0xC34055c565B5789f05dec44585f074d1009Feb89 \
  "setAuthorized(address,bool)" \
  [DIRECCION_DEL_SERVIDOR] \
  true \
  --rpc-url https://eth-sepolia.g.alchemy.com/v2/***REMOVED*** \
  --private-key [OWNER_PRIVATE_KEY]
```

---

## 📝 CHECKLIST PARA TESTING

- [ ] **Crear lobby**: Verificar evento `LobbyCreated` con datos correctos
- [ ] **Unirse al lobby**: Cada jugador debe llamar `joinLobby` con pago
- [ ] **Verificar jugadores**: Llamar `getLobbyPlayers(lobbyId)` 
- [ ] **Jugar off-chain**: Determinar ganador en servidor
- [ ] **Finalizar lobby**: Llamar `endLobby(lobbyId, [winner])`
- [ ] **Verificar eventos**:
  - [ ] `FeeTaken` con 5% del total
  - [ ] `Payout` con 95% al ganador
  - [ ] `LobbyEnded` con winners array NO vacío
- [ ] **Verificar balances**:
  - [ ] Ganador recibió su premio
  - [ ] DevWallet recibió comisión
  - [ ] Contrato balance = 0 (o solo fondos de otros lobbies)

---

## 🐛 PROBLEMA ACTUAL IDENTIFICADO

Según el código del servidor, el problema es:

**El creador NO se une automáticamente al lobby después de crearlo**

En el flujo actual:
1. ✅ Usuario A crea lobby → `createLobby(...)` → Lobby ID 17
2. ❌ Usuario A **NO** llama `joinLobby(17)` automáticamente
3. ✅ Usuario B llama `joinLobby(17)` → Paga 0.0001 ETH
4. ❌ Lobby tiene solo 1 jugador, necesita mínimo 2 para `endLobby`

**Solución**: El creador debe llamar `joinLobby` después de crear, o la UI debe hacerlo automáticamente.

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

### 1. **Completar el Lobby 17 actual**
```typescript
// Desde cuenta del creador (0xbf9a...)
await contract.joinLobby(17, { value: ethers.parseEther("0.0001") });
```

### 2. **Jugar y finalizar**
- Jugar la partida entre los 2 jugadores
- Determinar ganador
- Llamar `endLobby(17, [winnerAddress])`

### 3. **Verificar distribución en Etherscan**
- Debe mostrar 3 eventos: FeeTaken, Payout, LobbyEnded

### 4. **Modificar UI para auto-join del creador** (opcional)
Después de `createLobby`, automáticamente hacer `joinLobby`.

---

**Fecha**: 11 de octubre de 2025
**Contrato**: UnoLobby v1.0
**Red**: Sepolia Testnet
