"""Chatbot route — AI-powered career assistant."""

from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.models import ChatMessage, ChatResponse
from app.ai.chatbot import CareerChatbot
from app.database import get_database

router = APIRouter(prefix="/chat", tags=["Chatbot"])

@router.post("/", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    current_user: dict = Depends(get_current_user),
):
    """Process a chatbot message and return a response."""
    # Debug log
    print(f"[Chat] Incoming message from user {str(current_user['_id'])}: {message.message}")
    
    db = get_database()
    chatbot = CareerChatbot(db)
    
    user_id = str(current_user["_id"])
    response_text = await chatbot.get_response(user_id, message.message, history=message.history)

    print(f"[Chat] Generated response for user {str(current_user['_id'])}")

    return ChatResponse(
        reply=response_text,
        suggested_jobs=[], # Handled within structured reply now
        intent="general",
    )
