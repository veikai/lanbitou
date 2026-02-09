#!/usr/bin/env python3
"""Basic tests for the Lanbitou API."""

import sys
import json
from datetime import datetime

# Add project root to path
sys.path.insert(0, '.')

from lanbitou import create_app


def test_health_endpoint():
    """Test health endpoint."""
    app = create_app('testing')
    with app.test_client() as client:
        response = client.get('/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'ok'
        print('[OK] Health endpoint OK')


def test_task_crud():
    """Test basic task CRUD operations."""
    app = create_app('testing')
    with app.app_context():
        from lanbitou.extensions import db
        db.create_all()

    with app.test_client() as client:
        # 1. Create a task (without deadline first)
        task_data = {
            'title': 'Test Task',
            'description': 'This is a test task'
        }
        response = client.post('/api/tasks', json=task_data)
        print(f'Response status: {response.status_code}, data: {response.data}')
        assert response.status_code == 201
        task = json.loads(response.data)
        assert task['title'] == task_data['title']
        assert task['description'] == task_data['description']
        task_id = task['id']
        print(f'[OK] Task created with ID {task_id}')

        # 2. Get the task
        response = client.get(f'/api/tasks/{task_id}')
        assert response.status_code == 200
        task = json.loads(response.data)
        assert task['id'] == task_id
        print('[OK] Task retrieved')

        # 3. Update the task
        update_data = {'title': 'Updated Test Task'}
        response = client.put(f'/api/tasks/{task_id}', json=update_data)
        assert response.status_code == 200
        task = json.loads(response.data)
        assert task['title'] == update_data['title']
        print('[OK] Task updated')

        # 4. Get all tasks
        response = client.get('/api/tasks')
        assert response.status_code == 200
        tasks = json.loads(response.data)
        assert len(tasks['tasks']) > 0
        print('[OK] Task list retrieved')

        # 5. Delete the task
        response = client.delete(f'/api/tasks/{task_id}')
        assert response.status_code == 204
        print('[OK] Task deleted')

        # 6. Verify task is deleted
        response = client.get(f'/api/tasks/{task_id}')
        assert response.status_code == 404
        print('[OK] Task deletion confirmed')


def test_validation():
    """Test request validation."""
    app = create_app('testing')
    with app.test_client() as client:
        # Empty title should fail
        response = client.post('/api/tasks', json={'title': ''})
        assert response.status_code in (400, 422)
        print('[OK] Validation works (empty title rejected)')

        # Missing title should fail
        response = client.post('/api/tasks', json={})
        assert response.status_code in (400, 422)
        print('[OK] Validation works (missing title rejected)')


def main():
    """Run all tests."""
    print('Running basic tests for Lanbitou API...')
    try:
        test_health_endpoint()
        test_task_crud()
        test_validation()
        print('\n[PASS] All tests passed!')
        return 0
    except AssertionError as e:
        print(f'\n[FAIL] Test failed: {e}')
        import traceback
        traceback.print_exc()
        return 1
    except Exception as e:
        print(f'\n[FAIL] Unexpected error: {e}')
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())