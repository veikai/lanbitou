from flask_pydantic import validate
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

# Export validate decorator from flask-pydantic
__all__ = ['db', 'validate']