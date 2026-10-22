// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {ChainTable} from "../contracts/ChainTable.sol";

/// forge script script/DeployChainTable.s.sol --rpc-url <sepolia|mainnet|base|robinhood|ronin> --broadcast --private-key $PRIVATE_KEY
contract DeployChainTable is Script {
    function run() external returns (ChainTable table) {
        address referee = vm.envAddress("REFEREE_ADDRESS");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");

        vm.startBroadcast();
        table = new ChainTable(referee, feeRecipient);
        vm.stopBroadcast();

        console.log("ChainTable:", address(table));
        console.log("chainId:", block.chainid);
    }
}
