# 问题跟踪：本地 Markdown

本仓库的需求、规格与实施问题均以 Markdown 文件存放在 `.scratch/` 中。项目初始化并接入 GitHub 后，可重新运行配置以切换跟踪器。

## 约定

- 每个功能一个目录：`.scratch/<feature-slug>/`
- 规格文件：`.scratch/<feature-slug>/spec.md`
- 实施问题每个文件一条：`.scratch/<feature-slug>/issues/<NN>-<slug>.md`，从 `01` 编号；禁止将所有问题合并到同一文件
- 分诊状态写在问题文件顶部附近的 `Status:` 行；角色名称见 `triage-labels.md`
- 评论与沟通记录追加在文件底部的 `## Comments` 标题下

## 当技能要求“发布到问题跟踪器”时

在 `.scratch/<feature-slug>/` 下创建文件；如目录不存在则创建。

## 当技能要求“获取相关 ticket”时

读取引用路径对应的文件；用户通常会给出路径或问题编号。

## Wayfinder 操作

供 `/wayfinder` 使用。地图文件包含一个子问题文件。

- **地图**：`.scratch/<effort>/map.md`，记录 Notes、Decisions-so-far 与 Fog
- **子问题**：`.scratch/<effort>/issues/NN-<slug>.md`。顶部 `Type:` 为 `research`、`prototype`、`grilling` 或 `task`；`Status:` 为 `claimed` 或 `resolved`
- **阻塞关系**：顶部 `Blocked by: NN, NN`；列出的全部问题为 `resolved` 时才解除阻塞
- **待办前沿**：扫描未关闭、未阻塞、未认领的问题文件，按编号优先
- **认领**：先写入 `Status: claimed` 并保存，再开始工作
- **解决**：在 `## Answer` 下追加答案，设置 `Status: resolved`，并在 `map.md` 的 Decisions-so-far 中追加上下文链接
