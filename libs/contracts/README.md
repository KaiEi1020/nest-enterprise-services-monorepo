# @enterprise/contracts

用于服务间同步集成的**协议契约**共享包。

## 允许内容

- `proto/` 下的 gRPC `.proto` 定义
- 共享的 proto-loader 配置（`loadProto`）
- 纯协议辅助类型

## 禁止内容（ADR-0001）

领域模型、聚合根、Repository 实现与跨领域业务服务**永远不得**放在这里。
BFF 可导入本包构建 gRPC 客户端；BSC 可导入本包满足其 gRPC 服务端契约。
gRPC Proto 变更必须保持向后兼容（ADR-0003）。
