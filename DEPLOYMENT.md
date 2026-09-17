# Cloud reliability release

This branch includes frontend changes and versioned Edge Functions. A commit or branch push does not deploy the backend.

## Release order

1. Run `npm ci`, `npx playwright install chromium`, and `npm test`.
2. Execute `supabase/sql/cloud_reliability.sql` in the intended project. The new unread-count RPC is accessible only to `service_role`.
3. Set the `REMINDER_CRON_SECRET` Edge Function secret to match the existing cron caller. Never commit its value. Empty configuration denies dispatch. Rotate the cron caller and secret together if changing the value.
4. Deploy both functions from `supabase/functions`, retaining their existing `verify_jwt=false`. Device-token and cron-secret authentication are implemented in the handlers.
5. Before merging to main, change GitHub Settings → Pages → Source to **GitHub Actions**. Otherwise the old branch-based deployment can still bypass tests. The new deploy job depends on the entire test job.
6. Merge the tested frontend to main. Only public frontend files are uploaded; backend sources, dependencies and tests are excluded.

## Behavior

- One scheduler polls sync and social_sync. Concurrent reads share the same request, have timeouts, and recover after errors. UI and push startup are independent.
- Movie/thanks writes use a durable device-scoped outbox. Pending changes survive stale reads and reloads. Ambiguous writes are not blindly replayed. Automatic create retries require the new server's idempotent-create capability; old servers remain compatible.
- Other mutations are sent once. Failed forms retain input.
- Content changes and deletion require authorship; both partners may still change wishlist/idea completion. Generic family endpoints reject reminder edits/deletion.
- Reminder claims compare the prior JSON value atomically. Concurrent dispatches cannot claim the same snapshot; failed deliveries release only their own unchanged claim. This is not exactly-once delivery: claims expire after five minutes so process death does not permanently suppress a reminder, but a crash after actual delivery and partial success across devices still require a future per-device delivery ledger.
- No test-name exclusions remain. Redundant tests for removed legacy forms are covered by the existing v2 CRUD tests. Social and stability tests target visible v2 cards.
- Native innerHTML and Storage prototypes are no longer patched. Scoped decorative observers remain.

## Rollback

The RPC is additive. Previous frontend/function versions can be restored without deleting data. Do not clear `us_cloud_outbox_v1`: it can hold unconfirmed local saves. Let pending creates reconcile before reverting backend capabilities.
