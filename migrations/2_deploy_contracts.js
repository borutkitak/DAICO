var MasterToken = artifacts.require("DAICOtoken");
var MasterTokenCrowdsale = artifacts.require("DAICOcrowdsale");
//var Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  //const token = await deployer.deploy(MasterToken);
  const _name = 'DAICO';
  const _symbol = 'DAICO';
  const _decimals = 18;

  /*
  deployer.deploy(MasterToken, _name, _symbol).then(function () {
    return deployer.deploy(MasterTokenCrowdsale, MasterToken.address);
  });
  */

  deployer.deploy(MasterTokenCrowdsale);
};