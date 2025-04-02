import fs from 'fs';
import path from 'path';

export async function getInventoryData() {
  try {
    const filePath = path.join(process.cwd(), 'database', 'food_items.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading inventory data:', error);
    return [];
  }
}
