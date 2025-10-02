import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json

class Rating(BaseModel):
    institution: str
    rating: int

# Dummy database
institutions_db = [
    {
        "id": "inst1",
        "name": "Æblerød Plejehjem",
        "ratings": [],
    },
]

# Store active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        """Send data to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except:
                # Remove broken connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

app = FastAPI()

# Add CORS middleware only in development
if os.getenv("ENVIRONMENT", "development") != "production":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/api/ratings/submit")
async def submit(input: Rating):
    submission = input.dict()
    rating = submission['rating']
    institution_id = submission['institution']

    # Fix: Loop through the list to find the institution
    for institution in institutions_db:
        if institution["id"] == institution_id:
            institution["ratings"].append(rating)
            
            # Broadcast updated data to all connected WebSocket clients
            await manager.broadcast({
                "type": "data_update",
                "data": institutions_db
            })
            
            return {"status": "Rating submitted successfully"}
    
    return {"error": f"Institution '{institution_id}' not found"}

@app.get("/api/data")
async def data():
    print("Institutions data requested: ", institutions_db)
    return institutions_db

@app.websocket("/api/data/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    # Send initial data when client connects
    await websocket.send_json({
        "type": "initial_data",
        "data": institutions_db
    })
    
    try:
        # Keep connection alive and handle incoming messages if needed
        while True:
            # You can receive messages from client here if needed
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

