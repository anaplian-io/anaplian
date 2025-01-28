# @anaplian/djan-seriy

Djan-Seriy is an example agent written using the Anaplian agent framework.

## Features

Djan-Seriy illustrates the following behaviors:

- Uses event handlers to log the agent's outputs and action results.
- Sets a shutdown hook to gracefully shut down the agent on `CTRL + c`.
- Shuts down the agent when the agent invokes the `nop()` command.

## Running the agent

1. Clone this repository locally.

```shell
git clone https://github.com/anaplian-io/anaplian.git
```

2. Navigate to the djan-seriy package.

```shell
cd packages/djan-seriy
```

3. Build the agent.

```shell
npm run build
```

4. Make a copy of `./template.env` called `.env` and fill it in with API keys for Tavily, Discord, and OpenAI as well
   as your role assignment directive to the agent.

```.dotenv
OPEN_AI_API_KEY="YOUR OPENAI API KEY"
TAVILY_API_KEY="YOUR TAVILY API KEY"
DISCORD_BOT_TOKEN="YOUR DISCORD BOT TOKEN"
IMAGE_URL="AN IMAGE URL"
DIRECTIVE="YOUR AGENT INSTRUCTIONS"
```

5. Start the agent.

```shell
npm start
```
