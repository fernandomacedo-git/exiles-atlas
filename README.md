# Exiles Atlas

Offline-first second-screen companion for Conan Exiles.

## Current prototype

- Searchable, filterable POIs with local notes and discovery status
- Local browser persistence for personal progress
- Opt-in WebSocket bridge at `ws://127.0.0.1:7811/exiles-atlas`
- Explicit connecting, connected, disconnected, and error states
- Position data is cleared when the bridge disconnects; stale positions are clearly labeled
- Authorized bridge discovery messages mark matching POIs as seen

## Bridge messages

```json
{"type":"position","x":51.2,"y":63.1,"z":26.4}
{"type":"discovery","poiId":"iron-deposit"}
```

The bridge is a protocol boundary only; this project does not read game memory or include a Conan Exiles server mod. Discovery automation requires a separately authorized integration. Position status becomes stale after five seconds without updates.

## Development

```bash
npm install
npm run dev
npm test
```

Desktop shell:

```bash
npm run tauri dev
```

## Data and privacy

- No third-party map website is scraped.
- Dataset entries should include attribution and reuse permission.
- Live tracking is opt-in and connects only to a local service.
