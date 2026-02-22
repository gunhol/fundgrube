import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const itemsDir = path.join(__dirname, 'public', 'items');
const outputFile = path.join(__dirname, 'public', 'items.json');

const items = [];

if (fs.existsSync(itemsDir)) {
  const files = fs.readdirSync(itemsDir);

  const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

  for (const yamlFile of yamlFiles) {
    const basename = path.basename(yamlFile, path.extname(yamlFile));
    const yamlPath = path.join(itemsDir, yamlFile);

    // Find associated image
    const imageFile = files.find(f => f.startsWith(basename + '.') && f !== yamlFile);

    if (imageFile) {
      try {
        const fileContents = fs.readFileSync(yamlPath, 'utf8');
        const data = yaml.load(fileContents);

        // Handle both single objects and arrays of objects
        const itemsArray = Array.isArray(data) ? data : [data];

        itemsArray.forEach((item, index) => {
          items.push({
            id: `${basename}-${index}`,
            image: `./items/${imageFile}`, // using relative path from public root
            ...item
          });
        });
      } catch (e) {
        console.error(`Error parsing ${yamlFile}:`, e);
      }
    } else {
      console.warn(`No image found for ${yamlFile}, skipping.`);
    }
  }
} else {
  console.log('public/items directory does not exist. Creating it...');
  fs.mkdirSync(itemsDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(items, null, 2));
console.log(`Successfully generated items.json with ${items.length} items.`);
