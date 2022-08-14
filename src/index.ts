import express from "express";
import { findLocation, Location } from "./osdatahub";
import { Collection, getLocation, insertLocation, insertUser, selectCollecions, selectLocations, selectUser } from "./db";
import { toUser, User } from "./user";
import cron from "node-cron"
import { scrape, scraper } from "./scraper";

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
  } catch (e) {
    console.log("WARN: location already exsists")
  }

  try {
    user.id = await insertUser(user)
    console.log(user)
    res.send(user);
  } catch (e) {
    // console.log(e)
    res.status(409).send({message: e.message})
  }
});

app.get('/api/collections', async ( req, res ) => {
  let { uprn } = req.query as { uprn: string };
  // no checking uprn exsists
  try {
    let collections : Collection[] = await selectCollecions(uprn)
    console.log(collections)
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
    let collections = await selectCollecions(user.uprn)
    console.log(collections)
    res.send(collections);
  } catch (e) {
    // console.log(e)
    res.status(409).send({message: e.message})
  }
});

app.get('/api/sync', async ( req, res ) => {
  let { authority, uprn } = req.query as { authority?: string, uprn?: string };

  if (uprn) {
    try {
      let location = await getLocation(uprn)
      scraper(location)
      res.send(location); 
    } catch (e) {
      // console.log(e)
      res.status(200).send({message: e.message})
    }
  } else {
    try {
      let locations = await selectLocations(authority)
      scrape(locations)
      res.send(locations);
    } catch (e) {
      // console.log(e)
      res.status(409).send({message: e.message})
    }
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
