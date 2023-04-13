
# Pronote-notifications

This is the source code of a bot that makes notifications inside Discord for pronote, the french application for students.

The bot is written in Typescript and displayed in french with a MySQL database.

It uses the [Amethyst JS framework](https://npmjs.org/package/amethystjs)

## Features

The bot notificates when :

* There is a new grade
* There is a canceled/replaced class
* Theorically on a new message
* On a new homework within a period of 28 days

## Usage

First clone the project ( `git clone https://github.com/Greensky-gs/pronote-notifications` )

Then install the dependencies ( `yarn install` or `npm install` )

⚠️ Don't forget to enable your database

Create a `.env` file, like the [`.env.example`](./.env.example)

Build the project ( `yarn build` )

Start the bot ( `yarn start` )

## Starting

When the bot starts for the first time, you will receive a lot of notifications. This is because the bot fetches already existing items to cache them.
