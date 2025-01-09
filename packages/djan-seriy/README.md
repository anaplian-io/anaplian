# @anaplian/djan-seriy

Djan-Seriy is an example agent written using the Anaplian agent framework.

## Features

Djan-Seriy illustrates the following features of Anaplian:

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

4. Modify `./agent.sh` to include your OpenAI API key, Tavily API key, and your directive to the agent.

```shell
export OPEN_AI_API_KEY=#YOUR OPENAI API KEY
export TAVILY_API_KEY=#YOUR TAVILY API KEY
export DIRECTIVE=#YOUR AGENT INSTRUCTIONS
node dist/index.js
```

5. Start the agent.

```shell
bash agent.sh
```
