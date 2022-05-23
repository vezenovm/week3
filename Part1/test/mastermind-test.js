//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected

const chai = require("chai");
const path = require("path");
const buildPoseidon = require("circomlibjs").buildPoseidon;

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("Mastermind variation test", function () {
    this.timeout(100000000);
    let poseidon;
    let F;

    before( async () => {
        poseidon = await buildPoseidon();
        F = poseidon.F;
    });

    it("Code breaker wins", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        let salt = 50;
        const guesses = [1, 2, 3, 4, 5];
        const pubSolnHash = poseidon([salt, ...guesses]);
        const bigIntHash = F.toObject(pubSolnHash)

        const INPUT = {
            "pubGuessA": guesses[0],
            "pubGuessB": guesses[1],
            "pubGuessC": guesses[2],
            "pubGuessD": guesses[3],
            "pubGuessE": guesses[4],
            "pubSolnHash": bigIntHash.toString(),
            "pubNumHit": 5,
            "pubNumBlow": 0,
            "privSolnA": guesses[0],
            "privSolnB": guesses[1],
            "privSolnC": guesses[2],
            "privSolnD": guesses[3],
            "privSolnE": guesses[4],
            "privSalt": salt,
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(bigIntHash)));
    });

    it("Code breaker has hits, but without a win", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        let salt = 50;
        const guesses = [1, 2, 3, 4, 5];
        const pubSolnHash = poseidon([salt, 1, 3, 5, 4, 2]);
        const bigIntHash = F.toObject(pubSolnHash)

        const INPUT = {
            "pubGuessA": guesses[0],
            "pubGuessB": guesses[1],
            "pubGuessC": guesses[2],
            "pubGuessD": guesses[3],
            "pubGuessE": guesses[4],
            "pubSolnHash": bigIntHash.toString(),
            "pubNumHit": 2,
            "pubNumBlow": 3,
            "privSolnA": 1,
            "privSolnB": 3,
            "privSolnC": 5,
            "privSolnD": 4,
            "privSolnE": 2,
            "privSalt": salt,
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(bigIntHash)));
    });

    it("Code breaker has no hits", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        let salt = 50;
        const guesses = [1, 2, 3, 4, 5];
        const pubSolnHash = poseidon([salt, 0, 3, 5, 6, 2]);
        const bigIntHash = F.toObject(pubSolnHash)

        const INPUT = {
            "pubGuessA": guesses[0],
            "pubGuessB": guesses[1],
            "pubGuessC": guesses[2],
            "pubGuessD": guesses[3],
            "pubGuessE": guesses[4],
            "pubSolnHash": bigIntHash.toString(),
            "pubNumHit": 0,
            "pubNumBlow": 3,
            "privSolnA": 0,
            "privSolnB": 3,
            "privSolnC": 5,
            "privSolnD": 6,
            "privSolnE": 2,
            "privSalt": salt,
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(bigIntHash)));
    });
});
