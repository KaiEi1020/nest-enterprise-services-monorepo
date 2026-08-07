# 03 — bsc-user 用户管理

**What to build:** 管理员可通过 `bsc-user` 的 gRPC 领域动作创建用户、分页查询用户、查看用户详情、更新用户资料与状态、删除用户，使管理后台能够维护可登录身份。

**Blocked by:** 02 — bsc-user 身份与登录

**Status:** resolved

- [x] 管理员可创建用户，用户与认证实体在同一事务中持久化
- [x] 重复邮箱或用户名返回明确冲突错误
- [x] 管理员可分页查询用户、查看详情、更新资料与状态、删除用户
- [x] 删除为软删除，已删除用户不出现在默认列表
- [x] BSC gRPC 接缝测试覆盖各动作与冲突场景

## Comments

- 实现说明（2026-08-06）：按 ADR-0007 将 user 模块迁移至 api/application/domain/infrastructure 四层及复数目录；追加 `CreateUser`、`ListUsers`、`GetUser`、`UpdateUserProfile`、`SetUserActive`、`DeleteUser` gRPC 领域动作。用户与认证凭证通过 `UnitOfWork` 原子提交，重复用户名/邮箱映射为 `ALREADY_EXISTS`，缺失用户映射为 `NOT_FOUND`，删除为软删除并同步停用凭证。
- 分页统一放入 `@enterprise/contracts` 的 `PageRequest`/`PaginatedRequest`/`PageResponse<T>`，gRPC 入参为 `page: { currentPage, pageSize }`，出参为 `total`、`list`、`hasNext`；`UserRole` 放入 `@enterprise/platform` 的 `shared-kernel/vocabulary`，作为跨领域无行为共享词汇，避免 user 与 identity 互相导入内部实现。
- 测试说明：bsc-user gRPC 接缝覆盖创建、分页、详情、资料更新、状态切换、软删除、重复用户名/邮箱、非法输入与缺失用户；额外覆盖 UnitOfWork 失败回滚。全仓库 `test`、`typecheck`、`lint` 均通过。
