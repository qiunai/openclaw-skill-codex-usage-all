# Codex Usage (All Profiles)

Query **OpenAI Codex** usage/quota for the **current session profile** and **all configured** `openai-codex:*` profiles, then output a consolidated report.

- ✅ Highlights the **current session account** with a marker (🟢)
- ✅ Always shows **Plan** info
- ✅ No separator lines in output

---

## 中文说明

这是一个 OpenClaw skill，用于一次性查询 **当前会话账号** 以及 **所有 openai-codex profiles** 的 Codex 用量，并输出合并后的结果。

- ✅ 当前会话账号会带 🟢 标记
- ✅ 始终输出 Plan 信息
- ✅ 输出中不含分割线

---

## 1) Prerequisites / 前置条件

### Add multiple openai-codex profiles
Add multiple `openai-codex:*` profiles into your **agent auth profile store** (e.g. `auth-profiles.json` under the agent directory).

**中文：** 请先在 agent 的 **auth profile store** 中添加多个 `openai-codex:*` 账号（例如在 agent 目录下的 `auth-profiles.json` 中配置）。

> The script reads from the OpenClaw auth profile store and does **not** print tokens.

---

## 2) Switch current account in chat / 在会话里切换账号

In Telegram (or any channel that supports `/model`), switch account like this:

```
/model gpt-5.2-codex@openai-codex:tuta
```

**中文：** 在会话中用 `/model` 切换，例如：

```
/model gpt-5.2-codex@openai-codex:tuta
```

The profile after `@` is your **auth profile id**.

---

## 3) Run / 使用

```bash
node /path/to/codex_usage_all.mjs
```

Optional:

```bash
node /path/to/codex_usage_all.mjs --json
node /path/to/codex_usage_all.mjs --agentId main
```

---

## 4) Example Output / 输出示例

```
📊 Codex usage (all profiles)
Agent: main
Current profile (best-effort): openai-codex:tuta
Suggested auth order: openai-codex:tuta  →  openai-codex:wanda  →  openai-codex:team320
**【openai-codex:team320】**
  Plan:   team
  • 5h: **Remaining 100**   ⏳ Reset  2026-02-02  01:26:21  (Beijing)
  • Day: **Remaining 0**    ⏳ Reset  2026-02-02  19:19:44  (Beijing)
**【openai-codex:tuta】** 🟢
  Plan:   plus ($0.00)
  • 5h: **Remaining 60**    ⏳ Reset  2026-02-02  00:53:02  (Beijing)
  • Day: **Remaining 40**   ⏳ Reset  2026-02-02  14:32:42  (Beijing)
```

---

## Notes / 说明

- Remaining is calculated by `round(100 - usedPercent)`.
- Reset time is shown in **Asia/Shanghai**.

---

## License

MIT
