import json

teams = {
    "timberwolves": "timberwolves_players.json",
    "knicks": "knicks_players.json",
    "pacers": "pacers_players.json",
    "thunder": "thunder_players.json"
}

combined = {}

for team, filename in teams.items():
    with open(filename, 'r') as f:
        try:
            data = json.load(f)
            combined[team] = data
        except json.JSONDecodeError:
            print(f"⚠️ Could not decode {filename}")
            combined[team] = []

with open('playersMeta.json', 'w') as out:
    json.dump(combined, out, indent=2)

print("✅ All player data combined into playersMeta.json")
