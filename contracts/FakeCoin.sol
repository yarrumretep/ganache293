pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import 'zeppelin-solidity/contracts/ownership/HasNoEther.sol';

contract FakeCoin is StandardToken, HasNoEther {
  uint public decimals = 18;
  function FakeCoin(uint amount) public {
    balances[msg.sender] = amount;
    totalSupply = amount;
  }

}
