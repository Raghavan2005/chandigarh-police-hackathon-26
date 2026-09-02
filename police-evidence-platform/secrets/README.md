# secrets/

Local-only, git-ignored (`/secrets/` in `.gitignore`). Never commit anything
in this directory.

## `gcp-vision-service-account.json`

A GCP service-account key for `pramana-vision-search@tiq-world.iam.gserviceaccount.com`,
used only by `src/lib/reverse-image-search.ts` (Cloud Vision Web Detection —
real reverse-image search). No IAM role beyond the default is granted to
this service account, per least privilege; Vision API's `images:annotate`
endpoint authorizes on valid credentials + an API-enabled, billing-enabled
project, not resource-level IAM.

To set up on a new machine:

1. Get the JSON key file from whoever created the service account (it is
   never committed — ask the team, don't regenerate a second key unless
   the original is lost).
2. Place it here as `gcp-vision-service-account.json`.
3. Set `GOOGLE_APPLICATION_CREDENTIALS="./secrets/gcp-vision-service-account.json"`
   in `police-evidence-platform/.env`.

Without this, reverse-image search honestly reports itself unavailable
(`501`) instead of failing — every other feature in this build works fully
offline without it.
