# 02 — bsc-user 身份与登录

**What to build:** 管理员与学生可分别通过 `bsc-user` 验证账号密码并获得短期 access token 与可轮换 refresh token；`bsc-user` 使用非对称密钥签发 JWT，提供 gRPC `Login` 与 `Refresh` 领域动作，为后续管理后台与学生端登录建立身份基线。

**Blocked by:** 01 — Nx Monorepo 基线

**Status:** ready-for-agent

- [ ] 用户可凭账号密码通过 `bsc-user` gRPC 登录并获得非对称签名的 access token 与 refresh token
- [ ] refresh token 可轮换换取新的 access token，旧 refresh token 失效
- [ ] 错误凭据返回明确失败，不泄露用户是否存在
- [ ] 身份模块在目录与数据边界上可未来独立为 `bsc-identity`
- [ ] BSC gRPC 接缝测试覆盖登录成功、登录失败与刷新轮换
