# 基础中台不依赖业务中台

`bsc-user` 是提供身份、RBAC 和积分余额的基础中台；`bsc-marketing` 是管理营销活动、奖品和兑换的业务中台。业务中台可通过 gRPC 同步调用基础中台，基础中台不得同步依赖或理解业务中台的领域模型，以保持依赖方向稳定并允许业务领域独立演进。

## Consequences

`bsc-marketing` 可调用 `bsc-user` 扣减或补回积分；`bsc-user` 不调用 `bsc-marketing`。跨边界通知使用 RocketMQ 领域事件，而不是反向同步调用。
