// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ChainTable
 * @notice Mesas pagas de ChainTable en token nativo (ETH / RON).
 * @dev Solo el `referee` (wallet del servidor de juego) puede empezar y cerrar mesas
 *      y elegir ganadores, y solo entre los jugadores que pagaron. Si el referee
 *      desaparece, cualquiera puede devolver la plata de una mesa empezada después
 *      de REFUND_TIMEOUT. El owner no puede mover fondos de los jugadores.
 */
contract ChainTable is Ownable2Step, ReentrancyGuard {
    enum State {
        NONE,
        OPEN,
        STARTED,
        ENDED,
        CANCELLED
    }

    enum Mode {
        BEAST, // 95% al 1ro
        CLASSIC // 60% / 20% / 15% del pozo; lo que no se reparte va al 1ro
    }

    struct Lobby {
        address creator;
        uint256 entryFee;
        uint16 maxPlayers;
        Mode mode;
        State state;
        uint64 startedAt;
        address[] players;
    }

    uint256 public constant FEE_PERCENT = 5;
    uint16 public constant MAX_PLAYERS = 8;
    uint256 public constant REFUND_TIMEOUT = 1 days;
    /// @dev Gas para cada pago directo; si el receptor falla, el monto queda para `withdraw`.
    uint256 private constant PAYOUT_GAS = 50_000;

    address public referee;
    address public feeRecipient;
    uint256 public lobbyCount;

    mapping(uint256 => Lobby) private lobbies;
    mapping(uint256 => mapping(address => bool)) public isPlayer;
    mapping(address => uint256) public pendingWithdrawals;

    event LobbyCreated(
        uint256 indexed lobbyId, address indexed creator, uint256 entryFee, uint16 maxPlayers, Mode mode
    );
    event PlayerJoined(uint256 indexed lobbyId, address indexed player);
    event PlayerLeft(uint256 indexed lobbyId, address indexed player);
    event LobbyStarted(uint256 indexed lobbyId, uint256 playerCount);
    event LobbyEnded(uint256 indexed lobbyId, address[] winners);
    event LobbyCancelled(uint256 indexed lobbyId, address indexed cancelledBy);
    event Payout(uint256 indexed lobbyId, address indexed to, uint256 amount);
    event PayoutDeferred(address indexed to, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event RefereeUpdated(address indexed referee);
    event FeeRecipientUpdated(address indexed feeRecipient);

    error ZeroAddress();
    error InvalidEntryFee();
    error InvalidMaxPlayers();
    error WrongState();
    error AlreadyJoined();
    error LobbyFull();
    error NotAPlayer();
    error NotReferee();
    error NotAllowed();
    error NotEnoughPlayers();
    error InvalidWinners();
    error TooEarly();
    error NothingToWithdraw();
    error TransferFailed();

    modifier onlyReferee() {
        if (msg.sender != referee) revert NotReferee();
        _;
    }

    constructor(address _referee, address _feeRecipient) Ownable(msg.sender) {
        if (_referee == address(0) || _feeRecipient == address(0)) revert ZeroAddress();
        referee = _referee;
        feeRecipient = _feeRecipient;
    }

    // ============ Jugadores ============

    /// @notice Crea una mesa y suma al creador como primer jugador (paga la entrada en el mismo tx).
    function createLobby(uint16 maxPlayers, Mode mode) external payable returns (uint256 lobbyId) {
        if (msg.value == 0) revert InvalidEntryFee();
        if (maxPlayers < 2 || maxPlayers > MAX_PLAYERS) revert InvalidMaxPlayers();

        lobbyId = ++lobbyCount;
        Lobby storage lobby = lobbies[lobbyId];
        lobby.creator = msg.sender;
        lobby.entryFee = msg.value;
        lobby.maxPlayers = maxPlayers;
        lobby.mode = mode;
        lobby.state = State.OPEN;

        emit LobbyCreated(lobbyId, msg.sender, msg.value, maxPlayers, mode);
        _addPlayer(lobbyId, lobby, msg.sender);
    }

    function joinLobby(uint256 lobbyId) external payable {
        Lobby storage lobby = lobbies[lobbyId];
        if (lobby.state != State.OPEN) revert WrongState();
        if (msg.value != lobby.entryFee) revert InvalidEntryFee();
        if (isPlayer[lobbyId][msg.sender]) revert AlreadyJoined();
        if (lobby.players.length >= lobby.maxPlayers) revert LobbyFull();
        _addPlayer(lobbyId, lobby, msg.sender);
    }

    /// @notice Salir de una mesa que todavía no empezó y recuperar la entrada.
    function leaveLobby(uint256 lobbyId) external nonReentrant {
        Lobby storage lobby = lobbies[lobbyId];
        if (lobby.state != State.OPEN) revert WrongState();
        if (!isPlayer[lobbyId][msg.sender]) revert NotAPlayer();

        isPlayer[lobbyId][msg.sender] = false;
        address[] storage players = lobby.players;
        for (uint256 i; i < players.length; ++i) {
            if (players[i] == msg.sender) {
                players[i] = players[players.length - 1];
                players.pop();
                break;
            }
        }
        if (players.length == 0) lobby.state = State.CANCELLED;

        emit PlayerLeft(lobbyId, msg.sender);
        _pay(lobbyId, msg.sender, lobby.entryFee);
    }

    /// @notice Cobrar pagos que no se pudieron enviar directo.
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NothingToWithdraw();
        pendingWithdrawals[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Devuelve la plata de una mesa empezada que el referee nunca cerró.
    function refundExpired(uint256 lobbyId) external nonReentrant {
        Lobby storage lobby = lobbies[lobbyId];
        if (lobby.state != State.STARTED) revert WrongState();
        if (block.timestamp < lobby.startedAt + REFUND_TIMEOUT) revert TooEarly();
        _refundAll(lobbyId, lobby);
    }

    // ============ Referee / creador ============

    /// @notice Bloquea la mesa al empezar la partida (ya no se puede salir ni cancelar).
    function startLobby(uint256 lobbyId) external onlyReferee {
        Lobby storage lobby = lobbies[lobbyId];
        if (lobby.state != State.OPEN) revert WrongState();
        if (lobby.players.length < 2) revert NotEnoughPlayers();
        _start(lobbyId, lobby);
    }

    /**
     * @notice Cierra la mesa y paga. `winners` en orden de llegada, sin repetir, todos jugadores.
     *         BEAST: exactamente 1. CLASSIC: 1 a 3, menos jugadores que en la mesa.
     */
    function endLobby(uint256 lobbyId, address[] calldata winners) external onlyReferee nonReentrant {
        Lobby storage lobby = lobbies[lobbyId];
        if (lobby.state != State.STARTED) revert WrongState();

        uint256 n = winners.length;
        if (lobby.mode == Mode.BEAST ? n != 1 : (n == 0 || n > 3 || n >= lobby.players.length)) {
            revert InvalidWinners();
        }
        for (uint256 i; i < n; ++i) {
            if (!isPlayer[lobbyId][winners[i]]) revert InvalidWinners();
            for (uint256 j; j < i; ++j) {
                if (winners[i] == winners[j]) revert InvalidWinners();
            }
        }

        lobby.state = State.ENDED;
        emit LobbyEnded(lobbyId, winners);

        uint256 pool = lobby.entryFee * lobby.players.length;
        uint256 fee = (pool * FEE_PERCENT) / 100;
        uint256 first = pool - fee;
        if (lobby.mode == Mode.CLASSIC) {
            if (n > 1) {
                uint256 second = (pool * 20) / 100;
                first -= second;
                _pay(lobbyId, winners[1], second);
            }
            if (n > 2) {
                uint256 third = (pool * 15) / 100;
                first -= third;
                _pay(lobbyId, winners[2], third);
            }
        }
        _pay(lobbyId, winners[0], first);
        _pay(lobbyId, feeRecipient, fee);
    }

    /// @notice Cancela una mesa que no empezó y devuelve todas las entradas.
    function cancelLobby(uint256 lobbyId) external nonReentrant {
        Lobby storage lobby = lobbies[lobbyId];
        if (lobby.state != State.OPEN) revert WrongState();
        if (msg.sender != lobby.creator && msg.sender != referee) revert NotAllowed();
        _refundAll(lobbyId, lobby);
        emit LobbyCancelled(lobbyId, msg.sender);
    }

    // ============ Owner ============

    function setReferee(address _referee) external onlyOwner {
        if (_referee == address(0)) revert ZeroAddress();
        referee = _referee;
        emit RefereeUpdated(_referee);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        if (_feeRecipient == address(0)) revert ZeroAddress();
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }

    // ============ Views ============

    function getLobby(uint256 lobbyId)
        external
        view
        returns (
            address creator,
            uint256 entryFee,
            uint16 maxPlayers,
            Mode mode,
            State state,
            uint64 startedAt,
            address[] memory players
        )
    {
        Lobby storage l = lobbies[lobbyId];
        return (l.creator, l.entryFee, l.maxPlayers, l.mode, l.state, l.startedAt, l.players);
    }

    // ============ Internas ============

    function _addPlayer(uint256 lobbyId, Lobby storage lobby, address player) private {
        isPlayer[lobbyId][player] = true;
        lobby.players.push(player);
        emit PlayerJoined(lobbyId, player);
        if (lobby.players.length == lobby.maxPlayers) _start(lobbyId, lobby);
    }

    function _start(uint256 lobbyId, Lobby storage lobby) private {
        lobby.state = State.STARTED;
        lobby.startedAt = uint64(block.timestamp);
        emit LobbyStarted(lobbyId, lobby.players.length);
    }

    function _refundAll(uint256 lobbyId, Lobby storage lobby) private {
        lobby.state = State.CANCELLED;
        address[] storage players = lobby.players;
        for (uint256 i; i < players.length; ++i) {
            _pay(lobbyId, players[i], lobby.entryFee);
        }
    }

    /// @dev Pago directo con gas acotado y sin copiar returndata; si falla, queda para `withdraw`.
    ///      Así un receptor que revierte no puede trabar la mesa para el resto.
    function _pay(uint256 lobbyId, address to, uint256 amount) private {
        if (amount == 0) return;
        bool ok;
        assembly {
            ok := call(PAYOUT_GAS, to, amount, 0, 0, 0, 0)
        }
        if (ok) {
            emit Payout(lobbyId, to, amount);
        } else {
            pendingWithdrawals[to] += amount;
            emit PayoutDeferred(to, amount);
        }
    }
}
