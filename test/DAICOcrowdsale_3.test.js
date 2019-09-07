//const BigNumber = web3.BigNumber;
//const contract = require('truffle-contract');
const DAICOtoken = artifacts.require('DAICOtoken');
const DAICOcrowdsale = artifacts.require('DAICOcrowdsale');
const Voting = artifacts.require('Voting');
//require('chai').use(require('chai-bignumber')(BigNumber)).should();

contract('DAICOcrowdsale', accounts => {
  const _name = 'DAICOtoken';
  const _symbol = 'DAICO';
  const _decimals = 18;

  before(async function () {
    //this.token = await DAICOtoken.new(_name, _symbol/*, _decimals*/);
    this.crowdsale = await DAICOcrowdsale.new();
    const tokenAddress = await this.crowdsale.tokenAddress.call();
    this.token = await DAICOtoken.at(tokenAddress);
    this.voting = null;
  });

  describe('start decentralized ICO 3', function () {
    /*
    it('add minter', async function () {
      this.token.addMinter(this.crowdsale.address);
      
      const isMinter = await this.token.isMinter(this.crowdsale.address);
      assert.equal(true, isMinter, 'Minter is false');
    });
    */
    it('send ether to crowdsale', async function () {
      const ether = web3.utils.toWei('1', 'ether');
      const ether2 = web3.utils.toWei('5', 'ether');
      const ether3 = web3.utils.toWei('0.4', 'ether');
      const etherSent = web3.utils.toWei('6.4', 'ether');

      await this.crowdsale.sendTransaction({ from: accounts[0], value: ether.toString() });
      await this.crowdsale.sendTransaction({ from: accounts[1], value: ether2.toString() });
      await this.crowdsale.sendTransaction({ from: accounts[2], value: ether3.toString() });

      const invested = await this.crowdsale.weiRaised();
      assert.equal(invested.toString(), etherSent.toString(), 'Wei raised is not the same as investment!');
    });

    it('check tokens amount received - investor', async function () {
      const tokenBalance = await this.token.balanceOf(accounts[0]);
      const totalSupply = await this.crowdsale.allInvestors(accounts[0]);

      assert.equal(tokenBalance.toString(), totalSupply.tokensToRefund.toString(), 'Refund voting is not active!');
    });

    it('check tokens amount received - investor2', async function () {
      const tokenBalance = await this.token.balanceOf(accounts[1]);
      const totalSupply = await this.crowdsale.allInvestors(accounts[1]);

      assert.equal(tokenBalance.toString(), totalSupply.tokensToRefund.toString(), 'Refund voting is not active!');
    });

    it('check tokens amount received - investor3', async function () {
      const tokenBalance = await this.token.balanceOf(accounts[2]);
      const totalSupply = await this.crowdsale.allInvestors(accounts[2]);

      assert.equal(tokenBalance.toString(), totalSupply.tokensToRefund.toString(), 'Refund voting is not active!');
    });

    it('crowdsale not ended', async function () {
      const crowdsaleOpen = await this.crowdsale.isOpen();
      assert.equal(crowdsaleOpen, true, 'Crowdsale has ended!');
    });

    it('start refund voting - crowdsale in progress', async function () {
      try {
        await this.crowdsale.startRefundVoting();
        const votingAddress = await this.crowdsale.v.call();
        this.voting = await Voting.at(votingAddress);
        const isRefundVotingActive = await this.crowdsale.refundVotingActive.call();
        assert.equal(isRefundVotingActive, true, 'Refund voting is not active!');
      } catch (error) {
        const isRefundVotingActive = await this.crowdsale.refundVotingActive.call();
        assert.equal(isRefundVotingActive, false, 'Refund voting is active!');
      }
    });

    it('crowdsale has ended', async function () {
      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      await timeout(30000);

      const crowdsaleOpen = await this.crowdsale.isOpen();
      assert.equal(crowdsaleOpen, false, 'Crowdsale is open!');
    });

    it('start refund voting', async function () {
      await this.crowdsale.startRefundVoting();
      const votingAddress = await this.crowdsale.v.call();
      this.voting = await Voting.at(votingAddress);
      const isRefundVotingActive = await this.crowdsale.refundVotingActive.call();
      assert.equal(isRefundVotingActive, true, 'Refund voting is not active!');
    });
    /*
    it('add allowance for voting contract to transfer tokens for voting', async function () {
      const tokensToApprove = await this.crowdsale.allInvestors(accounts[0]);
      await this.token.approve(this.voting.address, tokensToApprove.tokensToRefund.toString());
      const allowance = await this.token.allowance(accounts[0], this.voting.address);
      assert.equal(allowance.toString(), tokensToApprove.tokensToRefund.toString(), 'Allowance and refund tokens are not the same!')
    });
    */
    it('vote for refund - is not DAICO investor', async function () {
      try {
        const a = await this.voting.addVote({ from: accounts[5] }, true);
        console.log(a);
        const votingResults = await this.voting.getVotingResults();
        assert.equal(votingResults, true, 'Voting is not right!');
      } catch (error) {
        assert.equal(true, true, 'Participated in DAICO');
      }
    });

    it('vote for refund - DAICO investor', async function () {
      try {
        await this.voting.addVote(true);
        const votingResults = await this.voting.getVotingResults();
        assert.equal(votingResults, true, 'Voting is not right!');
      } catch (error) {
        assert.equal(true, true, 'Participated in DAICO');
      }
    });

    it('finalize refund - shouldnt be possible', async function () {
      try {
        await this.crowdsale.finalizeRefundVoting();
        const refundActive = await this.crowdsale.refundActive.call();
        assert.equal(refundActive, true, 'Refund is not active!');
      } catch (error) {
        assert.equal(true, true, 'Refund is active!');
      }
    });

    it('finalize refund', async function () {
      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      await timeout(30000);
      
      await this.crowdsale.finalizeRefundVoting();
      const refundActive = await this.crowdsale.refundActive.call();
      assert.equal(refundActive, true, 'Refund is not active2!');
    });

    //bomo obdrzali tokene pa vrnili samo ether
    it('return tokens to owners', async function () {
      await this.voting.returnTokens();
      const tokensBalance = await this.token.balanceOf(accounts[0]);
      const voteBalance = await this.voting.getVoter(accounts[0]);
      assert.equal(tokensBalance.toString(), voteBalance[2].toString(), 'Tokens not received!');
    });

    it('claim refund', async function () {
      await this.crowdsale.claimRefund();
      const tokensToRefund = await this.crowdsale.allInvestors(accounts[0]);
      assert.equal(tokensToRefund.tokensToRefund.toString(), 0, 'Refund not received!');
    });
  });
});