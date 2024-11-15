import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import configuration, { IConfig } from 'src/config/configuration';
import { IDatasetInfoApiVerifierController } from './IDatasetInfoApi.controller';
import { ApiKeyStrategy } from 'src/auth/apikey.strategy';
import { AuthService } from 'src/auth/auth.service';
import { IDatasetInfoApiVerifierService } from './IDatasetInfoApi.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    // add connection to a database
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (config: ConfigService<IConfig>) =>
    //     config.get('typeOrmModuleOptions'),
    //   inject: [ConfigService],
    // }),
    AuthModule,
  ],
  controllers: [IDatasetInfoApiVerifierController],
  providers: [ApiKeyStrategy, AuthService, IDatasetInfoApiVerifierService],
})
export class IDatasetInfoApiVerifierServerModule {}
