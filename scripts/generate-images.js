import dotenv from 'dotenv';
import fs from 'fs/promises';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import { robots } from './robots.ts';

// Get the directory of this script and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// =============================================================================
// DEBUG CONFIGURATION
// =============================================================================
// Change this index to test different robots in debug mode (0-based)
// Examples: 0 = first robot, 1 = second robot, 9 = tenth robot
const DEBUG_ROBOT_INDEX = 9;
// =============================================================================

// Debug mode: generate only one robot for prompt testing
// Usage: node scripts/generate-images.js --debug [robotName]
const args = process.argv.slice(2);
const debugIndex = args.indexOf('--debug');
const isDebugMode = debugIndex !== -1;
const debugRobotName = debugIndex !== -1 && args[debugIndex + 1] ? args[debugIndex + 1] : null;

// Define the three visual styles
const IMAGE_STYLES = {
  blocky: {
    name: 'blocky',
    description: `Roblox-inspired blocky style with:
- Chunky, geometric, voxel-like shapes
- Simplified cubic body parts and limbs
- Flat, matte colors with minimal shading
- Friendly, approachable character design
- Toy-like, buildable aesthetic
- Simple facial features (dot eyes, basic expressions)`,
  },
  realistic: {
    name: 'realistic',
    description: `Realistic industrial robot style with:
- Photorealistic rendering with accurate materials
- Metallic surfaces, rubber treads, plastic panels
- Realistic proportions and mechanical details
- Visible joints, actuators, and sensors
- Professional, industrial design aesthetic
- Subtle lighting and shadows for depth`,
  },
};

// Quality setting - medium provides the best balance of quality and cost
const IMAGE_QUALITY = 'medium';

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
const outputDir = path.join(projectRoot, 'public', 'generated');

/**
 * Build a prompt for the OpenAI image generation API. The prompt uses the
 * consistent template defined in the project description to ensure that all
 * robots share a common visual style. Placeholders are replaced with the
 * robot's specific attributes.
 *
 * @param {Object} robot - Robot definition containing name, purpose,
 *   movement, environment, control, and sensors fields.
 * @param {Object} style - Style definition from IMAGE_STYLES.
 * @returns {string} A formatted prompt string ready for the image API.
 */
