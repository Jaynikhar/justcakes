import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { assertEnv, env } from './config/env.js';

async function start() {
  try {
    assertEnv();
    await connectDB();
    const app = createApp();
    app.listen(env.port, () => {
      console.log(`Just Cakes API listening on http://localhost:${env.port} (${env.nodeEnv})`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

start();
