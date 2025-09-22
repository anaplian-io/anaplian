# @anaplian/djan-seriy

Djan-Seriy is an AI agent creator. Agents can be configured using `agent.config.ts` the built using

```shell
npm run build
```

## Features

- Djan-Seriy constructs portable artifacts in its `dist/` directory.
- Each constructed agent operates as a STDIO model context protocol server.
- Each constructed agent can itself have access to a list of model context protocol servers configured in `agent.config.ts`.
