import { database as dbconfig } from "../config.json";
import { Client } from 'ts-postgres';
import { Signup } from './index';
import { Location } from "./osdatahub";

export type uuid = string;

export interface User {
	id?: uuid
	username: string
	email?: string
}

export const toUser = (signup: Signup) : User => {
  return {
    username: signup.username,
    email: signup.email
  }
}
export const getUser = async (userid: uuid) : Promise<User> => {
  const client = new Client(dbconfig);
  await client.connect();
  
  try {
    const selectQuery : string = 'SELECT id, username, email FROM users WHERE id = $1;'
    const results = await client.query(selectQuery, [userid]);
    let toUser = (res: any[]) : User => ({id: res[0], username: res[1], email: res[2]})
    return toUser(results.rows[0])
  } finally {
    await client.end();
  }
}

export const insertUser = async (user: User, password: string) : Promise<uuid> => {
  const client = new Client(dbconfig);
  await client.connect();

  try {
    const insertQuery : string = 'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id;'
    const result = await client.query(insertQuery, [user.username, password, user.email]);
    return <uuid>result.rows[0][0]
  } finally {
      await client.end();
  }
}

export const addAddress = async (user: User, loc: Location) => {
  const client = new Client(dbconfig);
  await client.connect();
  
  try {
    await client.query(`
      INSERT INTO addresses (userid, uprn)
      VALUES ($1, $2);
    `, [user.id, loc.uprn]);
  } finally {
      await client.end();
  }
}

export const removeAddress = async (user: User, loc: Location) => {
  const client = new Client(dbconfig);
  await client.connect();
  // worry about default address issues
  try {
    await client.query(`
      DELETE FROM addresses
      WHERE userid = $1 AND uprn = $2;
    `, [user.id, loc.uprn]);
  } finally {
      await client.end();
  }
}

export const setDefaultAddress = async (user: User, loc: Location) => {
  const client = new Client(dbconfig);
  await client.connect();

  try {
    await client.query(`
      UPDATE users
      SET default_address = (
        SELECT id 
        FROM addresses 
        WHERE userid = $1 AND uprn = $2
      )
      WHERE id = $3;
    `, [user.id, loc.uprn, user.id]);
  } finally {
      await client.end();
  }
}

const toLocation = ([uprn, building_name, street, area, city, postcode, authroity]: any[]) : Location => ({
  uprn: uprn,
  building_name: building_name,
  street: street,
  area: area === null ? undefined : area,
  city: city,
  postcode: postcode,
  authroity: authroity === null ? undefined : authroity
})

export const getDefaultAddress = async (user: User) : Promise<Location> => {
  const client = new Client(dbconfig);
  await client.connect();
  
  try {
    const result = await client.query(`
      SELECT uprn, building_name, street, area, city, postcode, authroity
      FROM locations
      WHERE uprn = (
        SELECT addresses.uprn 
        FROM addresses INNER JOIN users ON addresses.id = users.default_address
        WHERE addresses.userid = $1
      );
    `, [user.id]);
    return toLocation(result.rows.pop())
  } finally {
      await client.end();
  }
}

export const getAddresses = async (user: User) : Promise<Location[]> => {
  const client = new Client(dbconfig);
  await client.connect();
  
  try {
    const result = await client.query(`
      SELECT locations.uprn, building_name, street, area, city, postcode, authroity
      FROM locations INNER JOIN addresses ON addresses.uprn = locations.uprn 
      WHERE addresses.userid = $1;
    `, [user.id]);
    return result.rows.map(toLocation);
  } finally {
      await client.end();
  }
}

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
