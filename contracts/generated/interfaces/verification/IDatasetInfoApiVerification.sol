// SPDX-License-Identifier: MIT
  pragma solidity 0.8.20;
  
  import "../../../interfaces/types/IDatasetInfoApi.sol";
  
  
  interface IDatasetInfoApiVerification {
     function verifyDatasetInfoApi(
        IDatasetInfoApi.Proof calldata _proof
     ) external view returns (bool _proved);
  }
     