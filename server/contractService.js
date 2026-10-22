const { ethers } = require('ethers');

/**
 * Acceso al contrato ChainTable en cada red. El servidor es el "referee":
 * es la única wallet que puede empezar/cerrar mesas y elegir ganadores.
 * Nota: las variables de entorno deben cargarse antes de requerir este módulo.
 */

// Por red: RPC_URL_<KEY> y CONTRACT_<KEY> en el .env
const CHAINS = {
  sepolia: { chainId: 11155111, env: 'SEPOLIA', explorer: 'https://sepolia.etherscan.io' },
  ethereum: { chainId: 1, env: 'ETHEREUM', explorer: 'https://etherscan.io' },
  base: { chainId: 8453, env: 'BASE', explorer: 'https://basescan.org' },
  robinhood: { chainId: 4663, env: 'ROBINHOOD', explorer: 'https://robinhoodchain.blockscout.com' },
  ronin: { chainId: 2020, env: 'RONIN', explorer: 'https://app.roninchain.com' },
};

const STATE = { NONE: 0, OPEN: 1, STARTED: 2, ENDED: 3, CANCELLED: 4 };
const MODES = ['BEAST', 'CLASSIC'];

const ABI = [
  'function getLobby(uint256 lobbyId) view returns (address creator, uint256 entryFee, uint16 maxPlayers, uint8 mode, uint8 state, uint64 startedAt, address[] players)',
  'function isPlayer(uint256 lobbyId, address player) view returns (bool)',
  'function startLobby(uint256 lobbyId)',
  'function endLobby(uint256 lobbyId, address[] winners)',
  'function cancelLobby(uint256 lobbyId)',
];

class ContractService {
  constructor() {
    this.chains = new Map();
    const key = process.env.REFEREE_PRIVATE_KEY;

    for (const [name, cfg] of Object.entries(CHAINS)) {
      const rpc = process.env[`RPC_URL_${cfg.env}`];
      const address = process.env[`CONTRACT_${cfg.env}`];
      if (!rpc || !address) continue;

      const provider = new ethers.JsonRpcProvider(rpc, cfg.chainId, { staticNetwork: true });
      // NonceManager: varias mesas pueden cerrarse a la vez en la misma red
      const signer = key ? new ethers.NonceManager(new ethers.Wallet(key, provider)) : null;
      const contract = new ethers.Contract(address, ABI, signer || provider);
      this.chains.set(name, { ...cfg, address, contract, canWrite: !!signer });
    }

    console.log('🔗 Redes on-chain activas:', [...this.chains.keys()].join(', ') || 'ninguna');
    if (!key) console.warn('⚠️  REFEREE_PRIVATE_KEY no configurada: no se podrán empezar ni pagar mesas');
  }

  get(chain) {
    const c = this.chains.get(chain);
    if (!c) throw new Error(`Red no soportada: ${chain}`);
    return c;
  }

  write(chain) {
    const c = this.get(chain);
    if (!c.canWrite) throw new Error('El servidor no tiene wallet de referee configurada');
    return c.contract;
  }

  async getLobby(chain, lobbyId) {
    const [creator, entryFee, maxPlayers, mode, state, , players] = await this.get(chain).contract.getLobby(lobbyId);
    return {
      creator,
      entryFee: entryFee.toString(),
      maxPlayers: Number(maxPlayers),
      mode: MODES[Number(mode)],
      state: Number(state),
      players: players.map((p) => p.toLowerCase()),
    };
  }

  async isPlayer(chain, lobbyId, address) {
    return this.get(chain).contract.isPlayer(lobbyId, address);
  }

  async #send(chain, method, ...args) {
    const tx = await this.write(chain)[method](...args);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  startLobby(chain, lobbyId) {
    return this.#send(chain, 'startLobby', lobbyId);
  }

  endLobby(chain, lobbyId, winners) {
    return this.#send(chain, 'endLobby', lobbyId, winners);
  }

  cancelLobby(chain, lobbyId) {
    return this.#send(chain, 'cancelLobby', lobbyId);
  }

  txUrl(chain, hash) {
    return `${this.get(chain).explorer}/tx/${hash}`;
  }
}

module.exports = new ContractService();
module.exports.STATE = STATE;
