// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title BattleChessNFT
 * @dev ERC-721 contract for Battle Chess NFT pieces on Sepolia
 * 
 * Each piece is a unique NFT with 5 traits:
 * 1. Rarity (8 options)
 * 2. Piece Type (8 options: King, Queen, Rook, Bishop, Knight, Pawn, + 2 special)
 * 3. Collection (8 art styles)
 * 4. Color (Black/White + 6 special editions)
 * 5. Background (8 options)
 * 
 * Pricing:
 * - Full Set (32 pieces): 0.01 ETH
 * - Half Set (16 pieces): 0.006 ETH
 * - Individual Piece: 0.001 ETH
 */
contract BattleChessNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    // Pricing in wei (Sepolia ETH)
    uint256 public constant FULL_SET_PRICE = 0.01 ether;
    uint256 public constant HALF_SET_PRICE = 0.006 ether;
    uint256 public constant INDIVIDUAL_PRICE = 0.001 ether;

    // Piece counts per set
    uint256 public constant KINGS_PER_SET = 1;
    uint256 public constant QUEENS_PER_SET = 1;
    uint256 public constant ROOKS_PER_SET = 2;
    uint256 public constant BISHOPS_PER_SET = 2;
    uint256 public constant KNIGHTS_PER_SET = 2;
    uint256 public constant PAWNS_PER_SET = 8;
    uint256 public constant PIECES_PER_HALF_SET = 16;
    uint256 public constant PIECES_PER_FULL_SET = 32;

    // Trait definitions
    string[8] public rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic", "Divine", "Cosmic"];
    string[8] public pieceTypes = ["King", "Queen", "Rook", "Bishop", "Knight", "Pawn", "Champion", "Guardian"];
    string[8] public collections = ["Realistic", "Fantasy", "Sci-Fi", "Stylized", "Cyberpunk", "Medieval", "Ethereal", "Void"];
    string[8] public colors = ["White", "Black", "Gold", "Silver", "Crimson", "Azure", "Emerald", "Obsidian"];
    string[8] public backgrounds = ["Classic", "Nebula", "Forest", "Volcanic", "Ocean", "Crystal", "Shadow", "Aurora"];

    // Piece traits storage
    struct PieceTraits {
        uint8 rarity;      // 0-7
        uint8 pieceType;   // 0-7 (0-5 are standard chess pieces)
        uint8 collection;  // 0-7
        uint8 color;       // 0-7 (0=White, 1=Black for gameplay)
        uint8 background;  // 0-7
    }

    mapping(uint256 => PieceTraits) public pieceTraits;
    mapping(address => uint256[]) public playerPieces;

    // Events
    event PieceMinted(address indexed player, uint256 indexed tokenId, PieceTraits traits);
    event SetMinted(address indexed player, bool isFullSet, bool isWhite, uint256[] tokenIds);
    event TraitsRevealed(uint256 indexed tokenId, PieceTraits traits);

    string private _baseTokenURI;

    constructor(string memory baseURI) ERC721("Battle Chess NFT", "BCNFT") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Mint a full set (32 pieces - both white and black)
     */
    function mintFullSet() external payable nonReentrant {
        require(msg.value >= FULL_SET_PRICE, "Insufficient payment for full set");

        uint256[] memory whiteTokenIds = _mintHalfSetInternal(msg.sender, true);
        uint256[] memory blackTokenIds = _mintHalfSetInternal(msg.sender, false);

        // Combine arrays for event
        uint256[] memory allTokenIds = new uint256[](PIECES_PER_FULL_SET);
        for (uint256 i = 0; i < PIECES_PER_HALF_SET; i++) {
            allTokenIds[i] = whiteTokenIds[i];
            allTokenIds[i + PIECES_PER_HALF_SET] = blackTokenIds[i];
        }

        emit SetMinted(msg.sender, true, true, allTokenIds);

        // Refund excess
        if (msg.value > FULL_SET_PRICE) {
            payable(msg.sender).transfer(msg.value - FULL_SET_PRICE);
        }
    }

    /**
     * @dev Mint a half set (16 pieces - either white or black)
     * @param isWhite True for white pieces, false for black
     */
    function mintHalfSet(bool isWhite) external payable nonReentrant {
        require(msg.value >= HALF_SET_PRICE, "Insufficient payment for half set");

        uint256[] memory tokenIds = _mintHalfSetInternal(msg.sender, isWhite);

        emit SetMinted(msg.sender, false, isWhite, tokenIds);

        // Refund excess
        if (msg.value > HALF_SET_PRICE) {
            payable(msg.sender).transfer(msg.value - HALF_SET_PRICE);
        }
    }

    /**
     * @dev Mint individual piece
     * @param pieceType 0-5 for standard pieces (King, Queen, Rook, Bishop, Knight, Pawn)
     * @param isWhite True for white, false for black
     */
    function mintPiece(uint8 pieceType, bool isWhite) external payable nonReentrant {
        require(pieceType <= 5, "Invalid piece type");
        require(msg.value >= INDIVIDUAL_PRICE, "Insufficient payment");

        uint256 tokenId = _mintSinglePiece(msg.sender, pieceType, isWhite ? 0 : 1);

        emit PieceMinted(msg.sender, tokenId, pieceTraits[tokenId]);

        // Refund excess
        if (msg.value > INDIVIDUAL_PRICE) {
            payable(msg.sender).transfer(msg.value - INDIVIDUAL_PRICE);
        }
    }

    /**
     * @dev Internal function to mint a half set
     */
    function _mintHalfSetInternal(address to, bool isWhite) internal returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](PIECES_PER_HALF_SET);
        uint8 colorIndex = isWhite ? 0 : 1;
        uint256 index = 0;

        // Mint 1 King
        tokenIds[index++] = _mintSinglePiece(to, 0, colorIndex);
        
        // Mint 1 Queen
        tokenIds[index++] = _mintSinglePiece(to, 1, colorIndex);
        
        // Mint 2 Rooks
        for (uint256 i = 0; i < ROOKS_PER_SET; i++) {
            tokenIds[index++] = _mintSinglePiece(to, 2, colorIndex);
        }
        
        // Mint 2 Bishops
        for (uint256 i = 0; i < BISHOPS_PER_SET; i++) {
            tokenIds[index++] = _mintSinglePiece(to, 3, colorIndex);
        }
        
        // Mint 2 Knights
        for (uint256 i = 0; i < KNIGHTS_PER_SET; i++) {
            tokenIds[index++] = _mintSinglePiece(to, 4, colorIndex);
        }
        
        // Mint 8 Pawns
        for (uint256 i = 0; i < PAWNS_PER_SET; i++) {
            tokenIds[index++] = _mintSinglePiece(to, 5, colorIndex);
        }

        return tokenIds;
    }

    /**
     * @dev Internal function to mint a single piece with random traits
     */
    function _mintSinglePiece(address to, uint8 pieceType, uint8 colorIndex) internal returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        // Generate pseudo-random traits based on block data and token ID
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            tokenId
        )));

        PieceTraits memory traits = PieceTraits({
            rarity: _calculateRarity(randomSeed),
            pieceType: pieceType,
            collection: uint8(randomSeed % 8),
            color: colorIndex,
            background: uint8((randomSeed >> 8) % 8)
        });

        pieceTraits[tokenId] = traits;
        playerPieces[to].push(tokenId);

        _safeMint(to, tokenId);

        return tokenId;
    }

    /**
     * @dev Calculate rarity with weighted distribution
     * Common: 40%, Uncommon: 25%, Rare: 15%, Epic: 10%, Legendary: 5%, Mythic: 3%, Divine: 1.5%, Cosmic: 0.5%
     */
    function _calculateRarity(uint256 seed) internal pure returns (uint8) {
        uint256 roll = seed % 1000;
        
        if (roll < 400) return 0;      // Common (40%)
        if (roll < 650) return 1;      // Uncommon (25%)
        if (roll < 800) return 2;      // Rare (15%)
        if (roll < 900) return 3;      // Epic (10%)
        if (roll < 950) return 4;      // Legendary (5%)
        if (roll < 980) return 5;      // Mythic (3%)
        if (roll < 995) return 6;      // Divine (1.5%)
        return 7;                       // Cosmic (0.5%)
    }

    /**
     * @dev Check if player has a complete set of one color
     */
    function hasCompleteSet(address player, bool isWhite) public view returns (bool) {
        uint8 targetColor = isWhite ? 0 : 1;
        
        uint256 kings = 0;
        uint256 queens = 0;
        uint256 rooks = 0;
        uint256 bishops = 0;
        uint256 knights = 0;
        uint256 pawns = 0;

        uint256[] memory pieces = playerPieces[player];
        
        for (uint256 i = 0; i < pieces.length; i++) {
            uint256 tokenId = pieces[i];
            
            // Check if player still owns this piece
            if (ownerOf(tokenId) != player) continue;
            
            PieceTraits memory traits = pieceTraits[tokenId];
            
            // Only count pieces of the target color (White=0, Black=1)
            if (traits.color != targetColor) continue;
            
            if (traits.pieceType == 0) kings++;
            else if (traits.pieceType == 1) queens++;
            else if (traits.pieceType == 2) rooks++;
            else if (traits.pieceType == 3) bishops++;
            else if (traits.pieceType == 4) knights++;
            else if (traits.pieceType == 5) pawns++;
        }

        return (
            kings >= KINGS_PER_SET &&
            queens >= QUEENS_PER_SET &&
            rooks >= ROOKS_PER_SET &&
            bishops >= BISHOPS_PER_SET &&
            knights >= KNIGHTS_PER_SET &&
            pawns >= PAWNS_PER_SET
        );
    }

    /**
     * @dev Get all pieces owned by a player
     */
    function getPlayerPieces(address player) external view returns (uint256[] memory) {
        return playerPieces[player];
    }

    /**
     * @dev Get piece traits
     */
    function getPieceTraits(uint256 tokenId) external view returns (
        string memory rarity,
        string memory pieceType,
        string memory collection,
        string memory color,
        string memory background
    ) {
        PieceTraits memory traits = pieceTraits[tokenId];
        return (
            rarities[traits.rarity],
            pieceTypes[traits.pieceType],
            collections[traits.collection],
            colors[traits.color],
            backgrounds[traits.background]
        );
    }

    /**
     * @dev Get piece count by type and color for a player
     */
    function getPlayerPieceCount(address player, uint8 pieceType, bool isWhite) external view returns (uint256) {
        uint8 targetColor = isWhite ? 0 : 1;
        uint256 count = 0;
        
        uint256[] memory pieces = playerPieces[player];
        
        for (uint256 i = 0; i < pieces.length; i++) {
            uint256 tokenId = pieces[i];
            if (ownerOf(tokenId) != player) continue;
            
            PieceTraits memory traits = pieceTraits[tokenId];
            if (traits.pieceType == pieceType && traits.color == targetColor) {
                count++;
            }
        }
        
        return count;
    }

    // URI functions
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // Withdraw function
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
