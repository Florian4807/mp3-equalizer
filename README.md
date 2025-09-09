# MP3 Equalizer

A web application for DJs and music enthusiasts to upload MP3 files and automatically equalize their volumes for consistent loudness across all tracks.

## Features

- 🎵 Upload multiple MP3 files at once
- 📊 Automatic volume analysis using ffmpeg
- 🎚️ Normalize all tracks to -23 LUFS (broadcast standard)
- 📦 Download processed files as a ZIP archive
- 🎧 Perfect for DJ sets and playlist creation
- 🚀 High-quality output (320kbps bitrate)

## Tech Stack

- **Frontend:** React with modern UI components
- **Backend:** FastAPI (Python) with async support
- **Audio Processing:** ffmpeg for professional-grade audio analysis and processing

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- ffmpeg installed on your system

### Installing ffmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

## Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 3. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Upload**: Select or drag & drop multiple MP3 files
2. **Analysis**: ffmpeg analyzes the loudness of each file using industry-standard LUFS measurement
3. **Processing**: Files are normalized to -23 LUFS with high-quality encoding
4. **Download**: Get a ZIP file with all your equalized tracks

## API Endpoints

- `POST /upload-mp3s` - Upload and process MP3 files
- `GET /download-processed` - Download processed files as ZIP
- `GET /health` - Health check and ffmpeg availability

## Audio Processing Details

The application uses a two-pass loudness normalization process:

1. **First Pass**: Measures integrated loudness, loudness range, and true peak
2. **Second Pass**: Applies normalization using measured values for optimal results

Target specifications:
- **Integrated Loudness**: -23 LUFS
- **True Peak**: -1.5 dBFS  
- **Loudness Range**: 11 LU
- **Output Quality**: 320kbps MP3, 44.1kHz

This ensures all your tracks will have consistent volume levels perfect for DJ mixing or streaming platforms.

## Development

### Project Structure

```
mp3-equalizer/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── audio_processor.py   # ffmpeg integration
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   └── components/     # UI components
│   └── package.json        # Node.js dependencies
└── README.md
```

### Running Tests

Backend tests:
```bash
cd backend
python -m pytest
```

Frontend tests:
```bash
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.