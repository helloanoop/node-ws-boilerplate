'use strict';

import knex from 'knex';
import HashMap from 'hashmap';

let map = new HashMap();

/**
 * The Knex class
 *
 * @class       Request
 * @summary     The Request Class
 * @description Once a database connection is instantiated, it caches
                the connection
 * @author      Anoop M D <anoop.md@sinilabs.co.in>
 */
class Knex {
  constructor(dbConfig) {
    let key = this.getKey(dbConfig);

    if(map.has(key)) {
      return map.get(key);
    }

    let connection = knex({
      client: 'mysql',
      connection: dbConfig,
      pool: {
        min: 0,
        max: 1000
      }
    });

    map.set(key, connection);

    return connection;
  }

  getKey(dbConfig) {
    return JSON.stringify(dbConfig);
  }

  getConnection(dbConfig) {
    return map.get(this.getKey(dbConfig));
  }

  destroyConnection(dbConfig) {
    let key = this.getKey(dbConfig);
    let connection = map.get(key);
    connection.destroy();
    map.delete(key);
  }

  mockConnection(dbConfig, mockKnex) {
    let connection = map.get(this.getKey(dbConfig));
    mockKnex.mock(connection, 'knex@0.12');
  }

  unmockConnection(dbConfig, mockKnex) {
    let connection = map.get(this.getKey(dbConfig));
    mockKnex.unmock(connection);
  }
}

export default Knex;
