# 企业级 NestJS 微服务三层架构（BFF - 业务 BSC - 基础 BSC）

Nx 管理的 NestJS Monorepo，演示企业级微服务三层架构基线：BFF 负责客户端编排与用户级 RBAC，业务 BSC 承载业务领域，基础 BSC 提供身份等基础能力；各 BSC 独占领域数据与不变量。架构边界与决策记录在 `CONTEXT.md` 与 `docs/adr/`。

## 目录结构

```text
apps/
  bff-admin/      管理后台 BFF（无状态，无 MikroORM）
  bff-student/    学生端 BFF（无状态，无 MikroORM）
  bsc-user/       基础 BSC：身份、RBAC、积分余额
  bsc-marketing/  业务 BSC：营销活动、奖品、兑换
libs/
  contracts/      共享 gRPC 协议契约（仅 proto 与加载配置，禁止领域逻辑）
  platform/       共享技术能力（健康检查等，禁止领域逻辑）
test/
  architecture-guardrails.spec.ts  架构边界回归测试
```

## 常用命令

```bash
pnpm install

# 单项目：构建 / 测试 / lint / 类型检查
pnpm nx build bff-admin
pnpm nx test bff-admin

# 全量聚合（CI 等价）
pnpm verify      # 依次执行 typecheck、lint、test、build

# 本地启动
pnpm start:admin     # :3001/api/v1
pnpm start:student   # :3002/api/v1
pnpm start:user      # :4001/api/v1
pnpm start:marketing # :4002/api/v1

# 可视化依赖图
pnpm graph
```

## 架构强制规则（摘要）

- BFF 不引入 MikroORM 或业务数据库（ADR-0002）；由 ESLint `no-restricted-imports` 在 `apps/bff-*/src` 强制。
- BSC 间不得互相导入内部实现，BFF 只能依赖共享包（ADR-0001）；由 Nx `@nx/enforce-module-boundaries` 的 `depConstraints` 强制。
- 共享包仅含技术能力与协议契约，禁止领域模型与业务逻辑（ADR-0001）。
- 对外 REST 使用 `/api/v1` 与 OpenAPI；服务间同步用 gRPC，异步用 RocketMQ 领域事件（ADR-0003）。
- `bsc-marketing` 可调用 `bsc-user`，反之禁止（ADR-0006）。

边界回归见 `test/architecture-guardrails.spec.ts`，随 `pnpm test` 一并执行。

## 许可

UNLICENSED（私有）。
