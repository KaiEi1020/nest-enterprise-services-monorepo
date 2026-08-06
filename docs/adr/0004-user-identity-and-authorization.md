# 由 bsc-user 承载初始身份与 RBAC

初期由 `bsc-user` 的独立身份模块和 Schema 验证凭据、签发非对称签名 JWT，并管理 RBAC；其模块与数据边界必须允许未来演化为 `bsc-identity`。MSE Gateway 使用公钥离线验签并在成功后注入受信用户上下文；客户端身份头必须被剥离后重建。

## Consequences

BFF 执行用户级 RBAC，BSC 只接受受授权 BFF 的 gRPC 调用，并继续验证资源归属和领域不变量。初期使用短期 access token 与可轮换 refresh token，并保留高风险场景的撤销能力。
