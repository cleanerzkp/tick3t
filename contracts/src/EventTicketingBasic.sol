// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract EventTicketing {
    struct EventInfo {
        string name;
        string url;
        uint256 time;
        string location;
        string photo;
        uint256 n_tickets;
        uint256 n_tickets_sold;
        uint256 price;
    }

    EventInfo public eventInfo;
    address public owner;

    constructor(
        string memory _name,
        string memory _url,
        uint256 _time,
        string memory _location,
        string memory _photo,
        uint256 _n_tickets,
        uint256 _price,
        address _owner
    ) {
        require(_time > block.timestamp, "Event time must be in future");
        eventInfo = EventInfo({
            name: _name,
            url: _url,
            time: _time,
            location: _location,
            photo: _photo,
            n_tickets: _n_tickets,
            n_tickets_sold: 0,
            price: _price
        });
        owner = _owner;
    }

    function getEventInfo() public view returns (EventInfo memory) {
        return eventInfo;
    }

    function buy() public {
        require(block.timestamp < eventInfo.time, "Event has already passed");
        require(eventInfo.n_tickets_sold < eventInfo.n_tickets, "Event is sold out");
        eventInfo.n_tickets_sold += 1;
    }
}