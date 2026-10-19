# KORE — Product Rebuild & Brand Architecture
Status: DESIGN / AUDIT — not yet implemented or release-ready
Source: fork of dyad-sh/dyad, inspected 2026-10-19.

## Mission
Kore is a local-first AI app builder focused on visual creation, reliable code changes, transparent costs, and production handoff. Avoid promising “better than Lovable” without comparative tests. Retain existing working functionality until tests justify a change.

## Confirmed architecture
- Electron shell with React renderer and privileged Node main process, communicating via IPC.
- Prompt → LLM request → streamed structured UI → user approval → response processor → file operations → preview.
- Current package retains Dyad identity `name:dyad`, version `1.20.0-beta.1`; rebranding is not yet applied.
- Agent architecture doc places newer local-agent loop and tools under `src/pro/`, a separately licensed directory.
- Existing project scripts include lint, TypeScript checks, Vitest, Playwright E2E and Electron Forge packaging.

## Legal boundary (release blocker)
Root LICENSE declares Apache-2.0 for code outside `src/pro/`; this permits derivatives subject to attribution and NOTICE/license requirements.
`src/pro/LICENSE` is FSL-1.1-ALv2 and restricts competing commercial uses. Do not include that code in a competing commercial Kore release absent explicit authorization or qualified legal review. Do not remove or relabel upstream notices. `package.json` says MIT while root LICENSE and README define a split regime; resolve metadata inconsistency before release.
The existing Dyad name/logo remain upstream identifiers; adopt distinct Kore marks after removing trademark-confusing uses without hiding attribution.

## Product direction
Core promise: “Imagine. Build. Own.” Independent brand, straightforward visual workflow, transparent model cost, one-click local preview, source ownership, integration with GitHub and deploy targets.
Phase A: retain Apache-licensed base, build and execute baseline; discover dependencies on restricted modules.
Phase B: create compliant modular agent engine / adapters independent of `src/pro`; use neutral tool contracts and mandatory user approvals for file operations.
Phase C: brand UI, onboarding, icons, installation and docs.
Phase D: GitHub sync, deploy providers (including a future self-hosted Kore deployment engine) and measured E2E quality.
No automatic use of ARC source-intelligence documents as a runtime dependency.

## User journey
New project → describe idea → choose AI provider / key → preview generated app → inspect diff → approve change → run tests → publish via GitHub/deploy.

## Branding direction (draft)
Name: KORE. Positioning: the creative core for building real software.
Design language: precise, confident, not childish. Graphite #10151E, ivory #F7F9FC, signal-lime #0CE982 (subject to distinctiveness review), indigo #615FFF accent.
Logo: a geometric segmented “K” wrapped around a central luminous core, horizontal KORE wordmark. Mascot: CORE, a modular robotic spark with two floating angular wings and a small illuminated core; stylized geometric, no childish facial expressions. A single recognizable silhouette must work as a favicon.

## Verification gates
1. License/notice inventory including dependencies and `src/pro` imports.
2. Baseline Windows build and smoke app opening.
3. Core flows: create project, generate, diff review, preview, rollback, GitHub handoff.
4. Security: API key storage, IPC permissions, commands, file path traversal, update signing.
5. Comparison with Lovable/Dyad only on matched, reproducible tasks.
6. Record screenshots, versions, costs and failures before any superiority statement.

## Mission Lock
NOW: license-aware dependency inventory + baseline build.
NEXT: compliant rebrand implementation and original agent subsystem.
PARKED: ARC vs REA Coliseu; Vercel clone; broad product expansion.
