# 04 — bsc-user 积分余额

**What to build:** `bsc-user` 独占管理每个用户的积分余额，提供 gRPC `DeductPoints` 与 `RefundPoints` 领域动作，保证扣减与退还在并发下不会透支或重复记账，供业务中台在兑换流程中同步调用。

**Blocked by:** 02 — bsc-user 身份与登录

**Status:** ready-for-agent

- [ ] 每个用户具有可读取的积分余额
- [ ] `DeductPoints` 在余额不足时返回明确失败且不产生账务变更
- [ ] `RefundPoints` 可按幂等键安全重复调用而不重复入账
- [ ] 扣减与退还记录可追踪的账务流水
- [ ] BSC gRPC 接缝测试覆盖余额不足、幂等重试与账务一致性
