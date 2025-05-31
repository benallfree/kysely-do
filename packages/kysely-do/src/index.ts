import {
  CompiledQuery,
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
  type DatabaseConnection,
  type DatabaseIntrospector,
  type Dialect,
  type Driver,
  type QueryCompiler,
  type QueryResult,
} from 'kysely'

/**
 * Config for the D1 dialect. Pass your D1 instance to this object that you bound in `wrangler.toml`.
 */
export interface DODialectConfig {
  ctx: DurableObjectState
}

/**
 * DO dialect that adds support for [Cloudflare Durable Objects][0] in [Kysely][1].
 * The constructor takes the instance of your DO database that you bound in `wrangler.toml`.
 *
 * ```typescript
 * new DODialect({
 *   database: env.DB,
 * })
 * ```
 *
 * [0]: https://developers.cloudflare.com/durable-objects/
 * [1]: https://github.com/koskimas/kysely
 */
export class DODialect implements Dialect {
  #config: DODialectConfig

  constructor(config: DODialectConfig) {
    this.#config = config
  }

  createAdapter() {
    return new SqliteAdapter()
  }

  createDriver(): Driver {
    return new DODriver(this.#config)
  }

  createQueryCompiler(): QueryCompiler {
    return new SqliteQueryCompiler()
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new SqliteIntrospector(db)
  }
}

class DODriver implements Driver {
  #config: DODialectConfig

  constructor(config: DODialectConfig) {
    this.#config = config
  }

  async init(): Promise<void> {}

  async acquireConnection(): Promise<DatabaseConnection> {
    return new DOConnection(this.#config)
  }

  async beginTransaction(conn: DOConnection): Promise<void> {
    return await conn.beginTransaction()
  }

  async commitTransaction(conn: DOConnection): Promise<void> {
    return await conn.commitTransaction()
  }

  async rollbackTransaction(conn: DOConnection): Promise<void> {
    return await conn.rollbackTransaction()
  }

  async releaseConnection(_conn: DOConnection): Promise<void> {}

  async destroy(): Promise<void> {}
}

class DOConnection implements DatabaseConnection {
  #config: DODialectConfig
  //   #transactionClient?: DOConnection

  constructor(config: DODialectConfig) {
    this.#config = config
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    // Transactions are not supported yet.
    // if (this.#transactionClient) return this.#transactionClient.executeQuery(compiledQuery)

    const cursor = this.#config.ctx.storage.sql.exec(compiledQuery.sql, ...compiledQuery.parameters)

    // Convert cursor to array for results
    const rows = cursor.toArray() as O[]

    // Get the number of affected rows from the cursor
    const numAffectedRows = cursor.rowsWritten > 0 ? BigInt(cursor.rowsWritten) : undefined

    return {
      insertId: undefined, // Durable Objects doesn't provide last_row_id like D1
      rows: rows || [],
      numAffectedRows,
    }
  }

  async beginTransaction() {
    // this.#transactionClient = this.#transactionClient ?? new PlanetScaleConnection(this.#config)
    // this.#transactionClient.#conn.execute('BEGIN')
    throw new Error('Transactions are not supported yet.')
  }

  async commitTransaction() {
    // if (!this.#transactionClient) throw new Error('No transaction to commit')
    // this.#transactionClient.#conn.execute('COMMIT')
    // this.#transactionClient = undefined
    throw new Error('Transactions are not supported yet.')
  }

  async rollbackTransaction() {
    // if (!this.#transactionClient) throw new Error('No transaction to rollback')
    // this.#transactionClient.#conn.execute('ROLLBACK')
    // this.#transactionClient = undefined
    throw new Error('Transactions are not supported yet.')
  }

  async *streamQuery<O>(_compiledQuery: CompiledQuery, _chunkSize: number): AsyncIterableIterator<QueryResult<O>> {
    throw new Error('DO Driver does not support streaming')
  }
}
