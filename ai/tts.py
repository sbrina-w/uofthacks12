import os
from pathlib import Path
import pygame
from gtts import gTTS

def speak_text(text, voice="en-GB"):
    """
    Convert text to speech using Google Text-to-Speech API and play it.
    
    Args:
        text (str): The text to convert to speech
        voice (str): The language/accent to use (default is British English)
    """
    try:
        # Create speech file
        speech_file_path = Path("speech.mp3")
        
        # Generate speech using gTTS
        tts = gTTS(text=text, lang='en', tld='co.uk')
        tts.save(str(speech_file_path))
        
        # Initialize pygame mixer
        pygame.mixer.init()
        
        # Load and play the audio
        pygame.mixer.music.load(str(speech_file_path))
        pygame.mixer.music.play()
        
        # Wait for the audio to finish playing
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
            
        # Clean up
        pygame.mixer.quit()
        
        # Remove the temporary audio file
        speech_file_path.unlink()
        
    except Exception as e:
        print(f"Error in text-to-speech: {str(e)}")

if __name__ == "__main__":
    # Test the function
    speak_text("Hello! This is a test of the text-to-speech system.")