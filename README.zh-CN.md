# Codex 用量查询（多账号）

[English](README.md) | [中文](README.zh-CN.md)

这是一个 OpenClaw skill，用于一次性查询 **当前会话账号** 以及 **所有 openai-codex profiles** 的 Codex 用量，并输出合并后的结果。

- ✅ 当前会话账号会带 🟢 标记
- ✅ 始终输出 Plan 信息
- ✅ 输出中不含分割线

---

## 这个工具解决什么问题

当你有多个 Codex 账号时，很容易忘记各自的额度和重置时间。这个 skill 会：

- 读取 agent 的 `openai-codex:*` profiles
- 逐个查询用量窗口
- 输出一份清晰、合并的报告

不会打印 token 或其他敏感信息。

---

## 0) 一键提示词（发给你的 OpenClaw 机器人）

复制下面内容，发给你的 OpenClaw 机器人 即可设置长期记忆并自动安装：

```
请把以下内容加入长期记忆：
当我说“查询用量”或“查询 Codex 用量”时，始终调用 OpenClaw skill「codex-usage-all」，查询所有 openai-codex 账号并返回合并结果。先从 /status 判定**当前会话账号**并传给脚本（确保 🟢 标记对应当前会话）。如果该 skill 未安装，请先从下列仓库自动安装：
https://github.com/<your-username>/openclaw-skill-codex-usage-all
然后再执行；后续请求直接调用该 skill。
```

---

## 1) 前置条件

### 1.1 添加多个 `openai-codex` profiles

请先在 **agent 的 auth profile store** 中添加多个 `openai-codex:*` 账号（通常位于 agent 目录下的 `auth-profiles.json`）。

> 脚本只读取 auth store，并不会输出任何 token。

### 1.2 了解 profile id

profile id 是 `openai-codex:` 后面的部分（例如 `openai-codex:ABC`）。

### 1.3 （可选）设置 OpenClaw 安装路径

如果你的 OpenClaw 安装路径不是默认值，可以设置：

```
export OPENCLAW_ROOT=/path/to/openclaw
```

---

## 2) 会话里切换账号

在 Telegram（或支持 `/model` 的渠道）中这样切换：

```
/model gpt-5.2-codex@openai-codex:ABC
```

`@` 后面就是你的 **auth profile id**。

---

## 3) 安装（GitHub clone）

```bash
git clone https://github.com/<your-username>/openclaw-skill-codex-usage-all.git
```

放到 OpenClaw workspace 的 skills 目录，例如：

```bash
mv openclaw-skill-codex-usage-all /path/to/openclaw/workspace/skills/codex-usage-all
```

---

## 4) （可选）添加长期记忆快捷触发

如果你维护 `MEMORY.md`，可以加入一条规则：

> 当我说“查询用量”时，始终调用 `codex-usage-all` skill，查询所有 Codex 账号并返回合并结果。

这样之后只要说“查询用量”，助手就会自动调用该 skill。

---

## 5) 使用方式

```bash
node /path/to/codex_usage_all.mjs
```

可选参数：

```bash
node /path/to/codex_usage_all.mjs --json
node /path/to/codex_usage_all.mjs --agentId main
node /path/to/codex_usage_all.mjs --currentProfile openai-codex:ABC
```

---

## 6) 输出示例

```
📊 Codex usage (all profiles)
Agent: main
Current profile (best-effort): openai-codex:ABC
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

## 备注

- Remaining 的计算方式：`round(100 - usedPercent)`。
- 重置时间使用 **Asia/Shanghai**。

---

## 许可证

MIT
