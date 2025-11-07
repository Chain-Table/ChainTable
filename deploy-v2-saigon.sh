#!/bin/bash

# Script para desplegar UnoLobbyV2 en Ronin Saigon Testnet

PRIVATE_KEY="0x***REMOVED***"
RPC_URL="https://saigon-testnet.roninchain.com/rpc"
DEV_WALLET="0xbf9a40bf3EEB8C0c9bAd4a9A8AD23beD2fa8fD78"

echo "🚀 Desplegando UnoLobbyV2 en Ronin Saigon Testnet..."
echo "📍 RPC: $RPC_URL"
echo "👛 Dev Wallet: $DEV_WALLET"
echo ""

forge create contracts/UnoLobbyV2.sol:UnoLobbyV2 \
  --rpc-url "$RPC_URL" \
  --constructor-args "$DEV_WALLET" \
  --private-key "$PRIVATE_KEY"

echo ""
echo "✅ Despliegue completado!"
