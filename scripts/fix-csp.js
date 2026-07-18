/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

// Recursively find all files in a directory
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

// Recursively clean up files and folders starting with _ or __ (except _next)
function cleanReservedNames(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const basename = path.basename(filePath);

    if (basename.startsWith('_') || basename.startsWith('__')) {
      // Skip _next directory as we will process and rename it later
      if (basename === '_next') {
        cleanReservedNames(filePath);
        return;
      }
      
      // Delete directory or file
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`- Removed forbidden directory: ./${path.relative(outDir, filePath)}`);
      } else {
        fs.unlinkSync(filePath);
        console.log(`- Removed forbidden file: ./${path.relative(outDir, filePath)}`);
      }
    } else if (stat.isDirectory()) {
      cleanReservedNames(filePath);
    }
  });
}

function processFiles() {
  console.log('Post-processing static build for Chrome Extension compatibility...');
  
  if (!fs.existsSync(outDir)) {
    console.error('Error: "out" directory not found. Run a build first.');
    process.exit(1);
  }

  // 1. Remove all files/folders starting with _ or __ (except _next) to satisfy Chrome rules
  cleanReservedNames(outDir);

  // 2. Walk HTML files first to extract inline scripts (CSP fix)
  const initialFiles = walk(outDir);
  let scriptCounter = 0;

  initialFiles.forEach(file => {
    if (!file.endsWith('.html')) return;

    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    content = content.replace(scriptRegex, (fullTag, attributes, scriptContent) => {
      if (attributes.toLowerCase().includes('src=')) return fullTag;
      if (!scriptContent.trim()) return fullTag;

      scriptCounter++;
      const scriptFilename = `csp-script-${scriptCounter}.js`;
      const scriptPath = path.join(path.dirname(file), scriptFilename);
      
      fs.writeFileSync(scriptPath, scriptContent.trim());
      console.log(`- Extracted inline script: ./${path.relative(outDir, scriptPath)}`);
      
      modified = true;
      return `<script src="./${scriptFilename}"${attributes}></script>`;
    });

    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
    }
  });

  // 3. Walk all files (including newly created ones) and replace "_next" path references with "next"
  const allFiles = walk(outDir);
  allFiles.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    const isText = ['.html', '.js', '.css', '.json', '.txt'].includes(ext);
    if (!isText) return;

    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('_next')) {
      content = content.replace(/\/_next\//g, '/next/')
                       .replace(/\b_next\//g, 'next/')
                       .replace(/"_next\//g, '"next/');
      fs.writeFileSync(file, content, 'utf8');
      console.log(`- Replaced "_next" path references in: ./${path.relative(outDir, file)}`);
    }
  });

  // 4. Rename the _next directory to next (cleaning up target if it already exists, preventing Windows crashes)
  const oldNextDir = path.join(outDir, '_next');
  const newNextDir = path.join(outDir, 'next');
  if (fs.existsSync(oldNextDir)) {
    if (fs.existsSync(newNextDir)) {
      fs.rmSync(newNextDir, { recursive: true, force: true });
    }
    fs.renameSync(oldNextDir, newNextDir);
    console.log('- Renamed _next directory to next');
  }

  console.log(`Post-processing complete! Extracted ${scriptCounter} inline scripts.`);
}

processFiles();
