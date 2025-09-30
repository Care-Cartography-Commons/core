import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

class Rating(BaseModel):
    institution: str
    rating: int

# Dummy database
institutions_db = [
    {
        "id": "inst0",
        "name": "Kaffekoppen",
        "ratings": [1, 3, 2, 3],
    },
    {
        "id": "inst1",
        "name": "Æblerød Café",
        "ratings": [],
    },
]

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

@app.get("/api/data")
async def data():
    print("Institutions data requested: ", institutions_db)
    return institutions_db

@app.post("/api/ratings/submit")
async def submit(input: Rating):
    submission = input.dict()
    rating = submission['rating']
    institution_id = submission['institution']

    # Fix: Loop through the list to find the institution
    for institution in institutions_db:
        if institution["id"] == institution_id:
            institution["ratings"].append(rating)
            return {"status": "Rating submitted successfully"}
    
    return {"error": f"Institution '{institution_id}' not found"}

