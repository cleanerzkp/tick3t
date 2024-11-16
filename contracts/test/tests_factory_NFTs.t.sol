// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/EventTicketingFactoryNFTs.sol";
import "../src/EventTicketingNFT.sol";

contract EventFactoryTest is Test {
    EventFactory public factory;
    address public owner;
    address public user1;
    address public user2;

    // Event parameters
    string constant NAME = "ETH Global Paris";
    string constant URL = "https://ethglobal.paris";
    string constant LOCATION = "Paris, France";
    string constant PHOTO = "ipfs://test";
    uint256 constant N_TICKETS = 100;
    uint256 constant PRICE = 0.1 ether;
    string constant BASE_URI = "https://api.myevent.com/metadata/";

    event EventCreated(address eventAddress, address owner, uint256 eventTime);
    event EventMovedToPast(address eventAddress);

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
            PRICE,
            BASE_URI
        );

        // Verify event was created correctly
        EventTicketing event_ = EventTicketing(eventAddress);
        EventTicketing.EventInfo memory info = event_.getEventInfo();
        
        assertEq(info.name, NAME);
        assertEq(info.time, futureTime);
        assertEq(info.location, LOCATION);
        assertEq(event_.owner(), address(this));

        // Check that event is in future events array
        address[] memory futureEvents = factory.getFutureEvents();
        assertEq(futureEvents.length, 1);
        assertEq(futureEvents[0], eventAddress);
    }

    function testMultipleEventsCreation() public {
        uint256[] memory times = new uint256[](3);
        times[0] = block.timestamp + 1 days;
        times[1] = block.timestamp + 2 days;
        times[2] = block.timestamp + 3 days;

        address[] memory events = new address[](3);
        
        for(uint i = 0; i < 3; i++) {
            events[i] = factory.createEvent(
                NAME,
                URL,
                times[i],
                LOCATION,
                PHOTO,
                N_TICKETS,
                PRICE,
                BASE_URI
            );
        }

        address[] memory futureEvents = factory.getFutureEvents();
        assertEq(futureEvents.length, 3, "Should have created 3 future events");

        for(uint i = 0; i < 3; i++) {
            assertEq(futureEvents[i], events[i], "Events should be in correct order");
        }
    }

    function testEventMovesToPast() public {
        // Create event that will be in the past
        uint256 nearFutureTime = block.timestamp + 1 hours;
        address eventAddress = factory.createEvent(
            NAME,
            URL,
            nearFutureTime,
            LOCATION,
            PHOTO,
            N_TICKETS,
            PRICE,
            BASE_URI
        );

        // Verify it's in future events
        address[] memory futureEvents = factory.getFutureEvents();
        assertEq(futureEvents.length, 1, "Should have one future event");

        // Move time forward
        vm.warp(block.timestamp + 2 hours);

        // Update events
        vm.expectEmit(true, true, false, false);
        emit EventMovedToPast(eventAddress);
        factory.updateEventArrays();

        // Verify event moved to past events
        futureEvents = factory.getFutureEvents();
        address[] memory pastEvents = factory.getPastEvents();
        
        assertEq(futureEvents.length, 0, "Should have no future events");
        assertEq(pastEvents.length, 1, "Should have one past event");
        assertEq(pastEvents[0], eventAddress, "Past event should match created event");
    }

    function testGetUpcomingEvents() public {
        // Create events at different times
        uint256 time1 = block.timestamp + 1 days;
        uint256 time2 = block.timestamp + 2 days;
        uint256 time3 = block.timestamp + 5 days;

        address event1 = factory.createEvent(NAME, URL, time1, LOCATION, PHOTO, N_TICKETS, PRICE, BASE_URI);
        address event2 = factory.createEvent(NAME, URL, time2, LOCATION, PHOTO, N_TICKETS, PRICE, BASE_URI);
        address event3 = factory.createEvent(NAME, URL, time3, LOCATION, PHOTO, N_TICKETS, PRICE, BASE_URI);

        // Get events in next 3 days
        address[] memory upcomingEvents = factory.getUpcomingEvents(3 days);
        assertEq(upcomingEvents.length, 2, "Should have two upcoming events within 3 days");
        assertEq(upcomingEvents[0], event1);
        assertEq(upcomingEvents[1], event2);
    }

    function testEventsByOwner() public {
        uint256 futureTime = block.timestamp + 1 days;

        // User1 creates two events
        vm.startPrank(user1);
        address event1 = factory.createEvent(NAME, URL, futureTime, LOCATION, PHOTO, N_TICKETS, PRICE, BASE_URI);
        address event2 = factory.createEvent(NAME, URL, futureTime + 1 days, LOCATION, PHOTO, N_TICKETS, PRICE, BASE_URI);
        vm.stopPrank();

        // User2 creates one event
        vm.prank(user2);
        address event3 = factory.createEvent(NAME, URL, futureTime + 2 days, LOCATION, PHOTO, N_TICKETS, PRICE, BASE_URI);

        // Check events by owner
        address[] memory user1Events = factory.getEventsByOwner(user1);
        address[] memory user2Events = factory.getEventsByOwner(user2);

        assertEq(user1Events.length, 2, "User1 should have two events");
        assertEq(user2Events.length, 1, "User2 should have one event");
        
        assertEq(user1Events[0], event1);
        assertEq(user1Events[1], event2);
        assertEq(user2Events[0], event3);
    }

    function testGetEventCounts() public {
        // Create some events
        uint256 pastTime = block.timestamp - 1; // This won't actually create an event (will revert)
        uint256 futureTime = block.timestamp + 1 days;

        // Create future events
        factory.createEvent(NAME, URL, futureTime, LOCATION, PHOTO, N_TICKETS, PRICE, BASE_URI);
        factory.createEvent(NAME, URL, futureTime + 1 days, LOCATION, PHOTO, N_TICKETS, PRICE, BASE_URI);

        (uint256 futureCount, uint256 pastCount) = factory.getEventCounts();
        assertEq(futureCount, 2, "Should have two future events");
        assertEq(pastCount, 0, "Should have no past events");

        // Move time forward to make one event past
        vm.warp(block.timestamp + 1.5 days);
        factory.updateEventArrays();

        (futureCount, pastCount) = factory.getEventCounts();
        assertEq(futureCount, 1, "Should have one future event");
        assertEq(pastCount, 1, "Should have one past event");
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
            PRICE,
            BASE_URI
        );
    }
}