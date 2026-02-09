from flask import request, jsonify
from pydantic import ValidationError

from lanbitou.api import api_bp
from lanbitou.extensions import validate
from lanbitou.services import TaskService
from lanbitou.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, ErrorResponse

task_service = TaskService()


@api_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Get tasks with optional search and pagination."""
    try:
        # Parse query parameters
        skip = request.args.get('skip', default=0, type=int)
        limit = request.args.get('limit', default=20, type=int)
        search = request.args.get('search', default=None, type=str)

        # Validate pagination limits
        if skip < 0:
            skip = 0
        if limit <= 0 or limit > 100:
            limit = 20

        # Get tasks from service
        result = task_service.get_tasks(skip=skip, limit=limit, search=search)

        return jsonify(result.model_dump())
    except Exception as e:
        return jsonify(ErrorResponse(
            error='Internal Server Error',
            message=str(e),
            request_id=getattr(request, 'id', None)
        ).model_dump()), 500


@api_bp.route('/tasks', methods=['POST'])
@validate(body=TaskCreate)
def create_task(body: TaskCreate):
    """Create a new task."""
    try:
        # Create task via service
        task = task_service.create_task(body)

        return jsonify(task.model_dump()), 201
    except ValidationError as e:
        return jsonify(ErrorResponse(
            error='Validation Error',
            message=str(e),
            request_id=getattr(request, 'id', None)
        ).model_dump()), 422
    except Exception as e:
        return jsonify(ErrorResponse(
            error='Internal Server Error',
            message=str(e),
            request_id=getattr(request, 'id', None)
        ).model_dump()), 500


@api_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a single task by ID."""
    try:
        task = task_service.get_task(task_id)
        if not task:
            return jsonify(ErrorResponse(
                error='Not Found',
                message=f'Task with ID {task_id} not found.',
                request_id=getattr(request, 'id', None)
            ).model_dump()), 404

        return jsonify(task.model_dump())
    except Exception as e:
        return jsonify(ErrorResponse(
            error='Internal Server Error',
            message=str(e),
            request_id=getattr(request, 'id', None)
        ).model_dump()), 500


@api_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@validate(body=TaskUpdate)
def update_task(body: TaskUpdate, task_id):
    """Update a task."""
    try:
        # Update task via service
        task = task_service.update_task(task_id, body)
        if not task:
            return jsonify(ErrorResponse(
                error='Not Found',
                message=f'Task with ID {task_id} not found.',
                request_id=getattr(request, 'id', None)
            ).model_dump()), 404

        return jsonify(task.model_dump())
    except ValidationError as e:
        return jsonify(ErrorResponse(
            error='Validation Error',
            message=str(e),
            request_id=getattr(request, 'id', None)
        ).model_dump()), 422
    except ValueError as e:
        return jsonify(ErrorResponse(
            error='Bad Request',
            message=str(e),
            request_id=getattr(request, 'id', None)
        ).model_dump()), 400
    except Exception as e:
        return jsonify(ErrorResponse(
            error='Internal Server Error',
            message=str(e),
            request_id=getattr(request, 'id', None)
        ).model_dump()), 500


@api_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task."""
    try:
        success = task_service.delete_task(task_id)
        if not success:
            return jsonify(ErrorResponse(
                error='Not Found',
                message=f'Task with ID {task_id} not found.',
                request_id=getattr(request, 'id', None)
            ).model_dump()), 404

        return '', 204
    except Exception as e:
        return jsonify(ErrorResponse(
            error='Internal Server Error',
            message=str(e),
            request_id=getattr(request, 'id', None)
        ).model_dump()), 500