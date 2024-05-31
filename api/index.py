from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import ChatTTS
import torchaudio
import torch
import numpy as np
import io
import wave
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat = ChatTTS.Chat()
chat.load_models(compile=False)


@app.post("/generate_audio/")
async def generate_audio(request: Request):
    req_data = await request.json()
    if "text" not in req_data:
        raise HTTPException(
            status_code=400, detail="Missing 'text' field in request body"
        )

    text = req_data["text"]
    texts = [text]
    wavs = chat.infer(texts, use_decoder=True)

    if len(wavs[0].shape) > 1:
        print("Before squeeze: ", wavs[0].shape)
        wav_data = wavs[0].squeeze()
        print("After squeeze: ", wav_data.shape)
    else:
        wav_data = wavs[0]

    wav_data = (wav_data * 32767).astype(np.int16)

    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)
        wf.writeframes(wav_data.tobytes())
    buffer.seek(0)

    print("Audio file size: ", len(buffer.getvalue()))

    return StreamingResponse(buffer, media_type="audio/wav")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
