pragma solidity >=0.4.22 <0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20//ERC20Mintable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract DAICOtoken is ERC20, ERC20Mintable, ERC20Detailed, ERC20Burnable, ERC20Capped {
    //string memory _name, string memory _symbol, uint8 _decimals, uint256 _cap
    constructor(string memory _tokenName, string memory _symbol, uint8 _decimals) 
    ERC20Detailed(_tokenName, _symbol, _decimals)
    ERC20Capped(50000000 * 10 ** 18)
    public
    {

    }
}