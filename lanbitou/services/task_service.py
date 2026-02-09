from typing import List, Optional, Dict, Any
from datetime import datetime

from lanbitou.db.repositories import TaskRepository
from lanbitou.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse


class TaskService:
    """Service layer for task business logic."""

    def __init__(self, repository: TaskRepository = None):
        self.repository = repository or TaskRepository()

    def create_task(self, task_data: TaskCreate) -> TaskResponse:
        """Create a new task."""
        # Convert Pydantic model to dict
        task_dict = task_data.model_dump(exclude_unset=True)

        # Create task via repository
        task = self.repository.create(task_dict)

        # Convert to response model
        return TaskResponse.model_validate(task)

    def get_task(self, task_id: int) -> Optional[TaskResponse]:
        """Get a task by ID."""
        task = self.repository.get_by_id(task_id)
        if not task:
            return None
        return TaskResponse.model_validate(task)

    def get_tasks(self, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> TaskListResponse:
        """Get tasks with optional search and pagination."""
        if search:
            tasks = self.repository.search_by_title(search, skip, limit)
            # For search, we don't have total count easily; could query count separately
            # For simplicity, we'll just return the tasks without total count
            total = len(tasks)  # This is just the count of returned tasks, not total matching
        else:
            tasks = self.repository.get_all(skip, limit)
            # For get_all, we could query total count, but for simplicity we'll skip
            total = len(tasks)

        task_responses = [TaskResponse.model_validate(task) for task in tasks]
        return TaskListResponse(
            tasks=task_responses,
            total=total,
            skip=skip,
            limit=limit
        )

    def update_task(self, task_id: int, update_data: TaskUpdate) -> Optional[TaskResponse]:
        """Update a task."""
        # Convert Pydantic model to dict, excluding unset fields
        update_dict = update_data.model_dump(exclude_unset=True)

        # Check if at least one field is being updated
        if not update_dict:
            raise ValueError("No fields provided for update")

        # Update via repository
        task = self.repository.update(task_id, update_dict)
        if not task:
            return None

        return TaskResponse.model_validate(task)

    def delete_task(self, task_id: int) -> bool:
        """Delete a task."""
        return self.repository.delete(task_id)