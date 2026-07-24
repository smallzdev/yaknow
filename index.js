require("dotenv").config();
const axios = require("axios");

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

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

In construction (not released yet):
/yaknow-roll - Rolls a random number between 1 and 1,000,000. It currently works, but doesn't save even if you roll a good number.
/yaknow-roll-leaderboard - Shows the leaderboard for the /yaknow-roll command.`
  });
});

app.command("/yaknow-roll", async ({ command, ack, respond }) => {
  await ack();
  const leaderboard = require("./leaderboard.json");
  const roll = {
    value: Math.floor(Math.random() * 1000000) + 1,
    timestamp: new Date().toISOString(),
    user: command.user_id
  };
  const fs = require("fs");
  function saveRoll(roll) {
    const finished = (err) => {
        if(err){
            console.error(err);
            return;
        }
    }

    const jsonData = JSON.stringify(roll, null, 2);
    console.log(roll)
    console.log(jsonData)
    fs.writeFile('leaderboard.json',jsonData, finished);
  }
    saveRoll(roll);

    if (roll.value < 200) {
        await respond({ text: `🍀🎲✨ Wow! You rolled a ${roll.value}! That is a really low number! Cehck out the leaderboard to see if you are the lowest roller!'` });
    }
    if (roll.value > 900000) {
        await respond({ text: `🍀🎲✨ Wow! You rolled a ${roll.value}! That is a really high number! Check out the leaderboard to see if you are the highest roller!'` });
    }
    if (roll.value == 777) {
        await respond({ text: `🍀🎲✨ Wow! You rolled a ${roll.value}! That is a really lucky number! Check out the leaderboard to see if you are the luckiest roller!'` });
    }
    else {
        await respond({ text: `🎲 You rolled a ${roll.value}! Unfortunately, this isnt a rare number, however you might as well check the leaderboard just incase.` });
    }
  });

app.command("/yaknow-roll-leaderboard", async ({ ack, respond }) => {
    await ack();
    await respond({ text: 'The leaderboard is still in construction, check back soon :)' });
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