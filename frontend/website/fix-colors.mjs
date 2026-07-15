import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/Admin/Documents/GitHub/crackers-ecommerce/frontend/website/src';

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(file => {
    file = path.join(directory, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  content = content.replace(/text-gray-400/g, 'text-gray-300');
  content = content.replace(/text-gray-500/g, 'text-gray-400');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated colors in ${file}`);
  }
});
