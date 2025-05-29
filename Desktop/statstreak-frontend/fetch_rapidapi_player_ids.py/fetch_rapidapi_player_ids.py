import requests
import json

# === CONFIGURE THESE VALUES ===
RAPIDAPI_KEY = "4f07fe5986mshae6a883dc4095f8p138cbfjsn01452a875590"
SEASON = "2024"
TEAM_ID = 22 # Replace with desired team ID (e.g., 24 = Timberwolves)

# === SETUP ===
url = f"https://api-nba-v1.p.rapidapi.com/players?team={TEAM_ID}&season={SEASON}"
headers = {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com"
}

# === FETCH PLAYER DATA ===
response = requests.get(url, headers=headers)
data = response.json()

# === EXTRACT RELEVANT PLAYER INFO ===
players = data.get("response", [])

cleaned_players = [
    {
        "id": player.get("id"),
        "firstname": player.get("firstname"),
        "lastname": player.get("lastname"),
        "team": player.get("team", {}).get("name"),
        "position": player.get("leagues", {}).get("standard", {}).get("pos"),
        "jersey": player.get("leagues", {}).get("standard", {}).get("jersey")
    }
    for player in players
]

# === SAVE TO JSON FILE ===
filename = f"team_{TEAM_ID}_players.json"
with open(filename, "w") as f:
    json.dump(cleaned_players, f, indent=2)

print(f"✅ Saved {len(cleaned_players)} players to {filename}")
