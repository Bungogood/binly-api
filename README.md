# Binly API

[http://binly.co.uk](binly.co.uk) is a web app that allows a users to check thier bins.
Created using typescript express api which interfaces with a postgres database.

## Packages

- axios
- express
- ts-node
- ts-postgres
- typescript

## Config

create a `config.json` file using this template `template.config.json`:
```json
{
  "port": 8080,
  "database": {
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "postgres",
    "database": "binly"
  },
  "osdatahub": {
    "apiKey": "<your-api-key>"
  }
}
```

## Supported Councils

- Glasgow City Council

## Referenes

- https://osdatahub.os.uk
- https://api.os.uk

