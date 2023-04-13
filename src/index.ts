import { AmethystClient } from "amethystjs";
import { Partials } from "discord.js";
import { config } from 'dotenv';

config();

export const client = new AmethystClient({
    intents: ['Guilds'],
    partials: [Partials.Channel]
}, {
    token: process.env.token,
    commandsFolder: './dist/commands',
    eventsFolder: './dist/events',
    debug: true
});

client.start({});
