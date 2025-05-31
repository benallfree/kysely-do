# example

An example Kysely project using [kysely-do](https://github.com/benallfree/kysely-do) and [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/).

## Setup

**First, ensure your `wrangler.jsonc` includes the Durable Object binding:**

```jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "name": "MY_AUTH_OBJECT",
        "class_name": "MyAuthObject",
      },
    ],
  },
}
```

**Then, run the setup script:**

```bash
npm run setup
```

## Running locally

After setup, run the project locally:

```bash
npm run start
```
