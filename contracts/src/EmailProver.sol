// Local Utilities
import {AddressParser} from "./utils/AddressParser.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {RegexLib} from "vlayer-0.1.0/Regex.sol";
import {VerifiedEmail, UnverifiedEmail, EmailProofLib} from "vlayer-0.1.0/EmailProof.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";

contract EmailProver is Prover {
    using Strings for string;
    using RegexLib for string;
    using AddressParser for string;
    using EmailProofLib for UnverifiedEmail;

    string public emailRegex;

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
            "email does not match required domain"
        );

        return (proof());
    }
}
