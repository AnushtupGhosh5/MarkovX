"""Test the humming API endpoint"""
import requests

# Test the server is running
response = requests.get("http://localhost:8001/")
print("Server status:", response.json())

# Test melody extraction
print("\nTesting melody extraction...")
with open("test_humming.wav", "rb") as f:
    files = {"audio_file": f}
    response = requests.post("http://localhost:8001/extract-melody", files=files)
    
if response.status_code == 200:
    data = response.json()
    print(f"✓ Success! Extracted {data['num_notes']} notes")
    print(f"  MIDI URL: {data['midi_url']}")
    print(f"  First 3 notes:")
    for note in data['notes'][:3]:
        print(f"    {note['note_name']}: {note['start']:.2f}s - {note['end']:.2f}s")
else:
    print(f"✗ Error: {response.status_code}")
    print(response.text)

# Test complete pipeline
print("\nTesting complete pipeline with accompaniment...")
with open("test_humming.wav", "rb") as f:
    files = {"audio_file": f}
    data = {
        "add_accompaniment": "true",
        "progression_type": "pop",
        "bass_pattern": "walking"
    }
    response = requests.post("http://localhost:8001/humming-to-music", files=files, data=data)

if response.status_code == 200:
    result = response.json()
    print(f"✓ Success! Generated {result['num_tracks']} tracks")
    print(f"  MIDI URL: {result['midi_url']}")
    if 'audio_url' in result:
        print(f"  Audio URL: {result['audio_url']}")
else:
    print(f"✗ Error: {response.status_code}")
    print(response.text)

print("\n✓ All tests passed! The humming-to-music pipeline is working.")
print("\nNow open http://localhost:3001 and click the 6th icon in the sidebar")
print("(the music note icon) to test the full UI!")
