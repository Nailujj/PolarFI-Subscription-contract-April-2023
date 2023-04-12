// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract USDC is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    constructor() ERC20("USDC", "USDC") ERC20Permit("USDC") {
        _mint(msg.sender, 10000 * 10 ** decimals());
    }

    function mint( uint256 amount) public  {
        _mint(msg.sender, amount);
    }
}
