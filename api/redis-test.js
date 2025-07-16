import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    await kv.set("vercel-redis-test", "hello");
    const value = await kv.get("vercel-redis-test");
    res.status(200).json({ success: true, value });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
