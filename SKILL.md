---
name: codex-usage-all
description: Query OpenAI Codex usage/quota for the current session profile and ALL configured openai-codex auth profiles, then return a consolidated report. Use when the user asks to "查询 codex 用量/usage" or wants usage for multiple Codex accounts/profiles.
---

# Codex usage (all profiles)

## What to do

1) Determine the **current session profile** from /status (or equivalent), then pass it to the script via `--currentProfile`.

2) Query usage for **every** `openai-codex:*` profile found in the agent auth store and present a single merged report.

> Note: Do **not** patch `auth.order.openai-codex` or emit suggested order (user preference).

## Output convention
- 对任务次数限制，直接输出 **Remaining N**（由 provider 返回的 `usedPercent` 换算：`N = round(100 - usedPercent)`）。
  - 例如：21% used ≈ Remaining 79。
- 不输出分割线。
- 必须输出 **Plan** 信息（未知则输出 `(unknown)`）。
- 在当前会话账号对应的 `【openai-codex:...】` 后追加一个标记（如 `🟢`）。
- 输出中 **不包含** “Suggested auth order”。

## Run

```bash
node {baseDir}/scripts/codex_usage_all.mjs
```

Optional:

```bash
node {baseDir}/scripts/codex_usage_all.mjs --json
node {baseDir}/scripts/codex_usage_all.mjs --agentId main
# Force “current profile” (recommended: derive from /status so it matches the live session)
node {baseDir}/scripts/codex_usage_all.mjs --currentProfile openai-codex:tuta
```
