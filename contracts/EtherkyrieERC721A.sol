// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import './common/ERC721A.sol';
import './common/Ownable.sol';

contract EtherkyrieERC721A is Ownable, ERC721A {
    string private _baseTokenURI;
    string public baseExtension;

    constructor(
        address owner_,
        string memory name_,
        string memory symbol_,
        string memory baseTokenURI_,
        string memory baseExtension_
    ) Ownable(owner_) ERC721A(name_, symbol_) {
        _baseTokenURI = baseTokenURI_;
        baseExtension = baseExtension_;
    }

    /**
     * @dev Override ERC721A.tokenURI()
     * @param tokenId uint
     * @return tokenURI ERC721A Token URI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return string(abi.encodePacked(super.tokenURI(tokenId), baseExtension));
    }

    /**
     * @dev Override ERC721A._baseURI()
     * @return baseURI ERC721A Token BaseURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    // ================= Only Owner =================

    /**
     * @dev Mints `quantity` tokens and transfers them to `to`.
     * Requirements:
     * - `to` cannot be the zero address.
     * - `quantity` must be greater than 0.
     * Emits a {Transfer} event for each mint.
     * Emits a {Mint} event for each mint.
     *
     * @param to address
     * @param quantity uint
     */
    function mint(address to, uint256 quantity) external onlyOwner {
        _mint(to, quantity);
        emit Mint(to, quantity);
    }

    /**
     * @dev Safely mints `quantity` tokens and transfers them to `to`.
     * Requirements:
     * - If `to` refers to a smart contract, it must implement
     * {IERC721Receiver-onERC721Received}, which is called for each safe transfer.
     * - `quantity` must be greater than 0.
     * See {_mint}.
     * Emits a {Transfer} event for each mint.
     * Emits a {Mint} event for each mint.
     *
     * @param to address
     * @param quantity uint
     */
    function safeMint(address to, uint256 quantity) external onlyOwner {
        _safeMint(to, quantity);
        emit Mint(to, quantity);
    }

    /**
     * @dev Set token new baseuri.
     * like: www.abc.com/
     *
     * @param newBaseURI string
     */
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    /**
     * @dev Set token new baseExtension.
     * like: .json
     *
     * @param newBaseExtension string
     */
    function setBaseExtension(string calldata newBaseExtension) external onlyOwner {
        baseExtension = newBaseExtension;
    }

    // ================= Event =================

    event Mint(address indexed to, uint256 quantity);
}
