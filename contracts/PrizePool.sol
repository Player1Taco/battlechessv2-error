// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PrizePool
 * @dev Manages tournament prize pools and special event rewards
 */
contract PrizePool is Ownable, ReentrancyGuard {
    
    struct Tournament {
        string name;
        uint256 entryFee;
        uint256 prizePool;
        uint256 maxPlayers;
        uint256 currentPlayers;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isComplete;
        address[] winners;
        uint256[] prizeDistribution; // Percentages in basis points
    }
    
    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => mapping(address => bool)) public tournamentEntries;
    mapping(uint256 => address[]) public tournamentPlayers;
    
    uint256 public tournamentCounter;
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event TournamentCreated(uint256 indexed tournamentId, string name, uint256 entryFee, uint256 maxPlayers);
    event TournamentJoined(uint256 indexed tournamentId, address indexed player);
    event TournamentCompleted(uint256 indexed tournamentId, address[] winners, uint256[] prizes);
    event PrizeDistributed(uint256 indexed tournamentId, address indexed winner, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new tournament
     */
    function createTournament(
        string memory name,
        uint256 entryFee,
        uint256 maxPlayers,
        uint256 startTime,
        uint256 duration,
        uint256[] memory prizeDistribution
    ) external onlyOwner {
        require(maxPlayers > 0, "Invalid max players");
        require(startTime > block.timestamp, "Start time must be in future");
        
        // Validate prize distribution adds up to 100%
        uint256 totalDistribution;
        for (uint256 i = 0; i < prizeDistribution.length; i++) {
            totalDistribution += prizeDistribution[i];
        }
        require(totalDistribution == BASIS_POINTS, "Distribution must equal 100%");
        
        tournamentCounter++;
        
        tournaments[tournamentCounter] = Tournament({
            name: name,
            entryFee: entryFee,
            prizePool: 0,
            maxPlayers: maxPlayers,
            currentPlayers: 0,
            startTime: startTime,
            endTime: startTime + duration,
            isActive: false,
            isComplete: false,
            winners: new address[](0),
            prizeDistribution: prizeDistribution
        });
        
        emit TournamentCreated(tournamentCounter, name, entryFee, maxPlayers);
    }
    
    /**
     * @dev Join a tournament
     */
    function joinTournament(uint256 tournamentId) external payable nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(tournament.maxPlayers > 0, "Tournament does not exist");
        require(!tournament.isComplete, "Tournament already complete");
        require(tournament.currentPlayers < tournament.maxPlayers, "Tournament full");
        require(!tournamentEntries[tournamentId][msg.sender], "Already joined");
        require(msg.value >= tournament.entryFee, "Insufficient entry fee");
        require(block.timestamp < tournament.startTime, "Registration closed");
        
        tournament.prizePool += msg.value;
        tournament.currentPlayers++;
        tournamentEntries[tournamentId][msg.sender] = true;
        tournamentPlayers[tournamentId].push(msg.sender);
        
        emit TournamentJoined(tournamentId, msg.sender);
        
        // Refund excess
        if (msg.value > tournament.entryFee) {
            payable(msg.sender).transfer(msg.value - tournament.entryFee);
        }
    }
    
    /**
     * @dev Complete tournament and distribute prizes
     */
    function completeTournament(
        uint256 tournamentId,
        address[] memory winners
    ) external onlyOwner nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        
        require(!tournament.isComplete, "Already complete");
        require(winners.length == tournament.prizeDistribution.length, "Winners count mismatch");
        
        tournament.isComplete = true;
        tournament.winners = winners;
        
        uint256[] memory prizes = new uint256[](winners.length);
        
        for (uint256 i = 0; i < winners.length; i++) {
            uint256 prize = (tournament.prizePool * tournament.prizeDistribution[i]) / BASIS_POINTS;
            prizes[i] = prize;
            
            if (prize > 0) {
                payable(winners[i]).transfer(prize);
                emit PrizeDistributed(tournamentId, winners[i], prize);
            }
        }
        
        emit TournamentCompleted(tournamentId, winners, prizes);
    }
    
    /**
     * @dev Add to prize pool (for sponsors)
     */
    function addToPrizePool(uint256 tournamentId) external payable {
        Tournament storage tournament = tournaments[tournamentId];
        require(!tournament.isComplete, "Tournament complete");
        tournament.prizePool += msg.value;
    }
    
    /**
     * @dev Get tournament info
     */
    function getTournamentInfo(uint256 tournamentId) external view returns (
        string memory name,
        uint256 entryFee,
        uint256 prizePool,
        uint256 maxPlayers,
        uint256 currentPlayers,
        uint256 startTime,
        uint256 endTime,
        bool isComplete
    ) {
        Tournament storage t = tournaments[tournamentId];
        return (
            t.name,
            t.entryFee,
            t.prizePool,
            t.maxPlayers,
            t.currentPlayers,
            t.startTime,
            t.endTime,
            t.isComplete
        );
    }
    
    /**
     * @dev Get tournament players
     */
    function getTournamentPlayers(uint256 tournamentId) external view returns (address[] memory) {
        return tournamentPlayers[tournamentId];
    }
}
