// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IBattleChessNFT {
    function hasCompleteSet(address player, bool isWhite) external view returns (bool);
    function pieceTraits(uint256 tokenId) external view returns (
        uint8 rarity,
        uint8 pieceType,
        uint8 collection,
        uint8 color,
        uint8 background
    );
}

/**
 * @title GameStaking
 * @dev Handles staking of chess pieces for Battle Chess games on Sepolia
 * 
 * Features:
 * - Players stake 16 pieces (complete set of one color) to play
 * - Entry fee: 0.001 ETH
 * - Platform fee: 10% of prize pool
 * - Winner gets 90% + picks one piece from loser
 * - Off-chain game state, on-chain verification at match end
 * - Winner pays gas for on-chain verification
 */
contract GameStaking is ERC721Holder, Ownable, ReentrancyGuard {
    
    IERC721 public immutable chessNFT;
    IBattleChessNFT public immutable chessNFTInterface;
    
    // Entry fee and platform fee
    uint256 public constant ENTRY_FEE = 0.001 ether;
    uint256 public constant PLATFORM_FEE_PERCENT = 10; // 10%
    uint256 public constant WINNER_PERCENT = 90; // 90%
    
    // Time controls (in seconds)
    uint256 public constant DEFAULT_TIME_PER_PLAYER = 30 minutes;
    uint256 public constant TIME_INCREMENT_PER_MOVE = 3 seconds;
    uint256 public constant MAX_GAME_DURATION = 1 hours;
    
    // Staking info
    struct StakeInfo {
        bool isStaked;
        bool isWhite;
        uint256[] stakedTokenIds;
        uint256 stakedAt;
        uint256 gameId;
    }
    
    // Game info
    struct Game {
        address player1;
        address player2;
        bool player1IsWhite;
        bool player2IsWhite;
        uint256 prizePool;
        uint256 timePerPlayer;
        uint256 timeIncrement;
        uint256 startTime;
        uint256 maxDuration;
        GameStatus status;
        address winner;
        uint256 claimedPieceId;
        bytes32 gameHash; // Hash of final game state for verification
    }
    
    enum GameStatus {
        Created,
        Active,
        Completed,
        Cancelled,
        Disputed
    }
    
    // Player stats
    struct PlayerStats {
        uint256 elo;
        uint256 wins;
        uint256 losses;
        uint256 draws;
        uint256 totalEthWon;
        uint256 totalEthLost;
        uint256 matchesPlayed;
        uint256 points; // Leaderboard points
    }
    
    // Mappings
    mapping(address => StakeInfo) public stakes;
    mapping(uint256 => Game) public games;
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => bool) public tokenStaked;
    
    uint256 public gameCounter;
    uint256 public platformBalance;
    uint256 public currentSeason;
    
    // Season tracking
    mapping(uint256 => mapping(address => uint256)) public seasonPoints;
    mapping(uint256 => address[]) public seasonLeaderboard;
    
    // Events
    event PiecesStaked(address indexed player, bool isWhite, uint256[] tokenIds, uint256 gameId);
    event PiecesUnstaked(address indexed player, uint256[] tokenIds);
    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 entryFee, uint256 timePerPlayer);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event GameStarted(uint256 indexed gameId, address player1, address player2);
    event GameCompleted(uint256 indexed gameId, address indexed winner, uint256 prizeAmount, bytes32 gameHash);
    event PieceClaimed(uint256 indexed gameId, address indexed winner, address indexed loser, uint256 pieceId);
    event EloUpdated(address indexed player, uint256 oldElo, uint256 newElo);
    event SeasonStarted(uint256 indexed seasonId);
    event PointsAwarded(address indexed player, uint256 points, uint256 seasonId);
    
    constructor(address _chessNFT) Ownable(msg.sender) {
        chessNFT = IERC721(_chessNFT);
        chessNFTInterface = IBattleChessNFT(_chessNFT);
        currentSeason = 1;
    }
    
    /**
     * @dev Stake pieces and create a new game
     * @param tokenIds Array of 16 token IDs to stake
     * @param isWhite Whether staking white or black pieces
     * @param timePerPlayer Time per player in seconds (0 for default)
     */
    function stakeAndCreateGame(
        uint256[] calldata tokenIds,
        bool isWhite,
        uint256 timePerPlayer
    ) external payable nonReentrant {
        require(msg.value >= ENTRY_FEE, "Entry fee required: 0.001 ETH");
        require(!stakes[msg.sender].isStaked, "Already staked");
        require(tokenIds.length == 16, "Must stake exactly 16 pieces");
        require(chessNFTInterface.hasCompleteSet(msg.sender, isWhite), "Incomplete set");
        
        // Validate and transfer pieces
        _validateAndStakePieces(msg.sender, tokenIds, isWhite);
        
        // Set time control
        uint256 actualTimePerPlayer = timePerPlayer > 0 ? timePerPlayer : DEFAULT_TIME_PER_PLAYER;
        require(actualTimePerPlayer <= MAX_GAME_DURATION / 2, "Time per player too high");
        
        // Create game
        gameCounter++;
        games[gameCounter] = Game({
            player1: msg.sender,
            player2: address(0),
            player1IsWhite: isWhite,
            player2IsWhite: false,
            prizePool: msg.value,
            timePerPlayer: actualTimePerPlayer,
            timeIncrement: TIME_INCREMENT_PER_MOVE,
            startTime: 0,
            maxDuration: MAX_GAME_DURATION,
            status: GameStatus.Created,
            winner: address(0),
            claimedPieceId: 0,
            gameHash: bytes32(0)
        });
        
        // Update stake info
        stakes[msg.sender] = StakeInfo({
            isStaked: true,
            isWhite: isWhite,
            stakedTokenIds: tokenIds,
            stakedAt: block.timestamp,
            gameId: gameCounter
        });
        
        emit PiecesStaked(msg.sender, isWhite, tokenIds, gameCounter);
        emit GameCreated(gameCounter, msg.sender, msg.value, actualTimePerPlayer);
    }
    
    /**
     * @dev Join an existing game
     * @param gameId The game to join
     * @param tokenIds Array of 16 token IDs to stake
     * @param isWhite Whether staking white or black pieces
     */
    function stakeAndJoinGame(
        uint256 gameId,
        uint256[] calldata tokenIds,
        bool isWhite
    ) external payable nonReentrant {
        Game storage game = games[gameId];
        
        require(game.player1 != address(0), "Game does not exist");
        require(game.player2 == address(0), "Game already full");
        require(game.status == GameStatus.Created, "Game not available");
        require(msg.value >= game.prizePool, "Must match entry fee");
        require(!stakes[msg.sender].isStaked, "Already staked");
        require(tokenIds.length == 16, "Must stake exactly 16 pieces");
        require(chessNFTInterface.hasCompleteSet(msg.sender, isWhite), "Incomplete set");
        
        // Validate and transfer pieces
        _validateAndStakePieces(msg.sender, tokenIds, isWhite);
        
        // Update game
        game.player2 = msg.sender;
        game.player2IsWhite = isWhite;
        game.prizePool += msg.value;
        game.startTime = block.timestamp;
        game.status = GameStatus.Active;
        
        // Update stake info
        stakes[msg.sender] = StakeInfo({
            isStaked: true,
            isWhite: isWhite,
            stakedTokenIds: tokenIds,
            stakedAt: block.timestamp,
            gameId: gameId
        });
        
        emit PiecesStaked(msg.sender, isWhite, tokenIds, gameId);
        emit GameJoined(gameId, msg.sender);
        emit GameStarted(gameId, game.player1, msg.sender);
    }
    
    /**
     * @dev Complete a game - called by winner to verify and claim rewards
     * Winner pays gas for on-chain verification
     * @param gameId The game ID
     * @param gameHash Hash of the final game state (moves, result)
     * @param claimedPieceId The piece ID winner wants from loser
     */
    function completeGame(
        uint256 gameId,
        bytes32 gameHash,
        uint256 claimedPieceId
    ) external nonReentrant {
        Game storage game = games[gameId];
        
        require(game.status == GameStatus.Active, "Game not active");
        require(
            msg.sender == game.player1 || msg.sender == game.player2,
            "Not a player in this game"
        );
        
        address winner = msg.sender;
        address loser = winner == game.player1 ? game.player2 : game.player1;
        
        // Verify claimed piece belongs to loser's staked set
        bool pieceFound = false;
        uint256[] memory loserPieces = stakes[loser].stakedTokenIds;
        for (uint256 i = 0; i < loserPieces.length; i++) {
            if (loserPieces[i] == claimedPieceId) {
                pieceFound = true;
                break;
            }
        }
        require(pieceFound, "Claimed piece not in loser's staked set");
        
        // Calculate prize distribution
        uint256 platformCut = (game.prizePool * PLATFORM_FEE_PERCENT) / 100;
        uint256 winnerPrize = game.prizePool - platformCut;
        
        // Update game state
        game.status = GameStatus.Completed;
        game.winner = winner;
        game.claimedPieceId = claimedPieceId;
        game.gameHash = gameHash;
        
        // Update player stats
        _updatePlayerStats(winner, loser, winnerPrize, game.prizePool / 2);
        
        // Transfer claimed piece to winner
        chessNFT.safeTransferFrom(address(this), winner, claimedPieceId);
        tokenStaked[claimedPieceId] = false;
        
        // Return remaining pieces to both players
        _returnPiecesExcept(game.player1, claimedPieceId);
        _returnPiecesExcept(game.player2, claimedPieceId);
        
        // Clear stakes
        delete stakes[game.player1];
        delete stakes[game.player2];
        
        // Transfer prize to winner
        platformBalance += platformCut;
        payable(winner).transfer(winnerPrize);
        
        emit GameCompleted(gameId, winner, winnerPrize, gameHash);
        emit PieceClaimed(gameId, winner, loser, claimedPieceId);
    }
    
    /**
     * @dev Cancel a game that hasn't started
     */
    function cancelGame(uint256 gameId) external nonReentrant {
        Game storage game = games[gameId];
        
        require(game.player1 == msg.sender, "Not game creator");
        require(game.status == GameStatus.Created, "Cannot cancel");
        require(game.player2 == address(0), "Game already has opponent");
        
        game.status = GameStatus.Cancelled;
        
        // Return pieces
        _returnAllPieces(msg.sender);
        
        // Clear stake
        delete stakes[msg.sender];
        
        // Refund entry fee
        uint256 refund = game.prizePool;
        game.prizePool = 0;
        
        payable(msg.sender).transfer(refund);
        
        emit PiecesUnstaked(msg.sender, stakes[msg.sender].stakedTokenIds);
    }
    
    /**
     * @dev Validate pieces and transfer to contract
     */
    function _validateAndStakePieces(
        address player,
        uint256[] calldata tokenIds,
        bool isWhite
    ) internal {
        uint8 targetColor = isWhite ? 0 : 1;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            
            require(chessNFT.ownerOf(tokenId) == player, "Not owner of piece");
            require(!tokenStaked[tokenId], "Piece already staked");
            
            // Verify piece color matches
            (, , , uint8 color, ) = chessNFTInterface.pieceTraits(tokenId);
            require(color == targetColor, "Piece color mismatch");
            
            // Transfer to contract
            chessNFT.safeTransferFrom(player, address(this), tokenId);
            tokenStaked[tokenId] = true;
        }
    }
    
    /**
     * @dev Return all pieces to player
     */
    function _returnAllPieces(address player) internal {
        _returnPiecesExcept(player, type(uint256).max);
    }
    
    /**
     * @dev Return pieces except one
     */
    function _returnPiecesExcept(address player, uint256 exceptId) internal {
        uint256[] memory pieces = stakes[player].stakedTokenIds;
        
        for (uint256 i = 0; i < pieces.length; i++) {
            uint256 tokenId = pieces[i];
            
            if (tokenId == exceptId) continue;
            if (!tokenStaked[tokenId]) continue;
            
            chessNFT.safeTransferFrom(address(this), player, tokenId);
            tokenStaked[tokenId] = false;
        }
    }
    
    /**
     * @dev Update player statistics
     */
    function _updatePlayerStats(
        address winner,
        address loser,
        uint256 winnerPrize,
        uint256 loserLoss
    ) internal {
        // Initialize ELO if needed
        if (playerStats[winner].elo == 0) playerStats[winner].elo = 1200;
        if (playerStats[loser].elo == 0) playerStats[loser].elo = 1200;
        
        uint256 oldWinnerElo = playerStats[winner].elo;
        uint256 oldLoserElo = playerStats[loser].elo;
        
        // Calculate new ELO
        (uint256 newWinnerElo, uint256 newLoserElo) = _calculateElo(oldWinnerElo, oldLoserElo);
        
        // Update winner stats
        playerStats[winner].elo = newWinnerElo;
        playerStats[winner].wins++;
        playerStats[winner].totalEthWon += winnerPrize;
        playerStats[winner].matchesPlayed++;
        playerStats[winner].points += 100 + (newWinnerElo - oldWinnerElo);
        
        // Update loser stats
        playerStats[loser].elo = newLoserElo;
        playerStats[loser].losses++;
        playerStats[loser].totalEthLost += loserLoss;
        playerStats[loser].matchesPlayed++;
        playerStats[loser].points += 10; // Participation points
        
        // Update season points
        seasonPoints[currentSeason][winner] += 100 + (newWinnerElo - oldWinnerElo);
        seasonPoints[currentSeason][loser] += 10;
        
        emit EloUpdated(winner, oldWinnerElo, newWinnerElo);
        emit EloUpdated(loser, oldLoserElo, newLoserElo);
        emit PointsAwarded(winner, 100 + (newWinnerElo - oldWinnerElo), currentSeason);
        emit PointsAwarded(loser, 10, currentSeason);
    }
    
    /**
     * @dev Calculate ELO changes
     */
    function _calculateElo(uint256 winnerElo, uint256 loserElo) internal pure returns (uint256, uint256) {
        uint256 k = 32;
        
        // Expected score calculation (simplified)
        uint256 expectedWinner;
        if (winnerElo >= loserElo) {
            uint256 diff = winnerElo - loserElo;
            expectedWinner = 500 + (diff * 500) / 400;
            if (expectedWinner > 1000) expectedWinner = 1000;
        } else {
            uint256 diff = loserElo - winnerElo;
            expectedWinner = 500 - (diff * 500) / 400;
            if (expectedWinner > 500) expectedWinner = 0;
        }
        
        uint256 winnerGain = (k * (1000 - expectedWinner)) / 1000;
        uint256 loserLoss = (k * expectedWinner) / 1000;
        
        uint256 newWinnerElo = winnerElo + winnerGain;
        uint256 newLoserElo = loserElo > loserLoss ? loserElo - loserLoss : 0;
        
        return (newWinnerElo, newLoserElo);
    }
    
    /**
     * @dev Start a new season
     */
    function startNewSeason() external onlyOwner {
        currentSeason++;
        emit SeasonStarted(currentSeason);
    }
    
    /**
     * @dev Withdraw platform fees
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 amount = platformBalance;
        platformBalance = 0;
        payable(owner()).transfer(amount);
    }
    
    /**
     * @dev Get player stats
     */
    function getPlayerStats(address player) external view returns (
        uint256 elo,
        uint256 wins,
        uint256 losses,
        uint256 draws,
        uint256 totalEthWon,
        uint256 totalEthLost,
        uint256 matchesPlayed,
        uint256 points,
        bool isStaked,
        uint256 currentGameId
    ) {
        PlayerStats memory stats = playerStats[player];
        StakeInfo memory stake = stakes[player];
        
        return (
            stats.elo == 0 ? 1200 : stats.elo,
            stats.wins,
            stats.losses,
            stats.draws,
            stats.totalEthWon,
            stats.totalEthLost,
            stats.matchesPlayed,
            stats.points,
            stake.isStaked,
            stake.gameId
        );
    }
    
    /**
     * @dev Get game info
     */
    function getGameInfo(uint256 gameId) external view returns (
        address player1,
        address player2,
        uint256 prizePool,
        uint256 timePerPlayer,
        uint256 startTime,
        GameStatus status,
        address winner
    ) {
        Game memory game = games[gameId];
        return (
            game.player1,
            game.player2,
            game.prizePool,
            game.timePerPlayer,
            game.startTime,
            game.status,
            game.winner
        );
    }
    
    /**
     * @dev Get available games to join
     */
    function getAvailableGames() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count available games
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].status == GameStatus.Created && games[i].player2 == address(0)) {
                count++;
            }
        }
        
        // Build array
        uint256[] memory availableGames = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].status == GameStatus.Created && games[i].player2 == address(0)) {
                availableGames[index] = i;
                index++;
            }
        }
        
        return availableGames;
    }
}
