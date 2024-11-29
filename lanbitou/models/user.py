from datetime import datetime, UTC
from typing import List
from sqlmodel import Field, SQLModel, Relationship


class User(SQLModel, table=True):
    id: int = Field(primary_key=True)
    name: str = Field(nullable=False)
    create_time: datetime = Field(default_factory=lambda: datetime.now(UTC))
    last_update_time: datetime = Field(default_factory=lambda: datetime.now(UTC))
    boards: List['board'] = Relationship(back_populates='user')
