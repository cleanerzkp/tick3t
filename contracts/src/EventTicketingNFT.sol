// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import {console} from "forge-std/console.sol";

contract EventTicketing is ERC721 {
    using Strings for uint256;
    
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
    
    uint256 private _tokenIds;
    string private _baseTokenURI;
    mapping(uint256 => uint256) public ticketNumbers;

    event TicketMinted(address to, uint256 tokenId, uint256 ticketNumber);

    constructor(
        string memory _name,
        string memory _url,
        uint256 _time,
        string memory _location,
        string memory _photo,
        uint256 _n_tickets,
        uint256 _price,
        address _owner,
        string memory __baseURI
    ) ERC721("Event Ticket", "TCKT") {
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
        _baseTokenURI = __baseURI;
    }

    function getEventInfo() public view returns (EventInfo memory) {
        return eventInfo;
    }

    function buy() public payable {
        require(block.timestamp < eventInfo.time, "Event has already passed");
        require(eventInfo.n_tickets_sold < eventInfo.n_tickets, "Event is sold out");
        require(!hasTicket(msg.sender), "Address already has a ticket");

        // Check payment only if price is greater than 0
        if(eventInfo.price > 0) {
            require(msg.value >= eventInfo.price, "Insufficient payment");
        } else {
            // If someone sends ETH for a free event, revert
            require(msg.value == 0, "Event is free, no payment required");
        }

        // Increment ticket counter
        eventInfo.n_tickets_sold += 1;
        
        // Mint NFT
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(msg.sender, newTokenId);
        
        // Assign ticket number
        ticketNumbers[newTokenId] = eventInfo.n_tickets_sold;
        
        emit TicketMinted(msg.sender, newTokenId, eventInfo.n_tickets_sold);
        
        // Return excess payment if any
        if (msg.value > eventInfo.price) {
            payable(msg.sender).transfer(msg.value - eventInfo.price);
        }
    }

    // Owner can withdraw the funds
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner).transfer(balance);
    }

    // Rest of the contract remains the same...
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory baseURI) public {
        require(msg.sender == owner, "Only owner can set base URI");
        _baseTokenURI = baseURI;
    }

    function getTicketInfo(uint256 tokenId) 
        public 
        view 
        returns (
            address ticketOwner,
            uint256 ticketNumber,
            bool isValid
        ) 
    {
        require(tokenId<=_tokenIds, "Ticket does not exist");
        return (
            ownerOf(tokenId),
            ticketNumbers[tokenId],
            block.timestamp < eventInfo.time
        );
    }

    function hasTicket(address attendee) public view returns (bool) {
        return balanceOf(attendee) > 0;
    }

    function verifyTicket(uint256 tokenId) public view returns (bool) {
        if (tokenId>_tokenIds) return false;
        if (block.timestamp >= eventInfo.time) return false;
        return true;
    }

}