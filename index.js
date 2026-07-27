require("dotenv").config();
const axios = require("axios");

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

const fs = require('fs');

app.command("/yaknow-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

app.command("/yaknow-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text: `Available Commands:
/yaknow-help - Shows this exact help message.
/yaknow-ping - Check bot latency.
/yaknow-catfact - Sends a random cat fact.
/yaknow-joke - Sends a random joke.
/yaknow-cat - Sends a random cat image.
/yaknow-roll - Rolls a random number between 1 and 1,000,000.

In construction (not released yet):
/yaknow-roll-leaderboard - Shows the leaderboard for the /yaknow-roll command. Currently works, but only shows your own best, not others.`
  });
});

app.command("/yaknow-roll", async ({ command, ack, respond }) => {
  await ack();

  const roll = Math.floor(Math.random() * 1000000) + 1;
    
  var rollData = {
    user: command.user_id,
    highestRoll: null,
    lowestRoll: null,
    rolled777: null,
    timestamp: new Date().toISOString()
  }

  var jsonData = JSON.stringify(rollData)

  let data = {};
  if (fs.existsSync("leaderboard.json")) {
    data = JSON.parse(fs.readFileSync("leaderboard.json", "utf8"));
  }
  if (!data[command.user_id]) {
    data[command.user_id] = {
      highestRoll: roll,
      lowestRoll: roll,
      rolled777: false
    }
  }

  if (roll < data[command.user_id].lowestRoll) {
    data[command.user_id].lowestRoll = roll;
  }
  if (roll > data[command.user_id].highestRoll) {
    data[command.user_id].highestRoll = roll;
  }
  if (roll === 777) {
    data[command.user_id].rolled777 = true;
  }

  fs.writeFileSync("leaderboard.json", JSON.stringify(data, null, 2))

  if (roll < 200) {
    await respond({ text: `🍀🎲✨ Wow! You rolled a ${roll}! That is a really low number! Cehck out the leaderboard to see if you are the lowest roller!'` });
  }
  else if (roll > 900000) {
    await respond({ text: `🍀🎲✨ Wow! You rolled a ${roll}! That is a really high number! Check out the leaderboard to see if you are the highest roller!'` });
  }
  else if (roll === 777) {
    await respond({ text: `🍀🎲✨ Wow! You rolled a ${roll}! That is a really lucky number! Check out the leaderboard to see if you are the luckiest roller!'` });
  }
  else {
    await respond({ text: `🎲 You rolled a ${roll}! Unfortunately, this isnt a rare number, however you might as well check the leaderboard just incase.` });
  }

});

app.command("/yaknow-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `🐱 Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});

app.command("/yaknow-roll-leaderboard", async ({ command, ack, respond }) => {
  await ack();
  let leaderboard = {};
  if (fs.existsSync("leaderboard.json")) {
    leaderboard = JSON.parse(fs.readFileSync("leaderboard.json", "utf8"));
  }
  const userProfileLinkThingy = leaderboard[command.user_id];

  await respond({ text: "Roll Leaderboard 🏆", text: "Note: Currently this only displays your stats. I plan to make this an actual leaderboard in a later update.",
    text: `⬆️ Highest Roll: ${userProfileLinkThingy.highestRoll} ⬇️ Lowest Roll: ${userProfileLinkThingy.lowestRoll} ☘️ Rolled 777?: ${userProfileLinkThingy.rolled777}`
  })

});

app.command("/yaknow-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text:
`${response.data.setup}

${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});

app.command("/yaknow-cat", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://cataas.com/cat");
    await respond({
      attachments: [
        {
            "fallback": "Error: Please contact the bot owner @smallz.",
            "image_url": "https://cataas.com/cat",
            "text": "Here's a cute cat for you!",
        }
    ]
    });
  } catch (err) {
    await respond({ text: "Where did the cats go? Sorry, we can't fetch a cat. Please try again in a minute." });
  }
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();