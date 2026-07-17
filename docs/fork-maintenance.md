# Fork maintenance and deployment

This fork keeps `main` as the deployable branch. `origin` points to
`fulaoaz/new-api`, while `upstream` points to `QuantumNous/new-api`.

## Custom behavior

The fork adds authenticated `POST /v1/messages/count_tokens` support for
Claude Code clients. Token counting stays local and does not consume an
upstream model request. JSON-decoded Anthropic tool definitions are included
in the estimate.

## Sync upstream locally

```sh
git checkout main
git fetch upstream --prune
git merge upstream/main
go test ./controller ./dto
git push origin main
```

The merge preserves the fork commits and does not rewrite published history.
If Git reports a conflict, resolve it locally, rerun the focused tests, and
push only after the custom endpoint still passes.

The same sequence is available from GitHub Actions under **Sync upstream
main**. It runs automatically every six hours (at minute 17, UTC) and can also
be started manually. If the merge conflicts or the focused tests fail, the
workflow stops before pushing to `main`, so no image is published from a failed
sync.

## Image publication

Every push to fork `main` runs **Publish fork image to GHCR** and publishes:

```text
ghcr.io/fulaoaz/new-api:latest
ghcr.io/fulaoaz/new-api:sha-<short-commit>
```

Use the immutable `sha-<short-commit>` tag in production. The `latest` tag is
for update discovery and staging checks.

## Server update

```sh
cd /opt/new-api
docker compose pull new-api
docker compose up -d --no-deps new-api
docker inspect new-api --format '{{.Config.Image}} {{.State.Health.Status}}'
```

Before switching tags, retain the previous compose file and PostgreSQL dump.
After deployment, verify `/v1/models`, `/v1/responses`, `/v1/messages`, and
`/v1/messages/count_tokens` through the public domain.
