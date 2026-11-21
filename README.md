# Exiles Atlas

Offline-first second-screen companion for Conan Exiles.

## Windows MSI installer

Build the MSI installer locally with PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-windows-msi.ps1
```

Or:

```powershell
npm run build:windows-msi:ps
```

The installer package is written to `src-tauri/target/release/bundle/msi/`. Building Windows MSI packages requires Windows, Node.js, Rust, Cargo, and the Microsoft Visual C++ build tools.

## Current prototype

- Searchable, filterable POIs with local notes and discovery status
- Local browser persistence for personal progress
- Opt-in WebSocket bridge at `ws://127.0.0.1:7811/exiles-atlas`
- Explicit connecting, connected, disconnected, and error states
- Position data is cleared when the bridge disconnects; stale positions are clearly labeled
- Authorized bridge discovery messages mark matching POIs as seen
- User-configurable world-coordinate bounds place the live marker on the map
- Versioned JSON data-pack import validates coordinates and license metadata

## Bridge messages

```json
{"type":"position","x":51.2,"y":63.1,"z":26.4}
{"type":"discovery","poiId":"iron-deposit"}
```

The bridge is a protocol boundary only; this project does not read game memory or include a Conan Exiles server mod. Discovery automation requires a separately authorized integration. Position status becomes stale after five seconds without updates.

## Data-pack format

Import a `.json` file containing a version 1 object. Coordinates are map percentages (0–100); attribution and license are required. POI IDs must be unique within the pack. Updating an existing ID changes its map data but retains your local notes and discovery status. Imports are limited to 2 MB.

```json
{
  "version": 1,
  "title": "Example locations",
  "attribution": "Your name or source",
  "license": "CC BY 4.0",
  "pois": [
    { "id": "example-site", "name": "Example Site", "category": "Relic", "x": 42, "y": 58 }
  ]
}
```

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
- Imported data is validated locally and stored in browser local storage with personal progress.