function buildPrompt(robot, style) {
  const sensorsString = robot.sensors.join(', ');

  // Build sensor-specific visual descriptions (keep these concrete to reduce generic "box robot" defaults)
  const sensorVisualMap = {
    'Camera': 'prominent camera lens eye(s) or optical sensor dome',
    'Touch sensors': 'visible touch pads, pressure plates, or tactile fingertips',
    'Sound sensors': 'visible microphone grille, audio receivers, or ear-like sensors',
    'Temperature sensor': 'thermal scanner panel, heat-sensing camera, or thermometer-style gauge',
    'Thermal sensors': 'thermal scanner panel or heat-sensing camera',
    'LIDAR': 'spinning LIDAR puck on top or a scanning LIDAR window',
    'GPS': 'GNSS antenna puck or small antenna mast',
    'Ultrasonic sensors': 'small round ultrasonic “eyes” on the front bumper',
    'Infrared sensors': 'IR sensor windows or a small IR camera module',
    'IMU': 'stability module with calibration markings; balanced, sensor-rich core',
    'Depth sensors': 'stereo depth camera bar or depth sensor window',
    'Force sensors': 'force/torque sensor ring at the wrist/joint; load indicator panel',
    'Proximity sensors': 'ring of small proximity dots around the body',
    'Pressure sensors': 'pressure gauge and sealed sensor ports',
    'Dirt sensors': 'dust/crumb detection window near the intake/brush area',
    'Cliff sensors': 'downward-facing cliff sensors under the front edge',
    'Edge sensors': 'edge feelers/bumper whiskers or edge-detect pads',
    'Metal detector': 'metal-detector coil or sensor loop near the front',
    'Barometer': 'barometric vent port; small altitude sensor module',
    'Radiation sensors': 'radiation badge-like sensor module (no text), shielded housing',
    'Spectrometer': 'spectrometer sensor head with prism-like window',
    'Sonar': 'sonar dome and transducer ports',
    'Gas sensors': 'gas sensor vents and intake grill',
    'Seismic sensors': 'ground-contact probe foot with vibration sensor housing',
    'Humidity sensor': 'humidity vent module with perforated cover',
    'Motion sensors': 'motion sensor dome (PIR-style) or tracking module',
    'Gyroscope': 'gyroscope module; stabilized core housing',
    'Water quality sensors': 'water intake port and probe-like sensor tips',
    'Strain gauges': 'strain gauge strip areas on joints/arm segments',
    'Level sensors': 'leveling module; tiny bubble-level-like detail (no text)',
    'Laser sensors': 'laser scanner window or laser line emitter module',
    'Chemical sensors': 'sealed sampling port and chemical sensor array',
    'Light sensors': 'small light sensor window facing outward',
  };

  const sensorVisuals = robot.sensors
    .map((sensor) => sensorVisualMap[sensor] || sensor)
    .join('; ');

  // Build purpose-specific visual descriptions (tool/action-based; avoid "always holding a box")
  const purposeVisuals = {
    Delivery:
      'has a cargo bay or storage compartment; pickup/dropoff posture; navigation/route vibe (boxes optional, not default)',
    Cleaning:
      'has brushes, vacuum intake, mop pad, or scrubber attachments; actively cleaning visible dirt/crumbs',
    'Helping people':
      'assistant vibe: helper tray, pill organizer, guide handle, or first-aid kit silhouette (no text); caring posture',
    'Helping animals':
      'pet-focused props: food/water bowl, toy, gentle gripper; soft friendly vibe',
    Exploration:
      'ruggedized body, protective casing, sampling tools, scanning sensors; discovery vibe',
    Entertainment:
      'expressive face panel, lights, performance pose; playful vibe',
    Building:
      'construction tools, grippers, alignment/leveling tools; assembling/placing materials',
    Fixing:
      'repair toolkit, wrench-like gripper, diagnostic scanner; maintenance vibe',
  };

  // Per-robot overrides: signature prop + action + what to avoid.
  const robotOverrides = {
    'Grocery Sorting Arm': {
      mustInclude: [
        'conveyor belt with groceries (apples, cans, cartons)',
        'robot arm with gripper picking items and placing them into bins',
        'sorting lanes or colored bins (no text)',
      ],
      avoid: ['cardboard shipping box', 'parcel', 'delivery bag'],
    },
    'Hospital Supply Runner': {
      mustInclude: [
        'hospital cart or rolling tray',
        'medical supply bins (bandage rolls, gloves box silhouette, IV bag silhouette)',
        'simple hospital hallway cues (doors, handrail shapes)',
      ],
      avoid: ['cardboard box', 'parcel'],
    },
    'Home Assistant Bot': {
      mustInclude: [
        'friendly helper pose offering a pill organizer OR showing a reminder screen icon (no text)',
        'home setting cue (lamp, couch outline) or a charging dock',
        'microphone grille clearly visible',
      ],
      avoid: ['cardboard box', 'packages', 'delivery bag', 'parcel'],
    },
    'Floor Sweeper Bot': {
      mustInclude: [
        'visible brushes or vacuum intake underneath',
        'dustbin compartment',
        'a small trail of crumbs/dust being cleaned',
      ],
      avoid: ['cardboard box', 'packages', 'parcel'],
    },
    'Window Washer Bot': {
      mustInclude: [
        'squeegee or cleaning pad attached',
        'suction cups or adhesion mechanism',
        'vertical glass pane cue',
      ],
      avoid: ['cardboard box', 'packages', 'parcel'],
    },
    'Road Repair Bot': {
      mustInclude: [
        'asphalt patching tool or compactor attachment',
        'road surface crack/patch cue',
        'cone-like road cue shapes (no text)',
      ],
      avoid: ['cardboard box', 'packages', 'parcel'],
    },
    'Brick Laying Bot': {
      mustInclude: [
        'stack of bricks and mortar dispenser',
        'robot actively placing a brick (mid-action)',
        'alignment/leveling cue (no text)',
      ],
      avoid: ['cardboard box', 'packages', 'parcel'],
    },
    'Forest Mapping Drone': {
      mustInclude: [
        'downward-facing sensor pod',
        'top-down scanning pose (tilted camera/LIDAR)',
        'tree canopy silhouettes below',
      ],
      avoid: ['carrying anything', 'boxes', 'parcels', 'delivery bag'],
    },
    'Deep Sea Explorer': {
      mustInclude: [
        'submarine-style body with thrusters/propellers',
        'sonar dome and bright exploration lights',
        'tiny bubbles + faint seabed cue',
      ],
      avoid: ['tracks', 'wheels', 'boxes', 'parcels'],
    },
  };

  const override = robotOverrides[robot.name];

  const mustIncludeSection =
    override?.mustInclude?.length
      ? `
ROBOT-SPECIFIC MUST-INCLUDE DETAILS:
- ${override.mustInclude.join('\n- ')}
`
      : '';

  const avoidList = [
    ...(override?.avoid ?? []),
    ...(robot.purpose !== 'Delivery' ? ['cardboard box', 'shipping parcel', 'delivery package'] : []),
  ];

  const avoidSection =
    avoidList.length
      ? `
AVOID THESE VISUAL CLICHES:
- Do NOT include: ${avoidList.join(', ')}
`
      : '';

  const movementHints = {
    Wheels: 'wheels clearly visible; slight forward-lean motion pose',
    Tracks: 'tracks clearly visible; rugged ground-ready stance',
    Legs: 'legs in a walking/working stance; balanced posture',
    Flying: 'rotors/propellers/winglets visible; hovering pose',
    Propellers: 'thrusters/propellers visible; underwater propulsion pose',
    Stationary: 'firm base or mounted pedestal; working arm(s) doing the task',
  };

  const controlHint =
    robot.control === 'Human-controlled'
      ? 'Show a subtle teleoperation vibe (e.g., small antenna, status light), but do NOT show a person or a controller.'
      : robot.control === 'Mixed human and AI control'
      ? 'Show an intelligent, sensor-rich look; can include an antenna or docking cue, but no person.'
      : 'Autonomous look, no external control visible.';

  return `Create a kid-friendly illustration of a robot called "${robot.name}".

VISUAL STYLE:
${style.description}

===== MOST IMPORTANT - ROBOT'S PURPOSE (make this the focal point) =====
Purpose: ${robot.purpose}
Visual requirements: ${purposeVisuals[robot.purpose] || robot.purpose}
- The robot's purpose must be IMMEDIATELY obvious at first glance
- Include relevant tools, attachments, or context that scream "${robot.purpose}"
- Show the robot actively performing its job in a single clear action pose (not just standing still)

===== HIGHLY IMPORTANT - SENSORS (make these clearly visible) =====
Sensors: ${sensorsString}
Visual requirements: ${sensorVisuals}
- Sensors must be PROMINENT and easily identifiable features on the robot
- Make sensors large enough to be seen clearly
- Sensors should be integrated into the robot's design as key features

MOVEMENT TYPE: ${robot.movement}
- ${movementHints[robot.movement] || `Show ${robot.movement.toLowerCase()} clearly`}

ENVIRONMENT: ${robot.environment}
- Include 1–2 simple background cues that make the setting obvious (e.g., warehouse shelves, hospital hallway, forest canopy, window pane, pool tiles)
- Keep the background minimal and uncluttered

CONTROL: ${robot.control}
- ${controlHint}${mustIncludeSection}${avoidSection}

DESIGN RULES:
- Centered robot, full body visible
- White or very light background
- No humans, no text labels
- Friendly, approachable appearance
- Clean, uncluttered composition
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
 * Generate a single image for a robot with a specific style.
 *
 * @param {Object} robot - Robot definition.
 * @param {Object} style - Style from IMAGE_STYLES.
 * @returns {Promise<Buffer>} The image buffer.
 */
async function generateSingleImage(robot, style) {
  const prompt = buildPrompt(robot, style);
  const response = await openai.images.generate({
    model: 'gpt-image-1',
    prompt,
    n: 1,
    size: '1536x1024', // Larger landscape format for full-bleed card images
    quality: IMAGE_QUALITY,
  });
  return Buffer.from(response.data[0].b64_json, 'base64');
}

/**
 * Generate images for each robot definition in the robots array. For each robot,
 * two images are generated—one for each visual style (cartoon, realistic).
 * In debug mode, only one robot is processed for faster iteration.
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
      robotsToProcess = [robots[DEBUG_ROBOT_INDEX]];
      console.log(`Debug mode: generating images for "${robots[DEBUG_ROBOT_INDEX].name}" only (robot index ${DEBUG_ROBOT_INDEX})`);
    }
    console.log(`Debug mode: generating 3 styles at ${IMAGE_QUALITY} quality = 3 images`);
  }

  const styles = Object.values(IMAGE_STYLES);

  for (const robot of robotsToProcess) {
    console.log(`Generating images for: ${robot.name}…`);

    // Sanitize robot name for file names
    const safeName = robot.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    for (const style of styles) {
      const fileName = `${safeName}_${style.name}.png`;
      const filePath = path.join(outputDir, fileName);

      // Skip if file already exists
      try {
        await fs.access(filePath);
        console.log(`  Skipping ${style.name} style (${fileName} already exists)`);
        continue;
      } catch {
        // File doesn't exist, proceed with generation
      }

      try {
        console.log(`  Generating ${style.name} style...`);
        const imageBuffer = await generateSingleImage(robot, style);
        await fs.writeFile(filePath, imageBuffer);
        console.log(`    Saved ${fileName}`);
      } catch (error) {
        console.error(`  Error generating ${style.name} for ${robot.name}:`, error.message);
      }
    }
  }
  console.log('Image generation complete. Files are stored in the public/generated/ folder.');
}

// Run the script. Catch unhandled promise rejections to avoid silent
// failures on uncaught exceptions.
generateRobotImages().catch((err) => {
  console.error('Unexpected error:', err);
});

