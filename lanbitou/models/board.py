from datetime import datetime, UTC
from typing import List
from sqlmodel import Field, SQLModel, Relationship


class Board(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: int = Field(foreign_key='user.id')
    create_time: datetime = Field(default_factory=lambda: datetime.now(UTC))
    last_update_time: datetime = Field(default_factory=lambda: datetime.now(UTC))
    tasks: List['task'] = Relationship(back_populates='board')
