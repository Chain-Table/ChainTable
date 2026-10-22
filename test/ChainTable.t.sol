// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {ChainTable} from "../contracts/ChainTable.sol";

/// @dev Rechaza cualquier pago: simula un jugador que intenta trabar la mesa.
contract Rejecter {
    function join(ChainTable t, uint256 id) external payable {
        t.joinLobby{value: msg.value}(id);
    }
}

contract ChainTableTest is Test {
    ChainTable table;
    address referee = makeAddr("referee");
    address fees = makeAddr("fees");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address carol = makeAddr("carol");
    address dave = makeAddr("dave");

    uint256 constant FEE = 1 ether;

    function setUp() public {
        table = new ChainTable(referee, fees);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(carol, 10 ether);
        vm.deal(dave, 10 ether);
    }

    function _lobby(uint16 max, ChainTable.Mode mode, address[] memory others) internal returns (uint256 id) {
        vm.prank(alice);
        id = table.createLobby{value: FEE}(max, mode);
        for (uint256 i; i < others.length; ++i) {
            vm.prank(others[i]);
            table.joinLobby{value: FEE}(id);
        }
    }

    function _addrs(address a) internal pure returns (address[] memory r) {
        r = new address[](1);
        r[0] = a;
    }

    function _addrs(address a, address b) internal pure returns (address[] memory r) {
        r = new address[](2);
        (r[0], r[1]) = (a, b);
    }

    function _addrs(address a, address b, address c) internal pure returns (address[] memory r) {
        r = new address[](3);
        (r[0], r[1], r[2]) = (a, b, c);
    }

    // ---------- El ataque de V2 ya no funciona ----------

    function test_playerCannotEndLobbyAndTakePot() public {
        uint256 id = _lobby(4, ChainTable.Mode.BEAST, _addrs(bob));
        vm.prank(bob);
        vm.expectRevert(ChainTable.NotReferee.selector);
        table.endLobby(id, _addrs(bob));
    }

    function test_refereeCannotEndOpenLobby() public {
        uint256 id = _lobby(4, ChainTable.Mode.BEAST, _addrs(bob));
        vm.prank(referee);
        vm.expectRevert(ChainTable.WrongState.selector);
        table.endLobby(id, _addrs(bob));
    }

    function test_refereeCannotPayOutsider() public {
        uint256 id = _lobby(2, ChainTable.Mode.BEAST, _addrs(bob));
        vm.prank(referee);
        vm.expectRevert(ChainTable.InvalidWinners.selector);
        table.endLobby(id, _addrs(dave));
    }

    function test_rejectsDuplicateWinners() public {
        uint256 id = _lobby(4, ChainTable.Mode.CLASSIC, _addrs(bob, carol, dave));
        vm.prank(referee);
        vm.expectRevert(ChainTable.InvalidWinners.selector);
        table.endLobby(id, _addrs(bob, bob, bob));
    }

    function test_classicCannotPayLastPlace() public {
        uint256 id = _lobby(2, ChainTable.Mode.CLASSIC, _addrs(bob));
        vm.prank(referee);
        vm.expectRevert(ChainTable.InvalidWinners.selector);
        table.endLobby(id, _addrs(alice, bob));
    }

    function test_creatorCannotCancelStartedLobby() public {
        uint256 id = _lobby(4, ChainTable.Mode.BEAST, _addrs(bob));
        vm.prank(referee);
        table.startLobby(id);
        vm.prank(alice);
        vm.expectRevert(ChainTable.WrongState.selector);
        table.cancelLobby(id);
    }

    // ---------- Flujo normal ----------

    function test_createJoinsCreatorAndAutoStartsWhenFull() public {
        uint256 id = _lobby(2, ChainTable.Mode.BEAST, _addrs(bob));
        (, uint256 entry,,, ChainTable.State state,, address[] memory players) = table.getLobby(id);
        assertEq(entry, FEE);
        assertEq(uint8(state), uint8(ChainTable.State.STARTED));
        assertEq(players.length, 2);
        assertTrue(table.isPlayer(id, alice));
    }

    function test_joinRequiresExactFee() public {
        uint256 id = _lobby(4, ChainTable.Mode.BEAST, new address[](0));
        vm.prank(bob);
        vm.expectRevert(ChainTable.InvalidEntryFee.selector);
        table.joinLobby{value: FEE - 1}(id);
    }

    function test_beastPays95AndFee5() public {
        uint256 id = _lobby(3, ChainTable.Mode.BEAST, _addrs(bob, carol));
        vm.prank(referee);
        table.endLobby(id, _addrs(carol));
        assertEq(carol.balance, 9 ether + 2.85 ether);
        assertEq(fees.balance, 0.15 ether);
        assertEq(address(table).balance, 0);
    }

    function test_classicPaysWholePool() public {
        uint256 id = _lobby(4, ChainTable.Mode.CLASSIC, _addrs(bob, carol, dave));
        vm.prank(referee);
        table.endLobby(id, _addrs(dave, bob, carol));
        assertEq(dave.balance, 9 ether + 2.4 ether); // 60%
        assertEq(bob.balance, 9 ether + 0.8 ether); // 20%
        assertEq(carol.balance, 9 ether + 0.6 ether); // 15%
        assertEq(fees.balance, 0.2 ether); // 5%
        assertEq(address(table).balance, 0);
    }

    function test_classicTwoWinnersGivesRestToFirst() public {
        uint256 id = _lobby(3, ChainTable.Mode.CLASSIC, _addrs(bob, carol));
        vm.prank(referee);
        table.endLobby(id, _addrs(bob, carol));
        assertEq(bob.balance, 9 ether + 2.25 ether); // 75%
        assertEq(carol.balance, 9 ether + 0.6 ether); // 20%
        assertEq(address(table).balance, 0);
    }

    function test_leaveRefundsAndLastLeaverCancels() public {
        uint256 id = _lobby(4, ChainTable.Mode.BEAST, _addrs(bob));
        vm.prank(bob);
        table.leaveLobby(id);
        assertEq(bob.balance, 10 ether);
        assertFalse(table.isPlayer(id, bob));
        vm.prank(alice);
        table.leaveLobby(id);
        (,,,, ChainTable.State state,,) = table.getLobby(id);
        assertEq(uint8(state), uint8(ChainTable.State.CANCELLED));
        assertEq(address(table).balance, 0);
    }

    function test_cancelRefundsEveryone() public {
        uint256 id = _lobby(4, ChainTable.Mode.BEAST, _addrs(bob, carol));
        vm.prank(alice);
        table.cancelLobby(id);
        assertEq(alice.balance, 10 ether);
        assertEq(bob.balance, 10 ether);
        assertEq(carol.balance, 10 ether);
    }

    function test_outsiderCannotCancel() public {
        uint256 id = _lobby(4, ChainTable.Mode.BEAST, _addrs(bob));
        vm.prank(bob);
        vm.expectRevert(ChainTable.NotAllowed.selector);
        table.cancelLobby(id);
    }

    function test_refundExpiredAfterTimeout() public {
        uint256 id = _lobby(2, ChainTable.Mode.BEAST, _addrs(bob));
        vm.expectRevert(ChainTable.TooEarly.selector);
        table.refundExpired(id);
        vm.warp(block.timestamp + 1 days);
        vm.prank(dave);
        table.refundExpired(id);
        assertEq(alice.balance, 10 ether);
        assertEq(bob.balance, 10 ether);
    }

    function test_rejectingWinnerCannotBlockOthers() public {
        Rejecter r = new Rejecter();
        vm.prank(alice);
        uint256 id = table.createLobby{value: FEE}(3, ChainTable.Mode.CLASSIC);
        vm.prank(bob);
        table.joinLobby{value: FEE}(id);
        r.join{value: FEE}(table, id);

        vm.prank(referee);
        table.endLobby(id, _addrs(address(r), bob));
        assertEq(bob.balance, 9 ether + 0.6 ether);
        assertEq(table.pendingWithdrawals(address(r)), 2.25 ether);
        assertEq(fees.balance, 0.15 ether);
    }

    function test_onlyOwnerSetsReferee() public {
        vm.prank(bob);
        vm.expectRevert();
        table.setReferee(bob);
        table.setReferee(carol);
        assertEq(table.referee(), carol);
    }

    function testFuzz_poolIsFullyDistributed(uint96 fee, uint8 players, bool classic) public {
        vm.assume(fee > 0);
        players = uint8(bound(players, 2, 8));
        ChainTable.Mode mode = classic ? ChainTable.Mode.CLASSIC : ChainTable.Mode.BEAST;

        address[] memory ps = new address[](players);
        for (uint256 i; i < players; ++i) {
            ps[i] = address(uint160(0x1000 + i));
            vm.deal(ps[i], fee);
        }
        vm.prank(ps[0]);
        uint256 id = table.createLobby{value: fee}(players, mode);
        for (uint256 i = 1; i < players; ++i) {
            vm.prank(ps[i]);
            table.joinLobby{value: fee}(id);
        }

        uint256 n = classic ? (players - 1 < 3 ? players - 1 : 3) : 1;
        address[] memory winners = new address[](n);
        for (uint256 i; i < n; ++i) {
            winners[i] = ps[i];
        }
        vm.prank(referee);
        table.endLobby(id, winners);
        assertEq(address(table).balance, 0);
    }
}
