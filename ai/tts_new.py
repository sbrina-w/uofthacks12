import os
import requests
import pygame
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get ElevenLabs API key and voice IDs
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
VOICE_ID_NORMAL = os.getenv('ELEVENLABS_VOICE_ID_NORMAL')
VOICE_ID_ANGRY = os.getenv('ELEVENLABS_VOICE_ID_ANGRY')

def speak_text(text, mood="normal"):
    """
    Convert text to speech using ElevenLabs API and save to file.
    Returns the filename if successful.
    """
    try:
        voice_id = VOICE_ID_NORMAL if mood == "normal" else VOICE_ID_ANGRY
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }
        
        data = {
            "text": text,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        # Save to a static location in the extension's public path
        speech_file_path = Path("website/public/speech.mp3")
        with open(speech_file_path, "wb") as f:
            f.write(response.content)
            
        return "/speech.mp3"  # Return the public URL path
        
    except Exception as e:
        print(f"Error generating speech: {str(e)}")
        return None

if __name__ == "__main__":
    # Test normal voice
    text = "Ah yes, Stanley was happy. He had followed all the instructions perfectly."
    print("\nTesting normal voice...")
    speak_text(text, mood="normal")
    
    # Test angry voice
    print("\nTesting angry voice...")
    speak_text("Stanley, you complete IMBECILE! This is NOT the correct way!", mood="angry")