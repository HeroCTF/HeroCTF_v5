// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract hero2300 {
    bool public firstFlag;
    bool public secondFlag;

    constructor() {
        firstFlag = false;
        secondFlag = false;
    }

    function meFirst() public {
        firstFlag = true;
    }

    function meSecond() public {
        if (firstFlag) {
            secondFlag = true;
        }
    }

    function win() public view returns (bool) {
        return (firstFlag && secondFlag);
    }

}