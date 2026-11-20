# Exiles Atlas

Offline-first second-screen companion for Conan Exiles.

## Current prototype

- Searchable and filterable POI list
- Discovery states: new, seen, collected
- Personal notes and status persistence in local browser storage
- Source-attribution field for future reviewed data packs
- Opt-in local WebSocket position bridge
- Stale-position and connection-error states

## Live integration

The app intentionally does not read Conan Exiles process memory. The current bridge protocol is a local WebSocket service at:

```text
ws://127.0.0.1:7811/exiles-atlas
```

Supported position message:

```json
{"type":"position","x":51.2,"y":63.1,"z":26.4}
```

Automatic discovery may later consume `type: "discovery"` messages, but only from an authorized server/mod integration.

## Development

```bash
npm install
npm run dev
```

For the desktop shell:

```bash
npm run tauri dev
```

## Boundaries

- No scraping of third-party map sites without permission.
- No memory reading or client modification.
- Live position is opt-in and local-only.
