const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------
const CONFIG = {
    inputDir: path.resolve(__dirname, "input"),
    overlayPath: path.resolve(__dirname, "assets", "overlay.png"),
    logoPath: path.resolve(__dirname, "assets", "logo.png"),

    outputDir: path.resolve(__dirname, "output"),
    bmpFolder: "./",
    brandedFolder: "./",

    // Unreal's default game splash is commonly 600 x 200. Change if your project
    // expects another size.
    width: 720,
    height: 370,

    // cover fills the canvas and crops any excess without stretching.
    backgroundFit: "fill",
    backgroundPosition: "centre",

    // The overlay is stretched to the full canvas. Use a same-aspect-ratio PNG.
    overlayOpacity: 1,

    // Logo size is capped relative to the output canvas, while preserving its
    // aspect ratio. Set either value to null if only one limit is required.
    logoMaxWidth: 360,
    logoMaxHeight: 130,
    logoGravity: "centre",
    logoOffsetX: 0,
    logoOffsetY: 0,

    brandedSuffix: "-WithLogo",
    recursive: false,
};

const SUPPORTED_EXTENSIONS = new Set([
    ".avif", ".bmp", ".gif", ".heic", ".heif", ".jpeg", ".jpg",
    ".png", ".tif", ".tiff", ".webp",
]);

function validateConfig() {
    if (!Number.isInteger(CONFIG.width) || CONFIG.width <= 0) {
        throw new Error("CONFIG.width must be a positive integer.");
    }
    if (!Number.isInteger(CONFIG.height) || CONFIG.height <= 0) {
        throw new Error("CONFIG.height must be a positive integer.");
    }
    if (CONFIG.overlayOpacity < 0 || CONFIG.overlayOpacity > 1) {
        throw new Error("CONFIG.overlayOpacity must be between 0 and 1.");
    }
}

async function assertFile(filePath, label) {
    try {
        const stat = await fs.stat(filePath);
        if (!stat.isFile()) throw new Error();
    } catch {
        throw new Error(`${label} file not found: ${filePath}`);
    }
}

async function findImages(directory, recursive) {
    let entries;
    try {
        entries = await fs.readdir(directory, { withFileTypes: true });
    } catch {
        throw new Error(`Input folder not found: ${directory}`);
    }

    const files = [];
    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory() && recursive) {
            files.push(...await findImages(fullPath, true));
        } else if (entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
            files.push(fullPath);
        }
    }
    return files.sort((a, b) => a.localeCompare(b));
}

async function prepareOverlay() {
    let overlay = sharp(CONFIG.overlayPath)
        .resize(CONFIG.width, CONFIG.height, { fit: "fill" });

    if (CONFIG.overlayOpacity < 1) {
        overlay = overlay
        .ensureAlpha()
        .linear([1, 1, 1, CONFIG.overlayOpacity], [0, 0, 0, 0]);
    }
    return overlay.png().toBuffer();
}

async function prepareLogo() {
    return sharp(CONFIG.logoPath)
        .resize({
            width: CONFIG.logoMaxWidth,
            height: CONFIG.logoMaxHeight,
            fit: "inside",
            withoutEnlargement: true,
        })
        .png()
        .toBuffer();
}

async function processImage(imagePath, overlay, logo, bmpDir, brandedDir) {
    const baseName = path.parse(imagePath).name;

    // Stage 1: resize/crop the background and apply the shared overlay.
    const splash = await sharp(imagePath)
        .autoOrient()
        .resize(CONFIG.width, CONFIG.height, {
            fit: CONFIG.backgroundFit,
            position: CONFIG.backgroundPosition,
        })
        .composite([{ input: overlay, gravity: "centre" }])
        .removeAlpha()
        .png()
        .toBuffer();

    // Save the unbranded splash as a genuine uncompressed 24-bit BMP.
    const { data: rgb, info } = await sharp(splash)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    const bmp = encodeBmp24(rgb, info.width, info.height, info.channels);
    await fs.writeFile(path.join(bmpDir, `${baseName}.bmp`), bmp);

    // Stage 2: add the logo, then save a secondary web-friendly copy.
    const logoLayer = await createPositionedLogo(logo);
    const { data: brandedRgb, info: brandedInfo } = await sharp(splash)
        .composite([{ input: logoLayer, left: 0, top: 0 }])
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const brandedBmp = encodeBmp24(
        brandedRgb,
        brandedInfo.width,
        brandedInfo.height,
        brandedInfo.channels,
    );

    await fs.writeFile(path.join(brandedDir, `${baseName}${CONFIG.brandedSuffix}.bmp`), brandedBmp);    
}

