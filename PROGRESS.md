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

## Balance tweaks (2026-09-06)

- **Trade ship spawn throttle midpoint raised 400 → 10,000**: `Config.tradeShipSpawnRate`'s spawn-probability sigmoid is keyed on the *global* trade ship count (all players/bots), not per-port. At the upstream midpoint of 400, a large stacked-port setup (400+ ports, level 1000+) sat in the suppressed tail and building/leveling further had no visible effect — the pity-timer's guaranteed-spawn threshold grows exponentially with ship count while a port's rolls-per-check only grows linearly with level. Same curve shape, recentered at 10,000. Ship count is a global stat (`GameImpl.unitCount()`), so this affects the whole map, not just one player. Commit `4fb3b3a`.
  - No hard caps on trade ships or warships exist anywhere in the codebase (warship cost instead scales to a flat 1M gold/ship past your 3rd). Transport ships (invasion boats) *do* have a real hard cap: `Config.boatMaxNumber()` = 3 concurrent per player, untouched so far.
  - All ship types (trade/transport/warship) move at the same fixed speed: 1 map tile per 100ms tick. No per-type speed differences exist in the sim.

## Upstream PRs pulled in

- **[#5180](https://github.com/openfrontio/OpenFrontIO/pull/5180) — Map info button** (2026-09-06): hover "?" button on map cards showing map info + designer credits, sourced from new optional `info`/`designers` fields on the map manifest. Client-only.
- **[#5264](https://github.com/openfrontio/OpenFrontIO/pull/5264) — Train income scales with structure levels** (2026-09-06): city/station side `1.0 + 0.4*log2(level)` (unbounded), factory side same formula (**fork tweak** — upstream capped factories at 1.25x/~level 50; raised here to uncapped log2 since this fork has no multiplayer balance to protect and the playstyle here pushes factory levels well past 50). Both use `DetMath`'s deterministic `pow`/`log`, not raw `Math.*`, so no desync risk. Also fixed 6 pre-existing `NationStructureBehavior.test.ts` failures (stale mocks missing `level()`/`stationStackMultiplier()`). To retune further, edit the `0.4` coefficient (or the formula shape) in `Config.ts`'s `factoryStackMultiplier`/`stationStackMultiplier`.

## Next

- (add entries here as changes are made)
