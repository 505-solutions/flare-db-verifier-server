// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6 <0.9;

/**
 * @custom:name IDatasetInfoApi
 * @custom:supported WEB2
 * @author 505 + Flare
 * @notice An attestation request that fetches a dataset from the given url(filecoin), cleans it and gathers relevant info.
 * @custom:verification  Data is fetched from a url `url` (like on Filecoin). The received data is then cleaned,
 * by removing duplicates and empty entries. We PCA embed the values into vectors and calculate the expected distribution of all the values.
 * We then calculate the user's contribution to the dataset by comparing the user's distribution to the expected distribution,
 * multiplied by the share they provided. This rewards the user for providing unique and valuable data.
 * The structure of the final json is written in the `abi_signature`.
 *
 * The response contains an abi encoding of the dataset info and user's data contributions.
 * @custom:lut `0xffffffffffffffff`
 * @custom:lut-limit `0xffffffffffffffff`
 */
interface IDatasetInfoApi {
    /**
     * @notice Toplevel request
     * @param attestationType ID of the attestation type.
     * @param sourceId ID of the data source.
     * @param messageIntegrityCode `MessageIntegrityCode` that is derived from the expected response.
     * @param requestBody Data defining the request. Type (struct) and interpretation is determined
     * by the `attestationType`.
     */
    struct Request {
        bytes32 attestationType;
        bytes32 sourceId;
        bytes32 messageIntegrityCode;
        RequestBody requestBody;
    }

    /**
     * @notice Toplevel response
     * @param attestationType Extracted from the request.
     * @param sourceId Extracted from the request.
     * @param votingRound The ID of the State Connector round in which the request was considered.
     * @param lowestUsedTimestamp The lowest timestamp used to generate the response.
     * @param requestBody Extracted from the request.
     * @param responseBody Data defining the response. The verification rules for the construction
     * of the response body and the type are defined per specific `attestationType`.
     */
    struct Response {
        bytes32 attestationType;
        bytes32 sourceId;
        uint64 votingRound;
        uint64 lowestUsedTimestamp;
        RequestBody requestBody;
        ResponseBody responseBody;
    }

    /**
     * @notice Toplevel proof
     * @param merkleProof Merkle proof corresponding to the attestation response.
     * @param data Attestation response.
     */
    struct Proof {
        bytes32[] merkleProof;
        Response data;
    }

    /**
     * @notice Request body for Payment attestation type
     * @param url URL of the data source
     * @param abi_signature ABI signature of the data
     */
    struct RequestBody {
        string url;
        string abi_signature;
    }

    /**
     * @notice Response body for Payment attestation type
     * @param abi_encoded_data ABI encoded data
     */
    struct ResponseBody {
        bytes abi_encoded_data;
    }
}
