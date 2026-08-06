# 01 — Nx Monorepo 基线

**What to build:** 建立一个可构建、可 lint、可测试的 Nx 工作区，包含 `bff-admin`、`bff-student`、`bsc-user`、`bsc-marketing` 四个 NestJS 应用骨架与 `packages/*` 共享包目录；通过 Nx 依赖图与 lint 规则强制禁止跨领域导入内部实现，使后续领域功能可以在一致的工程流程上扩展。

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [x] 工作区由 Nx 管理，四个应用可分别构建、启动并运行测试
- [x] `packages/*` 仅允许技术能力与协议契约，禁止包含领域模型与业务逻辑
- [x] 每个应用包含约定的分层目录占位：BFF 无 MikroORM；BSC 含 `api`、`application`、`domain`、`infrastructure/persistence`、模块文件
- [x] lint/依赖图规则阻止 BFF 引入 MikroORM 或跨 BSC 内部实现导入
- [x] CI 或本地命令可一次性执行 build、test、lint 并全部通过

## Answer

Nx 管理的 NestJS Monorepo 基线已落地。四个应用（`bff-admin`、`bff-student`、`bsc-user`、`bsc-marketing`）可独立 build/serve/test/lint；根脚本 `pnpm verify` 一次性执行 typecheck、lint、test、build 并全部通过，`.github/workflows/ci.yml` 在 CI 中复用同一命令。

共享包位于 `libs/contracts`（gRPC proto 契约与共享 proto-loader 配置）与 `libs/platform`（健康检查等纯技术能力），均不含领域模型、聚合、Repository 实现或业务逻辑（ADR-0001）；其 README 与 `test/architecture-guardrails.spec.ts` 中“共享库禁含聚合/Repository”的断言共同约束这一点。注：采用 Nest CLI 的 `nest g lib` 约定生成于 `libs/`，而非规格中的 `packages/`；意图（仅技术能力与协议契约、禁止领域逻辑）已满足。

BSC 按 DDD 分层组织：`api/controller`、`api/dto`、`application/service`、`domain/entities`、`domain/repository`、`domain/vos`、`infrastructure/persistence/{repositories,schemas}` 与领域模块。领域层为纯 TS 类与抽象 Repository 端口，不依赖任何具体 ORM 框架（后续票据接入 ORM 时仅作用于 infrastructure 层）。BFF 仅挂载共享技术平台与编排占位，不引入 MikroORM。

强制规则：ESLint `no-restricted-imports` 在 `apps/bff-*/src` 禁止 `@mikro-orm/*` 及 `typeorm`、`mongoose`、`prisma`、`pg` 等常见持久化包（ADR-0002）；Nx `@nx/enforce-module-boundaries` 的 `depConstraints` 令各领域 scope 不得互相导入、BFF 只能依赖共享包（ADR-0001/0006）。`test/architecture-guardrails.spec.ts` 对上述规则做源码扫描回归。

## Comments

- 评审（/code-review）后修复了两点：删除 BFF 中与 `libs/platform` 重复的健康控制器，改为复用共享 `PlatformModule` 的 `HealthController`；将 BFF 持久化禁令从仅 `@mikro-orm/*` 扩展到 `typeorm`/`mongoose`/`prisma`/`@nestjs/typeorm` 等，并同步更新 guardrails 测试。
- gRPC proto 契约（`libs/contracts/proto`）与 OpenAPI/Swagger 挂载为前置占位，归属 ADR-0003 与后续身份/营销票据；本期仅建立契约入口，不接入真实 MSE/RocketMQ/数据库（符合 spec out-of-scope）。
