# Sensus — Incident Progress Primer

Last updated: 2025-11-17

Purpose: a compact, machine- and human-readable primer to restore context about the recent Gemini billing incident, what was changed, why we made those changes, and the guiding Philosophy that informs design choices across this workspace.

---

## 1) High-level summary

- Incident: unexpected Google Cloud / Gemini charges were observed. Rapid mitigation and investigation were required to stop further spend and restore safe operation.
- Outcome: emergency kill-switch and rate-limiting deployed, secret manager reconciled to the free-tier AI Studio key, malformed Cloud Run env fixed, updated images deployed, and a test no-traffic revision created to validate the free key.

## 2) Concrete problems discovered

- Uncontrolled use of a paid Gemini API key (old key still active) that caused usage-based charges.
- Code/runtime made outbound Gemini calls without robust guardrails (no kill-switch, no durable cache, no append-only logging for reconciliation).
- Cloud Run configuration drift: one service (`sensus-api`) was running an older image; another service (`sensus-server`) had a malformed environment variable entry (two values fused into one) causing `process.env.GEMINI_MODEL` to be empty.
- Secret mismatch: Secret Manager held a different key value than the local `.env` file; this caused confusion and inconsistent behavior across revisions.
- Privacy & repo hygiene risk: `server/.env` contained an API key and was present locally; it needed to be untracked and ignored.

## 3) Changes made (what + where)

- Runtime & code-level mitigations (in `server/` code):
  - `DISABLE_GEMINI` environment toggle to short-circuit outbound generative calls.
  - On-disk vector cache at `server/cache/` to reduce duplicate external queries.
  - Append-only Gemini call log (`server/logs/gemini_calls.log`) to reconcile usage and billing.
  - Per-IP rate-limiting to reduce abuse/excess calls.
  - Improved startup logging to include `geminiKeyPresent` and key-length (so we can see at boot whether a key is present without printing secrets).

- Deployment and infra fixes:
  - Fixed Cloud Run env entries (separate `DISABLE_GEMINI` and `GEMINI_MODEL`).
  - Built and deployed new images for `sensus-server` and `sensus-api` and created `sensus-server-test` (no-traffic test revision with Gemini enabled for controlled validation).
  - Uploaded the desired free-tier key to Secret Manager and restarted `sensus-api` to pick up the new secret version (fingerprints verified by SHA‑256 match).

- Repo hygiene:
  - Added `server/.env` and other common local artifacts to `.gitignore` to prevent committing secrets and local artifacts.
  - `server/.env` has been un-tracked (the file remains locally unless you remove it); consider secure deletion or moving it to your vault if you prefer.

## 4) Why we chose these changes (rationale)

- Kill-switch (`DISABLE_GEMINI`) — immediate, deterministic control to stop outbound billable activity while we troubleshoot.
- Cache & rate-limit — prevent rapid repeat calls and reduce noise that leads to bills and noisy logs.
- Append-only logging — create a durable record for billing reconciliation and audit; plain Cloud Run logs are ephemeral/unstructured for this purpose.
- Secret Manager reconciliation — consistent secrets across revisions prevents divergent behavior between services and accidental use of an old (paid) key.
- `.gitignore` & untracking `.env` — standard security practice. Never commit secrets; keep ephemeral or rotate if exposed.

## 5) Current state & verification points

- `sensus-api` and `sensus-server` are deployed with the updated image and envs.
- The free-tier AI Studio key is the Secret Manager active version (SHA‑256 verified); the old paid key was removed.
- Cloud Run logs: 7-day scan showed historical model/endpoint errors from older `sensus-api` revisions; recent 24h logs show no high-volume generativelanguage activity.
- Next recommended steps (not yet completed):
  1. Create a logs-based metric for Gemini/generativelanguage calls and an alerting policy to notify at a safe threshold (e.g., 80% of free quota).
  2. Create a Cloud Billing budget for `sensus-app-8db18` with early email alerts.
  3. Consider rotating the free API key if you suspect it was in repo history or exposed to others.

## 6) How to recover quickly from loss of context (checklist)

1. `GET /api/status` on each service — check `mongoConnected`, `geminiKeyPresent` flags.
2. Inspect `server/logs/gemini_calls.log` for a durable record of outbound calls.
3. Check Secret Manager `GEMINI_API_KEY` fingerprint and compare with local backup if needed.
4. Confirm Cloud Run service envs: `DISABLE_GEMINI`, `GEMINI_MODEL` are set correctly per service.
5. If unexpected charges appear, set `DISABLE_GEMINI=true` on all services immediately and notify billing.

## 7) Brief operational notes for developers

- Do not commit keys or any `*.env` files. Use Secret Manager for production secrets.
- Use `DISABLE_GEMINI=true` in any environment where you are doing bulk tests or where you want to avoid networked AI calls.
- When debugging model/endpoint issues, capture full logs and model list errors; these usually indicate a model or API mismatch.

## 8) Philosophy summary (core ideas from The Authentic Rebellion)

The following is a concise summary of the design philosophy published at https://rebellion.musubiaccord.org — included here because it intentionally drives decisions across all projects in this workspace.

- Purpose & Vision: build forkable, auditable, and ungovernable infrastructure that supports human flourishing in the age of AI rather than extracting value from attention and surveillance.
- Four-act movement: Sensus (emotional detox), The Whetstone (cognitive strengthening), Kintsugi (public witness), The Lyceum (decentralized infrastructure). Each act informs product design and guardrails.
- Shared design principles that guide choices here:
  - Ephemerality over accumulation — prefer short-lived or auto-deleting data where privacy matters.
  - Anonymity over performance — avoid profiles, follower counts, and performance metrics that encourage harmful behavior.
  - Deliberation over velocity — favor slow, accountable interaction flows instead of rapid engagement loops.
  - Transparency and open-source — GPL v3 licensing and auditable systems to reduce capture risk.
  - Local-first & decentralization — prefer edge/local options where feasible and design for anti-capture.
  - Human agency — AI facilitates human judgment rather than replacing it.

Reference: full text and context at https://rebellion.musubiaccord.org — use that site as the canonical source for design language and any direct quotations.

---

If you want, I can:

- Create a short `CHECKLIST.md` for on-call responders with the minimal commands to run.
- Implement the logs-based metric and a Billing budget now.
- Rotate the free API key and remove `server/.env` from disk.

