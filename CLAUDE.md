## 交流约定

- 主要使用中文交流。
- 技术名词与专业名词保留原文，不翻译成中文（如 gRPC、BFF、MikroORM、RBAC 等）。

### 注释与文档语言

- 面向人类读者的新增或修改代码注释，优先使用中文；技术名词、标识符、协议字段名、类库/API 名称保留原文。
- 注释重点说明意图、业务规则、边界条件和设计取舍，不重复代码已经直接表达的内容。
- 仅对新增或实际修改的注释执行此约定，不要求为了统一语言大范围改写既有注释。
- 生成代码、第三方代码和外部规范中的原始注释保留原文。

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
- `libs/platform/src/shared-kernel/` 仅存放多个领域或服务共同认可、语义稳定且无业务行为的共享词汇与标识符；按 `vocabulary/`、`identifiers/` 分类，禁止放入领域专属 Value Object、Specification、Interface 或领域事件契约。
- 单领域的枚举、状态和业务分类放在 `<domain>/domain/vocabulary/`；带校验、不变量或行为的类型放在 `<domain>/domain/value-objects/`；不是所有 enum 都进入 shared kernel。
- 跨服务传输的 Proto enum、RocketMQ event payload 属于 `libs/contracts/`，由 API 或消息适配层映射为领域类型。
- 对外接口使用 `/api/v1` REST 与 OpenAPI；gRPC Proto 变更必须保持向后兼容。
- 领域模块位于 `src/<domain>/`，内部固定为 api/application/domain/infrastructure 四层；目录统一用复数命名。结构约定见 `docs/adr/0007-domain-module-directory-layout.md`。
