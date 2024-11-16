// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventTicketingTest1 {
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

    constructor() {
        eventInfo = EventInfo({
            name: "Web3 Developer Conference 2024",
            url: "https://web3devcon.io",
            time: 1734115200,  // December 15, 2024 10:00 AM UTC
            location: "Crypto Convention Center, Miami, FL",
            photo: "https://static.displate.com/270x380/displate/2021-09-09/acaf2be9f58d1c05de9e4e47c580ee00_0da6a981d11a923cf24cf3f465fa81cc.jpg",
            n_tickets: 500,
            n_tickets_sold: 0,
            price: 0.01 ether  // 0.01 ETH in wei
        });
    }

    function getEventInfo() public view returns (EventInfo memory) {
        return eventInfo;
    }

    // Make the buy function payable
    function buy() public payable {
        require(msg.value == eventInfo.price, "Incorrect payment amount");
        require(eventInfo.n_tickets_sold < eventInfo.n_tickets, "Event is sold out");
        eventInfo.n_tickets_sold += 1;
        // Optionally, handle the received Ether (e.g., transfer to an owner)
    }
}