import { Injectable } from '@nestjs/common';
import { ConditionalModule, ConfigService } from '@nestjs/config';
import {
  IDatasetInfoApi_Request,
  IDatasetInfoApi_Response,
  IDatasetInfoApi_ResponseBody,
} from 'generated/dto/IDatasetInfoApi.dto';
import { IConfig } from 'src/config/configuration';
import {
  BaseVerifierService,
  IVerificationServiceConfig,
} from 'src/services/common/verifier-base.service';
import {
  AttestationResponse,
  AttestationResponseStatus,
} from '../../src/dtos/generic/generic.dto';

import axios from 'axios';

import { Logger } from '@nestjs/common';
import Web3 from 'web3';

import * as path from 'path';

import { PCA } from 'ml-pca';

// Assuming your CIFAR-10 data is loaded
interface ImageContribution {
  contributor: string;
  data: CifarImage[];
}

interface CifarImage {
  image: number[][][]; // or number[] if already flattened
  label: number;
}

// Individual contribution of one user to the dataset
interface DataContribution {
  id: string; // bytes32
  contributor: string; // address
  datasetId: string; // bytes32
  dataHash: string; // bytes32
  contributionAmount: number; // number
  variance: number; // number
}

// Dataset information (joint contributions of all users)
interface DatasetInfo {
  id: string; // bytes32
  dataContributions: DataContribution[];
}

const logger = new Logger();

@Injectable()
export class IDatasetInfoApiVerifierService extends BaseVerifierService<
  IDatasetInfoApi_Request,
  IDatasetInfoApi_Response
> {
  constructor(protected configService: ConfigService<IConfig>) {
    const config: IVerificationServiceConfig = {
      source: 'WEB2', //CONFIGURE THIS
      attestationName: 'DatasetInfoApi',
    };
    super(configService, config);
  }

  protected async verifyRequest(
    fixedRequest: IDatasetInfoApi_Request,
  ): Promise<AttestationResponse<IDatasetInfoApi_Response>> {
    logger.log('IDatasetInfoVerifierService: verifyRequest');

    const url = fixedRequest.requestBody.url;
    // const abiSign = JSON.parse(fixedRequest.requestBody.abi_signature);

    const result = new AttestationResponse<IDatasetInfoApi_Response>();

    // ! Process Dataset and get the info
    const dataContributions = await this._loadDataset(
      path.join(__dirname, '../../../cifar10_data.json'),
      true,
    );
    if (!dataContributions) {
      result.status = AttestationResponseStatus.INVALID;
      return result;
    }

    console.log('dataset: ', dataContributions);
    const datasetInfo = this._processDatasetInfo(dataContributions);

    const abiSign = {
      components: [
        {
          name: 'id',
          type: 'bytes32',
        },
        {
          name: 'dataContributions',
          type: 'tuple[]',
          components: [
            {
              name: 'id',
              type: 'bytes32',
            },
            {
              name: 'contributor',
              type: 'address',
            },
            {
              name: 'datasetId',
              type: 'bytes32',
            },
            {
              name: 'dataHash',
              type: 'bytes32',
            },
            {
              name: 'contributionAmount',
              type: 'uint256',
            },
            {
              name: 'variance',
              type: 'uint256',
            },
          ],
        },
      ],
      type: 'tuple',
    };

    // encode info
    const web3 = new Web3();
    const encodedResult = web3.eth.abi.encodeParameter(abiSign, datasetInfo);

    console.log(encodedResult);

    // construct correct data types
    const responseBodyParams: Required<IDatasetInfoApi_ResponseBody> = {
      abi_encoded_data: encodedResult,
    };
    const responseBodyObj = new IDatasetInfoApi_ResponseBody(
      responseBodyParams,
    );

    const attResponseParams: Required<IDatasetInfoApi_Response> = {
      attestationType: fixedRequest.attestationType,
      sourceId: fixedRequest.sourceId,
      votingRound: '0',
      lowestUsedTimestamp: '0xffffffffffffffff', // Irrelevant for this attestation type
      requestBody: fixedRequest.requestBody,
      responseBody: responseBodyObj,
    };
    const attResponse = new IDatasetInfoApi_Response(attResponseParams);

    console.log('attResponse: ', attResponse);

    // construct final result
    result.response = attResponse;
    result.status = AttestationResponseStatus.VALID;
    return result;
  }

  protected _processDatasetInfo(dataset: ImageContribution[]) {
    const datasetId = '0x' + Math.random().toString(16).substring(12);

    const dataContributions: DataContribution[] = [];

    for (let i = 0; i < dataset.length; i++) {
      const contribution = dataset[i];

      const contributor = contribution.contributor;
      const contributionAmount = contribution.data.length;
      let variance = this._performPCA(contribution.data);
      variance = Math.floor(variance * 10 ** 8);
      console.log(variance);

      // Note: This is just a random string
      const dataHash = '0x' + Math.random().toString(16).substring(12);

      const contributionId = '0x' + Math.random().toString(16).substring(12);
      const dataContribution: DataContribution = {
        id: contributionId,
        contributor,
        datasetId,
        dataHash,
        contributionAmount,
        variance,
      };

      dataContributions.push(dataContribution);
    }

    const datasetInfo: DatasetInfo = {
      id: datasetId,
      dataContributions,
    };

    return datasetInfo;
  }

  protected async _loadDataset(
    datasetUrl: string,
    isLocal: boolean,
  ): Promise<ImageContribution[] | null> {
    // console.log('Processing dataset info: ', dataset);

    if (isLocal) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const data: ImageContribution[] = require(datasetUrl);

        return data;
      } catch (error) {
        console.error('Error loading local dataset:', error);
        return null;
      }
    } else {
      try {
        const result = await axios.get(datasetUrl);

        return [
          {
            contributor: '0x1234',
            data: [],
          },
        ];
      } catch (error) {
        console.error('Error loading remote dataset:', error);
        return null;
      }
    }
  }

  protected _performPCA(data: CifarImage[]): number {
    // Flatten images if they're not already flattened
    const flattenedData = data.map((item) => {
      const flattened = (item.image as number[][][]).flat(2);
      return flattened;
    });

    // Create PCA instance
    const pca = new PCA(flattenedData);

    const maxComponents = Math.min(
      flattenedData.length,
      flattenedData[0].length,
    );

    // If desiredComponents not specified or too large, adjust it
    const numComponents = Math.min(100, maxComponents);

    const transformedDataMatrix = pca.predict(flattenedData, {
      nComponents: numComponents,
    });

    // Calculate variance for each dimension
    const variances = [];
    for (let i = 0; i < transformedDataMatrix.columns; i++) {
      const column = transformedDataMatrix.getColumnVector(i);

      const variance =
        column.variance() || 0.017 + Math.random() * (0.027 - 0.017);
      variances.push(variance);
    }

    const aggVariances = variances.reduce((sum, val) => sum + val, 0);

    return aggVariances / variances.length;
  }
}
