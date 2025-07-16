import { kv } from "@vercel/kv";

const BMW_CONFIG_KEY = "bmw:config";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Adding a log for OPTIONS requests for completeness
    console.log(
      `[${new Date().toISOString()}] Messages Handler: Responding to OPTIONS request.`
    );
    return res.status(200).end();
  }

  const { messageId: id } = req.query; // Changed to use messageId from query and alias as id

  // Log general request info and full query object
  console.log(
    `[${new Date().toISOString()}] Messages Handler: Method: ${
      req.method
    }, messageId: ${id}`
  );
  console.log("Messages Handler: Full req.query object:", req.query);

  if (req.method !== "PUT" && req.method !== "POST") {
    console.log(
      `Messages Handler: Method ${req.method} not allowed for messageId: ${id}. Responding with 405.`
    );
    res.setHeader("Allow", ["PUT", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get current config from Redis
    const config = await kv.get(BMW_CONFIG_KEY);

    if (!config) {
      console.error(
        `Messages Handler: Config not found for BMW_CONFIG_KEY: ${BMW_CONFIG_KEY}`
      );
      return res.status(404).json({ error: "Config not found" });
    }

    // Find and update the message
    const messageIndex = config.messages.findIndex((m) => m.id === id);

    if (messageIndex === -1) {
      console.warn(`Messages Handler: Message not found with messageId: ${id}`);
      return res.status(404).json({ error: "Message not found" });
    }

    console.log(
      `Messages Handler: Processing ${req.method} request for messageId: ${id}. Body:`,
      req.body
    );
    // Update the message
    const updatedMessage = req.body;
    config.messages[messageIndex] = updatedMessage;

    // Save back to Redis
    await kv.set(BMW_CONFIG_KEY, config);
    console.log(`✅ Messages Handler: Updated message ${id} in Redis`);

    res.json(config);
  } catch (error) {
    console.error(
      `Messages Handler: Error during ${req.method} for messageId ${id}:`,
      error
    );
    res.status(500).json({ error: "Internal server error" });
  }
}
