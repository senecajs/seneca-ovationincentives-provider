# Changes

## 0.4.0 2026-11-21

First entry of this change log. Earlier versions are on npm and in the git
history.

* Seneca 4: the peer dependency is `seneca` `^4.0.0` (was `>=3`). Seneca 3
  users stay on `@seneca/ovationincentives-provider@0.3`.
* The entity peer is `@seneca/entity` `^29.0.0` instead of `seneca-entity`.
  The other peers are `@seneca/provider` `^5.0.0` and `@seneca/env` `^0.6.0`,
  which is now optional: the plugin itself does not use it.
* The `seneca-promisify` peer dependency is removed. Seneca 4 has promises
  built in; do not call `use('promisify')` (D4).
* Node.js 24 or later (`engines.node` `>=24`, was `>=14`).
* The `retry.config` option passes any `fetch-retry` setting through again,
  such as `retries`. Seneca 4 closes plain-object option defaults, so it
  accepted only `retryDelay`.
* Tests load plugins by full name (`@seneca/entity`, `@seneca/env`,
  `@seneca/provider`) and set dummy `OVATION_CLIENT` and `OVATION_SECRET`
  values when these are not set. A new test creates a code against a local
  mock of the Ovation API and covers the access token refresh. Live calls
  were not tested on Seneca 4.
* devDependencies: `seneca` `^4.0.0`, `@seneca/entity` `^29.0.0`,
  `@seneca/env` `^0.6.0`, `@seneca/provider` `^5.0.0`, `seneca-msg-test`
  `^5.0.0`, `@seneca/doc` `^9.0.0` and `@types/node` `^24`.
* README: Seneca 4 install line and a code example, with plugins loaded by
  full name.
* `repository.url` uses `git+https`, `publishConfig` sets public access, and
  the package includes `CHANGES.md`.
