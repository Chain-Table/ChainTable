import { formatEther, parseAbi, type Address, type Chain } from "viem";
import { base, mainnet, robinhood, ronin, sepolia } from "wagmi/chains";

// Redes donde se puede jugar con plata. La dirección del contrato ChainTable de cada
// red viene de VITE_CONTRACT_<RED>; una red sin dirección no aparece en el selector.
export const NETWORKS = {
  ethereum: { chain: mainnet, contract: import.meta.env.VITE_CONTRACT_ETHEREUM, rpc: import.meta.env.VITE_RPC_ETHEREUM },
  base: { chain: base, contract: import.meta.env.VITE_CONTRACT_BASE, rpc: import.meta.env.VITE_RPC_BASE },
  robinhood: { chain: robinhood, contract: import.meta.env.VITE_CONTRACT_ROBINHOOD, rpc: import.meta.env.VITE_RPC_ROBINHOOD },
  ronin: { chain: ronin, contract: import.meta.env.VITE_CONTRACT_RONIN, rpc: import.meta.env.VITE_RPC_RONIN },
  sepolia: { chain: sepolia, contract: import.meta.env.VITE_CONTRACT_SEPOLIA, rpc: import.meta.env.VITE_RPC_SEPOLIA },
} satisfies Record<string, { chain: Chain; contract?: Address; rpc?: string }>;

export type NetworkKey = keyof typeof NETWORKS;

export const ENABLED_NETWORKS = (Object.keys(NETWORKS) as NetworkKey[]).filter((k) => NETWORKS[k].contract);

export const symbolOf = (network: NetworkKey) => NETWORKS[network].chain.nativeCurrency.symbol;

/** Monto en wei → "0.01 ETH" con el símbolo de la red. */
export const fmtAmount = (wei: bigint | string, network?: string) =>
  `${Number(formatEther(BigInt(wei))).toLocaleString(undefined, { maximumFractionDigits: 6 })}${
    network && network in NETWORKS ? ` ${symbolOf(network as NetworkKey)}` : ""
  }`;

export function contractOf(network: NetworkKey): Address {
  const address = NETWORKS[network]?.contract;
  if (!address) throw new Error(`ChainTable no está desplegado en ${network}`);
  return address;
}

export const txUrl = (network: NetworkKey, hash: string) =>
  `${NETWORKS[network].chain.blockExplorers.default.url}/tx/${hash}`;

export const CHAINTABLE_ABI = parseAbi([
  "function createLobby(uint16 maxPlayers, uint8 mode) payable returns (uint256)",
  "function joinLobby(uint256 lobbyId) payable",
  "function leaveLobby(uint256 lobbyId)",
  "function isPlayer(uint256 lobbyId, address player) view returns (bool)",
  "function getLobby(uint256 lobbyId) view returns (address creator, uint256 entryFee, uint16 maxPlayers, uint8 mode, uint8 state, uint64 startedAt, address[] players)",
  "event LobbyCreated(uint256 indexed lobbyId, address indexed creator, uint256 entryFee, uint16 maxPlayers, uint8 mode)",
]);

export const LOBBY_STATE = { OPEN: 1, STARTED: 2, ENDED: 3, CANCELLED: 4 } as const;
