#!/usr/bin/env node
/*
  Codex usage (all profiles)

  - Determine the current Codex profile (best-effort) from the auth store.
  - Fetch usage windows for each openai-codex profile in auth-profiles.json.
  - Output a suggested auth.order.openai-codex (caller can apply via config.patch).

  Notes:
  - Uses OpenClaw internal modules for auth resolution + usage fetch to avoid reverse-engineering endpoints.
  - Never prints tokens.
*/

import path from "node:path";

function parseArgs(argv) {
  const out = { json: false, agentId: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") out.json = true;
    else if (a === "--agentId") out.agentId = argv[++i] ?? null;
  }
  return out;
}

const args = parseArgs(process.argv);

function formatBeijingDateTime(ms) {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) return "unknown";
  const d = new Date(ms);
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  // keep date and time separated with extra spacing for readability
  return `${get("year")}-${get("month")}-${get("day")}  ${get("hour")}:${get("minute")}:${get("second")}`;
}

// Separator removed by formatting preference.

// Import OpenClaw internals from global install.
// NOTE: this is intentionally pinned to the installed OpenClaw package.
const OPENCLAW_ROOT = "/home/parallels/.npm-global/lib/node_modules/openclaw";

const { loadConfig } = await import(path.join(OPENCLAW_ROOT, "dist/config/config.js"));
const { resolveAgentDir, resolveDefaultAgentId } = await import(path.join(
  OPENCLAW_ROOT,
  "dist/agents/agent-scope.js",
));
const {
  ensureAuthProfileStore,
  listProfilesForProvider,
  resolveApiKeyForProfile,
} = await import(path.join(OPENCLAW_ROOT, "dist/agents/auth-profiles.js"));
const { fetchCodexUsage } = await import(path.join(
  OPENCLAW_ROOT,
  "dist/infra/provider-usage.fetch.js",
));

const cfg = loadConfig();
const agentId = args.agentId || resolveDefaultAgentId(cfg);
const agentDir = resolveAgentDir(cfg, agentId);

const store = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
const profileIds = listProfilesForProvider(store, "openai-codex");

if (!profileIds.length) {
  const msg = `No openai-codex auth profiles found for agentId=${agentId}`;
  if (args.json) {
    console.log(JSON.stringify({ ok: false, error: msg }, null, 2));
  } else {
    console.error(msg);
    process.exitCode = 2;
  }
  process.exit();
}

// "Current" = store.lastGood.openai-codex OR store.order.openai-codex[0] OR first profile.
// NOTE: This script does NOT modify OpenClaw config. The caller (agent) should
// patch `auth.order.openai-codex` via OpenClaw config.patch when needed.
const currentProfile =
  store.lastGood?.["openai-codex"] ||
  store.order?.["openai-codex"]?.[0] ||
  profileIds[0];

const suggestedOrder = (() => {
  const stored = Array.isArray(store.order?.["openai-codex"]) ? store.order["openai-codex"] : [];
  const merged = [currentProfile, ...stored, ...profileIds].filter(Boolean);
  const deduped = [];
  for (const id of merged) if (!deduped.includes(id)) deduped.push(id);
  return deduped;
})();

// Fetch usage for each profile
const results = [];
for (const profileId of profileIds) {
  const cred = store.profiles?.[profileId];
  const label = profileId;

  try {
    const resolved = await resolveApiKeyForProfile({
      cfg: undefined,
      store,
      profileId,
      agentDir,
    });

    const token = resolved?.apiKey;
    if (!token) {
      results.push({ profileId, label, ok: false, error: "No token resolved" });
      continue;
    }

    const accountId = cred && cred.type === "oauth" && "accountId" in cred ? cred.accountId : undefined;
    const snapshot = await fetchCodexUsage(token, accountId, 8000, fetch);

    results.push({ profileId, label, ok: true, snapshot });
  } catch (e) {
    results.push({ profileId, label, ok: false, error: String(e?.message || e) });
  }
}

// Format output
if (args.json) {
  console.log(
    JSON.stringify(
      {
        ok: true,
        agentId,
        currentProfile,
        suggestedAuthOrder: suggestedOrder,
        results: results.map((r) => {
          if (!r.ok) return r;
          const { provider, displayName, windows, plan, error } = r.snapshot;
          return {
            profileId: r.profileId,
            ok: true,
            provider,
            displayName,
            plan: plan || null,
            windows,
            error: error || null,
          };
        }),
      },
      null,
      2,
    ),
  );
} else {
  console.log(`📊 **Codex usage (all profiles)**`);
  console.log(`Agent: ${agentId}`);
  console.log(`Current profile (best-effort): ${currentProfile}`);
  console.log(`Suggested auth order: ${suggestedOrder.join("  →  ")}`);

  for (const r of results) {
    const isCurrent = r.profileId === currentProfile;
    const marker = isCurrent ? " 🟢" : "";
    console.log(`**【${r.profileId}】**${marker}`);
    if (!r.ok) {
      console.log(`  Status: ERROR`);
      console.log(`  Error:  ${r.error}`);
      continue;
    }

    const s = r.snapshot;
    if (s.error) {
      console.log(`  Status: ERROR`);
      console.log(`  Error:  ${s.error}`);
      continue;
    }

    const plan = s.plan || "(unknown)";
    console.log(`  Plan:   ${plan}`);

    if (!s.windows?.length) {
      console.log(`  Windows: (none)`);
      continue;
    }

    for (const w of s.windows) {
      const used = typeof w.usedPercent === "number" ? w.usedPercent : null;
      const remaining = used === null ? null : Math.max(0, Math.round(100 - used));
      const remainStr = remaining === null ? "?" : String(remaining);
      const resetStr = formatBeijingDateTime(w.resetAt);

      console.log(`  • ${w.label}: **Remaining ${remainStr}**   ⏳ Reset  ${resetStr}  (Beijing)`);
    }
  }
}
