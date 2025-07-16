const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'public/locales/config_en.json');
const guidesDir = path.join(__dirname, 'public/guides/updates');

function getMarkdownForGuide(guideId) {
  // Try both .md and -guide.md for flexibility
  const possibleFiles = [
    `${guideId}.md`,
    `${guideId}-guide.md`
  ];
  for (const file of possibleFiles) {
    const filePath = path.join(guidesDir, file);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  }
  return null;
}

function main() {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  let updated = false;

  if (!Array.isArray(config.guides)) {
    console.error('No guides array found in config!');
    process.exit(1);
  }

  config.guides.forEach(guide => {
    const md = getMarkdownForGuide(guide.id);
    if (md) {
      guide.content = md;
      updated = true;
      console.log(`Updated content for guide: ${guide.id}`);
    } else {
      console.warn(`No markdown file found for guide: ${guide.id}`);
    }
  });

  if (updated) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log('config_en.json updated successfully!');
  } else {
    console.log('No guides were updated.');
  }
}

main(); 