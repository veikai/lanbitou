from typing import List, Optional, Dict, Any
from datetime import datetime

from .models import Task
from lanbitou.extensions import db


class TaskRepository:
    """Repository for Task model database operations."""

    @staticmethod
    def create(task_data: Dict[str, Any]) -> Task:
        """Create a new task."""
        # Set timestamps
        task_data['created_at'] = datetime.utcnow()
        task_data['updated_at'] = datetime.utcnow()

        task = Task(**task_data)
        db.session.add(task)
        db.session.commit()
        return task

    @staticmethod
    def get_by_id(task_id: int) -> Optional[Task]:
        """Get a task by ID."""
        return db.session.get(Task, task_id)

    @staticmethod
    def get_all(skip: int = 0, limit: int = 100) -> List[Task]:
        """Get all tasks with pagination."""
        return db.session.query(Task).order_by(Task.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def update(task_id: int, update_data: Dict[str, Any]) -> Optional[Task]:
        """Update a task."""
        task = db.session.get(Task, task_id)
        if not task:
            return None

        # Update fields
        for key, value in update_data.items():
            if hasattr(task, key) and value is not None:
                setattr(task, key, value)

        # Update timestamp
        task.updated_at = datetime.utcnow()

        db.session.commit()
        return task

    @staticmethod
    def delete(task_id: int) -> bool:
        """Delete a task."""
        task = db.session.get(Task, task_id)
        if not task:
            return False

        db.session.delete(task)
        db.session.commit()
        return True

    @staticmethod
    def search_by_title(title: str, skip: int = 0, limit: int = 100) -> List[Task]:
        """Search tasks by title (case-insensitive partial match)."""
        return db.session.query(Task).filter(
            Task.title.ilike(f'%{title}%')
        ).order_by(Task.created_at.desc()).offset(skip).limit(limit).all()


