import subprocess
import os
import json
from typing import List, Dict
import tempfile

class AudioProcessor:
    """Handles audio processing using ffmpeg for volume equalization"""
    
    def __init__(self, target_lufs: float = -23.0):
        """
        Initialize audio processor
        
        Args:
            target_lufs: Target loudness in LUFS (Loudness Units relative to Full Scale)
                        -23.0 LUFS is the standard for broadcast/streaming
        """
        self.target_lufs = target_lufs
    
    def check_ffmpeg(self) -> bool:
        """Check if ffmpeg is available on the system"""
        try:
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, text=True)
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    def get_loudness_info(self, file_path: str) -> Dict:
        """
        Get loudness information from an MP3 file using ffmpeg
        
        Args:
            file_path: Path to the MP3 file
            
        Returns:
            Dictionary containing loudness measurements
        """
        try:
            # Use ffmpeg to analyze loudness
            cmd = [
                'ffmpeg', '-i', file_path, '-af', 'loudnorm=I=-23:print_format=json',
                '-f', 'null', '-'
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, stderr=subprocess.STDOUT)
            
            # Extract JSON from stderr (ffmpeg outputs to stderr)
            output_lines = result.stderr.split('\n')
            json_start = -1
            
            for i, line in enumerate(output_lines):
                if line.strip().startswith('{'):
                    json_start = i
                    break
            
            if json_start == -1:
                raise Exception("Could not find loudness measurement data")
            
            # Find the end of JSON
            json_lines = []
            for line in output_lines[json_start:]:
                json_lines.append(line)
                if line.strip() == '}':
                    break
            
            json_str = '\n'.join(json_lines)
            loudness_data = json.loads(json_str)
            
            return loudness_data
            
        except Exception as e:
            raise Exception(f"Error analyzing loudness for {file_path}: {str(e)}")
    
    def normalize_loudness(self, input_path: str, output_path: str, target_lufs: float = None) -> bool:
        """
        Normalize the loudness of an MP3 file
        
        Args:
            input_path: Path to input MP3 file
            output_path: Path for output MP3 file
            target_lufs: Target loudness level (uses instance default if None)
            
        Returns:
            True if successful, False otherwise
        """
        if target_lufs is None:
            target_lufs = self.target_lufs
        
        try:
            # First pass: measure loudness
            loudness_info = self.get_loudness_info(input_path)
            
            # Extract measured values for second pass
            measured_i = loudness_info.get('input_i', '0')
            measured_tp = loudness_info.get('input_tp', '0')
            measured_lra = loudness_info.get('input_lra', '0')
            measured_thresh = loudness_info.get('input_thresh', '0')
            
            # Second pass: apply normalization
            cmd = [
                'ffmpeg', '-i', input_path,
                '-af', f'loudnorm=I={target_lufs}:TP=-1.5:LRA=11:measured_I={measured_i}:measured_LRA={measured_lra}:measured_TP={measured_tp}:measured_thresh={measured_thresh}:linear=true',
                '-ar', '44100',  # Standard sample rate
                '-b:a', '320k',  # High quality bitrate
                output_path, '-y'  # Overwrite output file
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"ffmpeg error: {result.stderr}")
            
            return True
            
        except Exception as e:
            raise Exception(f"Error normalizing {input_path}: {str(e)}")
    
    def equalize_volumes(self, input_files: List[str], output_dir: str) -> List[str]:
        """
        Equalize volumes across multiple MP3 files
        
        Args:
            input_files: List of paths to input MP3 files
            output_dir: Directory to save processed files
            
        Returns:
            List of paths to processed files
        """
        if not self.check_ffmpeg():
            raise Exception("ffmpeg is not available. Please install ffmpeg to process audio files.")
        
        processed_files = []
        
        for input_file in input_files:
            if not os.path.exists(input_file):
                continue
                
            filename = os.path.basename(input_file)
            output_file = os.path.join(output_dir, f"equalized_{filename}")
            
            try:
                success = self.normalize_loudness(input_file, output_file)
                if success:
                    processed_files.append(output_file)
                    print(f"Successfully processed: {filename}")
                else:
                    print(f"Failed to process: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")
                continue
        
        return processed_files
    
    def get_file_info(self, file_path: str) -> Dict:
        """
        Get basic information about an audio file
        
        Args:
            file_path: Path to the audio file
            
        Returns:
            Dictionary containing file information
        """
        try:
            cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', file_path]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception("Could not analyze file")
            
            return json.loads(result.stdout)
        except Exception as e:
            raise Exception(f"Error getting file info: {str(e)}")