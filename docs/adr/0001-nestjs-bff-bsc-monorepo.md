# 采用 NestJS BFF/BSC Monorepo

项目初期采用 Nx 管理的 NestJS Monorepo，同时托管 `apps/bff-*` 与 `apps/bsc-*`，并以 `packages/*` 提供受限的跨服务技术能力与协议契约。这样可在领域边界仍在演进时保留统一工具链和低成本协作；当某领域具备独立的团队、发布节奏或安全边界时，再按领域拆分仓库。

## Consequences

共享包不得包含领域实体、聚合根、Repository 实现或跨领域业务服务；禁止通过 Monorepo 内部导入绕过服务边界。
