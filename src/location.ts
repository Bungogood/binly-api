import { database as dbconfig } from "../config.json";
import { Client } from 'ts-postgres';

export interface Location {
	uprn: string
	building_name?: string
	street?: string
	area?: string
	city?: string
	postcode?: string
	authroity?: string
}

export const toLocation = ([uprn, building_name, street, area, city, postcode, authroity]: any[]) : Location => ({
  uprn: uprn,
  building_name: building_name,
  street: street,
  area: area === null ? undefined : area,
  city: city,
  postcode: postcode,
  authroity: authroity === null ? undefined : authroity
})

export const getLocation = async (uprn: string) : Promise<Location> => {
  const client = new Client(dbconfig);
  await client.connect();

  try {
    const result = await client.query(`
      SELECT uprn, building_name, street, area, city, postcode, authroity 
      FROM locations
      WHERE uprn = $1;
    `, [uprn]);
    return toLocation(result.rows.pop())
  } finally {
    await client.end();
  }
}

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
