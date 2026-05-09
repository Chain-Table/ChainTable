import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('UnoLobbyV2 - Refund Tests', function () {
  let UnoLobbyV2, MockERC20, lobby, token, owner, dev, alice, bob, carol, dave;

  beforeEach(async function () {
    [owner, dev, alice, bob, carol, dave] = await ethers.getSigners();
    
    // Deploy contracts
    UnoLobbyV2 = await ethers.getContractFactory('UnoLobbyV2');
    lobby = await UnoLobbyV2.deploy(dev.address);
    await lobby.waitForDeployment();
    
    MockERC20 = await ethers.getContractFactory('MockERC20');
    token = await MockERC20.deploy('MockWETH', 'WETH', ethers.parseEther('10000'));
    await token.waitForDeployment();
    
    console.log('✅ Contracts deployed');
    console.log('   UnoLobbyV2:', await lobby.getAddress());
    console.log('   MockERC20:', await token.getAddress());
    console.log('   Dev wallet:', dev.address);
  });

  describe('❌ Cancel Lobby with ETH - Full Refund Test', function () {
    it('Should refund all players when lobby is cancelled (ETH)', async function () {
      const entryFee = ethers.parseEther('0.1');
      
      console.log('\n📝 Creating lobby with ETH...');
      console.log('   Entry fee:', ethers.formatEther(entryFee), 'ETH');
      console.log('   Max players: 4');
      console.log('   Creator: Alice');
      
      // Alice creates lobby
      const tx = await lobby.connect(alice).createLobby(
        ethers.ZeroAddress, // ETH nativo
        entryFee,
        4, // max players
        0  // BEAST mode
      );
      await tx.wait();
      const lobbyId = 1;
      
      console.log('✅ Lobby created with ID:', lobbyId);

      // Record balances BEFORE joining
      const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);
      const bobBalanceBefore = await ethers.provider.getBalance(bob.address);
      const carolBalanceBefore = await ethers.provider.getBalance(carol.address);
      
      console.log('\n💰 Balances BEFORE joining:');
      console.log('   Alice:', ethers.formatEther(aliceBalanceBefore), 'ETH');
      console.log('   Bob:', ethers.formatEther(bobBalanceBefore), 'ETH');
      console.log('   Carol:', ethers.formatEther(carolBalanceBefore), 'ETH');

      // Players join
      console.log('\n👥 Players joining lobby...');
      
      const joinTx1 = await lobby.connect(alice).joinLobby(lobbyId, { value: entryFee });
      const joinReceipt1 = await joinTx1.wait();
      const gasPrice1 = joinReceipt1.effectiveGasPrice ?? joinReceipt1.gasPrice;
      const gasUsedAliceJoin = joinReceipt1.gasUsed * gasPrice1;
      console.log('   ✅ Alice joined (gas:', ethers.formatEther(gasUsedAliceJoin), 'ETH)');
      
      const joinTx2 = await lobby.connect(bob).joinLobby(lobbyId, { value: entryFee });
      const joinReceipt2 = await joinTx2.wait();
      const gasPrice2 = joinReceipt2.effectiveGasPrice ?? joinReceipt2.gasPrice;
      const gasUsedBobJoin = joinReceipt2.gasUsed * gasPrice2;
      console.log('   ✅ Bob joined (gas:', ethers.formatEther(gasUsedBobJoin), 'ETH)');
      
      const joinTx3 = await lobby.connect(carol).joinLobby(lobbyId, { value: entryFee });
      const joinReceipt3 = await joinTx3.wait();
      const gasPrice3 = joinReceipt3.effectiveGasPrice ?? joinReceipt3.gasPrice;
      const gasUsedCarolJoin = joinReceipt3.gasUsed * gasPrice3;
      console.log('   ✅ Carol joined (gas:', ethers.formatEther(gasUsedCarolJoin), 'ETH)');

      // Check contract balance
      const lobbyAddress = await lobby.getAddress();
      const contractBalance = await ethers.provider.getBalance(lobbyAddress);
      console.log('\n💼 Contract balance:', ethers.formatEther(contractBalance), 'ETH');
      expect(contractBalance).to.equal(entryFee * 3n);

      // Get lobby info
      const lobbyInfo = await lobby.getLobbyInfo(lobbyId);
      console.log('\n📊 Lobby info:');
      console.log('   State:', lobbyInfo.state); // 0=OPEN, 1=STARTED, 2=ENDED, 3=CANCELLED
      console.log('   Players:', lobbyInfo.players.length);
      expect(lobbyInfo.players.length).to.equal(3);
      expect(Number(lobbyInfo.state)).to.equal(0); // OPEN

      // Alice cancels the lobby
      console.log('\n❌ Alice cancelling lobby...');
      const cancelTx = await lobby.connect(alice).cancelLobby(lobbyId);
      const cancelReceipt = await cancelTx.wait();
      const gasPriceCancel = cancelReceipt.effectiveGasPrice ?? cancelReceipt.gasPrice;
      const gasUsedCancel = cancelReceipt.gasUsed * gasPriceCancel;
      console.log('   Gas used for cancel:', ethers.formatEther(gasUsedCancel), 'ETH');

      // Verify lobby state is CANCELLED
      const lobbyInfoAfter = await lobby.getLobbyInfo(lobbyId);
      expect(Number(lobbyInfoAfter.state)).to.equal(3); // CANCELLED
      console.log('   ✅ Lobby state changed to CANCELLED');

      // Check contract balance (should be 0 after refunds)
      const contractBalanceAfter = await ethers.provider.getBalance(lobbyAddress);
      console.log('\n💼 Contract balance after cancel:', ethers.formatEther(contractBalanceAfter), 'ETH');
      expect(contractBalanceAfter).to.equal(0n);

      // Check player balances AFTER refund
      const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
      const bobBalanceAfter = await ethers.provider.getBalance(bob.address);
      const carolBalanceAfter = await ethers.provider.getBalance(carol.address);
      
      console.log('\n💰 Balances AFTER cancel:');
      console.log('   Alice:', ethers.formatEther(aliceBalanceAfter), 'ETH');
      console.log('   Bob:', ethers.formatEther(bobBalanceAfter), 'ETH');
      console.log('   Carol:', ethers.formatEther(carolBalanceAfter), 'ETH');

      // Calculate expected balances (original - gas costs for join and cancel)
      const expectedAliceBalance = aliceBalanceBefore - gasUsedAliceJoin - gasUsedCancel;
      const expectedBobBalance = bobBalanceBefore - gasUsedBobJoin;
      const expectedCarolBalance = carolBalanceBefore - gasUsedCarolJoin;
      
      console.log('\n✅ Expected balances (after gas):');
      console.log('   Alice:', ethers.formatEther(expectedAliceBalance), 'ETH');
      console.log('   Bob:', ethers.formatEther(expectedBobBalance), 'ETH');
      console.log('   Carol:', ethers.formatEther(expectedCarolBalance), 'ETH');

      // Verify refunds (allowing small gas price variations)
      const tolerance = ethers.parseEther('0.0001'); // 0.0001 ETH tolerance for gas variations

      const diffAlice = aliceBalanceAfter > expectedAliceBalance ? aliceBalanceAfter - expectedAliceBalance : expectedAliceBalance - aliceBalanceAfter;
      const diffBob = bobBalanceAfter > expectedBobBalance ? bobBalanceAfter - expectedBobBalance : expectedBobBalance - bobBalanceAfter;
      const diffCarol = carolBalanceAfter > expectedCarolBalance ? carolBalanceAfter - expectedCarolBalance : expectedCarolBalance - carolBalanceAfter;

      expect(diffAlice <= tolerance).to.equal(true);
      expect(diffBob <= tolerance).to.equal(true);
      expect(diffCarol <= tolerance).to.equal(true);
      
      console.log('\n🎉 ALL REFUNDS VERIFIED! Each player got their entry fee back.');
    });
  });

  describe('❌ Cancel Lobby with ERC20 - Full Refund Test', function () {
    it('Should refund all players when lobby is cancelled (ERC20)', async function () {
      const entryFee = ethers.parseEther('10');
      
      console.log('\n📝 Creating lobby with ERC20...');
      const tokenAddress = await token.getAddress();
      console.log('   Token:', tokenAddress);
      console.log('   Entry fee:', ethers.formatEther(entryFee), 'tokens');
      console.log('   Max players: 4');
      console.log('   Creator: Alice');
      
      // Distribute tokens to players
      await token.transfer(alice.address, ethers.parseEther('100'));
      await token.transfer(bob.address, ethers.parseEther('100'));
      await token.transfer(carol.address, ethers.parseEther('100'));
      console.log('   ✅ Tokens distributed to players');

      // Alice creates lobby
      const tx = await lobby.connect(alice).createLobby(
        tokenAddress,
        entryFee,
        4, // max players
        1  // CLASSIC mode
      );
      await tx.wait();
      const lobbyId = 1;
      console.log('✅ Lobby created with ID:', lobbyId);

      // Record balances BEFORE joining
      const aliceBalanceBefore = await token.balanceOf(alice.address);
      const bobBalanceBefore = await token.balanceOf(bob.address);
      const carolBalanceBefore = await token.balanceOf(carol.address);
      
      console.log('\n💰 Token balances BEFORE joining:');
      console.log('   Alice:', ethers.formatEther(aliceBalanceBefore), 'tokens');
      console.log('   Bob:', ethers.formatEther(bobBalanceBefore), 'tokens');
      console.log('   Carol:', ethers.formatEther(carolBalanceBefore), 'tokens');

      // Approve and join
      console.log('\n👥 Players approving and joining...');
      
      const lobbyAddress = await lobby.getAddress();
      await token.connect(alice).approve(lobbyAddress, entryFee);
      await lobby.connect(alice).joinLobby(lobbyId);
      console.log('   ✅ Alice approved and joined');
      
      await token.connect(bob).approve(lobbyAddress, entryFee);
      await lobby.connect(bob).joinLobby(lobbyId);
      console.log('   ✅ Bob approved and joined');
      
      await token.connect(carol).approve(lobbyAddress, entryFee);
      await lobby.connect(carol).joinLobby(lobbyId);
      console.log('   ✅ Carol approved and joined');

      // Check contract token balance
      const contractBalance = await token.balanceOf(lobbyAddress);
      console.log('\n💼 Contract token balance:', ethers.formatEther(contractBalance), 'tokens');
      expect(contractBalance).to.equal(entryFee * 3n);

      // Alice cancels the lobby
      console.log('\n❌ Alice cancelling lobby...');
      const cancelTx = await lobby.connect(alice).cancelLobby(lobbyId);
      const cancelReceipt = await cancelTx.wait();

      // Check contract balance (should be 0 after refunds)
      const contractBalanceAfter = await token.balanceOf(lobbyAddress);
      console.log('\n💼 Contract token balance after cancel:', ethers.formatEther(contractBalanceAfter), 'tokens');
      expect(contractBalanceAfter).to.equal(0n);

      // Check player balances AFTER refund
      const aliceBalanceAfter = await token.balanceOf(alice.address);
      const bobBalanceAfter = await token.balanceOf(bob.address);
      const carolBalanceAfter = await token.balanceOf(carol.address);
      
      console.log('\n💰 Token balances AFTER cancel:');
      console.log('   Alice:', ethers.formatEther(aliceBalanceAfter), 'tokens');
      console.log('   Bob:', ethers.formatEther(bobBalanceAfter), 'tokens');
      console.log('   Carol:', ethers.formatEther(carolBalanceAfter), 'tokens');

      // Verify full refunds (no gas costs for ERC20)
      expect(aliceBalanceAfter).to.equal(aliceBalanceBefore);
      expect(bobBalanceAfter).to.equal(bobBalanceBefore);
      expect(carolBalanceAfter).to.equal(carolBalanceBefore);
      
      console.log('\n🎉 ALL ERC20 REFUNDS VERIFIED! Each player got their tokens back.');
    });
  });

  describe('🚫 Cancel Restrictions', function () {
    it('Should reject cancel from non-creator', async function () {
      const entryFee = ethers.parseEther('0.1');
      
      await lobby.connect(alice).createLobby(
        ethers.ZeroAddress,
        entryFee,
        4,
        0
      );
      const lobbyId = 1;
      
      await lobby.connect(alice).joinLobby(lobbyId, { value: entryFee });
      await lobby.connect(bob).joinLobby(lobbyId, { value: entryFee });
      
      // Bob tries to cancel (should fail)
      await expect(
        lobby.connect(bob).cancelLobby(lobbyId)
      ).to.be.revertedWith('Only creator or owner can cancel');
      
      console.log('✅ Non-creator correctly prevented from cancelling');
    });

    it('Should allow owner to cancel any lobby', async function () {
      const entryFee = ethers.parseEther('0.1');
      
      await lobby.connect(alice).createLobby(
        ethers.ZeroAddress,
        entryFee,
        4,
        0
      );
      const lobbyId = 1;
      
      await lobby.connect(alice).joinLobby(lobbyId, { value: entryFee });
      
      // Owner cancels (should work)
      await lobby.connect(owner).cancelLobby(lobbyId);
      
      const lobbyInfo = await lobby.getLobbyInfo(lobbyId);
      expect(Number(lobbyInfo.state)).to.equal(3); // CANCELLED
      
      console.log('✅ Owner successfully cancelled lobby');
    });

    it('Should reject cancel after lobby started', async function () {
      const entryFee = ethers.parseEther('0.1');
      
      await lobby.connect(alice).createLobby(
        ethers.ZeroAddress,
        entryFee,
        2, // only 2 players to auto-start
        0
      );
      const lobbyId = 1;
      
      await lobby.connect(alice).joinLobby(lobbyId, { value: entryFee });
      await lobby.connect(bob).joinLobby(lobbyId, { value: entryFee });
      
      // Lobby auto-started, try to cancel
      await expect(
        lobby.connect(alice).cancelLobby(lobbyId)
      ).to.be.revertedWithCustomError(lobby, 'LobbyNotOpen');
      
      console.log('✅ Cancel correctly prevented after lobby started');
    });
  });
});
