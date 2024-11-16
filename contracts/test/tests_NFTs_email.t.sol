// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/EventTicketingNFT_Email.sol";
import {Proof, Seal, CallAssumptions} from "vlayer-0.1.0/Proof.sol";
import {ProofMode} from "vlayer-0.1.0/Seal.sol";


contract EventTicketingTicketTest is Test {
    EventTicketing public eventTicketing;
    address public owner;
    address public buyer;
    uint256 public eventTime;
    
    function setUp() public {
        owner = makeAddr("owner");
        buyer = makeAddr("buyer");
        eventTime = block.timestamp + 30 days;
        
        vm.startPrank(owner);
        // Deploy contract with email verification requirement
        eventTicketing = new EventTicketing(
            "UMONS Web3 Summit",
            "https://umons.be/web3",
            eventTime,
            "Mons, Belgium",
            "https://example.com/photo.jpg",
            50,
            0.05 ether,
            owner,
            "https://api.example.com/metadata/",
            address(0)
        );
        vm.stopPrank();
    }


}