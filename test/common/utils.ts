import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';

export const toWei = (num: Number) => ethers.utils.parseEther(num.toString());

export const fromWei = (num: BigNumber) => ethers.utils.formatEther(num);

export const ethBalance = async (address: string) => await ethers.provider.getBalance(address);
