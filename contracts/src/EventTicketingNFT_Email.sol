// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// OpenZeppelin Contracts
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Foundry
import {console} from "forge-std/console.sol";

// VLayer Contracts
import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";
import {RegexLib} from "vlayer-0.1.0/Regex.sol";
import {VerifiedEmail, UnverifiedEmail, EmailProofLib} from "vlayer-0.1.0/EmailProof.sol";

// Local Utilities
import {AddressParser} from "./utils/AddressParser.sol";


contract EmailProver is Prover {
    using Strings for string;
    using RegexLib for string;
    using AddressParser for string;
    using EmailProofLib for UnverifiedEmail;

    string public emailRegex = "";

    constructor(string memory _emailRegex){
        emailRegex = _emailRegex; 
    }

    function main(
        UnverifiedEmail calldata unverifiedEmail
    ) public view returns (Proof memory) {
        VerifiedEmail memory email = unverifiedEmail.verify();

        // string[] memory captures = email.subject.capture("Event Invitation$");
        // require(captures.length == 2, "subject must match the expected pattern");
        // require(bytes(captures[1]).length > 0, "email header must contain a valid Ethereum address");
        require(
            email.from.matches(emailRegex), // sender umons.ac.be, receiver gmail.com
            "from must be a University address"
        );

        return (proof());
    }
}


contract EventTicketing is ERC721, Verifier {
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

    EmailProver emailProver;
    string public emailRegex;

    constructor(
        string memory _name,
        string memory _url,
        uint256 _time,
        string memory _location,
        string memory _photo,
        uint256 _n_tickets,
        uint256 _price,
        address _owner,
        string memory __baseURI,
        string memory _email_regex //"^.*@umons.ac.be$"
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
        emailRegex = _email_regex;
        emailProver = new EmailProver(_email_regex);
    }

    function verifyEmail(Proof calldata) public view onlyVerified(address(emailProver), EmailProver.main.selector) {}

    function getEventInfo() public view returns (EventInfo memory) {
        return eventInfo;
    }

    function buy(Proof calldata emailProof) public payable {
        require(block.timestamp < eventInfo.time, "Event has already passed");
        require(eventInfo.n_tickets_sold < eventInfo.n_tickets, "Event is sold out");
        require(!hasTicket(msg.sender), "Address already has a ticket");
        if (isNonEmptyString(emailRegex)){
            verifyEmail(emailProof);
        }

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

    function isNonEmptyString(string memory str) public pure returns (bool) {
        return bytes(str).length > 0;
    }

}