import express from "express";
import { findLocation, Location } from "./osdatahub";
import { Collection, insertLocation, insertUser, QueryCollections, selectCollecions, selectUser } from "./db";
import { toUser, User } from "./user";
import cron from "node-cron"
import { addCollections } from "./scraper";

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
const port = 8080; // default port to listen

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
    user.id = await insertUser(user)
    delete user.password
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
    let user = await selectUser(userid)
    let collections = await selectCollecions({ uprn: user.uprn })
    // console.log(collections)
    res.send(collections);
  } catch (e) {
    // console.log(e)
    res.status(409).send({message: e.message})
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
