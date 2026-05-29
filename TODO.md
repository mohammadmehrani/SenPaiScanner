# TODO.md — Hacker Terminal upgrade (local-first)

## Step 0: Repo understanding & constraints
- [x] Read README, confirm Go TUI scanner is current core
- [ ] Identify exact Go entrypoints for scan configuration + export

## Step 1: Frontend scaffold (Next.js + Tailwind + Three.js + GSAP)
- [ ] Create `frontend/` Next.js app with Tailwind
- [ ] Add Three.js background + GSAP terminal animations
- [ ] Landing page with 2 buttons: «فارسی» (RTL) and «English» (LTR)
- [ ] Implement Hacker Terminal UI: simulated prompt + real-time log streaming panel
- [ ] Implement `help` command + command parser

## Step 2: Desktop wrapper scaffold (Electron)
- [ ] Create Electron app shell in `desktop/` (or integrate into root)
- [ ] Configure Electron to load the Next.js dev/build output
- [ ] Implement local bridge: Electron main process spawns Go scanner binary
- [ ] Add IPC protocol: start scan / cancel scan / stream logs / stream results

## Step 3: Core upgrade (two-phase + categories + exports)
- [ ] Extend Go engine/UI flow to implement explicit 2-phase pipeline
- [ ] Add category mapping: Excellent/Good/Fair/Slow/Blocked
- [ ] Add export: clean IPs + V2Ray/VLESS/Trojan-compatible configs from terminal

## Step 4: ISP preset tiers + service selection
- [ ] Add preset tiers (MCI, Irancell, Mokhaberat) into a configurable structure
- [ ] Add service selection menu (Cloudflare/Vercel/EGI/etc) with numeric selection
- [ ] Ensure frontend can pass selected service/preset tier into Go core

## Step 5: Git auto-commit + push workflow
- [ ] Add `scripts/auto_commit_push.*` (windows+mac friendly)
- [ ] Stage, generate commit message, push to fork
- [ ] Create a small usage doc

## Step 6: Build & test
- [ ] Run `go test ./...`
- [ ] Run frontend build
- [ ] Package Electron for Windows .exe
- [ ] Smoke test: start scan -> logs -> results -> export

