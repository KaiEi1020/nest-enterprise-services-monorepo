# 领域模块统一分层架构与命名约定

每个 BSC 内部按领域拆分为多个模块，领域模块直接位于 `src/<domain>/`（如 `src/user`、`src/identity`），单个领域模块内部分为四层：`api`（控制器、DTO、presenter）、`application`（command、query、application event、应用服务）、`domain`（聚合、实体、值对象、仓储接口、领域事件、领域服务、领域异常）、`infrastructure`（持久化、消息、外部集成）。模块根部以 `<domain>.module.ts` 组装。层间依赖只允许自外向内（api → application → domain），infrastructure 实现 domain 声明的接口并由 DI 装配，domain 不依赖任何外层与框架。

## 结构约定

```
<domain>/                              # 例：user、identity、points
├── api/
│   ├── controllers/
│   │   ├── user.controller.ts
│   │   └── auth.controller.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── presenters/
│       └── user.presenter.ts
├── application/
│   ├── commands/                      # 一条业务一个目录：命令 + 处理器
│   │   └── create-user/
│   │       ├── create-user.command.ts
│   │       └── create-user.handler.ts
│   ├── queries/                       # 一条业务一个目录：查询 + 处理器
│   │   └── get-user/
│   │       ├── get-user.query.ts
│   │       └── get-user.handler.ts
│   ├── events/                        # application 层事件（区别于 domain 的领域事件）
│   │   └── user-welcomed.event.ts
│   └── services/                      # 是可选的，只有出现多个 Handler 需要共享同一段应用层编排逻辑时才创建
│       └── notification.service.ts
├── domain/
│   ├── aggregates/                    # 聚合根 + 聚合业务入口（放业务一致性边界）
│   │   └── user.aggregate.ts
│   ├── entities/                      # 聚合内部实体，或者简单实体（放业务对象）
│   │   └── user.entity.ts
│   ├── value-objects/
│   │   ├── email.vo.ts
│   │   └── password.vo.ts
│   ├── vocabulary/                    # 单领域枚举、状态和业务分类
│   │   └── user-status.ts
│   ├── repositories/                  # 仓储接口（实现在 infrastructure）
│   │   └── user.repository.ts
│   ├── events/                        # 领域事件
│   │   └── user-created.event.ts
│   ├── services/                      # 领域服务（非应用服务）
│   │   └── password.service.ts
│   └── exceptions/
│       ├── user-not-found.exception.ts
│       └── invalid-password.exception.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── repositories/              # 仓储实现，带 ORM 前缀
│   │   │   └── mikro-orm-user.repository.ts
│   │   ├── schemas/
│   │   │   └── user.schema.ts
│   │   └── migrations/
│   ├── messaging/                     # RocketMQ 领域事件收发
│   └── external/                      # 外部集成、auth 基础设施等
└── <domain>.module.ts
```

## 命名约定

### 目录

目录统一用复数：`controllers`、`dto`、`presenters`、`commands`、`queries`、`events`、`services`、`value-objects`、`vocabulary`、`entities`、`aggregates`、`repositories`、`exceptions`、`schemas`、`migrations`。废弃单数与缩写别名：`controller`、`service`（泛指 application 层目录）、`use-case`、`vo`、`vos`、`repository`。

`domain/vocabulary/` 仅用于当前领域拥有的枚举、状态和业务分类；它不承载业务行为。具有校验、不变量、标准化或相等性语义的类型放入 `domain/value-objects/`。只有多个领域或服务共同认可且语义稳定的无行为词汇或标识符，才放入 `libs/platform/src/shared-kernel/vocabulary/` 或 `identifiers/`；Proto enum 和 RocketMQ event payload 属于 `libs/contracts/`。并非所有 enum 都应放入 shared kernel。严格禁止为领域专属类型建立泛化的 `src/shared/` 目录。 

### 文件

文件命名遵循统一规律：**`业务名.角色.ts`（business-name.role.ts）**。

- **文件名用 kebab-case（短横线），类名用 PascalCase。** 例：文件 `create-user.command.ts` 内 `export class CreateUserCommand {}`。与 Nest CLI / Nx Generator 一致，避免跨系统大小写问题。
- **文件名表达业务动作（动词），不是实体。** 用 `create-user.use-case.ts`，不用 `user.service.ts`、`create.service.ts`。

各层文件后缀：

| 层 | 目录 | 文件命名 | 反例 |
| --- | --- | --- | --- |
| api | controllers/ | `user.controller.ts` | `UserController.ts` |
| api | dto/ | `create-user.dto.ts` | `CreateUserDto.ts` |
| api | presenters/ | `user.presenter.ts` | |
| application | commands/ | `create-user.command.ts` + `create-user.handler.ts`（一业务一目录） | `command.ts`、`handler.ts`（裸名会搜索重名） |
| application | queries/ | `get-user.query.ts` + `get-user.handler.ts` | `query.ts`、`handler.ts` |
| application | events/ | `user-welcomed.event.ts` | |
| application | services/ | `notification.service.ts` | |
| domain | aggregates/ | `user.aggregate.ts` | `user.ts` |
| domain | entities/ | `user.entity.ts` | `user.ts` |
| domain | value-objects/ | `email.vo.ts`、`password.vo.ts` | `vos/`、`EmailVO.ts` |
| domain | repositories/ | `user.repository.ts`（接口） | `user-repository.ts` |
| domain | events/ | `user-created.event.ts`、`password-reset.event.ts` | |
| domain | services/ | `password.service.ts`（领域服务，非应用服务） | |
| domain | exceptions/ | `user-not-found.exception.ts`、`invalid-password.exception.ts` | |
| infrastructure | persistence/repositories/ | `mikro-orm-user.repository.ts`（带 ORM 前缀；单一 ORM 时可用 `user.repository.impl.ts`） | `user.repository.ts`（与接口同名难区分） |
| infrastructure | persistence/schemas/ | `user.schema.ts`（Mongo / MikroORM）；TypeORM 用 `user.orm-entity.ts` 与 domain 实体区分 | 与 domain 实体同名的 `user.entity.ts` |
| infrastructure | persistence/migrations/ | 迁移文件 | |

> 关键区分：`domain/services/` 是**领域服务**（含业务规则），`application/services/` 是**应用服务**（编排）；`infrastructure/persistence/schemas/` 的持久化对象不要与 `domain/entities/` 的领域实体同名同后缀。

横切关注点（多层通用，按需放在对应层）：

| 目录 | 文件命名 |
| --- | --- |
| guards/ | `jwt-auth.guard.ts` |
| interceptors/ | `logging.interceptor.ts` |
| factories/ | `user.factory.ts` |
| specifications/ | `active-user.specification.ts` |
| policies/ | `user-access.policy.ts` |

模块根部组装文件：`<domain>.module.ts`（如 `user.module.ts`）。

## Consequences

- 新领域模块一律按此结构创建，不再出现 `api/controller`、`domain/vos` 这类旧写法。
- 既有模块（`bsc-user` 的 `user`、`identity`）在各自 issue 触及该模块时顺带迁移到此结构，不单独发起全量重构。
- application 层区分 `commands`/`queries`（CQRS 意图）、`services`（编排/应用服务）与 `events`（application 层发布的事件，区别于 domain 的领域事件），写操作走 command、读操作走 query。
- 未来拆分独立服务（如 `identity` 拆为 `bsc-identity`）时，整个 `<domain>/` 目录即为迁移单元。
