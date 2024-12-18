// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {EmailProver} from "./EmailProver.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";

contract EmailVerifier is Verifier {
    address public prover;

    constructor(address _prover) {
        prover = _prover;
    }

    function verify(
        Proof calldata
    ) public view onlyVerified(prover, EmailProver.main.selector) {}
}
