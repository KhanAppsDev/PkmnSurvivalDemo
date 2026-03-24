// ─── PMD Collab Sprite Loader ─────────────────────────────────────────────────
//
// PMD spritesheet format:
//   Each animation = separate PNG + AnimData.xml describing frame dims.
//   Sheet layout: rows = directions (S, SE, E, NE, N, NW, W, SW)
//                 cols = animation frames
//
// For the demo we load only "Walk" and "Idle" animations.
// We use only the SOUTH row (row 0) for simplicity in the demo.
// Full 8-direction support can be added later by reading all 8 rows.

const BASE_URL = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite';

/**
 * Zero-pad a dex number to 4 digits.
 * @param {number} id
 */
export function padId(id) {
  return String(id).padStart(4, '0');
}

/**
 * Build the URL to a specific animation sheet PNG.
 * @param {number} dexId   National dex number
 * @param {string} anim    Animation name e.g. 'Walk', 'Idle', 'Attack'
 * @param {number} form    Form index (default 0)
 */
export function getAnimUrl(dexId, anim, form = 0) {
  return `${BASE_URL}/${padId(dexId)}/${padId(form)}/${anim}-Anim.png`;
}

/**
 * Build the URL to AnimData.xml for a Pokémon.
 */
export function getAnimDataUrl(dexId, form = 0) {
  return `${BASE_URL}/${padId(dexId)}/${padId(form)}/AnimData.xml`;
}

/**
 * Fetch and parse AnimData.xml to get frame dimensions for a named animation.
 * Returns { frameW, frameH, frameCount, durations[] } or null if not found.
 *
 * @param {number} dexId
 * @param {string} animName  e.g. 'Walk'
 * @param {number} form
 */
export async function fetchAnimData(dexId, animName, form = 0) {
  try {
    const url = getAnimDataUrl(dexId, form);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');

    // Find the <Anim> node whose <Name> matches animName
    const anims = xml.querySelectorAll('Anim');
    let targetAnim = null;
    for (const anim of anims) {
      const nameEl = anim.querySelector('Name');
      if (nameEl && nameEl.textContent.trim() === animName) {
        targetAnim = anim;
        break;
      }
    }

    if (!targetAnim) return null;

    const frameW = parseInt(targetAnim.querySelector('FrameWidth')?.textContent  || '0');
    const frameH = parseInt(targetAnim.querySelector('FrameHeight')?.textContent || '0');

    // Parse per-frame durations
    const durations = [];
    const durationEls = targetAnim.querySelectorAll('Duration');
    for (const d of durationEls) {
      durations.push(parseInt(d.textContent || '6'));
    }

    const frameCount = durations.length || 1;

    return { frameW, frameH, frameCount, durations };
  } catch (err) {
    console.warn(`[SpriteLoader] AnimData fetch failed for ${dexId}/${animName}:`, err.message);
    return null;
  }
}

/**
 * Register a PMD Walk sprite into Phaser's loader for a given Pokémon.
 * Call this inside a Phaser Scene's preload() or via scene.load.
 *
 * We fetch AnimData first (async), so this function is async and resolves
 * before Phaser's load queue runs. Call it from an async create() + promiseAll pattern.
 *
 * @param {Phaser.Scene} scene
 * @param {number} dexId
 * @param {string} [animName]  Default 'Walk'
 * @param {number} [form]
 * @returns {Promise<{key:string, frameW:number, frameH:number, frameCount:number}|null>}
 */
export async function loadPokemonSprite(scene, dexId, animName = 'Walk', form = 0) {
  const key = `pmd_${dexId}_${animName.toLowerCase()}`;

  // If already loaded, skip
  if (scene.textures.exists(key)) {
    return { key, alreadyLoaded: true };
  }

  // 1. Fetch AnimData to get frame dimensions
  const animData = await fetchAnimData(dexId, animName, form);

  if (!animData || animData.frameW === 0) {
    console.warn(`[SpriteLoader] No valid AnimData for ${dexId}/${animName}. Using fallback.`);
    return null;
  }

  const { frameW, frameH, frameCount } = animData;

  // 2. Load the spritesheet into Phaser
  await new Promise((resolve, reject) => {
    const url = getAnimUrl(dexId, animName, form);

    scene.load.spritesheet(key, url, {
      frameWidth:  frameW,
      frameHeight: frameH,
    });

    scene.load.once('complete', resolve);
    scene.load.once('loaderror', (file) => {
      if (file.key === key) reject(new Error(`Load error: ${url}`));
    });

    scene.load.start();
  });

  return { key, frameW, frameH, frameCount, durations: animData.durations };
}

/**
 * Create a Phaser animation from a loaded PMD sheet.
 * PMD sheets: row 0 = South, row 1 = SouthEast, ..., row 7 = SouthWest.
 * For demo we only create the south-facing walk anim.
 *
 * @param {Phaser.Scene} scene
 * @param {string} textureKey   Key returned by loadPokemonSprite
 * @param {string} animKey      Name to register in Phaser's anim manager
 * @param {number} frameCount   Number of frames per row
 * @param {number} [row]        Direction row (0 = south)
 * @param {number} [fps]        Default 8
 */
export function createWalkAnim(scene, textureKey, animKey, frameCount, row = 0, fps = 8) {
  if (scene.anims.exists(animKey)) return;

  const frames = [];
  for (let f = 0; f < frameCount; f++) {
    // PMD sheets: frame index = row * frameCount + col
    frames.push({ key: textureKey, frame: row * frameCount + f });
  }

  scene.anims.create({
    key:       animKey,
    frames,
    frameRate: fps,
    repeat:    -1, // loop
  });
}

/**
 * All-in-one: load + register walk anim for a Pokémon.
 * Returns the animation key to play on a sprite, or null on failure.
 *
 * @param {Phaser.Scene} scene
 * @param {number} dexId
 * @param {number} [form]
 */
export async function setupPokemonWalkAnim(scene, dexId, form = 0) {
  const result = await loadPokemonSprite(scene, dexId, 'Walk', form);
  if (!result) return null;

  const animKey = `walk_${dexId}`;
  createWalkAnim(scene, result.key, animKey, result.frameCount, 0, 8);
  return { textureKey: result.key, animKey, frameW: result.frameW, frameH: result.frameH };
}
