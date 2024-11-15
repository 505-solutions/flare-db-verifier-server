import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  IDatasetInfoApi_Request,
  IDatasetInfoApi_Response,
} from 'generated/dto/IDatasetInfoApi.dto';
import { BaseVerifierController } from 'src/controllers/base/verifier-base.controller';
import { AttestationResponse } from 'src/dtos/generic/generic.dto';
import { IDatasetInfoApiVerifierService } from './IDatasetInfoApi.service';

@ApiTags('IDatasetInfoApi')
@Controller('IDatasetInfoApi')
export class IDatasetInfoApiVerifierController extends BaseVerifierController<
  IDatasetInfoApi_Request,
  IDatasetInfoApi_Response
> {
  constructor(
    protected readonly verifierService: IDatasetInfoApiVerifierService,
  ) {
    super();
  }

  /**
   * Tries to verify attestation request (given in JSON) without checking message integrity code, and if successful it returns response.
   * @param prepareResponseBody
   * @returns
   */
  @HttpCode(200)
  @Post('prepareResponse')
  async prepareResponse(
    @Body() body: IDatasetInfoApi_Request,
  ): Promise<AttestationResponse<IDatasetInfoApi_Response>> {
    return this.verifierService.prepareResponse(body);
  }
}
