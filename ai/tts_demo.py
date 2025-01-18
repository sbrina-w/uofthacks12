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
    Convert text to speech using ElevenLabs API and play it.
    Args:
        text (str): Text to convert to speech
        mood (str): Either "normal" or "angry" to select voice
    """
    try:
        # Select voice based on mood
        voice_id = VOICE_ID_NORMAL if mood == "normal" else VOICE_ID_ANGRY
        
        # Define API endpoint and headers
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }
        
        # Request body
        data = {
            "text": text,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
        
        # Make API request
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        # Save and play audio
        speech_file_path = Path("speech.mp3")
        with open(speech_file_path, "wb") as f:
            f.write(response.content)
            
        # Initialize pygame mixer
        pygame.mixer.init()
        
        # Load and play audio
        pygame.mixer.music.load(str(speech_file_path))
        pygame.mixer.music.play()
        
        # Wait for audio to finish
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
            
        # Cleanup
        pygame.mixer.quit()
        speech_file_path.unlink()
        
    except Exception as e:
        print(f"Error in text-to-speech: {str(e)}")

if __name__ == "__main__":
    # Test normal voice
    text = "Ah yes, Stanley was happy. He had followed all the instructions perfectly."
    print("\nTesting normal voice...")
    speak_text(text, mood="normal")
    
    # Test angry voice
    print("\nTesting angry voice...")
    speak_text("Stanley, you complete IMBECILE! This is NOT the correct way!", mood="angry")