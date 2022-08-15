import express from "express";
import { findLocation, Location } from "./osdatahub";
import { Collection, insertLocation, QueryCollections, selectCollecions } from "./db";
import { getUser, addAddress, getAddresses, getDefaultAddress, getLocation, insertUser, setDefaultAddress, toUser, User } from "./user";
import cron from "node-cron"
import { addCollections } from "./scraper";
import { port } from "../config.json";

export interface Signup {
  username: string
  password: string
  email: string
  building_name: string
  street: string
  city: string
  postcode: string
}

const app = express();
app.use(express.json());

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
  res.send( "Hello world!" );
});

app.get( "/api/signin", ( req, res ) => {
  res.send( "work in!" );
});

app.post('/api/signup', async ( req, res ) => {
  let signup : Signup = req.body;
  let loc : Location = await findLocation(`${signup.building_name}, ${signup.street}, ${signup.city}, ${signup.postcode}`);
  let user : User = toUser(signup, loc.uprn);
  
  try {
    await insertLocation(loc)
    addCollections(loc)
  } catch (e) {
    console.log("WARN: location already exsists")
  }

  try {
    user.id = await insertUser(user, signup.password)
    addAddress(user, loc).then(() => setDefaultAddress(user, loc))
    console.log(user)
    res.send(user)
  } catch (e) {
    // console.log(e)
    res.status(409).send({message: e.message})
  }
});

app.get('/api/collections', async ( req, res ) => {
  let query = req.query as unknown as QueryCollections;
  if (query.from) query.from = new Date(query.from)
  if (query.until) query.until = new Date(query.until)
  // no checking uprn exsists
  try {
    let collections : Collection[] = await selectCollecions(query)
    res.send(collections);
  } catch (e) {
    // console.log(e)
    res.status(409).send({message: e.message})
  }
});

app.get('/api/user/collections', async ( req, res ) => {
  let { userid } = req.query as { userid: string };
  // no checking userid exsists
  try {
    let user = await getUser(userid)
    let loc = await getDefaultAddress(user)
    let collections = await selectCollecions(loc)
    // console.log(collections)
    res.send(collections);
  } catch (e) {
    // console.log(e)
    res.status(409).send({message: e.message})
  }
});

app.get('/api/user/addresses', async ( req, res ) => {
  let { userid } = req.query as { userid: string };
  // no checking userid exsists
  try { 
    let user = await getUser(userid)
    let locs = await getAddresses(user)
    res.send(locs);
  } catch (e) {
    console.error(e.message)
    res.status(400).send({message: e.message})
  }
});

app.get('/api/user/default-address', async ( req, res ) => {
  let { userid } = req.query as { userid: string };
  // no checking userid exsists
  try { 
    let user = await getUser(userid)
    let loc = await getDefaultAddress(user)
    // console.log(collections)
    res.send(loc);
  } catch (e) {
    console.error(e.message)
    res.status(409).send({message: e.message})
  }
});

app.put('/api/user/default-address', async ( req, res ) => {
  let { userid, uprn } = req.body as { userid: string, uprn: string };
  // no checking userid exsists
  try {
    let user = await getUser(userid);
    let loc = await getLocation(uprn);
    await setDefaultAddress(user, loc);
    res.send();
  } catch (e) {
    console.error(e.message)
    res.status(400).send({message: e.message})
  }
});

// start the Express server
app.listen( port, () => {
  console.log(`server started at http://localhost:${port}`);
} );

/*
cron.schedule('* * * * *', () => {
  console.log('running a task every minute');
});
 */
