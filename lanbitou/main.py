from fastapi import FastAPI

from .routers import board, task, user

app = FastAPI()

app.include_router(board.router)
app.include_router(task.router)
app.include_router(user.router)

