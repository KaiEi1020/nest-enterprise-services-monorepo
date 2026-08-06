# 10 — student-app BFF

**What to build:** 学生可通过 `bff-student` 的 `/api/v1` REST API 登录/刷新、分页浏览进行中的营销活动、查看活动详情及其奖品列表、用积分兑换奖品、查询自己的兑换记录；BFF 编排 `bsc-user` 与 `bsc-marketing` 的 gRPC 调用并执行用户级 RBAC。

**Blocked by:** 02 — bsc-user 身份与登录, 06 — bsc-marketing 营销活动管理, 07 — bsc-marketing 活动奖品配置与活动库存, 08 — bsc-marketing 兑换与兑换记录

**Status:** ready-for-agent

- [ ] 学生可通过 `/api/v1/auth` 登录并刷新令牌
- [ ] 学生可分页浏览进行中的营销活动
- [ ] 学生可查看某个进行中活动的详情及其奖品列表（含兑换积分与活动库存）
- [ ] 学生可用积分兑换一个单位并在积分或库存不足时得到明确失败
- [ ] 学生可查询自己的兑换记录；未认证或未授权请求被拒绝；BFF 不直接访问任何业务数据库
- [ ] OpenAPI 契约可被生成；supertest 接缝测试覆盖认证、RBAC、浏览与兑换
