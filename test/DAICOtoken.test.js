//const BigNumber = web3.BigNumber;
const DAICOtoken = artifacts.require('DAICOtoken');

//require('chai').use(require('chai-bignumber')(BigNumber)).should();

contract('DAICOtoken', accounts => {
  const _name = 'DAICOtoken';
  const _symbol = 'DAICO';
  const _decimals = 18;

  beforeEach(async function () {
    //this.token = await DAICOtoken.new(_name, _symbol/*, _decimals*/);
  });
  /*
  describe('token attributes', function () {
    it('has the correct name', async function () {
      const name = await this.token.name();
      assert.equal(_name, name);
    });

    it('has the correct symbol', async function () {
      const symbol = await this.token.symbol();
      assert.equal(_symbol, symbol);
    });
    it('has the correct decimals', async function () {
      const decimals = await this.token.decimals();
      assert.equal(_decimals, decimals.toNumber());
    });
  });
  */
});