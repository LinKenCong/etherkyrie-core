// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IERC20 {
    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);
}

contract EtherkyrieWallet {
    address public immutable owner;

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev withdraw contract `amount` ETH transfer to `to`.
     * Emits a {WithdrawEth} event for withdraw ETH.
     *
     * @param to address
     * @param amount uint256
     */
    function withdrawForEth(address to, uint256 amount) external onlyOwner {
        if (getEthBalance() < amount) revert InsufficientBalance({available: getEthBalance(), required: amount});
        (bool success, ) = payable(to).call{value: amount}('');
        require(success, 'Withdraw Failed');
        emit WithdrawEth(to, amount);
    }

    /**
     * @dev withdraw contract `amount` erc20Token(`token`) transfer to `to`.
     * Emits a {WithdrawToken} event for withdraw token.
     *
     * @param to address
     * @param amount uint256
     * @param token address
     */
    function withdrawForToken(
        address to,
        uint256 amount,
        address token
    ) external onlyOwner {
        if (getTokenBalance(token) < amount)
            revert InsufficientBalance({available: getTokenBalance(token), required: amount});
        IERC20(token).transfer(to, amount);
        emit WithdrawToken(to, amount, token);
    }

    /**
     * @return balance this contract eth balance
     */
    function getEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @return balance this contract erc20Token(`token`) balance
     */
    function getTokenBalance(address token) public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    receive() external payable {
        emit ReceiveEth(msg.sender, msg.value);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'Caller is not owner');
        _;
    }
    event WithdrawEth(address to, uint256 value);
    event WithdrawToken(address to, uint256 value, address token);
    event ReceiveEth(address from, uint256 value);

    error InsufficientBalance(uint256 available, uint256 required);
}
