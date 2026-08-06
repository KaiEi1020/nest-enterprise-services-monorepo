# 09 — admin-app BFF

**What to build:** 管理后台可通过 `bff-admin` 的 `/api/v1` REST API 完成管理员登录/刷新、用户管理、奖品管理、营销活动管理、活动奖品配置管理、兑换记录列表/标记已发放/取消；BFF 编排 `bsc-user` 与 `bsc-marketing` 的 gRPC 调用并执行用户级 RBAC。

**Blocked by:** 02 — bsc-user 身份与登录, 03 — bsc-user 用户管理, 05 — bsc-marketing 奖品管理, 06 — bsc-marketing 营销活动管理, 07 — bsc-marketing 活动奖品配置与活动库存, 08 — bsc-marketing 兑换与兑换记录

**Status:** ready-for-agent

- [ ] 管理员可通过 `/api/v1/auth` 登录并刷新令牌
- [ ] 管理员可通过 `/api/v1` 管理用户、奖品、营销活动与活动奖品配置
- [ ] 管理员可通过 `/api/v1` 查询待发放兑换记录并标记已发放或取消
- [ ] 未认证或未授权请求被拒绝；BFF 不直接访问任何业务数据库
- [ ] OpenAPI 契约可被生成；supertest 接缝测试覆盖认证、RBAC 与各管理操作
