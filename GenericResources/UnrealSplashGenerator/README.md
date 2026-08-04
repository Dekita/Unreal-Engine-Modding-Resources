# Unreal Splash Generator

Batch-generates two images from every background in `input/`:

1. `output/bmp/name.bmp` — resized background with the overlay applied.
2. `output/branded/name-branded.png` — the same image with the logo added.

The BMP output is a genuine uncompressed 24-bit BMP suitable for Unreal Engine.

## Setup

1. Install [Node.js](https://nodejs.org/) 18 or newer.
2. Open a terminal in this folder and run:

   ```bash
   npm install
   ```

3. Add your files:

   ```text
   assets/overlay.png
   assets/logo.png
   input/background-one.jpg
   input/background-two.png
   ```

4. Adjust the `CONFIG` object at the top of `create-splashes.js` if required.
5. Run:

   ```bash
   npm start
   ```

## Useful settings

- `width` / `height`: final splash dimensions. Defaults to `600 x 200`.
- `backgroundPosition`: crop focus, such as `centre`, `top`, or `right`.
- `overlayOpacity`: opacity from `0` to `1`.
- `logoMaxWidth` / `logoMaxHeight`: maximum logo dimensions.
- `logoGravity`: `centre`, `north`, `south`, `east`, `west`, or a corner such as `southeast`.
- `logoOffsetX` / `logoOffsetY`: fine positioning in pixels.
- `brandedFormat`: `png`, `jpg`, or `webp`.
- `recursive`: process subfolders when set to `true`.

Transparent PNG files are recommended for both the overlay and logo.
