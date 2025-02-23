pragma solidity ^0.8.0;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

contract TokenVoting {
    address public owner;
    IERC20 public votingToken;
    string public pollQuestion;
    string[] public options;
    mapping(address => bool) public hasVoted;
    mapping(uint256 => uint256) public votes;
    uint256 public totalVotes;

    constructor(address _votingToken, string memory _pollQuestion, string[] memory _options) {
        owner = msg.sender;
        votingToken = IERC20(_votingToken);
        pollQuestion = _pollQuestion;
        options = _options;
    }

    function vote(uint256 optionId) public {
        require(optionId < options.length, "Invalid option");
        require(!hasVoted[msg.sender], "Already voted");

        uint256 votingPower = votingToken.balanceOf(msg.sender);
        require(votingPower > 0, "No voting power");

        votes[optionId] += votingPower;
        totalVotes += votingPower;
        hasVoted[msg.sender] = true;
    }

    function getVotes(uint256 optionId) public view returns (uint256) {
        require(optionId < options.length, "Invalid option");
        return votes[optionId];
    }

    function getWinningOption() public view returns (string memory winningOption) {
        uint256 winningVoteCount = 0;
        for (uint256 i = 0; i < options.length; i++) {
            if (votes[i] > winningVoteCount) {
                winningVoteCount = votes[i];
                winningOption = options[i];
            }
        }
    }

    function resetPoll() public {
        require(msg.sender == owner, "Only owner can reset poll");
        for (uint256 i = 0; i < options.length; i++) {
            votes[i] = 0;
        }
        totalVotes = 0;
        for (address voter : getAllVoters()) {
            hasVoted[voter] = false;
        }
    }

    function getAllVoters() internal view returns (address[] memory) {
        address[] memory voters = new address[](totalVotes);
        uint256 index = 0;
        for (uint256 i = 0; i < totalVotes; i++) {
            if (hasVoted[voters[i]]) {
                voters[index] = voters[i];
                index++;
            }
        }
        return voters;
    }
}