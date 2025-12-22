import dotenv from 'dotenv';
import fs from 'fs/promises';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import { robots } from './robots.js';

// Get the directory of this script and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Debug mode: generate only one robot for prompt testing
// Usage: node scripts/generate-images.js --debug [robotName]
const args = process.argv.slice(2);
const debugIndex = args.indexOf('--debug');
const isDebugMode = debugIndex !== -1;
const debugRobotName = debugIndex !== -1 && args[debugIndex + 1] ? args[debugIndex + 1] : null;

// Load environment variables from .env file in project root
dotenv.config({ path: path.join(projectRoot, '.env') });

// Retrieve your OpenAI API key from the environment. The key is required
// to authenticate requests against the OpenAI image generation endpoint.
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error(
    'Missing OpenAI API key. Please set the OPENAI_API_KEY environment variable or add it to a .env file in the project root.'
  );
  process.exit(1);
}

// Initialize the OpenAI client. The SDK automatically picks up the API key from
// the configuration provided here. See https://github.com/openai/openai-node for details.
const openai = new OpenAI({ apiKey });

// Directory in which generated images will be stored. The script will create
// this folder if it doesn't already exist.
const outputDir = path.join(projectRoot, 'generated');

/**
 * Build a prompt for the OpenAI image generation API. The prompt uses the
 * consistent template defined in the project description to ensure that all
 * robots share a common visual style. Placeholders are replaced with the
 * robot's specific attributes.
 *
 * @param {Object} robot - Robot definition containing name, purpose,
 *   movement, environment, control, and sensors fields.
 * @returns {string} A formatted prompt string ready for the image API.
 */
function buildPrompt(robot) {
  const sensorsString = robot.sensors.join(', ');
  return `Create a clean, kid-friendly illustration of a robot called "${robot.name}".

STYLE:
- Flat, colorful, educational illustration
- Consistent cartoon style
- Soft outlines, simple shapes
- No shadows, no dramatic lighting
- White or very light background
- Centered robot, full body visible
- Designed for elementary school students

ROBOT PURPOSE:
- Main job: ${robot.purpose}
- Show this clearly using props or context (for example: boxes for delivery, broom for cleaning, medical cross for helping people)

MOVEMENT:
- Movement type: ${robot.movement}
- Make the movement obvious (wheels clearly visible, legs jointed, tracks like a tank, or propellers if flying)

ENVIRONMENT:
- Works primarily: ${robot.environment}
- Hint at this using minimal background elements (simple indoor floor line or outdoor ground line, but keep background very simple)

CONTROL TYPE:
- Control: ${robot.control}
- Show this subtly (small antenna, signal icon, tablet nearby, or no controller at all)

SENSORS:
- Sensors included: ${sensorsString}
- Visually show sensors as icons or features on the robot (camera lens for vision, microphone for sound, small thermometer icon for temperature, touch pads on arms)

DESIGN RULES:
- No humans
- No text labels inside the image
- No clutter or extra objects
- Robot should look friendly, not scary
- Robot must clearly communicate its function at a glance

VARIATION:
- Slightly vary color accents and robot shape, but keep all features and style consistent
`;
}

/**
 * Create the output directory if it doesn't already exist. This function
 * gracefully handles the case where the directory exists.
 */
async function ensureOutputDir() {
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create output directory:', err);
    throw err;
  }
}

/**
 * Generate images for each robot definition in the robots array. For each robot
 * a single API request is issued with the `n` parameter set to 3, instructing
 * the model to produce three variations of the same prompt. The base64 image
 * data returned by the API is saved to disk as PNG files. Filenames are
 * sanitised to remove spaces and other filesystem‑hostile characters.
 */
async function generateRobotImages() {
  await ensureOutputDir();

  // Determine which robots to process
  let robotsToProcess = robots;
  if (isDebugMode) {
    if (debugRobotName) {
      const found = robots.find(
        (r) => r.name.toLowerCase() === debugRobotName.toLowerCase()
      );
      if (!found) {
        console.error(`Robot "${debugRobotName}" not found. Available robots:`);
        robots.forEach((r) => console.log(`  - ${r.name}`));
        process.exit(1);
      }
      robotsToProcess = [found];
      console.log(`Debug mode: generating images for "${found.name}" only`);
    } else {
      robotsToProcess = [robots[0]];
      console.log(`Debug mode: generating images for "${robots[0].name}" only (first robot)`);
    }
  }

  for (const robot of robotsToProcess) {
    const prompt = buildPrompt(robot);
    console.log(`Generating images for: ${robot.name}…`);
    try {
      const response = await openai.images.generate({
        model: 'gpt-image-1.5',
        prompt,
        n: 3,
        size: '1024x1024',
        // You can tweak additional parameters such as output_format or quality
      });
      // The data field contains an array of image objects. Each entry has a
      // `b64_json` property with the Base64‑encoded PNG data.
      const images = response.data;
      // Sanitize robot name for file names (replace spaces with underscores and remove non‑alphanumeric characters).
      const safeName = robot.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const fileName = `${safeName}_${i + 1}.png`;
        const filePath = path.join(outputDir, fileName);
        const imageBuffer = Buffer.from(image.b64_json, 'base64');
        await fs.writeFile(filePath, imageBuffer);
        console.log(`  Saved ${fileName}`);
      }
    } catch (error) {
      console.error(`Error generating images for ${robot.name}:`, error);
    }
  }
  console.log('Image generation complete. Files are stored in the generated/ folder.');
}

// Run the script. Catch unhandled promise rejections to avoid silent
// failures on uncaught exceptions.
generateRobotImages().catch((err) => {
  console.error('Unexpected error:', err);
});

