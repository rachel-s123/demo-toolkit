#!/usr/bin/env node
import { existsSync } from 'fs';
if (!existsSync('node_modules')) {
  console.warn('⚠️  node_modules not found. Run `npm install` before linting.');
}
