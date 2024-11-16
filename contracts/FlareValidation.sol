// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./interfaces/IDatasetInfoApi.sol";
import "./generated/interfaces/verification/IDatasetInfoApiVerification.sol";
import "./generated/implementation/verification/DatasetInfoApiVerification.sol";

// Individual contribution of one user to the dataset
struct DataContribution {
    bytes32 id;
    address contributor;
    bytes32 datasetId;
    bytes32 dataHash;
    uint256 contributionAmount;
    uint256 variance;
}

// Dataset information (joint contributions of all users)
struct DatasetInfo {
    bytes32 id;
    DataContribution[] dataContributions;
}

struct TeeHashInfo {
    address contributor;
    bytes32 dataHash;
}

contract FlareValidation {
    error AttestationAllreadyProcessed();

    mapping(bytes32 => DatasetInfo) public datasetInfo;
    IDatasetInfoApiVerification public dbApiAttestationVerification;

    mapping(bytes32 => bool) public processedAttestations;

    // The hashes of data contributions that have been verified in the TEE during Proof-of-Learning
    mapping(bytes32 => address) verifiedContributions; // dataHash => contributor

    mapping(address => uint256) public pendingPayouts; // contributor => payout

    constructor() {
        dbApiAttestationVerification = new DatasetInfoApiVerification();
    }

    function verifyTeeLearning(TeeHashInfo[] calldata contributionHashInfo) {
        for (uint256 i = 0; i < contributionHashInfo.length; i++) {
            verifiedContributions[contributionHashInfo[i].dataHash] = contributionHashInfo[i].contributor;
        }
    }

    function addDatabaseInfo(IJsonApi.Response calldata jsonResponse) public {
        // We mock the proof for testing and hackathon
        IJsonApi.Proof memory proof = IJsonApi.Proof({merkleProof: new bytes32[](0), data: jsonResponse});
        require(dbApiAttestationVerification.verifyJsonApi(proof), "Invalid proof");

        DatasetInfo memory _dbInfo = abi.decode(jsonResponse.responseBody.abi_encoded_data, (DatasetInfo));

        if (processedAttestations[_dbInfo.id]) {
            return AttestationAllreadyProcessed();
        }

        for (uint256 i = 0; i < _dbInfo.dataContributions.length; i++) {
            DataContribution memory dataContribution = _dbInfo.dataContributions[i];

            require(dataContribution.datasetId == _dbInfo.id, "Invalid dataset ID");
            require(
                verifiedContributions[dataContribution.dataHash] == dataContribution.contributor,
                "Contribution hasn't been verified by the TEE"
            );

            pendingPayouts[contributor] += dataContribution.contributionAmount;
        }

        datasetInfo[_dbInfo.id] = _dbInfo;

        processedAttestations[_dbInfo.id] = true;
    }

    function payout(address payable contributor) {
        require(contributor != address(0), "invalid address");

        uint256 payoutAmount = pendingPayouts[contributor];
        if (payoutAmount > 0) {
            pendingPayouts[contributor] = 0;

            // Send Ether
            (bool success,) = contributor.call{value: payoutAmount}("");

            // Check if the transfer was successful
            require(success, "Transfer failed");
        }
    }
}
