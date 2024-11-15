import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    const abiSign = JSON.parse(fixedRequest.requestBody.abi_signature);

    const result = new AttestationResponse<IDatasetInfoApi_Response>();

    // axios get data
    let dataset: any;
    await axios
      .get(url)
      .then((response) => {
        dataset = response['data'];
      })
      .catch((error) => {
        console.error(error);
        result.status = AttestationResponseStatus.INVALID;
        return result;
      });

    // ! Process Dataset and get the info
    const datasetInfo = this._processDatasetInfo(dataset);

    // // encode info
    // const web3 = new Web3();
    // const encodedResult = web3.eth.abi.encodeParameter(abiSign, datasetInfo);

    const encodedResult = '0x1234567890'; // dummy data

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

  protected async _processDatasetInfo(dataset: any) {
    console.log('Processing dataset info: ', dataset);
    return { hello: 'world' };
  }
}
