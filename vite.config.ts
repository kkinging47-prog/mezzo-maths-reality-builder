import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// The mission artwork was uploaded under `Public/footbridge` and the uploaded
// filenames currently end in `.png.png`. Keep those original files intact,
// but expose the clean `/footbridge/<name>.png` URLs expected by the UI.
function normalizeFootbridgeArtwork() {
  return {
    name: 'normalize-footbridge-artwork',
    closeBundle() {
      const dir = join(process.cwd(), 'dist', 'footbridge');
      if (!existsSync(dir)) return;
      for (const filename of readdirSync(dir)) {
        if (!filename.endsWith('.png.png')) continue;
        const cleanName = filename.slice(0, -4);
        copyFileSync(join(dir, filename), join(dir, cleanName));
      }
    },
  };
}

export default defineConfig({
  // This repository currently uses an uppercase Public directory.
  publicDir: 'Public',
  plugins: [react(), normalizeFootbridgeArtwork()],
});
