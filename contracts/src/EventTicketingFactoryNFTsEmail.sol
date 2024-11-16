// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./EventTicketingNFT_Email.sol";

contract EventFactory {
    event EventCreated(address eventAddress, address owner, uint256 eventTime);
    event EventMovedToPast(address eventAddress);
    
    // Separate arrays for future and past events
    address[] public futureEvents;
    address[] public pastEvents;
    
    mapping(address => address[]) public eventsByOwner;
    mapping(address => uint256) public eventTimes;
    mapping(address => uint256) public futureEventIndices; // Track index in futureEvents array

    function createEvent(
        string memory _name,
        string memory _url,
        uint256 _time,
        string memory _location,
        string memory _photo,
        uint256 _n_tickets,
        uint256 _price,
        string memory uri,
        string memory _email_regex //"^.*@umons.ac.be$"
    ) public returns (address) {
        EventTicketing newEvent = new EventTicketing(
            _name,
            _url,
            _time,
            _location,
            _photo,
            _n_tickets,
            _price,
            msg.sender,
            uri,
            _email_regex 
        );
        
        address eventAddress = address(newEvent);
        
        // Store event time
        eventTimes[eventAddress] = _time;
        
        // Add to future events and store its index
        futureEventIndices[eventAddress] = futureEvents.length;
        futureEvents.push(eventAddress);
        
        // Store in owner's events
        eventsByOwner[msg.sender].push(eventAddress);
        
        // Check and move any past events before adding the new one
        _movePastEvents();
        
        emit EventCreated(eventAddress, msg.sender, _time);
        
        return eventAddress;
    }

    function _movePastEvents() internal {
        // Start from the end to maintain array integrity while removing elements
        for (int i = int(futureEvents.length) - 1; i >= 0; i--) {
            address eventAddress = futureEvents[uint(i)];
            if (eventTimes[eventAddress] <= block.timestamp) {
                // Move to past events
                pastEvents.push(eventAddress);
                
                // Remove from future events - swap and pop
                uint lastIndex = futureEvents.length - 1;
                if (uint(i) != lastIndex) {
                    address lastEvent = futureEvents[lastIndex];
                    futureEvents[uint(i)] = lastEvent;
                    futureEventIndices[lastEvent] = uint(i);
                }
                futureEvents.pop();
                
                emit EventMovedToPast(eventAddress);
            }
        }
    }

    // Call this function periodically to move past events
    function updateEventArrays() public {
        _movePastEvents();
    }

    // Get all future events (already sorted by creation time)
    function getFutureEvents() public view returns (address[] memory) {
        return futureEvents;
    }

    // Get all past events (sorted by creation time)
    function getPastEvents() public view returns (address[] memory) {
        return pastEvents;
    }

    // Get upcoming events within a time window
    function getUpcomingEvents(uint256 timeWindow) 
        public 
        view 
        returns (address[] memory) 
    {
        uint256 endTime = block.timestamp + timeWindow;
        uint256 count = 0;
        
        // Count events within window
        for (uint i = 0; i < futureEvents.length; i++) {
            if (eventTimes[futureEvents[i]] <= endTime) {
                count++;
            }
        }
        
        address[] memory upcomingEvents = new address[](count);
        uint256 currentIndex = 0;
        
        // Fill array
        for (uint i = 0; i < futureEvents.length && currentIndex < count; i++) {
            if (eventTimes[futureEvents[i]] <= endTime) {
                upcomingEvents[currentIndex] = futureEvents[i];
                currentIndex++;
            }
        }
        
        return upcomingEvents;
    }

    // Get events by owner (combines both future and past)
    function getEventsByOwner(address owner) public view returns (address[] memory) {
        return eventsByOwner[owner];
    }
    
    // Get counts
    function getEventCounts() public view returns (uint256 future, uint256 past) {
        return (futureEvents.length, pastEvents.length);
    }
}