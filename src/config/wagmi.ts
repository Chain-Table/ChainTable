import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { base, mainnet, robinhood, ronin, sepolia } from "wagmi/chains";
import { NETWORKS } from "./chains";

const { connectors } = getDefaultWallets({
  appName: "Chain Table",
  projectId: "f07abaf1c72667be12516c80f07650ff",
});

// RPC propio si está en el .env (VITE_RPC_<RED>), si no el público de la red
export const wagmiConfig = createConfig({
  chains: [mainnet, base, robinhood, ronin, sepolia],
  connectors,
  transports: {
    [mainnet.id]: http(NETWORKS.ethereum.rpc),
    [base.id]: http(NETWORKS.base.rpc),
    [robinhood.id]: http(NETWORKS.robinhood.rpc),
    [ronin.id]: http(NETWORKS.ronin.rpc),
    [sepolia.id]: http(NETWORKS.sepolia.rpc),
  },
  ssr: false,
});