async function createPositionedLogo(logo) {
    const { width, height } = await sharp(logo).metadata();
    const position = calculatePosition(
        CONFIG.logoGravity,
        CONFIG.width,
        CONFIG.height,
        width,
        height,
    );

    const left = clamp(position.left + CONFIG.logoOffsetX, 0, CONFIG.width - width);
    const top = clamp(position.top + CONFIG.logoOffsetY, 0, CONFIG.height - height);

    return sharp({
        create: {
            width: CONFIG.width,
            height: CONFIG.height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    })
        .composite([{ input: logo, left, top }])
        .png()
        .toBuffer();
}

function calculatePosition(gravity, canvasWidth, canvasHeight, itemWidth, itemHeight) {
    const x = {
        west: 0,
        centre: Math.floor((canvasWidth - itemWidth) / 2),
        east: canvasWidth - itemWidth,
    };
    const y = {
        north: 0,
        centre: Math.floor((canvasHeight - itemHeight) / 2),
        south: canvasHeight - itemHeight,
    };

    const positions = {
        northwest: { left: x.west, top: y.north },
        north: { left: x.centre, top: y.north },
        northeast: { left: x.east, top: y.north },
        west: { left: x.west, top: y.centre },
        centre: { left: x.centre, top: y.centre },
        east: { left: x.east, top: y.centre },
        southwest: { left: x.west, top: y.south },
        south: { left: x.centre, top: y.south },
        southeast: { left: x.east, top: y.south },
    };

    if (!positions[gravity]) {
        throw new Error(`Unsupported logoGravity: ${gravity}`);
    }
    return positions[gravity];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Sharp does not provide BMP output. This writes an uncompressed 24-bit BMP
// from Sharp's RGB pixel buffer. BMP scanlines are stored bottom-up and padded
// to a multiple of four bytes.
function encodeBmp24(rgb, width, height, channels) {
    if (channels < 3) throw new Error("BMP encoding requires RGB pixel data.");

    const rowSize = Math.ceil((width * 3) / 4) * 4;
    const pixelDataSize = rowSize * height;
    const headerSize = 54;
    const output = Buffer.alloc(headerSize + pixelDataSize);

    output.write("BM", 0, 2, "ascii");
    output.writeUInt32LE(output.length, 2);
    output.writeUInt32LE(headerSize, 10);
    output.writeUInt32LE(40, 14);
    output.writeInt32LE(width, 18);
    output.writeInt32LE(height, 22);
    output.writeUInt16LE(1, 26);
    output.writeUInt16LE(24, 28);
    output.writeUInt32LE(pixelDataSize, 34);
    output.writeInt32LE(2835, 38);
    output.writeInt32LE(2835, 42);

    for (let y = 0; y < height; y += 1) {
        const sourceY = height - 1 - y;
        const targetRow = headerSize + (y * rowSize);
        for (let x = 0; x < width; x += 1) {
            const source = ((sourceY * width) + x) * channels;
            const target = targetRow + (x * 3);
            output[target] = rgb[source + 2];
            output[target + 1] = rgb[source + 1];
            output[target + 2] = rgb[source];
        }
    }

    return output;
}

async function main() {
    validateConfig();

    const bmpDir = path.join(CONFIG.outputDir, CONFIG.bmpFolder);
    const brandedDir = path.join(CONFIG.outputDir, CONFIG.brandedFolder);
    await Promise.all([
        fs.mkdir(bmpDir, { recursive: true }),
        fs.mkdir(brandedDir, { recursive: true }),
    ]);

    await Promise.all([
        assertFile(CONFIG.overlayPath, "Overlay"),
        assertFile(CONFIG.logoPath, "Logo"),
    ]);

    const imagePaths = await findImages(CONFIG.inputDir, CONFIG.recursive);
    if (imagePaths.length === 0) {
        throw new Error(`No supported images found in: ${CONFIG.inputDir}`);
    }

    const overlay = await prepareOverlay();
    const logo = await prepareLogo();

    let succeeded = 0;
    for (const imagePath of imagePaths) {
        try {
            await processImage(imagePath, overlay, logo, bmpDir, brandedDir);
            succeeded += 1;
            console.log(`Created: ${path.basename(imagePath)}`);
        } catch (error) {
            console.error(`Failed: ${imagePath}\n  ${error.message}`);
        }
    }

    console.log(`\nFinished: ${succeeded}/${imagePaths.length} images processed.`);
    if (succeeded !== imagePaths.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exitCode = 1;
});
