// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/EventTicketingFactory.sol";

contract EventFactoryTest is Test {
    EventFactory public factory;
    address public owner;
    address public user1;
    address public user2;

    // Event parameters
    string constant NAME = "Test Event";
    string constant URL = "https://test.com";
    string constant LOCATION = "Test Location";
    string constant PHOTO = "ipfs://test";
    uint256 constant N_TICKETS = 100;
    uint256 constant PRICE = 0.1 ether;

    function setUp() public {
        factory = new EventFactory();
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }

    function testCreateEvent() public {
        uint256 futureTime = block.timestamp + 1 days;
        address eventAddress = factory.createEvent(
            NAME,
            URL,
            futureTime,
            LOCATION,
            PHOTO,
            N_TICKETS,
            PRICE
        );

        assertTrue(eventAddress != address(0), "Event should be created");
        
        // Check event counts
        (uint256 futureCount, uint256 pastCount) = factory.getEventCounts();
        assertEq(futureCount, 1, "Should have one future event");
        assertEq(pastCount, 0, "Should have no past events");

        // Verify event details
        EventTicketing event_ = EventTicketing(eventAddress);
        EventTicketing.EventInfo memory eventInfo = event_.getEventInfo();
        
        assertEq(eventInfo.name, NAME, "Event name should match");
        assertEq(eventInfo.location, LOCATION, "Event location should match");
        assertEq(eventInfo.time, futureTime, "Event time should match");
    }

    function testCannotCreatePastEvent() public {
        uint256 pastTime = block.timestamp - 1;
        
        vm.expectRevert("Event time must be in future");
        factory.createEvent(
            NAME,
            URL,
            pastTime,
            LOCATION,
            PHOTO,
            N_TICKETS,
            PRICE
        );
    }

    function testBuyTicket() public {
        uint256 futureTime = block.timestamp + 1 days;
        address eventAddress = factory.createEvent(
            NAME,
            URL,
            futureTime,
            LOCATION,
            PHOTO,
            N_TICKETS,
            PRICE
        );

        EventTicketing event_ = EventTicketing(eventAddress);
        
        vm.prank(user1);
        event_.buy();

        EventTicketing.EventInfo memory eventInfo = event_.getEventInfo();
        assertEq(eventInfo.n_tickets_sold, 1, "Should have sold one ticket");
    }

    function testCannotBuyTicketForPastEvent() public {
        uint256 futureTime = block.timestamp + 1 days;
        address eventAddress = factory.createEvent(
            NAME,
            URL,
            futureTime,
            LOCATION,
            PHOTO,
            N_TICKETS,
            PRICE
        );

        EventTicketing event_ = EventTicketing(eventAddress);
        
        // Warp time to after event
        vm.warp(block.timestamp + 2 days);
        
        vm.prank(user1);
        vm.expectRevert("Event has already passed");
        event_.buy();
    }

    function testEventMovesToPastArray() public {
        // Create events at different times
        uint256 time1 = block.timestamp + 1 days;
        uint256 time2 = block.timestamp + 2 days;
        
        address event1 = factory.createEvent(
            NAME,
            URL,
            time1,
            LOCATION,
            PHOTO,
            N_TICKETS,
            PRICE
        );

        address event2 = factory.createEvent(
            NAME,
            URL,
            time2,
            LOCATION,
            PHOTO,
            N_TICKETS,
            PRICE
        );

        // Initially both should be future events
        (uint256 futureCount, uint256 pastCount) = factory.getEventCounts();
        assertEq(futureCount, 2, "Should have two future events");
        assertEq(pastCount, 0, "Should have no past events");

        // Warp time to after first event
        vm.warp(time1 + 1);
        
        // Update arrays
        factory.updateEventArrays();
        
        // Check counts again
        (futureCount, pastCount) = factory.getEventCounts();
        assertEq(futureCount, 1, "Should have one future event");
        assertEq(pastCount, 1, "Should have one past event");

        // Verify specific events
        address[] memory pastEvents = factory.getPastEvents();
        address[] memory futureEvents = factory.getFutureEvents();
        
        assertEq(pastEvents[0], event1, "First event should be in past array");
        assertEq(futureEvents[0], event2, "Second event should be in future array");
    }

    function testGetUpcomingEvents() public {
        // Create events at different times
        uint256 time1 = block.timestamp + 1 days;
        uint256 time2 = block.timestamp + 2 days;
        uint256 time3 = block.timestamp + 5 days;
        
        factory.createEvent(NAME, URL, time1, LOCATION, PHOTO, N_TICKETS, PRICE);
        factory.createEvent(NAME, URL, time2, LOCATION, PHOTO, N_TICKETS, PRICE);
        factory.createEvent(NAME, URL, time3, LOCATION, PHOTO, N_TICKETS, PRICE);

        // Get events in next 3 days
        address[] memory upcomingEvents = factory.getUpcomingEvents(3 days);
        assertEq(upcomingEvents.length, 2, "Should have two upcoming events within 3 days");
    }

    function testMultipleUserEvents() public {
        uint256 futureTime = block.timestamp + 1 days;
        
        vm.prank(user1);
        address event1 = factory.createEvent(
            NAME,
            URL,
            futureTime,
            LOCATION,
            PHOTO,
            N_TICKETS,
            PRICE
        );

        vm.prank(user2);
        address event2 = factory.createEvent(
            NAME,
            URL,
            futureTime,
            LOCATION,
            PHOTO,
            N_TICKETS,
            PRICE
        );

        address[] memory user1Events = factory.getEventsByOwner(user1);
        address[] memory user2Events = factory.getEventsByOwner(user2);

        assertEq(user1Events.length, 1, "User1 should have one event");
        assertEq(user2Events.length, 1, "User2 should have one event");
        assertEq(user1Events[0], event1, "User1's event should match");
        assertEq(user2Events[0], event2, "User2's event should match");
    }

    function testFuzzCreateEvent(
        string memory name,
        string memory url,
        string memory location,
        string memory photo,
        uint256 n_tickets,
        uint256 price
    ) public {
        // Ensure we're using reasonable values
        vm.assume(bytes(name).length > 0 && bytes(name).length < 100);
        vm.assume(bytes(url).length > 0 && bytes(url).length < 100);
        vm.assume(bytes(location).length > 0 && bytes(location).length < 100);
        vm.assume(bytes(photo).length > 0 && bytes(photo).length < 100);
        vm.assume(n_tickets > 0 && n_tickets < 1000000);
        vm.assume(price > 0 && price < 100 ether);

        uint256 futureTime = block.timestamp + 1 days;
        
        address eventAddress = factory.createEvent(
            name,
            url,
            futureTime,
            location,
            photo,
            n_tickets,
            price
        );

        assertTrue(eventAddress != address(0), "Event should be created with fuzzed values");
        
        EventTicketing event_ = EventTicketing(eventAddress);
        EventTicketing.EventInfo memory eventInfo = event_.getEventInfo();
        
        assertEq(eventInfo.name, name, "Event name should match");
        assertEq(eventInfo.location, location, "Event location should match");
        assertEq(eventInfo.n_tickets, n_tickets, "Number of tickets should match");
        assertEq(eventInfo.price, price, "Price should match");
    }
}