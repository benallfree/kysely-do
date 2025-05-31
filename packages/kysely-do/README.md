# kysely-do

[![ci](https://github.com/benallfree/kysely-do/actions/workflows/ci.yaml/badge.svg)](https://github.com/benallfree/kysely-do/actions/workflows/ci.yaml)
[![npm](https://img.shields.io/npm/v/kysely-do.svg)](https://www.npmjs.com/package/kysely-do)

[Kysely](https://github.com/koskimas/kysely) adapter for [Cloudflare D1](https://developers.cloudflare.com/d1/).

```bash
npm i kysely-do
```

This project was largely adapted from [kysely-do](https://github.com/aidenwallis/kysely-do).

## Usage

Pass your D1 binding into the dialect in order to configure the Kysely client. Follow [these docs](https://developers.cloudflare.com/d1/get-started/#4-bind-your-worker-to-your-d1-database) for instructions on how to do so.

```typescript
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-do';

export interface Env {
  DB: D1Database;
}

interface KvTable {
  key: string;
  value: string;
}

interface Database {
  kv: KvTable;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) {
      return new Response('No key defined.', { status: 400 });
    }

    // Create Kysely instance with kysely-do
    const db = new Kysely<Database>({ dialect: new D1Dialect({ database: env.DB }) });
    
    // Read row from D1 table
    const result = await db.selectFrom('kv').selectAll().where('key', '=', key).executeTakeFirst();
    if (!result) {
      return new Response('No value found', { status: 404 });
    }

    return new Response(result.value);
  },
};
```

There is a working [example](example) also included, which implements a K/V style store using D1.
