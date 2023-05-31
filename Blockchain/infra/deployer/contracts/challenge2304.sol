/**
 *Submitted for verification at BscScan.com on 2022-02-01
*/
import "./IERC20.sol";

//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

library SafeMath {

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;
        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) { return 0; }
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        return c;
    }
}



import "hardhat/console.sol" ;

abstract contract Auth {
    address internal owner;
    mapping (address => bool) internal authorizations;

    constructor() {
        owner = msg.sender;
        authorizations[owner] = true;
    }

    /**
     * Function modifier to require caller to be contract owner
     */
    modifier onlyOwner() {
        require(isOwner(msg.sender), "!OWNER"); _;
    }

    /**
     * Function modifier to require caller to be authorized
     */
    modifier authorized() {
        require(isAuthorized(msg.sender), "!AUTHORIZED"); _;
    }

    /**
     * Authorize address. Owner only
     */
    function authorize(address adr) public onlyOwner {
        authorizations[adr] = true;
    }

    /**
     * Remove address' authorization. Owner only
     */
    function unauthorize(address adr) public onlyOwner {
        authorizations[adr] = false;
    }

    /**
     * Check if address is owner
     */
    function isOwner(address account) public view returns (bool) {
        return account == owner;
    }

    /**
     * Return address' authorization status
     */
    function isAuthorized(address adr) public view returns (bool) {
        return authorizations[adr];
    }

    /**
     * Transfer ownership to new address. Caller must be owner. Leaves old owner authorized
     */
    function transferOwnership(address payable adr) public {
        owner = adr;
        authorizations[adr] = true;
        emit OwnershipTransferred(adr);
    }

    /**
     * Renounces ownership. Caller must be owner.
     */
     function renounceOwnership() public onlyOwner {
        owner = address(0);
        emit OwnershipTransferred(address(0));
     }

    event OwnershipTransferred(address owner);
}

contract hero2304 is IERC20, Auth {
    uint public totalSupply = 1000000 ether;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    string public name = "PouneSomeSolidity2earn";
    string public symbol = "PWNNERN";
    uint8 public decimals = 18;

    constructor() 
    {
        balanceOf[msg.sender] = totalSupply;
    }

    function getAllowance(address src) public view returns (uint) 
    {
      return allowance[msg.sender][src];
    }

    function getBalanceOf(address guy) public view returns (uint)
    {
        return balanceOf[guy];
    }

    function transfer(address recipient, uint256 amount) external returns (bool) 
    {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) external returns (bool) 
    {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool) 
    {

        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        allowance[sender][msg.sender] -= amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(uint amount) external authorized
    {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) external authorized
    {
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}