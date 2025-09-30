import * as esbuild from 'esbuild';
import { AgentConfig } from '../src/agent-config';
import c from '../agent.config';
import * as fs from 'node:fs';

(async () => {
  const agentConfig = c as AgentConfig;
  console.info(`Agent Configuration: ${JSON.stringify(agentConfig, null, 2)}`);
  const outdir = `dist/${agentConfig.name}`;
  const outfile = `${outdir}/index.js`;
  await esbuild.build({
    outfile,
    entryPoints: ['src/server.ts'],
    minify: true,
    platform: 'node',
    format: 'cjs',
    bundle: true,
  });
  console.info(`Successfully built agent to ${outfile}`);
  fs.writeFileSync(
    `${outdir}/mcp.json`,
    JSON.stringify(
      {
        [agentConfig.name]: {
          command: 'node',
          args: [`${process.cwd()}/${outfile}`],
        },
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    `${outdir}/config.json`,
    JSON.stringify(agentConfig, null, 2),
  );
})();
