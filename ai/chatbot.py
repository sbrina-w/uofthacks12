import os
from dotenv import load_dotenv
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage
from openai import OpenAI as OpenAIClient
from collections import deque

# Load environment variables
load_dotenv()

class Chatbot:
    def __init__(self):
        self.client = OpenAIClient(api_key=os.getenv('OPENAI_API_KEY'))
        self.previous_responses = deque(maxlen=10)
        self.current_tasks = []
        self.task_index = 0
        self.current_user = "the user"

    def get_context_prompt(self):
        """Create a context prompt from previous responses and current task"""
        task_context = f"{self.current_user} should be working on: {self.current_tasks[self.task_index] if self.current_tasks else 'No task set'}"
        if not self.previous_responses:
            return task_context + "\nThis is your first observation."
        
        context = f"{task_context}\n\nYour previous observations were:\n"
        for i, response in enumerate(self.previous_responses, 1):
            context += f"{i}. {response}\n"
        return context

    def analyze_screenshot(self, screenshot_base64):
        try:
            context_prompt = self.get_context_prompt()
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": f"""You are a narrator in the style of The Stanley Parable, observing {self.current_user}'s screen and their assigned task.

Your characteristics:
- Pay close attention to what's on screen and if it matches their assigned task
- When {self.current_user} is focused on their task: become quietly approving, subtle encouragement
- When {self.current_user} is distracted or off-task: unleash witty, entertainingly condescending commentary
- Be specific about what you see that indicates focus or distraction
- Maintain continuity with your previous observations
- Always refer to the user in third person as "{self.current_user}"
- Keep responses to one, concise impactful sentence"""
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"{context_prompt}\n\nExamine this new image - what is actually on {self.current_user}'s screen and how does it relate to what they're supposed to be doing?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{screenshot_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=100
            )
            
            analysis = response.choices[0].message.content
            self.previous_responses.append(analysis)
            return analysis

        except Exception as e:
            print(f"\n❌ GPT-4o Error: {str(e)}")
            return f"Analysis failed: {str(e)}"

    def update_user(self, username):
        self.current_user = username

    def update_tasks(self, tasks):
        self.current_tasks = tasks
        self.task_index = 0
        self.previous_responses.clear()