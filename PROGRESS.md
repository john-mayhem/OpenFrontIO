# OpenFront Fork — Progress

Fork of [openfrontio/OpenFrontIO](https://github.com/openfrontio/OpenFrontIO), running on a dedicated LAN VM for local dev/testing and eventual server-side modifications.

## Setup (2026-09-06)

- Forked to `github.com/john-mayhem/OpenFrontIO`. `origin` = fork, `upstream` = original repo.
- Running on VM "OpenFrontServer" (Hyper-V host: Federation), Ubuntu 24.04, hostname `openfront`.
- Dev server (`npm run dev:host`) runs in the background — client (Vite) on :9000, game server workers on :3000-3002. Logs at `~/dev.log`.
- nginx reverse-proxies `https://openfront.lan` → `127.0.0.1:9000` with TLS termination (cert issued by the local FEDERATION-CA, DNS record via Pi-hole). See the `project_federation_ca` memory for the full cert-issuance process if a cert needs renewing/reissuing.
- `vite.config.ts`: added `server.allowedHosts: ["openfront.lan"]` — required because Vite's dev server rejects unrecognized `Host` headers by default (DNS-rebinding guard), and the nginx proxy sends `Host: openfront.lan`.

## Next

- (add entries here as changes are made)
