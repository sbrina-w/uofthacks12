import os 
from pathlib import Path
from gtts import gTTS
import pygame
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def speak_text(text, mood="normal"):
    """Convert text to speech using Google TTS and play it using pygame"""
    try:
        # Create speech file
        speech_file_path = Path("speech.mp3")
        
        # Generate speech using gTTS
        tts = gTTS(text=text, lang='en', tld='co.uk')
        tts.save(str(speech_file_path))
        
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
        
        return True
        
    except Exception as e:
        print(f"Error generating speech: {str(e)}")
        return False