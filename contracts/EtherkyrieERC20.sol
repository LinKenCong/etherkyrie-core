// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './common/Ownable.sol';

contract EtherkyrieERC20 is Ownable, ERC20 {
    constructor(
        address owner_,
        string memory name_,
        string memory symbol_,
        uint256 initialMint_
    ) Ownable(owner_) ERC20(name_, symbol_) {
        _mint(owner(), initialMint_);
    }
}
