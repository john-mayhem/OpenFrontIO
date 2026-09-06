# OpenFront Fork — Progress

Fork of [openfrontio/OpenFrontIO](https://github.com/openfrontio/OpenFrontIO), running on a dedicated LAN VM for local dev/testing and eventual server-side modifications.

## Setup (2026-09-06)

- Forked to `github.com/john-mayhem/OpenFrontIO`. `origin` = fork, `upstream` = original repo.
- Running on VM "OpenFrontServer" (Hyper-V host: Federation), Ubuntu 24.04, hostname `openfront`.
- Dev server (`npm run dev:host`) runs in the background — client (Vite) on :9000, game server workers on :3000-3002. Logs at `~/dev.log`.
- nginx reverse-proxies `https://openfront.lan` → `127.0.0.1:9000` with TLS termination (cert issued by the local FEDERATION-CA, DNS record via Pi-hole). See the `project_federation_ca` memory for the full cert-issuance process if a cert needs renewing/reissuing.
- `vite.config.ts`: added `server.allowedHosts: ["openfront.lan"]` — required because Vite's dev server rejects unrecognized `Host` headers by default (DNS-rebinding guard), and the nginx proxy sends `Host: openfront.lan`.

## Fixes (2026-09-06)

- **Stack overflow at high city/player counts**: `Worker drain failed: RangeError: Maximum call stack size exceeded at addExecution`. Root cause: `GameRunner` spread execution arrays into `Game.addExecution`'s rest params (`addExecution(...bigArray)`) — V8 throws once a spread call gets into the ~100k-200k argument range, which `execManager.createExecs()` (every tick) and the init-time `nationExecutions()`/`spawnPlayers()`/`spawnTribes()` calls can hit on large maps. Fixed by adding `Game.addExecutions(execs: Execution[])`, which appends via a loop instead of spreading, and switching those four call sites to it. Single-execution call sites (the vast majority) are untouched. Commit `4f5d333`.

## Upstream PRs pulled in

- **[#5180](https://github.com/openfrontio/OpenFrontIO/pull/5180) — Map info button** (2026-09-06): hover "?" button on map cards showing map info + designer credits, sourced from new optional `info`/`designers` fields on the map manifest. Client-only.

## Next

- (add entries here as changes are made)
