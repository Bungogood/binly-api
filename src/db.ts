import { Client } from 'ts-postgres';
import { Location } from "./osdatahub"
import { User, uuid } from './user';
import { database as dbconfig } from "../config.json";

export const insertLocation = async (loc: Location) => {
  const client = new Client(dbconfig);
  await client.connect();
  
  try {
    const insertQuery : string = 'INSERT INTO locations (uprn, building_name, street, area, city, postcode, authroity) VALUES ($1, $2, $3, $4, $5, $6, $7);'
    await client.query(insertQuery, [loc.uprn, loc.building_name, loc.street, loc.area || null, loc.city, loc.postcode, loc.authroity || null]);
  } catch(e) {
    console.error("ERROR:", (<Error>e).message); // conversion to Error type
    throw e;
  } finally {
      await client.end();
  }
}

export const insertUser = async (user: User) : Promise<uuid> => {
  const client = new Client(dbconfig);
  await client.connect();

  try {
    const insertQuery : string = 'INSERT INTO users (username, password, email, uprn) VALUES ($1, $2, $3, $4) RETURNING id;'
    const result = await client.query(insertQuery, [user.username, user.password, user.email, user.uprn]);
    return <uuid>result.rows[0][0]
  } catch(e) {
    console.error("ERROR:", (<Error>e).message); // conversion to Error type
    throw e;
  } finally {
      await client.end();
  }
}

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
        const selectQuery : string = 'SELECT color, purpose, date FROM collections INNER JOIN bins ON bins.id = collections.binid WHERE uprn = $1 AND date > $2 AND date < $3 ORDER BY date ASC;'
        results = await client.query(selectQuery, [query.uprn, query.from, query.until]);
      } else {
        const selectQuery : string = 'SELECT color, purpose, date FROM collections INNER JOIN bins ON bins.id = collections.binid WHERE uprn = $1 AND date > $2 ORDER BY date ASC;'
        results = await client.query(selectQuery, [query.uprn, query.from]);
      }
    } else {
      const selectQuery : string = 'SELECT color, purpose, date FROM collections INNER JOIN bins ON bins.id = collections.binid WHERE uprn = $1 ORDER BY date ASC;'
      results = await client.query(selectQuery, [query.uprn]);
    }
    let toCollection = (res: any[]) : Collection => ({ uprn: query.uprn, color: res[0], purpose: res[1], date: res[2] })
    return results.rows.map(toCollection)
  } catch(e) {
    console.error("ERROR:", (<Error>e).message); //conversion to Error type
    throw e;
  } finally {
    await client.end();
  }
}

export const selectUser = async (userid: uuid) : Promise<User> => {
  const client = new Client(dbconfig);
  await client.connect();
  
  try {
    const selectQuery : string = 'SELECT id, username, uprn FROM users WHERE id = $1;'
    const results = await client.query(selectQuery, [userid]);
    let toUser = (res: any[]) : User => ({id: res[0], username: res[1], uprn: res[2]})
    return toUser(results.rows[0])
  } catch(e) {
    console.error("ERROR:", (<Error>e).message); //conversion to Error type
    throw e;
  } finally {
    await client.end();
  }
}

export const selectLocations = async (authroity: string) : Promise<Location[]> => {
  const client = new Client(dbconfig);
  await client.connect();

  try {
    const selectQuery : string = 'SELECT uprn, building_name, street, area, city, postcode, authroity FROM locations WHERE authroity = $1;'
    const results = await client.query(selectQuery, [authroity]);
    let toLocation = (res: any[]) : Location => ({
      uprn: res[0],
      building_name: res[1], 
      street: res[2], 
      area: res[3], 
      city: res[4], 
      postcode: res[5], 
      authroity: res[6]
    })
    return results.rows.map(toLocation)
  } catch(e) {
    console.error("ERROR:", (<Error>e).message); //conversion to Error type
    throw e;
  } finally {
    await client.end();
  }
}

export const getLocation = async (uprn: string) : Promise<Location> => {
  const client = new Client(dbconfig);
  await client.connect();

  try {
    const selectQuery : string = 'SELECT uprn, building_name, street, area, city, postcode, authroity FROM locations WHERE uprn = $1;'
    const result = await client.query(selectQuery, [uprn]);
    let toLocation = (res: any[]) : Location => ({
      uprn: res[0],
      building_name: res[1], 
      street: res[2], 
      area: res[3], 
      city: res[4], 
      postcode: res[5], 
      authroity: res[6]
    })
    return toLocation(result.rows[0])
  } catch(e) {
    console.error("ERROR:", (<Error>e).message); //conversion to Error type
    throw e;
  } finally {
    await client.end();
  }
}