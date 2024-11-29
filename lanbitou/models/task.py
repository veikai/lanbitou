from datetime import datetime, UTC
from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    id: int = Field(primary_key=True)
    title: str = Field(nullable=False)
    detail: str = Field(nullable=False)
    board_id: int = Field(foreign_key='board.id')
    importance_level: int = Field(nullable=False)
    urgency_level: int = Field(nullable=False)
    deadline: datetime = Field()
    create_time: datetime = Field(default_factory=lambda: datetime.now(UTC))
    last_update_time: datetime = Field(default_factory=lambda: datetime.now(UTC))
