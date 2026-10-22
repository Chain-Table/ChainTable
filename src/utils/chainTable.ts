import { parseEther, parseEventLogs, type Address } from "viem";
import { readContract, switchChain, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { CHAINTABLE_ABI, LOBBY_STATE, NETWORKS, contractOf, type NetworkKey } from "../config/chains";
import { wagmiConfig } from "../config/wagmi";

// Toda la interacción del frontend con el contrato ChainTable, vía wagmi
// (funciona con cualquier wallet conectada por RainbowKit, no solo MetaMask).

async function prepare(network: NetworkKey) {
  const chainId = NETWORKS[network].chain.id;
  await switchChain(wagmiConfig, { chainId });
  return { chainId, address: contractOf(network), abi: CHAINTABLE_ABI } as const;
}

async function confirm(chainId: number, hash: `0x${string}`) {
  const receipt = await waitForTransactionReceipt(wagmiConfig, { chainId: chainId as typeof wagmiConfig.chains[number]["id"], hash });
  if (receipt.status !== "success") throw new Error("La transacción falló on-chain");
  return receipt;
}

export async function getLobby(network: NetworkKey, lobbyId: string) {
  const [creator, entryFee, maxPlayers, mode, state, , players] = await readContract(wagmiConfig, {
    chainId: NETWORKS[network].chain.id,
    address: contractOf(network),
    abi: CHAINTABLE_ABI,
    functionName: "getLobby",
    args: [BigInt(lobbyId)],
  });
  return { creator, entryFee, maxPlayers, mode, state, players };
}

/** Crea la mesa y paga la entrada del creador en un solo tx. Devuelve el id on-chain. */
export async function createPaidLobby(network: NetworkKey, entry: string, maxPlayers: number, mode: "BEAST" | "CLASSIC") {
  const value = parseEther(entry.replace(",", ".").trim());
  if (value <= 0n) throw new Error("Costo de entrada inválido");
  const c = await prepare(network);
  const hash = await writeContract(wagmiConfig, { ...c, functionName: "createLobby", args: [maxPlayers, mode === "CLASSIC" ? 1 : 0], value });
  const receipt = await confirm(c.chainId, hash);
  const [event] = parseEventLogs({ abi: CHAINTABLE_ABI, eventName: "LobbyCreated", logs: receipt.logs });
  if (!event) throw new Error("No se encontró el evento LobbyCreated");
  return event.args.lobbyId.toString();
}

/** Paga la entrada exacta que dice el contrato (no la que dice el server). */
export async function joinPaidLobby(network: NetworkKey, lobbyId: string, player: Address) {
  const lobby = await getLobby(network, lobbyId);
  if (lobby.state !== LOBBY_STATE.OPEN) throw new Error("La mesa ya no acepta jugadores");
  if (lobby.players.some((p) => p.toLowerCase() === player.toLowerCase())) return; // ya pagó
  if (lobby.players.length >= lobby.maxPlayers) throw new Error("La mesa está llena");
  const c = await prepare(network);
  await confirm(c.chainId, await writeContract(wagmiConfig, { ...c, functionName: "joinLobby", args: [BigInt(lobbyId)], value: lobby.entryFee }));
}

/** Sale de una mesa que no empezó y recupera la entrada. */
export async function leavePaidLobby(network: NetworkKey, lobbyId: string, player: Address) {
  const lobby = await getLobby(network, lobbyId);
  const paid = lobby.players.some((p) => p.toLowerCase() === player.toLowerCase());
  if (lobby.state !== LOBBY_STATE.OPEN || !paid) return;
  const c = await prepare(network);
  await confirm(c.chainId, await writeContract(wagmiConfig, { ...c, functionName: "leaveLobby", args: [BigInt(lobbyId)] }));
}
