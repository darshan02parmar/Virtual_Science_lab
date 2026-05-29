const fs = require('fs');
const path = require('path');

const experimentsDir = path.join(__dirname, 'frontend', 'src', 'experiments');

const processDirectory = (directory) => {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // Automated merging issue 1: Component declaration duplicated inside the function body
      // Example:
      // const Component = () => {
      //   const Component = () => {
      content = content.replace(/(const\s+\w+\s*=\s*\(\)\s*=>\s*\{)[\s\S]*?(const\s+\w+\s*=\s*\(\)\s*=>\s*\{)/, "$1");
      
      // Automated merging issue 2: imports inside function body
      // Example:
      //   import Something from 'somewhere';
      const imports = [];
      content = content.replace(/^(\s*import\s+.*?;?\n)/gm, (match) => {
        imports.push(match.trim());
        return "";
      });
      
      if (imports.length > 0) {
        content = [...new Set(imports)].join('\n') + '\n\n' + content;
      }

      if (original !== content) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed ${file}`);
      }
    }
  }
};

processDirectory(experimentsDir);
