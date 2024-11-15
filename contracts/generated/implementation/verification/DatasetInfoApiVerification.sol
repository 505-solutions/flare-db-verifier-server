// SPDX-License-Identifier: MIT
  pragma solidity 0.8.20;
  
  import '../../../interfaces/types/IDatasetInfoApi.sol';
  import '../../interfaces/verification/IDatasetInfoApiVerification.sol';
  
  /**
   * Contract mocking verifying DatasetInfoApi attestations.
   */
  contract DatasetInfoApiVerification is IDatasetInfoApiVerification {
  
     /**
      * @inheritdoc IDatasetInfoApiVerification
      */
     function verifyDatasetInfoApi(
        IDatasetInfoApi.Proof calldata _proof
     ) external pure returns (bool _proved) {
        return _proof.data.attestationType == bytes32("DatasetInfoApi");
     }
  }
     