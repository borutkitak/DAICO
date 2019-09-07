pragma solidity >=0.4.22 <0.6.0;

import "./DAICOcrowdsale.sol";
import "./DAICOtoken.sol";

contract Voting {
    struct Vote {
        bool vote;
        bool didVote;
        uint256 dateTime;
        uint256 tokensAmount;
        bool tokensReturned;
    }
    
    bool public raiseTapVoting;
    
    uint256 public positiveVotes = 0;
    uint256 public negativeVotes = 0;
    
    uint256 public startTime = now;
    uint256 public endTime;
    
    address public tokenAddress;
    address payable private crowdsaleAddress;
    
    mapping(address => Vote) votes;
    address[] public allVoters;

    event VoteAdded(bool _vote, uint256 _tokens);
    
    constructor(address _tokenAddress, uint256 _endTime, bool _votingType, address payable _crowdsale) public {
        tokenAddress = _tokenAddress;
        endTime = _endTime;
        raiseTapVoting = _votingType;
        crowdsaleAddress = _crowdsale;
    }
    
    modifier votingInProgress {
        require(now <= endTime);
        _;
    }
    
    modifier votingEnded {
        require(now > endTime);
        _;
    }
    
    modifier canVote {
        if(!raiseTapVoting){
            require(DAICOcrowdsale(crowdsaleAddress).tokensBought(msg.sender) > 0);
        }
        _;
    }
    
    function getVoter(address voterAddress) public view returns(bool, uint256, uint256, bool){
        return (votes[voterAddress].vote, votes[voterAddress].dateTime, votes[voterAddress].tokensAmount, votes[voterAddress].didVote);
    }
    
    function test() public view returns(address, address){
        return(msg.sender, address(this));
    }
    
    function addVote(bool vote) public votingInProgress canVote {
        uint256 tokensBalance = ERC20(tokenAddress).balanceOf(msg.sender);
        ERC20(tokenAddress).approve(address(this), tokensBalance);
        ERC20(tokenAddress).transferFrom(msg.sender, address(this), tokensBalance);
        //uint256 tokensBalance = 100000000000;
        votes[msg.sender].vote = vote;
        votes[msg.sender].didVote = true;
        votes[msg.sender].dateTime = now;
        votes[msg.sender].tokensAmount = tokensBalance;
            
        allVoters.push(msg.sender) -1;
            
        if(vote){
            positiveVotes += tokensBalance;
        } else {
            negativeVotes += tokensBalance;
        }

        emit VoteAdded(vote, tokensBalance);
    }
    
    function returnTokens() public votingEnded {
        if(votes[msg.sender].tokensAmount > 0 && !votes[msg.sender].tokensReturned){
            ERC20(tokenAddress).transfer(msg.sender, votes[msg.sender].tokensAmount); 
            votes[msg.sender].tokensReturned = true;
        }
    }
    
    function getVotingResults() public view returns (bool) {
        if(positiveVotes - negativeVotes > 0) {
            return true;
        }
        return false;
    }
    
    function votingIsActive() public view returns(bool) {
        if(now > endTime){
            return false;
        }
        return true;
    }
}