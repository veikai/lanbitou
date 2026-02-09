from datetime import datetime
from lanbitou.extensions import db


class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    description = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deadline = db.Column(db.DateTime)
    priority = db.Column(db.Integer, default=3)  # 1-5, where 1 is highest priority

    def __repr__(self):
        return f'<Task id={self.id} title="{self.title}">'