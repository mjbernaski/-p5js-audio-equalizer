# Audio Visualizer

A real-time audio visualizer built with p5.js that displays frequency spectrum analysis and amplitude waveforms for MP3 files.

## Overview

This application creates dynamic visual representations of audio using Fast Fourier Transform (FFT) analysis. It includes multiple visualization modes and supports a library of songs loaded dynamically from a local server.

## Architecture

```
playwithNoise/
├── index.html        # Entry point, loads p5.js libraries
├── sketch.js         # Main visualization code
├── server.js         # Node.js server for serving files and song API
├── style.css         # Styles
├── libraries/
│   ├── p5.min.js         # p5.js core library
│   └── p5.sound.min.js   # p5.js sound library for audio analysis
└── songs/
    ├── *.mp3             # Audio files displayed in dropdown
    └── archive/          # UUID-named files (hidden from UI)
```

## How It Works

### Server (`server.js`)

A simple Node.js HTTP server that:

1. **Serves static files** - HTML, JS, CSS, and audio files
2. **Provides a REST API** (`/api/songs`) - Returns a JSON array of available songs from the `songs/` directory
   - Filters for `.mp3` files only
   - Cleans up filenames for display (replaces underscores with spaces)
   - Sorts alphabetically

### Client (`sketch.js`)

#### Initialization

1. **`setup()`** - Creates the canvas, initializes FFT and amplitude analyzers, and creates UI dropdowns
2. **`loadSongList()`** - Fetches available songs from `/api/songs` and populates the song selector dropdown

#### Audio Analysis

The app uses two p5.sound analyzers:

- **`p5.FFT`** - Fast Fourier Transform splits audio into 64 frequency bands (configurable via `bands` variable)
- **`p5.Amplitude`** - Tracks overall volume level over time

#### Visualization Modes

1. **Classic** - Traditional equalizer with vertical bars representing frequency bands. Lower frequencies on the left, higher on the right.

2. **Circular** - Frequency bars arranged radially around a center point, creating a circular pattern.

3. **Mirror** - Symmetrical display where frequencies mirror both horizontally and vertically from the center.

4. **Frequency Colors** - Similar to Classic but color-coded by frequency range:
   - Red: Bass (low frequencies)
   - Green: Mids
   - Blue/Cyan: Treble (high frequencies)

#### Visual Features

- **Peak markers** - White lines that show the maximum level reached for each frequency band, slowly decaying over time
- **Amplitude waveform** - A trailing line at the bottom showing overall volume over the duration of the song
- **Frequency labels** - Hz/kHz labels below bars showing the frequency range (based on 22050 Hz Nyquist frequency)

### User Interaction

- **Song selector dropdown** - Choose which song to play
- **Mode selector dropdown** - Switch between visualization modes
- **Click/tap on canvas** - Toggle play/pause

## Running the Application

1. Start the server:
   ```bash
   node server.js
   ```

2. Open a browser to `http://localhost:8000`

3. Select a song from the dropdown to begin playback

## Technical Details

### FFT Configuration

```javascript
fft = new p5.FFT(0.9, bands);
```

- `0.9` - Smoothing factor (0-1). Higher values create smoother transitions between frames
- `bands` - Number of frequency bins (default: 64)

### Frequency Calculation

The frequency for each band is calculated as:
```javascript
freq = (bandIndex / bands) * nyquist;  // nyquist = 22050 Hz
```

### Peak Decay

Peak markers decay at a rate of 0.1 units per frame:
```javascript
keepMax[i] -= 0.1;
```

## Dependencies

- [p5.js](https://p5js.org/) - Creative coding library for canvas rendering
- [p5.sound](https://p5js.org/reference/#/libraries/p5.sound) - Audio analysis and playback
- Node.js - Server runtime
