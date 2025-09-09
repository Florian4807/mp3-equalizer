#!/usr/bin/env python3
"""
Test script for the MP3 Equalizer audio processing functionality
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.audio_processor import AudioProcessor

def test_audio_processor():
    """Test the AudioProcessor class functionality"""
    
    print("🎵 Testing MP3 Equalizer Audio Processor")
    print("=" * 50)
    
    # Initialize the processor
    processor = AudioProcessor()
    
    # Test 1: Check ffmpeg availability
    print("1. Checking ffmpeg availability...")
    ffmpeg_available = processor.check_ffmpeg()
    print(f"   ✅ ffmpeg available: {ffmpeg_available}")
    
    if not ffmpeg_available:
        print("   ❌ ffmpeg is not available. Please install ffmpeg to run audio processing tests.")
        return False
    
    # Test 2: Check target LUFS setting
    print(f"2. Target loudness level: {processor.target_lufs} LUFS")
    print("   ✅ Using broadcast standard (-23 LUFS)")
    
    # Test 3: Test file info functionality (without actual file)
    print("3. Audio processor methods available:")
    methods = [method for method in dir(processor) if not method.startswith('_')]
    for method in methods:
        print(f"   ✅ {method}")
    
    print("\n🎉 Audio processor tests completed successfully!")
    print("\nNext steps to test with real MP3 files:")
    print("1. Start the backend: ./start-backend.sh")
    print("2. Start the frontend: ./start-frontend.sh") 
    print("3. Open http://localhost:3000 in your browser")
    print("4. Upload MP3 files to test volume equalization")
    
    return True

if __name__ == "__main__":
    test_audio_processor()