// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/EventTicketingNFT.sol";

contract EventTicketingTest is Test {
    EventTicketing public ticketing;
    address public owner;
    address public user1;
    address public user2;

    string constant NAME = "ETH Global Paris";
    string constant URL = "https://ethglobal.paris";
    string constant LOCATION = "Paris, France";
    string constant PHOTO = "ipfs://QmXyZ123...abc";
    uint256 constant N_TICKETS = 100;
    uint256 constant PRICE = 0.1 ether;
    string constant BASE_URI = "https://api.myevent.com/metadata/";
    uint256 constant EVENT_TIME = 1734115200; // Some time in the future

    event TicketMinted(address to, uint256 tokenId, uint256 ticketNumber);

    function setUp() public {
        owner = address(this);

        user1 = vm.addr(1);
        user2 = vm.addr(2);
        
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);

        ticketing = new EventTicketing(
            NAME,
            URL,
            block.timestamp + 1 days,
            LOCATION,
            PHOTO,
            N_TICKETS,
            PRICE,
            owner,
            BASE_URI
        );
    }

    function testInitialState() public view{
        EventTicketing.EventInfo memory info = ticketing.getEventInfo();
        assertEq(info.name, NAME);
        assertEq(info.url, URL);
        assertEq(info.location, LOCATION);
        assertEq(info.photo, PHOTO);
        assertEq(info.n_tickets, N_TICKETS);
        assertEq(info.n_tickets_sold, 0);
        assertEq(info.price, PRICE);
    }

    function testBuyPaidTicket() public {
        vm.expectEmit(true, true, true, true);
        emit TicketMinted(user1, 1, 1);

        vm.prank(user1);
        ticketing.buy{value: PRICE}();

        assertTrue(ticketing.hasTicket(user1));
        
        (address _owner, uint256 ticketNumber, bool isValid) = ticketing.getTicketInfo(1);
        assertEq(_owner, user1);
        assertEq(ticketNumber, 1);
        assertTrue(isValid);
    }

    function testCannotBuyTwiceFromSameAddress() public {
            vm.startPrank(user1);
            
            // First purchase should succeed
            ticketing.buy{value: PRICE}();
            
            // Second purchase should fail
            vm.expectRevert("Address already has a ticket");
            ticketing.buy{value: PRICE}();
            
            vm.stopPrank();
            
            // Verify user1 has exactly one ticket
            assertEq(ticketing.balanceOf(user1), 1, "User should have exactly one ticket");
        }

    function testFreeTickets() public {
        // Create new event with free tickets
        EventTicketing freeEvent = new EventTicketing(
            NAME,
            URL,
            block.timestamp + 1 days,
            LOCATION,
            PHOTO,
            N_TICKETS,
            0, // Free tickets
            owner,
            BASE_URI
        );

        vm.prank(user1);
        freeEvent.buy();

        assertTrue(freeEvent.hasTicket(user1));
        assertEq(freeEvent.balanceOf(user1), 1);
    }

    function testFailPayForFreeTicket() public {
        EventTicketing freeEvent = new EventTicketing(
            NAME,
            URL,
            block.timestamp + 1 days,
            LOCATION,
            PHOTO,
            N_TICKETS,
            0,
            owner,
            BASE_URI
        );

        vm.prank(user1);
        freeEvent.buy{value: 0.1 ether}();
    }

    function testFailInsufficientPayment() public {
        vm.prank(user1);
        ticketing.buy{value: PRICE - 0.01 ether}();
    }


    function testWithdraw() public {
        // Buy some tickets
        vm.prank(user1);
        ticketing.buy{value: PRICE}();

        vm.prank(user2);
        ticketing.buy{value: PRICE}();

        uint256 expectedBalance = PRICE * 2;
        assertEq(address(ticketing).balance, expectedBalance);

        uint256 initialOwnerBalance = address(this).balance;
        ticketing.withdraw();

        assertEq(
            address(this).balance,
            initialOwnerBalance + expectedBalance,
            "Owner should receive all payments"
        );
    }

    function testFailWithdrawNoFunds() public {
        EventTicketing freeEvent = new EventTicketing(
            NAME,
            URL,
            block.timestamp + 1 days,
            LOCATION,
            PHOTO,
            N_TICKETS,
            0,
            owner,
            BASE_URI
        );

        freeEvent.withdraw();
    }

    function testVerifyTicket() public {
        vm.prank(user1);
        ticketing.buy{value: PRICE}();

        assertTrue(ticketing.verifyTicket(1), "New ticket should be valid");
        assertFalse(ticketing.verifyTicket(999), "Non-existent ticket should be invalid");

        // Warp to after event
        vm.warp(block.timestamp + 2 days);
        assertFalse(ticketing.verifyTicket(1), "Ticket should be invalid after event");
    }

    function testGetTicketInfo() public {
        vm.prank(user1);
        ticketing.buy{value: PRICE}();

        (address ticketOwner, uint256 ticketNumber, bool isValid) = ticketing.getTicketInfo(1);
        
        assertEq(ticketOwner, user1);
        assertEq(ticketNumber, 1);
        assertTrue(isValid);

        // Test non-existent ticket
        vm.expectRevert("Ticket does not exist");
        ticketing.getTicketInfo(999);
    }

    function testFailBuyAfterEventTime() public {
        // Warp to after event
        vm.warp(block.timestamp + 2 days);
        
        vm.prank(user1);
        ticketing.buy{value: PRICE}();
    }

    function testFailBuyWhenSoldOut() public {
        // Create event with only 2 tickets
        EventTicketing smallEvent = new EventTicketing(
            NAME,
            URL,
            block.timestamp + 1 days,
            LOCATION,
            PHOTO,
            2, // Only 2 tickets
            PRICE,
            owner,
            BASE_URI
        );

        // Buy all tickets
        vm.startPrank(user1);
        smallEvent.buy{value: PRICE}();
        smallEvent.buy{value: PRICE}();

        // Try to buy when sold out
        smallEvent.buy{value: PRICE}();
    }

    function testExcessPaymentRefund() public {
        uint256 excessAmount = 0.5 ether;
        uint256 initialBalance = user1.balance;

        vm.prank(user1);
        ticketing.buy{value: PRICE + excessAmount}();

        assertEq(
            user1.balance,
            initialBalance - PRICE,
            "Should refund excess payment"
        );
    }

    receive() external payable {}
    fallback() external payable {}
}