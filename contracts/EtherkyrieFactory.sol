// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import './EtherkyrieERC721A.sol';
import './common/Ownable.sol';

contract EtherkyrieFactory is Ownable {
    address public receiptWallet;
    uint256 public createTokenFee;
    mapping(address => uint256) public createCountOf;

    constructor(
        address owner_,
        address receiptWallet_,
        uint256 createTokenFee_
    ) Ownable(owner_) {
        receiptWallet = receiptWallet_;
        createTokenFee = createTokenFee_;
    }

    // ================= Create Token Contract =================

    function createERC721A(
        address ownerAddress,
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory baseExtension
    ) external returns (address newContractAddress) {
        _payCreateFee();
        newContractAddress = address(new EtherkyrieERC721A(ownerAddress, name, symbol, baseURI, baseExtension));
        emit CreateTokenContract(ownerAddress, newContractAddress, 'ERC721A');
    }

    // ================= Only Owner =================

    function setCreateTokenFee(uint256 newFee) external onlyOwner {
        createTokenFee = newFee;
    }

    function setReceiptWallet(address newWallet) external onlyOwner {
        receiptWallet = newWallet;
    }

    // ================= Inner Function =================

    function _payCreateFee() private {
        if (msg.value < createTokenFee) revert InsufficientCreateFee();
        (bool success, ) = payable(receiptWallet).call{value: createTokenFee}('');
        if (!success) revert CreateFeePayFailed();
    }

    // ================= Event / Error =================

    event CreateTokenContract(address indexed owner, address indexed newContractAddress, string tokenType);

    error InsufficientCreateFee();
    error CreateFeePayFailed();
}
