import { kv } from "@vercel/kv";
import fs from "fs";
import path from "path";

const BMW_CONFIG_KEY = "bmw:config";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case "GET":
        // Get config from Redis
        let config = await kv.get(BMW_CONFIG_KEY);

        if (!config) {
          // Initialize with static config.json if not in Redis
          try {
            const configPath = path.join(
              process.cwd(),
              "public",
              "config.json"
            );
            const staticConfig = JSON.parse(
              fs.readFileSync(configPath, "utf8")
            );

            // DO NOT Store in Redis for future use - allow force-update-redis.js to be the authority
            // await kv.set(BMW_CONFIG_KEY, staticConfig);
            config = staticConfig;
            console.log(
              "✅ Used static config as Redis was empty (did not write to Redis)."
            );
          } catch (error) {
            console.error("Failed to load static config:", error);
            return res
              .status(500)
              .json({ error: "Failed to load configuration" });
          }
        }

        res.json(config);
        break;

      case "PUT":
        // Update entire config
        const updatedConfig = req.body;
        await kv.set(BMW_CONFIG_KEY, updatedConfig);
        console.log("✅ Updated entire config in Redis");
        res.json(updatedConfig);
        break;

      default:
        res.setHeader("Allow", ["GET", "PUT"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Config API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
