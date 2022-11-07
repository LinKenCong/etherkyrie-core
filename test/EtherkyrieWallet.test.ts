import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAccounts, DeployContracts } from './common/type';
import { toWei, ethBalance } from './common/utils';

const fixture = async () => {
  const [deployer, addr1] = await ethers.getSigners();
  const WalletFactory = await ethers.getContractFactory('EtherkyrieWallet');
  const TestCoinFactory = await ethers.getContractFactory('EtherkyrieERC20');
  const WalletContract = await WalletFactory.connect(deployer).deploy();
  const TestCoinContract = await TestCoinFactory.connect(deployer).deploy(
    deployer.address,
    'TestCoin',
    'TCT',
    toWei(10000)
  );
  const Signers: SignerWithAccounts = {
    owner: deployer,
    other: addr1,
  };
  const Contracts: DeployContracts = {
    walletContract: WalletContract,
    testCoinContract: TestCoinContract,
  };
  return [Signers, Contracts] as [SignerWithAccounts, DeployContracts];
};

describe('EtherkyrieWallet.test', function () {
  describe('1.Initialization information of WalletContract', () => {
    let signers: SignerWithAccounts, contracts: DeployContracts;
    before(async () => {
      [signers, contracts] = await loadFixture(fixture);
    });
    it('Owner is {signers.owner}.', async () => {
      expect(await contracts.walletContract.owner()).to.eq(signers.owner.address);
    });
    it('ETH balance is `0`.', async () => {
      expect(await ethers.provider.getBalance(contracts.walletContract.address)).to.eq(0);
    });
    it('ERC20Token balance is `0`.', async () => {
      expect(await contracts.testCoinContract.balanceOf(contracts.walletContract.address)).to.eq(0);
    });
  });
  describe('2.Receive ETH/Token to WalletContract', () => {
    let signers: SignerWithAccounts, contracts: DeployContracts;
    const testAmount = toWei(100);
    beforeEach(async () => {
      [signers, contracts] = await loadFixture(fixture);
    });
    it('The func{getEthBalance} result should be the same as provider result.', async () => {
      await signers.owner.sendTransaction({ to: contracts.walletContract.address, value: testAmount });
      const funcRes = await contracts.walletContract.getEthBalance();
      const providerRes = await ethers.provider.getBalance(contracts.walletContract.address);
      expect(providerRes).to.eq(testAmount);
      expect(funcRes).to.eq(providerRes);
    });
    it('The func{getTokenBalance} result should be the same as contract result.', async () => {
      await contracts.testCoinContract.connect(signers.owner).transfer(contracts.walletContract.address, testAmount);
      const funcRes = await contracts.walletContract.getTokenBalance(contracts.testCoinContract.address);
      const contractRes = await contracts.testCoinContract.balanceOf(contracts.walletContract.address);
      expect(contractRes).to.eq(testAmount);
      expect(funcRes).to.eq(contractRes);
    });
    it('Should emit an event{ReceiveEth}, if receive eth success.', async () => {
      await expect(signers.owner.sendTransaction({ to: contracts.walletContract.address, value: testAmount }))
        .to.emit(contracts.walletContract, 'ReceiveEth')
        .withArgs(signers.owner.address, testAmount);
    });
    it('Should fail of receive, if have msg.data.', async () => {
      const codeData = contracts.walletContract.interface.encodeFunctionData('owner', []);
      await expect(
        signers.owner.sendTransaction({ to: contracts.walletContract.address, value: testAmount, data: codeData })
      ).to.reverted;
    });
  });
  describe('3.Withdraw eth from WalletContract', () => {
    let signers: SignerWithAccounts, contracts: DeployContracts;
    let walletContractFromOwner: Contract;
    const sendAmount = toWei(1000);
    beforeEach(async () => {
      [signers, contracts] = await loadFixture(fixture);
      walletContractFromOwner = contracts.walletContract.connect(signers.owner);
      await signers.owner.sendTransaction({ to: contracts.walletContract.address, value: sendAmount });
    });
    it('Should success of withdraw `100.0` eth.', async () => {
      const amount = toWei(100);
      const oldBalance = await ethBalance(signers.other.address);
      await walletContractFromOwner.withdrawForEth(signers.other.address, amount);
      expect(await ethBalance(signers.other.address)).to.eq(oldBalance.add(amount));
      expect(await contracts.walletContract.getEthBalance()).to.eq(sendAmount.sub(amount));
    });
    it('Should success of withdraw all eth.', async () => {
      const oldBalance = await ethBalance(signers.other.address);
      await walletContractFromOwner.withdrawForEth(signers.other.address, sendAmount);
      expect(await ethBalance(signers.other.address)).to.eq(oldBalance.add(sendAmount));
      expect(await contracts.walletContract.getEthBalance()).to.eq(0);
    });
    it('Should emit an event{WithdrawEth}, if withdraw eth success.', async () => {
      await expect(walletContractFromOwner.withdrawForEth(signers.other.address, sendAmount))
        .to.emit(contracts.walletContract, 'WithdrawEth')
        .withArgs(signers.other.address, sendAmount);
    });
    it('Should emit an customError{InsufficientBalance}, if have insufficient balance fail.', async () => {
      const amount = sendAmount.add(toWei(1));
      await expect(walletContractFromOwner.withdrawForEth(signers.other.address, amount))
        .to.revertedWithCustomError(contracts.walletContract, 'InsufficientBalance')
        .withArgs(sendAmount, amount);
    });
    it('Should fail of withdraw, if not owner.', async () => {
      await expect(
        contracts.walletContract.connect(signers.other).withdrawForEth(signers.other.address, sendAmount)
      ).to.revertedWith('Caller is not owner');
    });
  });
  describe('4.Withdraw ERC20Token from WalletContract', () => {
    let signers: SignerWithAccounts, contracts: DeployContracts;
    let walletContractFromOwner: Contract;
    const sendAmount = toWei(1000);
    beforeEach(async () => {
      [signers, contracts] = await loadFixture(fixture);
      walletContractFromOwner = contracts.walletContract.connect(signers.owner);
      await contracts.testCoinContract.connect(signers.owner).transfer(contracts.walletContract.address, sendAmount);
    });
    const tokenBalance = async (address: string) => await contracts.testCoinContract.balanceOf(address);
    it('Should success of withdraw `100.0` token.', async () => {
      const amount = toWei(100);
      const oldBalance = await tokenBalance(signers.other.address);
      await walletContractFromOwner.withdrawForToken(signers.other.address, amount, contracts.testCoinContract.address);
      expect(await tokenBalance(signers.other.address)).to.eq(oldBalance.add(amount));
      expect(await contracts.walletContract.getTokenBalance(contracts.testCoinContract.address)).to.eq(
        sendAmount.sub(amount)
      );
    });
    it('Should success of withdraw all token.', async () => {
      const oldBalance = await tokenBalance(signers.other.address);
      await walletContractFromOwner.withdrawForToken(
        signers.other.address,
        sendAmount,
        contracts.testCoinContract.address
      );
      expect(await tokenBalance(signers.other.address)).to.eq(oldBalance.add(sendAmount));
      expect(await contracts.walletContract.getTokenBalance(contracts.testCoinContract.address)).to.eq(0);
    });
    it('Should emit an event{WithdrawToken}, if withdraw eth success.', async () => {
      await expect(
        walletContractFromOwner.withdrawForToken(signers.other.address, sendAmount, contracts.testCoinContract.address)
      )
        .to.emit(contracts.walletContract, 'WithdrawToken')
        .withArgs(signers.other.address, sendAmount, contracts.testCoinContract.address);
    });
    it('Should emit an customError{InsufficientBalance}, if have insufficient balance fail.', async () => {
      const amount = sendAmount.add(toWei(1));
      await expect(
        walletContractFromOwner.withdrawForToken(signers.other.address, amount, contracts.testCoinContract.address)
      )
        .to.revertedWithCustomError(contracts.walletContract, 'InsufficientBalance')
        .withArgs(sendAmount, amount);
    });
    it('Should fail of withdraw, if not owner.', async () => {
      await expect(
        contracts.walletContract
          .connect(signers.other)
          .withdrawForToken(signers.other.address, sendAmount, contracts.testCoinContract.address)
      ).to.revertedWith('Caller is not owner');
    });
  });
});
