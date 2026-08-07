/**
 * Platform-wide reusable pagination envelope. Every list request across gRPC
 * contracts carries a nested `page` message of `currentPage` + `pageSize`;
 * every list response carries `total` + `list` + `hasNext`. Keeping the shape
 * here (ADR-0001: contracts may hold protocol types but no domain logic) lets
 * each BSC map its own typed records into the same wire envelope instead of
 * redefining it per service. proto3 has no generics, so on the wire each
 * response names its typed records field (`users`, `prizes`, ...) alongside
 * the shared `total`/`hasNext`; the reusable `list` envelope lives here and
 * each presenter fills the typed field from it.
 */

/** The nested `page` message mirrored by every `*ListRequest` proto message. */
export interface PageRequest {
  /** 1-based page number; values below 1 are treated as page 1. */
  currentPage: number;
  /** Page size; values below 1 fall back to the service default. */
  pageSize: number;
}

/** Reusable list-request shape: a single nested `page` envelope. */
export interface PaginatedRequest {
  page: PageRequest;
}

/** Reusable list-response shape mirrored by every `*ListResponse` proto message. */
export interface PageResponse<T> {
  /** Total number of records across all pages (excluding soft-deleted). */
  total: string;
  /** The records on the current page, already mapped to the wire shape. */
  list: T[];
  /** Whether at least one more page exists after this one. */
  hasNext: boolean;
}

/** Normalizes a `page` envelope to safe 1-based values. */
export function normalizePageRequest(
  request: PaginatedRequest,
  defaultPageSize = 20,
): PageRequest {
  const page = request.page ?? { currentPage: 1, pageSize: defaultPageSize };
  return {
    currentPage: page.currentPage >= 1 ? page.currentPage : 1,
    pageSize: page.pageSize >= 1 ? page.pageSize : defaultPageSize,
  };
}

/**
 * Builds the reusable pagination envelope from a page of typed records and a
 * mapper to the wire shape. `hasNext` is derived from total/page position so
 * every service computes it identically.
 */
export function toPageResponse<TRecord, TWire>(
  records: TRecord[],
  total: number,
  currentPage: number,
  pageSize: number,
  map: (record: TRecord) => TWire,
): PageResponse<TWire> {
  return {
    total: String(total),
    list: records.map(map),
    hasNext: currentPage * pageSize < total,
  };
}
