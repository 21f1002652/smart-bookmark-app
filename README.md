# Bookmark App – README

## Project Overview

This is a simple bookmark management application built using Next.js and Supabase.
Users can add, view, and delete bookmarks. Each user only sees their own data.

---

## Problems Faced

### 1. Delete Not Updating in Real Time

When deleting a bookmark, the item was removed from the database but not from the UI unless the page was refreshed.

### Cause

Realtime DELETE events were not sending old row data from PostgreSQL.

### Solution

Set the table replica identity to FULL using:

```sql
ALTER TABLE public.bookmarks REPLICA IDENTITY FULL;
```

Then handled realtime events properly using `payload.old` for DELETE.

---

### 2. Realtime Payload Undefined Error

Console showed error:
`Cannot read properties of undefined (reading 'payload')`

### Cause

The realtime callback was assuming payload always exists.

### Solution

Added safe checks inside the subscription callback:

```ts
if (!payload) return;
```

Handled INSERT, UPDATE, DELETE separately.

-------

## What I Learned

* How Supabase Realtime works with PostgreSQL replication
* Importance of Replica Identity for DELETE events
* Proper state management in React with realtime data
* Debugging production build errors from console stack traces
