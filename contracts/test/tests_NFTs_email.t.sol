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
            "^.*@umons.ac.be$"
        );
        vm.stopPrank();
    }

    function testBuyTicketWithProof() public {
        vm.startPrank(buyer);
        
        // Create the Seal structure
        bytes32[8] memory sealArray = [
            bytes32(0xb131a954ac4c6c40ba2c32c169cf8055d615babf1dae24467844e35ff5429998),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0)
        ];

        Seal memory seal = Seal({
            verifierSelector: bytes4(0xdeafbeef),
            seal: sealArray,
            mode: ProofMode.FAKE  // Using correct enum value
        });

        // Create the CallAssumptions structure
        CallAssumptions memory callAssumptions = CallAssumptions({
            functionSelector: bytes4(0xb224ae69),
            proverContractAddress: address(0x03701a3db17248c79AA6512CcDC89c45bc1443E2),
            settleBlockNumber: block.number-1, //7089408,
            settleBlockHash: blockhash(block.number - 1) //bytes32(0x30db78573d7a9ec73a9275d70414aa301bd0597e55e07472f497f525ff869d3e)
        });

        // Create the complete Proof structure
        Proof memory proof = Proof({
            seal: seal,
            callGuestId: bytes32(0xc0f59f76de44b1700c2de89e0eeffbbad523e049b6beef55441f371811f62767),
            length: 640,
            callAssumptions: callAssumptions
        });

        // Fund the buyer's account
        vm.deal(buyer, 1 ether);

        // Try to buy ticket
        eventTicketing.buy{value: 0.05 ether}(proof);

        // Verify ticket was purchased successfully
        assertTrue(eventTicketing.hasTicket(buyer), "Buyer should have a ticket");
        
        // Check ticket details
        EventTicketing.EventInfo memory info = eventTicketing.getEventInfo();
        assertEq(info.n_tickets_sold, 1, "One ticket should be sold");
        
        // Verify ticket info
        (address ticketOwner, uint256 ticketNumber, bool isValid) = eventTicketing.getTicketInfo(1);
        assertEq(ticketOwner, buyer, "Ticket owner should be buyer");
        assertEq(ticketNumber, 1, "Ticket number should be 1");
        assertTrue(isValid, "Ticket should be valid");

        vm.stopPrank();
    }


}