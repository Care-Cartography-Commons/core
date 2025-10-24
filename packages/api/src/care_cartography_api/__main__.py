import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from .database import get_db, engine, Base
from . import models

class RatingInput(BaseModel):
    institution: str
    rating: int

def get_institutions_data(db: Session):
    """Helper function to get all institutions with their ratings"""
    institutions = db.query(models.Institution).all()
    return [
        {
            "id": inst.id,
            "name": inst.name,
            "ratings": [r.rating for r in inst.ratings]
        }
        for inst in institutions
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup if needed

app = FastAPI(lifespan=lifespan)

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
async def submit(input: RatingInput, db: Session = Depends(get_db)):
    # Find the institution
    institution = db.query(models.Institution).filter(
        models.Institution.id == input.institution
    ).first()

    if not institution:
        return {"error": f"Institution '{input.institution}' not found"}

    # Create a new rating
    new_rating = models.Rating(
        institution_id=input.institution,
        rating=input.rating
    )
    db.add(new_rating)
    db.commit()

    # Get all institutions with their ratings for broadcast
    institutions_data = get_institutions_data(db)

    # Broadcast updated data to all connected WebSocket clients
    await manager.broadcast({
        "type": "data_update",
        "data": institutions_data
    })

    return {"status": "Rating submitted successfully"}

@app.get("/api/data")
async def data(db: Session = Depends(get_db)):
    institutions_data = get_institutions_data(db)
    print("Institutions data requested: ", institutions_data)
    return institutions_data

@app.websocket("/api/data/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(websocket)

    # Send initial data when client connects
    institutions_data = get_institutions_data(db)
    await websocket.send_json({
        "type": "initial_data",
        "data": institutions_data
    })

    try:
        # Keep connection alive and handle incoming messages if needed
        while True:
            # You can receive messages from client here if needed
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

