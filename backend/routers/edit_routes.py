from fastapi import APIRouter, Depends, Query
from utils.JWT import check_auth_middleware
from controllers.edit_controller import EditorController

router = APIRouter(prefix="/editor", tags=["Editor"])


@router.get("/load/{file_id}")
async def load_file(file_id: str, user=Depends(check_auth_middleware)):
    return await EditorController.load_file(file_id, user)


@router.get("/docx/{file_id}/content")
async def get_docx_content(
    file_id: str,
    user=Depends(check_auth_middleware),
):
    return await EditorController.get_docx_content(file_id, user)


@router.post("/docx/{file_id}/save")
async def save_docx(file_id: str, data: dict, user=Depends(check_auth_middleware)):
    content = data.get("content")
    if content is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="Missing content")
    return await EditorController.save_docx(file_id, content, user)
