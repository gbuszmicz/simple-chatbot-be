[![GitHub Workflow Status](https://github.com/gbuszmicz/tz-chatbot-service/actions/workflows/ci.yml/badge.svg)](https://github.com/gbuszmicz/tz-chatbot-service/actions/workflows/ci.yml)

# Timezone Chatbot Service

An MVP of a chatbot service that could be called from an IRC channel. The input and output interfaces are both plain old strings. Currently, it accepts only two commands:

```javascript
!timeat America/Los_Angeles
```

`!timeat `, which returns the time at a specific timezone -LA in this case-. The format of the response is `9 Jun 2020 13:55`

```javascript
!timepopularity America/Los_Angeles
```

`!timepopularity `, the number of valid !timeat requests that have been received for timezones that start with `<tzinfo_or_prefix>`.
A “prefix” is defined as any characters before a / in a tzinfo string - in America/Chicago, America would be the prefix, while in America/Argentina/Buenos_Aires, America and America/Argentina would be the prefixes. A command of `!timepopularity America` would return the number of `!timeat` requests for anywhere in the Americas, and a command of `!timepopularity America/Argentina` would return the number of !timeat requests for anywhere in Argentina.
The format of the response is just a number, like `9`. In the case of IRC, it's also mentioning the user that made the request.

Currently, the chatbot service can be accessed through 3 different channels:

- http
- websockets
- IRC

As soon as the service is up and running, you can test it using one of the clients implementation at root level (`http://localhost:3000/`)

## Running the Service Locally

### Environment variables

The environment variables are listed and described in the `.env.sample ` file at
the root level of this project.

#### Setup Environment

1. Copy the .env.sample file to a file called .env.local

```bash
cp .env.sample .env.local
```

2. Fill the required variables using the descriptions provided

The .gitignore file purposely excludes your .env.local file. This is to
prevent secrets from entering the repository.

### Installing NPM Dependencies

Install the node dependencies using NPM

```bash
npm i
```

### Service Dependencies

The service only relies on a redis instance for storing the popularity.
The production environment is running an instance of [redis labs](https://redislabs.com/)

### Starting the Server

After setting up your environment, dependencies, and dependent services you're
ready to start the service. Start the service by running `npm start` from the root
level of the project. You should see a few log lines signifying the startup of
the service:

```bash
Environment development

 _____  _             _    _             _     _____                     _
/  __ \| |           | |  | |           | |   /  ___|                   (_)
| /  \/| |__    __ _ | |_ | |__    ___  | |_  \ `--.   ___  _ __ __   __ _   ___   ___
| |    | '_ \  / _` || __|| '_ \  / _ \ | __|  `--. \ / _ \| '__|\ \ / /| | / __| / _ \
| \__/\| | | || (_| || |_ | |_) || (_) || |_  /\__/ /|  __/| |    \ V / | || (__ |  __/
 \____/|_| |_| \__,_| \__||_.__/  \___/  \__| \____/  \___||_|     \_/  |_| \___| \___|


🚀  Server listening on port 3000
```

## Chatbot addresses

| Environment | Address                                   |
| ----------- | ----------------------------------------- |
| local       | http://localhost:3000                     |
| Production  | https://tz-chatbot-service.herokuapp.com/ |
