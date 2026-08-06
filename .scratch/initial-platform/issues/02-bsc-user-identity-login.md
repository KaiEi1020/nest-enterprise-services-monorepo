# 02 — bsc-user 身份与登录

**What to build:** 管理员与学生可分别通过 `bsc-user` 验证账号密码并获得短期 access token 与可轮换 refresh token；`bsc-user` 使用非对称密钥签发 JWT，提供 gRPC `Login` 与 `Refresh` 领域动作，为后续管理后台与学生端登录建立身份基线。

**Blocked by:** 01 — Nx Monorepo 基线

**Status:** claimed

- [x] 用户可凭账号密码通过 `bsc-user` gRPC 登录并获得非对称签名的 access token 与 refresh token
- [x] refresh token 可轮换换取新的 access token，旧 refresh token 失效
- [x] 错误凭据返回明确失败，不泄露用户是否存在
- [x] 身份模块在目录与数据边界上可未来独立为 `bsc-identity`
- [x] BSC gRPC 接缝测试覆盖登录成功、登录失败与刷新轮换

## Comments

- 实现说明（2026-08-06）：在 `apps/bsc-user/src/identity/` 落地独立身份模块（ADR-0007 四层结构，CQRS command/query）。密码用 Node 内置 `crypto.argon2`（Argon2id，memory 64MiB / 3 passes / 4 lanes / 16B 随机盐）加盐哈希；access token 用 Ed25519（EdDSA）非对称签名 JWT，refresh token 为高熵随机串、仅存 SHA-256 哈希、轮换即原子作废。登录失败在 miss 路径用固定 dummy hash 对齐 Argon2id 耗时，避免时序泄露用户是否存在。proto 向后兼容追加 `Login`/`Refresh`。
- 遗留（后续 ticket）：Ed25519 密钥当前为进程级临时密钥，后续由密钥下发 + JWKS 公钥分发替换（支撑 MSE Gateway 离线验签）；旧 access token 的撤销列表（`jti`）由高风险撤销需求 ticket 补充；MikroORM 持久化与独立 DB 账号由持久化 ticket 落地，当前为内存仓储。
