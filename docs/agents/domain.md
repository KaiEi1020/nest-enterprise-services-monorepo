# 领域文档

工程技能探索代码库时，应按以下规则使用领域文档。

## 开始探索前阅读

- 根目录的 `CONTEXT.md`；或
- 根目录的 `CONTEXT-MAP.md`：存在时，它会指向多个上下文的 `CONTEXT.md`，仅阅读与当前任务相关的文件；
- `docs/adr/`：阅读影响当前任务的架构决策记录（ADR）。

若上述文件尚不存在，静默继续；不要将其缺失视为阻塞。`/domain-modeling`、`/grill-with-docs` 和 `/improve-codebase-architecture` 会在形成真实决策时创建它们。

## 文档结构

单上下文布局：

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## 术语规则

问题标题、重构建议、假设与测试名称中的领域概念必须使用 `CONTEXT.md` 已定义的术语，避免擅自改用同义词。若需要的概念尚未定义，应作为 `/domain-modeling` 的待解决术语记录。

## ADR 冲突

若输出与现有 ADR 矛盾，必须明确指出冲突，而非静默推翻。例如：

> 与 ADR-0007 冲突；建议重新讨论的理由是……
