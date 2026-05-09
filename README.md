# 🃏 Chain Table - UNO Blockchain Platform

Una plataforma de juego UNO descentralizada construida sobre blockchain, donde los jugadores pueden crear y unirse a lobbies públicos, privados o con premios reales en criptomonedas.

![Chain Table](https://img.shields.io/badge/Chain%20Table-UNO-blue)
![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum%20%7C%20Ronin-purple)
![React](https://img.shields.io/badge/React-19.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)

## 🎮 Características

### Tipos de Lobbies

- **🌍 Lobbies Públicos**: Juega con jugadores de todo el mundo, sin restricciones
- **🔒 Lobbies Privados**: Invita a tus amigos con contraseña
- **💰 Lobbies Pagos**: Compite por premios reales en crypto

### Modos de Reparto de Premios

- **🔥 BEAST Mode**: 95% al ganador, 5% fee del proyecto
- **🏆 CLASSIC Mode**: 60% / 20% / 15% a los top 3, resto fee del proyecto

### Redes Blockchain Soportadas

- **Sepolia Testnet** (Ethereum) - Tokens ETH
- **Ronin Mainnet** - Tokens RON, RICE, RONKE
- **Ronin Saigon** - Red de prueba de Ronin

### Características Técnicas

- ✅ Interfaz moderna con **Tailwind CSS** y animaciones fluidas
- ✅ **WebSockets** para sincronización en tiempo real
- ✅ Integración con **MetaMask** y otras wallets Web3
- ✅ Sistema de recompensas en blockchain
- ✅ Diseño responsive
- ✅ Auto-distribución de premios
- ✅ Sistema de lobbies sincronizados

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** v22.10.0 o superior (LTS recomendado)
- **npm** o **yarn**
- MetaMask u otra wallet compatible instalada
- Para lobbies pagos: Fondos en la red correspondiente

> Nota: el frontend y el servidor suelen funcionar con versiones anteriores, pero los tests/compilación con **Hardhat v3** requieren Node 22+.

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd ChainTable

# Instalar dependencias del proyecto
npm install --legacy-peer-deps

# Instalar dependencias del servidor
cd server
npm install
cd ..
```

### Desarrollo

#### Opción 1: Script de Windows (recomendado)

```bash
# Simplemente ejecuta:
start-lobbies.bat
```

Esto iniciará automáticamente:

- Servidor WebSocket en `http://localhost:3001`
- Cliente web en `http://localhost:5173`

#### Opción 2: Manual (Windows/Mac/Linux)

```bash
# Terminal 1: Servidor WebSocket
cd server
npm run dev

# Terminal 2: Cliente web
cd ..
npm run dev
```

### Producción

```bash
# Build del cliente
npm run build

# Servidor en producción
cd server
npm start
```

## 📖 Uso

1. **Conectar Wallet**: Abre la aplicación y conecta tu wallet (MetaMask recomendado)
2. **Crear Lobby**: Selecciona el tipo de lobby que desees crear
3. **Unirse a Lobby**: Explora los lobbies activos y únete
4. **Jugar**: Disfruta de partidas sincronizadas en tiempo real
5. **Ganar**: En lobbies pagos, los premios se distribuyen automáticamente al blockchain

### Crear Lobby Pago (Requiere Bloqueo de Fondos)

Los lobbies pagos requieren:

- Aprobar el uso de tokens ERC20 (si aplica)
- Pagar el costo de entrada on-chain
- Los fondos se bloquean automáticamente en un contrato inteligente

### Distribución de Premios

Al finalizar un lobby pago:

- Los ganadores reciben automáticamente sus premios
- La transacción se registra en blockchain
- El link del explorador te permite verificar la transacción

## 🛠️ Tecnologías

### Frontend

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilos modernos
- **Vite** - Build tool rápido
- **React Router** - Navegación
- **Wagmi** + **RainbowKit** - Integración Web3
- **Socket.IO Client** - Conexión WebSocket

### Backend

- **Node.js** - Runtime
- **Express** - Server framework
- **Socket.IO** - WebSocket server
- **Ethers.js** - Interacción blockchain

### Blockchain

- **Solidity** - Smart contracts
- **Ethers.js** - Cliente Ethereum
- **MetaMask** - Wallet provider

## 📁 Estructura del Proyecto

```
ChainTable/
├── src/
│   ├── components/       # Componentes React reutilizables
│   │   ├── Card.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── PlayerHand.tsx
│   │   └── ...
│   ├── pages/            # Páginas principales
│   │   ├── Landing.tsx
│   │   ├── Auth.tsx
│   │   ├── Lobbies.tsx
│   │   └── Game.tsx
│   ├── hooks/            # Custom hooks
│   │   ├── useGame.ts
│   │   └── useSocket.ts
│   ├── services/         # Servicios
│   ├── types/            # TypeScript types
│   └── utils/            # Utilidades
├── server/               # Servidor WebSocket
│   ├── server.js
│   └── package.json
└── README.md
```

## 🎯 Características del Juego

- **Cartas Especiales**: Skip, Reverse, Draw Two, Wild, Wild Draw Four
- **Stacking**: Acumula penalizaciones
- **UNO!**: Grita UNO cuando te queda 1 carta
- **Tiempo Real**: Todo sincronizado con WebSockets
- **Multi-jugador**: Hasta 6 jugadores por lobby

## 🔐 Seguridad

- Transacciones verificadas on-chain
- Fondos bloqueados en contrato inteligente
- Sin control centralizado de premios
- Sistema de recompensas transparente

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo del frontend
npm run build        # Build de producción
npm run lint         # Linting con ESLint
npm run preview      # Preview del build
npm test             # Tests con Hardhat (TBD)
```

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🎉 Credits

Desarrollado con ❤️ para la comunidad blockchain gaming.

---

**¿Listo para jugar?** Conecta tu wallet y ¡a disfrutar! 🃏🎮
