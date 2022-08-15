import express from "express";
import { Collection, QueryCollections, selectCollecions } from "./db";
import { getUser, getAddresses, getDefaultAddress, setDefaultAddress, signup, Signup } from "./user";
import cron from "node-cron"
import { sync } from "./scraper";
import { port } from "../config.json";
import { getLocation } from "./location";

const app = express();
app.use(express.json());

app.get( "/api/signin", ( req, res ) => {
  res.send( "work in!" );
});

app.post('/api/signup', async ( req, res ) => {
  const newSignup : Signup = req.body;
  try {
    let user = await signup(newSignup)
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

app.patch('/api/sync', async ( req, res ) => {
  let { uprn } = req.query as { uprn: string, year?: string };
  try {
    await sync(uprn)
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
