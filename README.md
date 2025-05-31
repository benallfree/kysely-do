# kysely-do

[![ci](https://github.com/benallfree/kysely-do/actions/workflows/ci.yaml/badge.svg)](https://github.com/benallfree/kysely-do/actions/workflows/ci.yaml)
[![npm](https://img.shields.io/npm/v/kysely-do.svg)](https://www.npmjs.com/package/kysely-do)

[Kysely](https://github.com/koskimas/kysely) adapter for [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/).

```bash
npm i kysely-do
```

This project provides a Kysely dialect for Cloudflare Durable Objects, enabling you to use SQL queries with Durable Object storage.

## Usage

### Creating a Durable Object with Kysely

To use kysely-do, you need to create a Durable Object class that initializes a Kysely instance with the `DODialect`. Here's a basic example:

```typescript
import { DurableObject } from 'cloudflare:workers'
import { Kysely } from 'kysely'
import { DODialect } from 'kysely-do'

export interface Env {
  MY_OBJECT: DurableObjectNamespace<MyObject>
}

export class MyObject extends DurableObject<Env> {
  private db: Kysely<Database>

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)

    // Create Kysely instance with DODialect
    this.db = new Kysely<Database>({
      dialect: new DODialect({ ctx }),
    })
  }
}
```

### Configuration

You'll need to configure your Durable Object binding in your `wrangler.jsonc`:

```jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "name": "MY_OBJECT",
        "class_name": "MyObject",
      },
    ],
  },
}
```
