import logging
from flask import Flask, jsonify, request, render_template
import uuid

from lanbitou.config import config
from lanbitou.extensions import db, validate


def create_app(config_name='default'):
    """Application factory function."""
    app = Flask(__name__, template_folder="../templates", static_folder="../static")

    # Load configuration
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    from lanbitou.api import api_bp
    app.register_blueprint(api_bp, url_prefix=app.config['API_PREFIX'])

    # Request ID middleware for logging
    @app.before_request
    def before_request():
        request.id = str(uuid.uuid4())

    # Health check endpoint
    @app.route('/health')
    def health():
        return jsonify({'status': 'ok', 'message': 'Lanbitou API is running'})

    # Frontend routes
    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/tasks')
    def task_list():
        return render_template('task_list.html')

    @app.route('/tasks/new')
    def add_task():
        return render_template('add_task.html')

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found.',
            'request_id': getattr(request, 'id', None)
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Server Error: {error}', exc_info=True)
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred.',
            'request_id': getattr(request, 'id', None)
        }), 500

    # Database initialization CLI command
    @app.cli.command('init-db')
    def init_db_command():
        """Initialize the database."""
        with app.app_context():
            db.create_all()
        print('Database initialized.')

    # Create tables on first request (development only)
    # Removed in Flask 3.x - use init-db command instead

    return app


if __name__ == '__main__':
    # For development running with python lanbitou/app.py
    app = create_app('development')
    app.run(debug=True)