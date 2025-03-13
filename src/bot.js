import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import axios from 'axios';

const TOKEN = process.env.BOT_TOKEN;
const CODEWARS_USERNAME = process.env.CODEWARS_USERNAME;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID; // Make sure to define this in your .env

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ]
});

let lastCompleted = null;

async function checkCodeWars() {
    try {
        const response = await axios.get(`https://www.codewars.com/api/v1/users/${CODEWARS_USERNAME}/code-challenges/completed`);
        const data = response.data;

        if (data.data.length > 0) {
            const latestChallenge = data.data[0].name;
            console.log(`Latest challenge: ${latestChallenge}`);

            if (latestChallenge !== lastCompleted) {
                lastCompleted = latestChallenge;

                const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
                if (channel) {
                    console.log(`✅ Found channel: ${channel.name}`);
                    channel.send(`${CODEWARS_USERNAME} just completed a CodeWars challenge: **${latestChallenge}**! ✅`);
                } else {
                    console.log(`❌ Error: Could not find channel with ID ${DISCORD_CHANNEL_ID}`);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching CodeWars data:", error.message);
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Check if the bot can access the channel
    const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
    if (channel) {
        console.log(`✅ Found channel: ${channel.name}`);
    } else {
        console.log(`❌ Error: Channel with ID ${DISCORD_CHANNEL_ID} not found.`);
    }

    checkCodeWars(); // Run immediately on startup
});

client.login(TOKEN);

// **Express Server for Manual Trigger**
const app = express();

app.get('/', (req, res) => {
    res.send('Bot is running locally!');
});

// **New Route: Trigger CodeWars Check Immediately**
app.get('/check', async (req, res) => {
    await checkCodeWars();
    res.send("✅ CodeWars check completed!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));
