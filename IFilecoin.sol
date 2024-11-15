// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.9;

interface IFilecoin {
    struct DataContribution {
        bytes32 id;
        address contributor;
        bytes32 datasetId;
        bytes32 dataHash;
    }

    struct DatasetInfo {
        DataContribution[] dataContributions;
    }
}
