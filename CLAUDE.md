## 交流约定

- 主要使用中文交流。
- 技术名词与专业名词保留原文，不翻译成中文（如 gRPC、BFF、MikroORM、RBAC 等）。

## Agent skills

### Issue tracker

问题以本地 Markdown 文件跟踪，位于 `.scratch/`。详见 `docs/agents/issue-tracker.md`。

### Triage labels

使用五个默认分诊标签。详见 `docs/agents/triage-labels.md`。

### Domain docs

使用单上下文文档布局。详见 `docs/agents/domain.md`。

## 架构强制规则

修改应用代码前，必须阅读 `CONTEXT.md` 以及与任务相关的 `docs/adr/` 文件。

- 本项目是 Nx 管理的 NestJS Monorepo：BFF 位于 `apps/bff-*`，核心领域服务位于 `apps/bsc-*`。
- BFF 不得配置 MikroORM 或访问业务数据库；每个 BSC 独占领域数据、数据库账号和迁移。
- 服务间同步调用统一使用 gRPC；异步领域事件统一使用 RocketMQ。
- BFF 负责用户级 RBAC；BSC 必须验证资源归属与领域不变量。
- 禁止跨领域导入内部实现或跨库访问；共享包不得包含领域模型与业务逻辑。
- 对外接口使用 `/api/v1` REST 与 OpenAPI；gRPC Proto 变更必须保持向后兼容。
