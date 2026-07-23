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
    text:
`Available Commands:
/yaknow-help - Shows this exact help message.
/yaknow-ping - Check bot latency.
/yaknow-catfact - Sends a random cat fact.
/yaknow-joke - Sends a random joke.

In construction (not released yet):
/yaknow-cat - Sends a random cat image.
  });
});

app.command("/yaknow-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
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
  await respond({
    text:
`In construction. Please check back later.
  });
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();