import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';

export interface SignerWithAccounts {
  [propName: string]: SignerWithAddress;
}

export interface DeployContracts {
  [propName: string]: Contract;
}
