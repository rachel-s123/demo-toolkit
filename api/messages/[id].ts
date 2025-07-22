import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../../src/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    console.log(`[${new Date().toISOString()}] Messages Handler: Processing PUT request for message ${id}`);

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Message ID is required' });
    }

    // In Vercel serverless environment, we can't write to filesystem
    // Return success response but note that changes are not persisted
    console.log(`Would update message ${id} with data:`, req.body);

    return res.status(200).json({
      success: true,
      message: `Message ${id} would be updated successfully (changes not persisted in production)`,
      data: {
        id,
        ...req.body
      },
      note: "In production environment, file changes are not persisted due to serverless limitations."
    });

    console.log(`✅ Messages Handler: Successfully processed message ${id} update request`);

  } catch (error: any) {
    console.error("Messages Handler: Error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
} 