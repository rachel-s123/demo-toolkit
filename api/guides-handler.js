import { kv } from "@vercel/kv";
// import fs from "fs"; // Comment out for this test
// import path from "path"; // Comment out for this test

const BMW_CONFIG_KEY = "bmw:config";

export default async function handler(req, res) {
  const { guideId: id } = req.query; // Changed to use guideId from query and alias as id

  console.log(
    `[${new Date().toISOString()}] Guides Handler: Method: ${
      req.method
    }, guideId: ${id}` // Updated log
  );
  // Log the full query object for debugging
  console.log("Guides Handler: Full req.query object:", req.query);

  // Enable CORS - KEEP THIS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log(
      `Guides Handler: Responding to OPTIONS request for guideId: ${id}`
    ); // Updated log
    return res.status(200).end();
  }

  if (req.method === "PUT") {
    console.log(
      `Guides Handler: Processing PUT request for guideId: ${id}. Body:`,
      req.body
    );
    try {
      const config = await kv.get(BMW_CONFIG_KEY);
      if (!config) {
        console.error(
          `Guides Handler: Config not found for BMW_CONFIG_KEY: ${BMW_CONFIG_KEY}`
        );
        return res.status(404).json({ error: "Config not found" });
      }

      // Ensure config.guides array exists
      if (!config.guides || !Array.isArray(config.guides)) {
        console.warn(
          "Guides Handler: config.guides array not found or not an array. Initializing."
        );
        config.guides = []; // Initialize if it doesn't exist or isn't an array
      }

      const guideIndex = config.guides.findIndex((g) => g.id === id);

      if (guideIndex === -1) {
        // If guide not found, create a new one
        console.log(
          `Guides Handler: Guide with id ${id} not found. Creating new guide.`
        );
        const newGuide = { ...req.body, id: id }; // Ensure the id from URL is used
        config.guides.push(newGuide);
      } else {
        // If guide found, update it
        console.log(`Guides Handler: Updating existing guide with id ${id}.`);
        config.guides[guideIndex] = {
          ...config.guides[guideIndex],
          ...req.body,
          id: id,
        }; // Merge and ensure id from URL
      }

      await kv.set(BMW_CONFIG_KEY, config);
      console.log(`✅ Guides Handler: Updated/Created guide ${id} in Redis`);

      // Return the specific updated/created guide or the whole guides array/config as needed
      const updatedOrCreatedGuide = config.guides.find((g) => g.id === id);
      return res.status(200).json({
        success: true,
        message: `Guide ${id} processed successfully`,
        guide: updatedOrCreatedGuide,
      });
    } catch (error) {
      console.error(
        `Guides Handler: Error during PUT for guideId ${id}:`,
        error
      );
      return res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }

  // Fallback for other methods
  console.log(
    `Guides Handler: Method ${req.method} not allowed for guideId: ${id}. Responding with 405.` // Updated log
  );
  res.setHeader("Allow", ["PUT", "POST", "OPTIONS"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
