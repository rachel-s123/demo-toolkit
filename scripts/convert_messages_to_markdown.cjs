const fs = require("fs");
const path = require("path");

// Load the current config
const configPath = path.join(__dirname, "..", "public", "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

console.log(
  `🔄 Converting ${config.messages.length} messages to markdown format...`
);

// Function to convert plain text message content to markdown
function convertToMarkdown(content) {
  let markdown = content;

  // Convert \n\n to proper line breaks
  markdown = markdown.replace(/\\n\\n/g, "\n\n");
  markdown = markdown.replace(/\\n/g, "\n");

  // Convert [CTA: ...] to styled markdown buttons
  markdown = markdown.replace(/\[CTA:\s*([^\]]+)\]/g, "**[$1]**");

  // Convert bullet points that start with • to proper markdown
  markdown = markdown.replace(/•\s*/g, "- ");

  // Convert ✅ checkmarks to markdown checkboxes
  markdown = markdown.replace(/✅\s*/g, "- ✅ ");

  // Ensure proper spacing around sections
  markdown = markdown.replace(/\n\n\n+/g, "\n\n");

  // Clean up any remaining literal \n sequences
  markdown = markdown.replace(/\\n/g, "\n");

  return markdown.trim();
}

// Convert all messages
let convertedCount = 0;
config.messages = config.messages.map((message) => {
  const originalContent = message.content;
  const markdownContent = convertToMarkdown(originalContent);

  if (originalContent !== markdownContent) {
    convertedCount++;
    console.log(`✅ Converted message: ${message.title}`);
    console.log(`   Before: ${originalContent.substring(0, 50)}...`);
    console.log(`   After:  ${markdownContent.substring(0, 50)}...`);
    console.log("");
  }

  return {
    ...message,
    content: markdownContent,
  };
});

// Save the updated config
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log(`🎉 Conversion complete!`);
console.log(
  `📊 Converted ${convertedCount} out of ${config.messages.length} messages`
);
console.log(`💾 Updated config saved to ${configPath}`);
