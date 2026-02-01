---
name: codex-usage-all
description: Query OpenAI Codex usage/quota for the current session profile and ALL configured openai-codex auth profiles, then return a consolidated report. Use when the user asks to "查询 codex 用量/usage" or wants usage for multiple Codex accounts/profiles.
---

# Codex usage (all profiles)

## What to do

1) Ensure **auth order** prefers the current session’s Codex profile (best-effort):
- Pick `lastGood` for provider `openai-codex` from the agent auth store; otherwise fall back to the first Codex profile.
- Patch `openclaw.json` to set `auth.order.openai-codex` with that profile first.

2) Query usage for **every** `openai-codex:*` profile found in the agent auth store and present a single merged report.

## Output convention
- 对任务次数限制，直接输出 **Remaining N**（由 provider 返回的 `usedPercent` 换算：`N = round(100 - usedPercent)`）。
  - 例如：21% used ≈ Remaining 79。
- 不输出分割线。
- 必须输出 **Plan** 信息（未知则输出 `(unknown)`）。
- 在当前会话账号对应的 `【openai-codex:...】` 后追加一个标记（如 `🟢`）。

## Run

```bash
node {baseDir}/scripts/codex_usage_all.mjs
```

Optional:

```bash
node {baseDir}/scripts/codex_usage_all.mjs --json
node {baseDir}/scripts/codex_usage_all.mjs --agentId main
```
