from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store event info (in a real app, this would come from a database)
event_info = {
    "name": "ETH Global Paris",
    "location": "Paris, France",
    "time": int(datetime(2024, 7, 15).timestamp()),  # Example date
    "url": "https://ethglobal.paris",
    "image": "https://st3.depositphotos.com/2495409/12558/i/450/depositphotos_125585348-stock-photo-ticket-concept-3d-illustration.jpg"  # Replace with your image URL
}

@app.get("/")
async def root():
    return {"status": "running", "service": "NFT Metadata Server"}

@app.get("/metadata/{token_id}")
async def get_metadata(token_id: int):
    try:
        # Validate token_id is a positive integer
        if token_id < 1:
            raise HTTPException(status_code=400, detail="Invalid token ID")

        # Generate metadata for the token
        metadata = {
            "name": f"{event_info['name']} - Ticket #{token_id}",
            "description": f"Official ticket for {event_info['name']}",
            "image": event_info['image'],
            "attributes": [
                {
                    "trait_type": "Event Name",
                    "value": event_info['name']
                },
                {
                    "trait_type": "Location",
                    "value": event_info['location']
                },
                {
                    "trait_type": "Date",
                    "value": datetime.fromtimestamp(event_info['time']).strftime('%Y-%m-%d')
                },
                {
                    "trait_type": "Ticket Number",
                    "value": str(token_id)
                },
                {
                    "trait_type": "Event URL",
                    "value": event_info['url']
                }
            ]
        }
        return metadata
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# For development/hackathon purposes
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)