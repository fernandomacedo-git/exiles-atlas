[persistence]
- POI state and personal notes are stored locally in browser storage.
- Seed POI records include source metadata and can be replaced or extended by reviewed data packs.

[live bridge]
- Live position is opt-in and connects only to ws://127.0.0.1:7811/exiles-atlas.
- It accepts only finite position frames and marks stale data after 5 seconds.
- It does not read process memory or attempt to modify the game.

[data safety]
- No proprietary map website is scraped.
- External datasets require an explicit license or source attribution.
