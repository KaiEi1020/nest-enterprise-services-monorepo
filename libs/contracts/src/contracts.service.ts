import { Injectable } from '@nestjs/common';
import { loadProto, protoFilePath } from './proto-loader';

export const USER_PROTO_PATH = 'user/v1/user.proto';
export const MARKETING_PROTO_PATH = 'marketing/v1/marketing.proto';

/**
 * Shared protocol-contract helpers. Exposes proto package metadata so every
 * BFF and BSC binds gRPC transport from the same source of truth (ADR-0003).
 * Domain logic and repository implementations live in the owning BSCs, never
 * here (ADR-0001).
 */
@Injectable()
export class ContractsService {
  /** gRPC package name for the user contract. */
  readonly userPackage = 'enterprise.user.v1';

  /** Absolute on-disk path of the user proto, for gRPC server/client binding. */
  userProtoFilePath(): string {
    return protoFilePath(USER_PROTO_PATH);
  }

  /**
   * Shared gRPC options for the user contract, so servers and clients bind the
   * same package + proto instead of duplicating the literal (ADR-0003).
   */
  userGrpcOptions(url: string): {
    package: string;
    protoPath: string;
    url: string;
  } {
    return {
      package: this.userPackage,
      protoPath: this.userProtoFilePath(),
      url,
    };
  }

  marketingProtoFilePath(): string {
    return protoFilePath(MARKETING_PROTO_PATH);
  }

  loadUserProto(): ReturnType<typeof loadProto> {
    return loadProto(USER_PROTO_PATH);
  }

  loadMarketingProto(): ReturnType<typeof loadProto> {
    return loadProto(MARKETING_PROTO_PATH);
  }
}
