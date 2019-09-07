pragma solidity >=0.4.22 <0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "../node_modules/openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "../node_modules/openzeppelin-solidity/contracts/crowdsale/validation/WhitelistCrowdsale.sol";
import "../node_modules/openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./DAICOtoken.sol";
import "./Voting.sol";

contract DAICOcrowdsale is MintedCrowdsale, TimedCrowdsale, Ownable {
    
    bool public refundVotingActive = false;
    bool public refundActive = false;
    bool public tapVotingActive = false;
    
    uint256 public refundRate;
    
    uint256 public tapWei = 20000000000000000;
    uint256 public lastWithdrawTime = now;
    uint256 public lastVotingEndTime;
    Voting public v;
    
    uint256 private tokensSold = 0;
    address public tokenAddress;
    DAICOtoken public tokenName;
    
    address[] public voting;
    
    mapping(address => Investor) public allInvestors;
    address[] public investors;
    
    struct Investor {
        uint256 invested;
        uint256 tokens;
        uint256 tokensToRefund;
    }

    event RefundClaimed(bool _status);
    event FundsReleased(uint256 _wei);
    
    ERC20Mintable _token = new DAICOtoken("NoviToken", "NVT", 18);
    
    constructor()
    Crowdsale(12000, address(this), _token)
    //CappedCrowdsale(1000000 * 10**16)
    TimedCrowdsale(now, now + 0.5 minutes)
    public
    {   
        tokenAddress = address(_token);
    }
    
    modifier refund {
        require(!refundVotingActive);
        require(!tapVotingActive);
        _;
    }
    
    modifier tapVoting {
        require(!tapVotingActive);
        require(!refundVotingActive);
        _;
    }
    
    modifier votingEnded {
        require(lastVotingEndTime <= now);
        _;
    }
    
    modifier crowdSaleIsOver {
      require(closingTime() < block.timestamp);
      _;
    }
    
    function tokensBought(address _investor) public view returns(uint256) {
        return allInvestors[_investor].invested;
    }
    
    
    function _updatePurchasingState(address beneficiary, uint256 weiAmount) internal {
        allInvestors[beneficiary].invested = weiAmount;
        investors.push(beneficiary);
    }
    
    function _forwardFunds() internal {
        //_wallet.transfer(msg.value);
    }
    
    function _processPurchase(address beneficiary, uint256 tokenAmount) internal {
        _deliverTokens(beneficiary, tokenAmount);
        allInvestors[beneficiary].tokens = tokenAmount;
        allInvestors[beneficiary].tokensToRefund = tokenAmount;
        tokensSold = tokensSold + tokenAmount;
    }
    
    function startRefundVoting() public refund crowdSaleIsOver {
        refundVotingActive = true;
        lastVotingEndTime = now + 0.5 minutes;
        v = new Voting(tokenAddress, lastVotingEndTime, false, address(this));
        voting.push(address(v));
    }
    
    
    function startTapVoting() public /*onlyOwner tapVoting crowdSaleIsOver*/ {
        tapVotingActive = true;
        lastVotingEndTime = now + 0.5 minutes;
        v = new Voting(tokenAddress, lastVotingEndTime, true, address(this));
        voting.push(address(v));
    }
    
    function finalizeRefundVoting() public votingEnded {
        require(refundVotingActive);
        require(!tapVotingActive);
        require(!refundActive);
        bool result = v.getVotingResults();
        if(result){
            refundRate = calculateRefundRate();
            refundActive = true;
        }
        refundVotingActive = false;
    }
    
    function finalizeTapVoting() public /*onlyOwner votingEnded*/ {
        require(tapVotingActive);
        require(!refundVotingActive);
        bool result = v.getVotingResults();
        if(result){
            releaseFunds();
            tapWei = tapWei + (tapWei * 1/10);
        }
        tapVotingActive = false;
    }
    
    function calculateRefundRate() private view returns (uint256) {
        uint256 balance = address(this).balance;
        uint256 newRate = balance;
        return newRate;
    }
    
    
    function releaseFunds() public onlyOwner {
        uint256 weiAmount = tapForRelease();
        lastWithdrawTime = now;
        if(weiAmount<address(this).balance){
            address(0xF67535b630bF119ca643cf75F9F23723E00E28ca).transfer(weiAmount);
        } else {
            address(0xF67535b630bF119ca643cf75F9F23723E00E28ca).transfer(address(this).balance);
        }
        emit FundsReleased(weiAmount);
    }
    
    function tapForRelease() public view returns (uint256) {
        uint256 weiAmount = (now - lastWithdrawTime) * tapWei;
        return weiAmount;
    }
    
    function getETHBalance() public view returns(uint256) {
        uint256 ethBalance = address(this).balance;
        return(ethBalance);
    }
    function BalanceTokens() public view returns(uint256) {
        uint256 balance = ERC20(tokenAddress).balanceOf(msg.sender);
        return(balance);
    }
    
    function refundTokens() public view returns(uint256) {
        uint256 tokensToRefund = allInvestors[msg.sender].tokensToRefund;
        return(tokensToRefund);
    }
    
    function getSoldTokens() public view returns(uint256) {
        return(tokensSold);
    }
    
    function claimRefund() public {
        require(refundActive);
        uint256 balance = ERC20(tokenAddress).balanceOf(msg.sender);
        uint256 tokensToRefund = allInvestors[msg.sender].tokensToRefund;
        if(balance <= tokensToRefund && tokensToRefund != 0){
            uint256 refundEth = refundRate * balance / tokensSold;
            msg.sender.transfer(refundEth);
            allInvestors[msg.sender].tokensToRefund -= balance;
            //tokenName.burn(balance);
            emit RefundClaimed(true);
        }
    }
}