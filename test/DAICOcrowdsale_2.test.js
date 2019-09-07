//const BigNumber = web3.BigNumber;
//const contract = require('truffle-contract');
const DAICOtoken = artifacts.require('DAICOtoken');
const DAICOcrowdsale = artifacts.require('DAICOcrowdsale');
const Voting = artifacts.require('Voting');
const votingABI = require('../build/contracts/Voting');
//require('chai').use(require('chai-bignumber')(BigNumber)).should();
const BigNumber = require('bignumber.js');

contract('DAICOcrowdsale', accounts => {
  const _name = 'DAICOtoken';
  const _symbol = 'DAICO';
  const _decimals = 18;

  before(async function () {
    this.crowdsale = await DAICOcrowdsale.new();
    const tokenAddress = await this.crowdsale.tokenAddress.call();
    this.token = await DAICOtoken.at(tokenAddress);
    this.voting = null;
  });

  describe('start decentralized ICO', function () {
    /*
    it('add minter', async function () {
      this.token.addMinter(this.crowdsale.address);

      const isMinter = await this.token.isMinter(this.crowdsale.address);
      assert.equal(true, isMinter, 'Minter is false');
    });
    */
    it('send ether to crowdsale', async function () {
      const ether = web3.utils.toWei('1', 'ether');
      await this.crowdsale.sendTransaction({ from: accounts[0], value: ether.toString() });

      const invested = await this.crowdsale.allInvestors(accounts[0]);
      assert.equal(invested.invested.toString(), ether.toString(), 'Wei raised is not the same as investment!');
    });

    it('start tap voting', async function () {
      await this.crowdsale.startTapVoting();
      const votingAddress = await this.crowdsale.v.call();
      this.voting = await Voting.at(votingAddress);
      const isTapVotingActive = await this.crowdsale.tapVotingActive.call();
      assert.equal(isTapVotingActive, true, 'Tap voting is not active!');
    });

    it('add allowance for voting contract to transfer tokens for voting', async function () {
      const tokensToApprove = await this.crowdsale.allInvestors(accounts[0]);
      await this.token.approve(this.voting.address, tokensToApprove.tokensToRefund.toString());
      const allowance = await this.token.allowance(accounts[0], this.voting.address);
      assert.equal(allowance.toString(), tokensToApprove.tokensToRefund.toString(), 'Allowance and refund tokens are not the same!')
    });

    it('vote for tap raise', async function () {
      const t = await this.voting.addVote(true);
      const votingResults = await this.voting.getVotingResults();
      assert.equal(votingResults, true, 'Voting is not right!');
    });

    it('finalize tap voting', async function () {
      await this.crowdsale.finalizeTapVoting();
      const tapVotingActive = await this.crowdsale.tapVotingActive.call();
      assert.equal(tapVotingActive, false, 'Refund is not active!');
    });

    it('tap raise success', async function () {
      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      await timeout(5000);
      const tapWei = await this.crowdsale.tapWei.call();
      assert.equal(BigNumber(tapWei) > 20000000000000000, true, 'Tap raise failed!');
    });

    /*
    it('funds released to devleopers', async function () {
      const ethBalance = await web3.eth.getBalance(this.crowdsale.address);
      console.log(BigNumber(ethBalance))
      const weiRaised = await this.crowdsale.weiRaised();
      console.log(BigNumber(weiRaised))
      assert.equal(ethBalance.toString() !== weiRaised.toString(), true, 'Funds not released!');
    });
    */
    it('return tokens to owners', async function () {
      await this.voting.returnTokens();
      const tokensBalance = await this.token.balanceOf(accounts[0]);
      const voteBalance = await this.voting.getVoter(accounts[0]);
      assert.equal(tokensBalance.toString(), voteBalance[2].toString(), 'Tokens not received!');
    });

    it('release funds by demand', async function () {
      await this.crowdsale.releaseFunds();
      const ethBalance = await web3.eth.getBalance(this.crowdsale.address);
      const weiRaised = await this.crowdsale.weiRaised();
      assert.equal(ethBalance.toString() !== weiRaised.toString(), true, 'Funds not released!');
    });
  });
});