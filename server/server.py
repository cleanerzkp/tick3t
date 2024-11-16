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
# Add these imports and models at the top
from pydantic import BaseModel
import logging

class EncryptRequest(BaseModel):
    type: str  # 'tokens' or 'nft' or 'balance'
    amount: float
    contract_address: str
    message: str


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

@app.post("/encrypt")
async def encrypt_message(request: EncryptRequest):
    """Execute Lit Protocol encryption script"""
    try:
        cmd = ["node", "scripts/lit_protocol_encrypt.js", request.type, str(request.amount), request.contract_address, request.message]
        
        result = subprocess.run(
            cmd,
            capture_output=False,  # This will print directly to terminal
            text=True
        )
        
        if result.returncode != 0:
            raise HTTPException(
                status_code=500, 
                detail=f"Encryption failed"
            )
            
        return {"status": "success"}
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to encrypt message: {str(e)}"
        )


@app.post("/decrypt")
async def decrypt_message():
    """Execute Lit Protocol decryption script"""
    try:
        result = subprocess.run(
            ["node", "scripts/lit_protocol_decrypt.js"],
            capture_output=True,  # Capture the output
            text=True
        )
        
        # Print everything for debugging
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)
        
        # Parse the output
        if result.returncode != 0:
            raise HTTPException(
                status_code=500, 
                detail=f"Decryption failed: {result.stderr}"
            )

        try:
            # Try to parse the last non-empty line
            output_lines = [line for line in result.stdout.split('\n') if line.strip()]
            if not output_lines:
                raise HTTPException(
                    status_code=500,
                    detail="No output from decryption script"
                )
            
            last_line = output_lines[-1]
            print("Attempting to parse:", last_line)
            
            result_json = json.loads(last_line)
            return {
                "status": "success",
                "message": result_json["decryptedMessage"] if "decryptedMessage" in result_json else result_json
            }
            
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse JSON: {str(e)}, Output was: {last_line}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to decrypt message: {str(e)}"
        )
    

if __name__ == "__main__":
    
    # Configure logging
    uvicorn.config.logger = logging.getLogger("uvicorn")
    uvicorn.config.logger.handlers = []
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("uvicorn")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")



    