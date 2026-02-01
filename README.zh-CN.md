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

## 3) 使用方式

```bash
node /path/to/codex_usage_all.mjs
```

可选参数：

```bash
node /path/to/codex_usage_all.mjs --json
node /path/to/codex_usage_all.mjs --agentId main
```

---

## 4) 输出示例

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

## 备注

- Remaining 的计算方式：`round(100 - usedPercent)`。
- 重置时间使用 **Asia/Shanghai**。

---

## 许可证

MIT
