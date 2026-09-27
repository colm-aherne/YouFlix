# Security Specification & Invariants

## 1. Data Invariants
- A profile, custom playlist, watch progress, or watchlist item must always be owned by the authenticated user (`userId == request.auth.uid`).
- Subcollections under `/users/{userId}/...` can only be read, created, updated, or deleted by the user matching `{userId}`.
- String fields are constrained by length limits to prevent resource exhaustion and denial of wallet attacks.
- Document IDs must match hardened character set and length constraints (`isValidId`).
- Modification of immutable fields like `userId` or `createdAt` on existing documents is prohibited.

## 2. The Dirty Dozen Payloads (Targeting PERMISSION_DENIED)
1. **Orphan / Cross-User Profile Write**: Unauthenticated or user B attempting to write to `/users/userA/profiles/prof1`.
2. **Identity Spoofing in Playlist**: User A attempting to create a playlist under `/users/userA/playlists/p1` with `userId: "userB"`.
3. **Ghost Field Injection in Watchlist**: Payload contains required fields + unauthorized ghost field `isAdmin: true` or `unauthorizedField: "hacked"`.
4. **Massive Payload Attack**: Document with 2MB title field to attempt wallet exhaustion.
5. **ID Poisoning Attack**: Attempting document ID with special characters or path traversal `../../admin`.
6. **Watch Progress Cross-Account Hijack**: User B writing their current playback state into User A's `watchProgress` collection.
7. **Immutable Field Modification**: Attempting to update `userId` or `createdAt` on an existing `CustomPlaylist`.
8. **Rating Spoofing**: User attempting to set `rating: "super_admin_vote"` outside allowed enum values.
9. **Blanket Collection Scrape**: Unauthenticated or cross-account query querying all `/users/{userId}/watchProgress` without matching auth UID.
10. **Public Playlist Hijack**: Non-owner attempting to modify or delete another user's custom playlist.
11. **Negative Duration/Time Attack**: Video progress containing invalid negative timestamps.
12. **Malformed Profile Creation**: Creating profile without required `name` or `avatar`.
