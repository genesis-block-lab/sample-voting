pragma solidity ^0.4.21;

contract Ownable {
  address public owner;

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

}

contract Voting is Ownable {
    bool public isEnded = false;

    mapping (bytes32 => uint8) public votesReceived;
    mapping(address => bool) private voterStatus;
    mapping(bytes32 => bool) public validCandidates;

    bytes32[3] public candidateNames = [bytes32("Hulk"), bytes32("Captain"), bytes32("Stark")];

    constructor() public {
        for(uint i = 0; i < candidateNames.length; i++) {
            validCandidates[candidateNames[i]] = true;
        }
    }

    modifier canVote() {
        require(isEnded == false);
        _;
    }

    function totalVotesFor(bytes32 _candidate) view public returns (uint8) {
        require(validCandidates[_candidate]);
        return votesReceived[_candidate];
    }

    function voteForCandidate(bytes32 _candidate) public canVote returns (bool) {
        address voter = msg.sender;
        require(validCandidates[_candidate]);
        require(voterStatus[voter] != true);

        voterStatus[voter] = true;
        votesReceived[_candidate] += 1;

        return true;
    }

    function endVoting() public onlyOwner returns (bool) {
        //TODO: Implement
    }

    function changeVoting(bytes32 _newCandidate) public returns (bool) {
        address voter = msg.sender;
        // TODO: Implement
        // Hint: Keep the paramameters of functions, you can add/edit the contract variables

        return true;
    }

}
