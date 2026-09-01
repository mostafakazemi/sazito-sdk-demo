import { loadEnvFile } from "node:process";
import { defineConfig } from "vitest/config";

try {
  loadEnvFile(".env.local");
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

export default defineConfig({
  test: {
    include: ["src/**/*.live.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
    maxWorkers: 1,
  },
});
