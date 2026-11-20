import { spawn } from "node:child_process";

function run() {
  const child = spawn("node", ["node_modules/next/dist/bin/next", "dev", "-p", "3000"], {
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });

  child.on("exit", (code, signal) => {
    if (signal === "SIGINT" || signal === "SIGTERM") {
      process.exit(0);
    }
    console.log(`[dev-server] Next.js dev server exited (code: ${code}, signal: ${signal}). Re-spawning in 1s...`);
    setTimeout(run, 1000);
  });
}

run();
