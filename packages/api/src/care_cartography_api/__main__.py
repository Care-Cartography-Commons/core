import os, re
from uuid import uuid4
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Response
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from .database import get_db, engine, Base
from . import models
from .qrcode import generate_qr_code

# Load environment variables from .env file
# Look for .env in the project root (3 levels up from this file)
env_path = Path(__file__).resolve().parent.parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class RatingInput(BaseModel):
    institution: str
    rating: int

class InstitutionCreate(BaseModel):
    name: str

class InstitutionUpdate(BaseModel):
    name: str
    status: models.InstitutionStatus

def get_qr_code_url(institution_id: str) -> str:
    """Helper function to generate QR code URL for an institution"""
    base_url = os.getenv("PROJECT_BASE_URL", "http://localhost:8000")
    return f"{base_url}/api/institutions/{institution_id}/qrcode"

def get_artwork_data(db: Session):
    """Helper function to get all institutions with their ratings"""
    institutions = db.query(models.Institution).all()
    return [
        {
            "id": inst.id,
            "name": inst.name,
            "ratings": [r.rating for r in inst.ratings],
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
    institutions_data = get_artwork_data(db)

    # Broadcast updated data to all connected WebSocket clients
    await manager.broadcast({
        "type": "data_update",
        "data": institutions_data
    })

    return {"status": "Rating submitted successfully"}


@app.websocket("/api/data/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(websocket)

    # Send initial data when client connects
    institutions_data = get_artwork_data(db)
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

# Institution CRUD endpoints

@app.get("/api/institutions")
async def list_institutions(db: Session = Depends(get_db)):
    """List all institutions with their ratings"""
    institutions = db.query(models.Institution).all()
    return [
        {
            "id": inst.id,
            "name": inst.name,
            "created_at": inst.created_at.isoformat(),
            "rating_count": len(inst.ratings),
            "status": inst.status,
            "qr_url": get_qr_code_url(str(inst.id)),
        }
        for inst in institutions
    ]

@app.post("/api/institutions")
async def create_institution(institution: InstitutionCreate, db: Session = Depends(get_db)):
    """Create a new institution"""

    # Generate unique institution ID and URL for rating
    new_institution_id = uuid4().hex
    new_institution_rate_url = f"{os.getenv('PROJECT_BASE_URL', 'http://localhost:8000')}/rate/{new_institution_id}"

    # Check if institution ID already exists
    existing = db.query(models.Institution).filter(
        models.Institution.id == new_institution_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Institution with this ID already exists")

    # Create new institution
    new_institution = models.Institution(
        id=new_institution_id,
        name=institution.name,
        status=models.InstitutionStatus.INACTIVE.value,
        qr_code_svg=generate_qr_code(new_institution_rate_url)
    )
    db.add(new_institution)
    db.commit()
    db.refresh(new_institution)

    return {
        "id": new_institution.id,
        "name": new_institution.name,
        "created_at": new_institution.created_at.isoformat(),
        "rating_count": 0,
        "status": new_institution.status,
        "url": new_institution_rate_url,
    }

@app.get("/api/institutions/{institution_id}")
async def get_institution(institution_id: str, db: Session = Depends(get_db)):
    """Get a single institution with all its ratings"""
    institution = db.query(models.Institution).filter(
        models.Institution.id == institution_id
    ).first()

    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")

    return {
        "id": institution.id,
        "name": institution.name,
        "created_at": institution.created_at.isoformat(),
        "rating_count": len(institution.ratings),
        "status": institution.status,
        "ratings": [
            {
                "id": r.id,
                "rating": r.rating,
                "created_at": r.created_at.isoformat()
            }
            for r in institution.ratings
        ]
    }

@app.get("/api/institutions/{institution_id}/qrcode")
async def get_qr_code(institution_id: str, db: Session = Depends(get_db)):
    # Fetch institution from database
    institution = db.query(models.Institution).filter(models.Institution.id == institution_id).first()
    
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found, cannot retrieve QR code")
    
    # Return the SVG string with proper content type and filename
    sanitized_name = re.sub(r'[^\w]', '', str(institution.name))
    sanitized_name = re.sub(r' +', '_', sanitized_name)
    return Response(
        content=institution.qr_code_svg,
        media_type="image/svg+xml",
        headers={
            "Content-Disposition": f'attachment; filename="{sanitized_name}-qrcode.svg"'
        }
    )

@app.put("/api/institutions/{institution_id}")
async def update_institution(
    institution_id: str,
    institution_data: InstitutionUpdate,
    db: Session = Depends(get_db)
):
    """Update an institution"""
    db_institution = db.query(models.Institution).filter(
        models.Institution.id == institution_id
    ).first()

    if not db_institution:
        raise HTTPException(status_code=404, detail="Institution not found")

    db_institution.name = institution_data.name # type: ignore
    db.commit()
    db.refresh(db_institution)

    return {
        "id": db_institution.id,
        "name": db_institution.name,
        "created_at": db_institution.created_at.isoformat(),
        "rating_count": len(db_institution.ratings)
    }

@app.delete("/api/institutions/{institution_id}")
async def delete_institution(institution_id: str, db: Session = Depends(get_db)):
    """Delete an institution and all its ratings"""
    db_institution = db.query(models.Institution).filter(
        models.Institution.id == institution_id
    ).first()

    if not db_institution:
        raise HTTPException(status_code=404, detail="Institution not found")

    db.delete(db_institution)
    db.commit()

    return {"status": "success", "message": f"Institution '{institution_id}' deleted"}

