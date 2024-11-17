// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/EventTicketingFactoryNFTsEmail.sol";

contract EventFactoryTest is Test {
    EventFactoryNFTsEmail public factory;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        // Setup addresses
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        vm.startPrank(owner);
        factory = new EventFactoryNFTsEmail();
        vm.stopPrank();
    }

    function testCreateEvent() public {
        vm.startPrank(user1);
        
        // Event details
        string memory name = "ETH Global Paris";
        string memory url = "https://ethglobal.paris";
        uint256 time = block.timestamp + 30 days;
        string memory location = "Paris, France";
        string memory photo = "https://example.com/photo.jpg";
        uint256 nTickets = 100;
        uint256 price = 0.1 ether;
        string memory uri = "https://api.example.com/metadata/";

        // Create event
        address eventAddress = factory.createEvent(
            name,
            url,
            time,
            location,
            photo,
            nTickets,
            price,
            uri,
            address(0)
        );

        // Verify event creation
        assertTrue(eventAddress != address(0), "Event should be created");
        
        // Check event is in future events array
        address[] memory futureEvents = factory.getFutureEvents();
        assertEq(futureEvents.length, 1, "Should have one future event");
        assertEq(futureEvents[0], eventAddress, "Future event should match created event");
        
        // Check event is associated with creator
        address[] memory ownerEvents = factory.getEventsByOwner(user1);
        assertEq(ownerEvents.length, 1, "Should have one event for owner");
        assertEq(ownerEvents[0], eventAddress, "Owner event should match created event");

        vm.stopPrank();
    }

    function testGetUpcomingEvents() public {
        vm.startPrank(user1);
        
        // Create multiple events with different times
        address event1 = factory.createEvent(
            "Event 1",
            "url1",
            block.timestamp + 1 days,
            "Location 1",
            "photo1",
            100,
            0.1 ether,
            "uri1",
            address(0)
        );

        address event2 = factory.createEvent(
            "Event 2",
            "url2",
            block.timestamp + 7 days,
            "Location 2",
            "photo2",
            100,
            0.1 ether,
            "uri2",
            address(0)
        );

        address event3 = factory.createEvent(
            "Event 3",
            "url3",
            block.timestamp + 30 days,
            "Location 3",
            "photo3",
            100,
            0.1 ether,
            "uri3",
            address(0)
        );

        assertNotEq(event2, event3);

        // Get events in next 2 days
        address[] memory upcomingEvents = factory.getUpcomingEvents(2 days);
        assertEq(upcomingEvents.length, 1, "Should have one event in 2 days");
        assertEq(upcomingEvents[0], event1, "Should be first event");

        // Get events in next week
        upcomingEvents = factory.getUpcomingEvents(7 days);
        assertEq(upcomingEvents.length, 2, "Should have two events in 7 days");

        vm.stopPrank();
    }

    function testMovePastEvents() public {
        vm.startPrank(user1);
        
        // Create an event
        address eventAddress = factory.createEvent(
            "Past Event",
            "url",
            block.timestamp + 1 days,
            "Location",
            "photo",
            100,
            0.1 ether,
            "uri",
            address(0)
        );

        // Verify it's in future events
        address[] memory futureEvents = factory.getFutureEvents();
        assertEq(futureEvents.length, 1, "Should have one future event");

        // Move time forward
        vm.warp(block.timestamp + 2 days);

        // Update event arrays
        factory.updateEventArrays();

        // Verify event moved to past events
        futureEvents = factory.getFutureEvents();
        address[] memory pastEvents = factory.getPastEvents();
        
        assertEq(futureEvents.length, 0, "Should have no future events");
        assertEq(pastEvents.length, 1, "Should have one past event");
        assertEq(pastEvents[0], eventAddress, "Past event should match created event");

        vm.stopPrank();
    }

    function testEventCounts() public {
        vm.startPrank(user1);
        
        // Initial counts should be zero
        (uint256 future, uint256 past) = factory.getEventCounts();
        assertEq(future, 0, "Should start with no future events");
        assertEq(past, 0, "Should start with no past events");

        // Create some events
        factory.createEvent(
            "Event 1",
            "url1",
            block.timestamp + 1 days,
            "Location 1",
            "photo1",
            100,
            0.1 ether,
            "uri1",
            address(0)
        );

        factory.createEvent(
            "Event 2",
            "url2",
            block.timestamp + 2 days,
            "Location 2",
            "photo2",
            100,
            0.1 ether,
            "uri2",
            address(0)
        );

        // Check updated counts
        (future, past) = factory.getEventCounts();
        assertEq(future, 2, "Should have two future events");
        assertEq(past, 0, "Should still have no past events");

        // Move time forward and update
        vm.warp(block.timestamp + 3 days);
        factory.updateEventArrays();

        // Check final counts
        (future, past) = factory.getEventCounts();
        assertEq(future, 0, "Should have no future events");
        assertEq(past, 2, "Should have two past events");

        vm.stopPrank();
    }
}