# 统一使用 gRPC 与 RocketMQ 进行服务集成

所有同步 BFF-to-BSC 与 BSC-to-BSC 集成使用 gRPC；异步领域事件使用 RocketMQ。gRPC 超时、熔断和重试由统一 SDK 管控，自动重试仅适用于幂等查询；领域事件采用 Transactional Outbox、消费者幂等、重试和死信队列。

## Consequences

对外 BFF API 使用带 `/api/v1` 的 REST 和 OpenAPI；gRPC Proto 必须保持向后兼容。服务不得为绕过这些契约而直接共享数据库或内部实现。
