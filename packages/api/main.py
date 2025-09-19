from fastapi import FastAPI
from pydantic import BaseModel


class Rating(BaseModel):
    institution: str
    rating: int

# Dummy database
institutions_db = {
    "inst1": {
        "name": "Institution One",
        "ratings": [],
        },
}

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/data")
async def data():
    return {"message": institutions_db}


@app.post("/api/ratings/submit")
async def submit(input: Rating):
    submission = input.dict()
    rating = submission['rating']
    institution_id = submission['institution']

    if institution_id in institutions_db:
        institutions_db[institution_id]["ratings"].append(rating)
        return {"status": "Rating submitted successfully"}
    else:
        return {"error": f"Institution '{institution_id}' not found"}

