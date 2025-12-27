import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

print(f"URL found: {bool(url)}")
if url:
    print(f"URL starts with: {url[:8]}...")
    print(f"URL is placeholder: {url == 'your_supabase_url_here'}")

print(f"KEY found: {bool(key)}")
