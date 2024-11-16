from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
from typing import List, Dict
import uvicorn
import subprocess
import tempfile
from pathlib import Path
from pydantic import BaseModel

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def execute_node_script():
    """Execute the Node.js script and return its result"""
    try:
        # Execute the Node.js script
        process = subprocess.Popen(
            ["node", "generate_email_proof.js"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate()
        
        if process.returncode != 0:
            raise HTTPException(
                status_code=500, 
                detail=f"Node.js script execution failed: {stderr}"
            )
            
        try:
            return json.loads(stdout)
        except json.JSONDecodeError:
            return {"raw_output": stdout}
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to execute Node.js script: {str(e)}"
        )

def load_nft_events():
    """Load NFT events data from JSON file"""
    try:
        with open('data/nft_metadata.json', 'r') as f:
            data = json.load(f)
            # Create a dictionary with index as key for faster lookup
            return {str(event['index']): event for event in data['events']}
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Events data file not found")

def load_crypto_events():
    """Load crypto events schedule data from JSON file"""
    try:
        with open('data/events_data.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Crypto events schedule file not found")

@app.get("/hello")
async def hello():
    return {"status": "running"}

@app.get("/metadata/{event_id}/{token_id}")
async def get_metadata(event_id: str, token_id: int):
    try:
        # Load events data
        events = load_nft_events()
        
        # Check if event exists
        if event_id not in events:
            raise HTTPException(status_code=404, detail=f"Event with ID {event_id} not found")
            
        # Check token ID
        if token_id < 1:
            raise HTTPException(status_code=400, detail="Invalid token ID")

        event = events[event_id]
        
        # Generate metadata for the token
        metadata = {
            "name": f"{event['name']} - Ticket #{token_id}",
            "description": f"Official ticket for {event['name']}",
            "image": event['image'],
            "attributes": [
                {
                    "trait_type": "Event Name",
                    "value": event['name']
                },
                {
                    "trait_type": "Location",
                    "value": event['location']
                },
                {
                    "trait_type": "Date",
                    "value": datetime.fromtimestamp(event['time']).strftime('%Y-%m-%d')
                },
                {
                    "trait_type": "Ticket Number",
                    "value": str(token_id)
                },
                {
                    "trait_type": "Event URL",
                    "value": event['url']
                }
            ]
        }
        return metadata
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/events")
async def get_all_events():
    """Get all crypto events schedule"""
    try:
        return load_crypto_events()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/generate-proof")
async def generate_proof():
    """Execute Node.js script and return result"""
    try:
        result = await execute_node_script()
        return {
            "status": "success",
            "result": result
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating proof: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)