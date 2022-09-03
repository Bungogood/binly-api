import { Client } from 'ts-postgres';
import { database as dbconfig } from "../config.json";
// import color from 'color-convert'
// "#"+color.keyword.hex("brown")

export const insertCollection = async (collection: Collection) => {
  await insertCollections([collection])
}

export const insertCollections = async (collections: Collection[]) => {
  const client = new Client(dbconfig);
  await client.connect();
  try {
    for (const collection of collections) {
      const insertQuery : string = 'INSERT INTO collections (uprn, binid, date) VALUES ($1, (SELECT id AS binid FROM bins WHERE color = $2), $3);'
      await client.query(insertQuery, [collection.uprn, collection.color, collection.date]);
    }
  } catch(e) {
    console.error("ERROR:", (<Error>e).message); // conversion to Error type
    throw e;
  } finally {
      await client.end();
  }
}

export interface Collection {
    uprn: string
    color: string
    rgb?: string
    purpose?: string
    authority?: string
    date: Date
}

export interface QueryCollections {
  uprn: string,
  until?: Date,
  from?: Date
}

export const selectCollecions = async (query: QueryCollections) : Promise<Collection[]> => {
  const client = new Client(dbconfig);
  await client.connect();
  
  try {
    let results;
    if (query.from) {
      if (query.until) {
        const selectQuery : string = 'SELECT color, rgb, purpose, date FROM collections INNER JOIN bins ON bins.id = collections.binid WHERE uprn = $1 AND date > $2 AND date < $3 ORDER BY date ASC;'
        results = await client.query(selectQuery, [query.uprn, query.from, query.until]);
      } else {
        const selectQuery : string = 'SELECT color, rgb, purpose, date FROM collections INNER JOIN bins ON bins.id = collections.binid WHERE uprn = $1 AND date > $2 ORDER BY date ASC;'
        results = await client.query(selectQuery, [query.uprn, query.from]);
      }
    } else {
      const selectQuery : string = 'SELECT color, rgb, purpose, date FROM collections INNER JOIN bins ON bins.id = collections.binid WHERE uprn = $1 ORDER BY date ASC;'
      results = await client.query(selectQuery, [query.uprn]);
    }
    let toCollection = ([ color, rgb, purpose, date ]: any[]) : Collection => ({ uprn: query.uprn, color: color, rgb: rgb, purpose: purpose, date: date })
    return results.rows.map(toCollection)
  } catch(e) {
    console.error("ERROR:", (<Error>e).message); //conversion to Error type
    throw e;
  } finally {
    await client.end();
  }
}
