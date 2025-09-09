from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import shutil
import tempfile
import zipfile
from typing import List
from audio_processor import AudioProcessor

app = FastAPI(title="MP3 Equalizer API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

audio_processor = AudioProcessor()

@app.get("/")
async def root():
    return {"message": "MP3 Equalizer API"}

@app.post("/upload-mp3s")
async def upload_mp3s(files: List[UploadFile] = File(...)):
    """Upload multiple MP3 files and process them for volume equalization"""
    
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    # Validate file types
    for file in files:
        if not file.filename.lower().endswith('.mp3'):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an MP3 file")
    
    try:
        # Create temporary directories
        with tempfile.TemporaryDirectory() as temp_dir:
            input_dir = os.path.join(temp_dir, "input")
            output_dir = os.path.join(temp_dir, "output")
            os.makedirs(input_dir)
            os.makedirs(output_dir)
            
            # Save uploaded files
            file_paths = []
            for file in files:
                file_path = os.path.join(input_dir, file.filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                file_paths.append(file_path)
            
            # Process files for volume equalization
            processed_files = audio_processor.equalize_volumes(file_paths, output_dir)
            
            # Create ZIP file with processed MP3s
            zip_path = os.path.join(temp_dir, "equalized_mp3s.zip")
            with zipfile.ZipFile(zip_path, 'w') as zip_file:
                for processed_file in processed_files:
                    zip_file.write(processed_file, os.path.basename(processed_file))
            
            # Copy ZIP to a permanent location for download
            permanent_zip = "/tmp/equalized_mp3s.zip"
            shutil.copy2(zip_path, permanent_zip)
            
            return {
                "message": f"Successfully processed {len(processed_files)} MP3 files",
                "processed_count": len(processed_files),
                "download_url": "/download-processed"
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing files: {str(e)}")

@app.get("/download-processed")
async def download_processed():
    """Download the ZIP file containing processed MP3s"""
    zip_path = "/tmp/equalized_mp3s.zip"
    
    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="No processed files available for download")
    
    return FileResponse(
        zip_path,
        media_type='application/zip',
        filename="equalized_mp3s.zip"
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "ffmpeg_available": audio_processor.check_ffmpeg()}