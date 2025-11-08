# Local Redis for Development

We now default the app to a Redis instance that runs on `redis://127.0.0.1:6379` so local development no longer hits the shared Upstash instance. You can spin up Redis in one of the following ways.

## Option 1 – Homebrew service

```bash
brew install redis
brew services start redis
# verify
redis-cli ping
```

> **Heads up:** `brew install` will fail if `/usr/local/Cellar` or `~/Library/Caches/Homebrew` are not writable (for example on a managed Mac). Fix the permissions first, e.g. `sudo chown -R $(whoami) /usr/local/Cellar ~/Library/Caches/Homebrew`.

Stop the service when you no longer need it:

```bash
brew services stop redis
```

## Option 2 – Docker Compose

If you prefer not to install Redis globally, use the included compose file:

```bash
docker compose up -d redis
docker compose logs -f redis   # optional: watch logs
docker compose down            # stop and remove the container
```

The compose file binds port `6379` and persists data inside the `redis-data` volume.

## Environment variables

- `.env` is now configured with `REDIS_URL="redis://127.0.0.1:6379"` and an empty `REDIS_TOKEN`, which is all you need locally.
- For production or shared staging environments, set `REDIS_URL`/`REDIS_TOKEN` via your hosting provider’s dashboard (e.g. Vercel). You can also keep a separate `.env.production` locally if you need to test with Upstash.

## Verifying from the app

After starting Redis, run the app as usual:

```bash
pnpm dev
```

Creating or joining rooms will stay entirely on the local Redis instance. If the API still reports “Room not found”, confirm that `redis-cli ping` returns `PONG` and that no other process is using port 6379.
