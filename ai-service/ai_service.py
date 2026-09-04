from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class AnalyzeRequest(BaseModel):
    code_diff: str

@app.post("/analyze")
def analyze_code(request: AnalyzeRequest):
    # Trả về kết quả phân tích giả lập nhưng chuẩn định dạng AI
    return {
        "status": "success",
        "severity": "HIGH",
        "confidence_score": "94% (AST Semantic Match)",
        "suggestion": "Tài liệu phát hiện hàm mới UserController.mfaVerify() chưa được đặc tả. Đề xuất bổ sung endpoint POST /api/v1/auth/mfa/verify vào file API_Endpoints.md."
    }
