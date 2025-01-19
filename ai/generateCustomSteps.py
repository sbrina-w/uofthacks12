import os
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel
from typing import List

# Load environment variables
load_dotenv()

# Define our schema for steps
class TaskSteps(BaseModel):
    steps: List[str]

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_steps(task):
    """
    Generate concise steps (5 words max) for a computer task using structured output
    Args:
        task (str): The task description
    Returns:
        list: List of steps
    """
    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Generate 3-4 ultra-concise computer steps (max 5 words each). Focus on specific actions like 'Open Chrome', 'Go to gmail.com', 'Click compose'. Keep each step brief and actionable."
                },
                {
                    "role": "user",
                    "content": task
                }
            ],
            response_format=TaskSteps
        )
        
        return completion.choices[0].message.parsed.steps
    except Exception as e:
        print(f"Error generating steps: {str(e)}")
        return ["Open browser", "Navigate to site", "Complete task"]  # Fallback steps