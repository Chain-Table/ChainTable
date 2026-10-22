# ChainTable

ChainTable is a real-time multiplayer card game inspired by UNO, built for players who want fast matches, wallet-based identity, and optional blockchain-backed prize lobbies.

Players can connect their wallet, create or join a lobby, and play against others in a live table where every move is synchronized instantly.

## Game Modes

- Public lobbies for open matches.
- Private lobbies for playing with invited players.
- Paid lobbies where entry and rewards can be handled on-chain.

## How To Play

1. Connect your wallet.
2. Enter the lobbies page.
3. Create a table or join an existing one.
4. Wait for the match to start.
5. Play cards by matching color or value.
6. Use action cards to skip, reverse, or force opponents to draw.
7. Use wild cards to change the active color.
8. Be the first to clear your hand and climb the final ranking.

## Blockchain Lobbies

ChainTable supports paid lobbies where players can join through blockchain transactions. Entry fees are locked through smart contracts, and rewards can be distributed to winners after the match.

Supported networks (native token only):

- Ethereum (ETH)
- Base (ETH)
- Robinhood Chain (ETH)
- Ronin (RON)
- Sepolia testnet (ETH)

### How payouts work

The `ChainTable` contract (`contracts/ChainTable.sol`) holds every entry fee. Only the game server's
**referee** wallet can start a table, end it, and pick winners, and only among players who paid.
Players can leave an unstarted table and get their entry back; if a started table is never settled,
anyone can call `refundExpired` after 24h and everyone is refunded. The owner cannot move player funds.

- BEAST: 95% to 1st, 5% fee.
- CLASSIC: 60% / 20% / 15%, 5% fee. Last place is never paid; unpaid shares go to 1st.

### Deploying

```bash
forge test
REFEREE_ADDRESS=0x... FEE_RECIPIENT=0x... \
  forge script script/DeployChainTable.s.sol --rpc-url base --broadcast --private-key $DEPLOYER_KEY
```

Then set `CONTRACT_<NETWORK>` + `RPC_URL_<NETWORK>` + `REFEREE_PRIVATE_KEY` on the server and
`VITE_CONTRACT_<NETWORK>` on the frontend (see `.env.example`). A network without a contract address
is hidden from the UI. End-to-end check against a local chain: `cd server && npm run test:e2e`.

## Real-Time Multiplayer

The game uses a live socket connection so every player sees lobby updates, turns, hands, card plays, winners, and prize events as they happen.

## Made By

https://github.com/MiguelSc66

https://github.com/alva-p
