"""
BERT Embedding Module
- Uses sentence-transformers to generate embeddings
- Calculates cosine similarity between resume and job embeddings
"""

import numpy as np
from typing import List, Optional
from functools import lru_cache

# Lazy-loaded model
_model = None


def _get_model():
    """Lazy-load the sentence-transformer model."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            print("🔄 Loading BERT model (first time may take a minute)...")
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            print("✅ BERT model loaded successfully")
        except Exception as e:
            print(f"⚠️ Could not load BERT model: {e}")
            _model = None
    return _model


def generate_embedding(text: str) -> Optional[List[float]]:
    """Generate a 384-dimensional embedding for the given text."""
    model = _get_model()
    if model is None:
        # Fallback: return a random embedding for demo purposes
        return np.random.randn(384).tolist()

    # Truncate to model's max sequence length
    text = text[:8000]
    embedding = model.encode(text, show_progress_bar=False)
    return embedding.tolist()


def calculate_cosine_similarity(embedding1: List[float], embedding2: List[float]) -> float:
    """Calculate cosine similarity between two embeddings."""
    vec1 = np.array(embedding1)
    vec2 = np.array(embedding2)

    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)

    if norm1 == 0 or norm2 == 0:
        return 0.0

    similarity = dot_product / (norm1 * norm2)
    return float(max(0.0, min(1.0, similarity)))


def batch_generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for multiple texts at once (more efficient)."""
    model = _get_model()
    if model is None:
        return [np.random.randn(384).tolist() for _ in texts]

    truncated = [t[:8000] for t in texts]
    embeddings = model.encode(truncated, show_progress_bar=False, batch_size=32)
    return [e.tolist() for e in embeddings]
