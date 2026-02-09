from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, validator


class TaskBase(BaseModel):
    """Base schema for task data."""
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, max_length=2000, description="Task description")
    deadline: Optional[datetime] = Field(None, description="Task deadline")


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, max_length=2000, description="Task description")
    deadline: Optional[datetime] = Field(None, description="Task deadline")

    # Validation for at least one field will be handled in service layer


class TaskResponse(TaskBase):
    """Schema for task response."""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)  # Enable ORM mode


class TaskListResponse(BaseModel):
    """Schema for paginated task list response."""
    tasks: List[TaskResponse]
    total: int
    skip: int
    limit: int


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    error: str
    message: str
    request_id: Optional[str] = None