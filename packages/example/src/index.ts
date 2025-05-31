/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { DurableObject } from 'cloudflare:workers'
import { Hono } from 'hono'
import { Kysely } from 'kysely'
import { DODialect } from 'kysely-do'

export class MyAuthObject extends DurableObject<Env> {
  private db: Kysely<Database>

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.db = new Kysely<Database>({
      dialect: new DODialect({ ctx }),
    })
    this.initializeDatabase()
  }

  private async initializeDatabase() {
    // Create KV table if it doesn't exist
    await this.db.schema
      .createTable('kv')
      .ifNotExists()
      .addColumn('key', 'varchar(255)', col => col.primaryKey())
      .addColumn('value', 'text', col => col.notNull())
      .execute()
  }

  async get(key: string): Promise<string | null> {
    const result = await this.db.selectFrom('kv').selectAll().where('key', '=', key).executeTakeFirst()

    return result?.value || null
  }

  async set(key: string, value: string): Promise<string> {
    await this.db
      .insertInto('kv')
      .values([{ key, value }])
      .onConflict(oc => oc.column('key').doUpdateSet({ value }))
      .execute()

    return value
  }

  async delete(key: string): Promise<void> {
    await this.db.deleteFrom('kv').where('key', '=', key).execute()
  }
}

interface KvTable {
  key: string
  value: string
}

interface Database {
  kv: KvTable
}

const app = new Hono<{ Bindings: Env }>()

app.get('/', async c => {
  const action = c.req.query('action')
  const key = c.req.query('key')
  const value = c.req.query('value')

  // Get the durable object instance
  const id = c.env.MY_AUTH_OBJECT.idFromName('auth')
  const authObject = c.env.MY_AUTH_OBJECT.get(id)

  switch (action) {
    case 'get': {
      if (!key) {
        return c.text('Key is not defined.', 400)
      }
      const result = await authObject.get(key)
      if (!result) {
        return c.text('', 404)
      }
      return c.text(result)
    }

    case 'set': {
      if (!(key && value)) {
        return c.text('Key and value must be defined.', 400)
      }
      try {
        const result = await authObject.set(key, value)
        return c.text(result, 200)
      } catch (err) {
        console.log(err)
        console.log((err as any).cause)
        throw err
      }
    }

    case 'delete': {
      if (!key) {
        return c.text('Key is not defined.', 400)
      }
      await authObject.delete(key)
      return c.text('', 200)
    }
  }

  return c.text('Action must be get/set/delete', 400)
})

export default app
