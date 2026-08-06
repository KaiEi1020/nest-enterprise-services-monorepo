import { join } from 'node:path';
import * as protoLoader from '@grpc/proto-loader';

/**
 * Resolves the on-disk path of a proto contract under `libs/contracts/proto`.
 * gRPC servers and clients bind from this single source of truth (ADR-0003).
 */
export function protoFilePath(relativeProtoPath: string): string {
  return join(__dirname, '..', 'proto', relativeProtoPath);
}

/**
 * Resolves a proto contract under `libs/contracts/proto` and loads it with the
 * shared options used by every gRPC client/server in the platform. Keeping the
 * loader configuration here is what makes the proto package the single source
 * of truth for synchronous BFF/BSC and BSC/BSC integration contracts (ADR-0003).
 */
export function loadProto(relativeProtoPath: string) {
  return protoLoader.loadSync(protoFilePath(relativeProtoPath), {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
}
