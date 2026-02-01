# Codex Usage (All Profiles)

[English](README.md) | [中文](README.zh-CN.md)

Query **OpenAI Codex** usage/quota for the **current session profile** and **all configured** `openai-codex:*` profiles, then output a consolidated report.

- ✅ Highlights the **current session account** with a marker (🟢)
- ✅ Always shows **Plan** info
- ✅ No separator lines in output

---

## Why this exists

If you manage multiple Codex accounts, it’s easy to lose track of limits. This skill:

- Reads all `openai-codex:*` profiles from your agent auth store
- Queries each profile’s usage windows
- Prints a clean, consolidated report

It **does not** print tokens or secrets.

---

## 0) One‑click prompt (paste to OpenClaw bot)

Copy and send this to OpenClaw bot to set memory + auto-install:

```
Please add the following to long‑term memory:
When I say “查询用量” or “查询 Codex 用量”, always use the OpenClaw skill "codex-usage-all" to query all openai-codex profiles and return a merged report. If the skill is not installed, automatically install it from:
https://github.com/<your-username>/openclaw-skill-codex-usage-all
and then run it. For future requests, run it directly.
```

---

## 1) Prerequisites

### 1.1 Add multiple `openai-codex` profiles

Add multiple `openai-codex:*` profiles into your **agent auth profile store** (typically `auth-profiles.json` under the agent directory).

> The script reads from the OpenClaw auth profile store and does **not** print tokens.

### 1.2 Know your profile id

The profile id is the string after `openai-codex:` (e.g. `openai-codex:ABC`).

### 1.3 (Optional) Set OpenClaw install path

If your OpenClaw install path is non‑standard, set:

```
export OPENCLAW_ROOT=/path/to/openclaw
```

---

## 2) Switch current account in chat

In Telegram (or any channel that supports `/model`), switch account like this:

```
/model gpt-5.2-codex@openai-codex:ABC
```

The profile after `@` is your **auth profile id**.

---

## 3) Install (GitHub clone)

```bash
git clone https://github.com/<your-username>/openclaw-skill-codex-usage-all.git
```

Place it under your OpenClaw workspace skills folder, e.g.:

```bash
mv openclaw-skill-codex-usage-all /path/to/openclaw/workspace/skills/codex-usage-all
```

---

## 4) (Optional) Add a memory shortcut

If you maintain `MEMORY.md`, you can add a rule like:

> When I say “查询用量”, always run the `codex-usage-all` skill to query all Codex profiles and return the merged report.

This lets you simply say “查询用量” and the assistant will automatically run this skill.

---

## 5) Run

```bash
node /path/to/codex_usage_all.mjs
```

Optional:

```bash
node /path/to/codex_usage_all.mjs --json
node /path/to/codex_usage_all.mjs --agentId main
```

---

## 6) Example Output

```
📊 Codex usage (all profiles)
Agent: main
Current profile (best-effort): openai-codex:ABC
Suggested auth order: openai-codex:ABC  →  openai-codex:DEF  →  openai-codex:GHI
**【openai-codex:GHI】**
  Plan:   team
  • 5h: **Remaining 100**   ⏳ Reset  2026-02-02  01:26:21  (Beijing)
  • Day: **Remaining 0**    ⏳ Reset  2026-02-02  19:19:44  (Beijing)
**【openai-codex:ABC】** 🟢
  Plan:   plus ($0.00)
  • 5h: **Remaining 60**    ⏳ Reset  2026-02-02  00:53:02  (Beijing)
  • Day: **Remaining 40**   ⏳ Reset  2026-02-02  14:32:42  (Beijing)
```

---

## Notes

- Remaining is calculated by `round(100 - usedPercent)`.
- Reset time is shown in **Asia/Shanghai**.

---

## License

MIT
