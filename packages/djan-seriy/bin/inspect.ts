import * as child_process from 'node:child_process';

const serverName = process.argv[2];
if (serverName) {
  const location = `${process.cwd()}/dist/${serverName}/index.js`;
  console.info(`Inspecting MCP server at ${location}`);
  child_process.exec(`npx @modelcontextprotocol/inspector node ${location}`);
} else {
  console.info(`Usage: npm run inspect -- {server-name}`);
}
