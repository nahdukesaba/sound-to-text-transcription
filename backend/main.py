
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import whisper
import os
import uuid
import supabase
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None

@app.on_event("startup")
async def load_model():
    global model
    model = whisper.load_model("base")
    print("Whisper model loaded.")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase_client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase_client = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/health")
async def health_check():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=503, detail="Whisper model not loaded yet.")

    try:
        file_location = f"/tmp/{uuid.uuid4()}_{file.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(file.file.read())

        result = model.transcribe(file_location, fp16=False)
        transcription_text = result["text"]

        if supabase_client:
            supabase_client.table("transcriptions").insert({
                "filename": file.filename,
                "transcription": transcription_text
            }).execute()

        os.remove(file_location)

        return JSONResponse({"filename": file.filename, "transcription": transcription_text})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/")
async def get_history():
    if not supabase_client:
        return JSONResponse([])
    try:
        response = supabase_client.table("transcriptions").select("filename, transcription, created_at").order("created_at", desc=True).execute()
        return JSONResponse(response.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
