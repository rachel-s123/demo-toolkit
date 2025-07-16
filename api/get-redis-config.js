import { kv } from "@vercel/kv";

const BMW_CONFIG_KEY = "bmw:config";

export default async function handler(req, res) {
  // Optional: Add a secret query parameter for basic security if desired
  // const { secret } = req.query;
  // if (secret !== 'YOUR_CHOSEN_SECRET_HERE') {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  if (req.method === "GET") {
    try {
      const config = await kv.get(BMW_CONFIG_KEY);
      if (config) {
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="redis_config.json"'
        );
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json(config);
      } else {
        return res.status(404).json({ error: "Config not found in Redis." });
      }
    } catch (error) {
      console.error("Error fetching config from Redis:", error);
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
