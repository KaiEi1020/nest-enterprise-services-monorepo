# 以 ACK 与 MSE 作为云原生运行基线

服务部署到阿里云 ACK：MSE Gateway 承担公网 JWT 验签、限流和全局路由，Nginx Ingress 仅承担 ACK 内部入口和 Service 路由。开发、测试、预发与生产共用集群但使用独立 Namespace、RBAC、ResourceQuota 和 NetworkPolicy 隔离；每项服务独立镜像、独立 Helm 发布到 ACR，并采用滚动更新。

## Consequences

服务发现和动态配置使用 MSE Nacos；密钥仅可通过 KMS 加密配置或 Secrets Manager 引用取得。服务必须配置 startup、readiness 与 liveness 探针、回滚路径，以及以 Trace ID 关联的 OpenTelemetry、Prometheus 和日志。
