import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

from werkzeug.security import generate_password_hash

app = Flask(__name__)

# Define the directory for the database
db_dir =  r'C:\y'


# If the directory doesn't exist, create it
if not os.path.exists(db_dir):
    os.makedirs(db_dir)

# Configure the SQLAlchemy URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(db_dir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db = SQLAlchemy(app)


# Define the Role table
class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)


# Define the User table
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    role = db.relationship('Role', backref=db.backref('users', lazy=True))
    session_token = db.Column(db.String(64), nullable=True)
    is_approved = db.Column(db.Boolean, default=False)  # New field for user approval

class LearnerManager(db.Model):
    __tablename__ = 'manager_team'
    id = db.Column(db.Integer, primary_key=True)
    learner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)  # Track when the learner was assigned

    # Relationships
    learner = db.relationship('User', foreign_keys=[learner_id], backref='manager_assignments')
    manager = db.relationship('User', foreign_keys=[manager_id], backref='team_members')


# Define the PasswordReset table to store OTPs
class PasswordReset(db.Model):
    __tablename__ = 'password_resets'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False)
    otp = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)


# Define the Course table
class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.String(100), unique=True, nullable=False)
    course_title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    instructor_name = db.Column(db.String(100))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    status = db.Column(db.String(50))
    video_link = db.Column(db.String(255))
    pdf_link = db.Column(db.String(255))


# Define the Enrollment table
class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False, default="Enrolled")  # Enrolled, Completed
    user = db.relationship('User', backref=db.backref('enrollments', lazy=True))
    course = db.relationship('Course', backref=db.backref('enrollments', lazy=True))
class Resource(db.Model):
    __tablename__ = 'resources'  # It's better to use plural (resources) for consistency.

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course_title = db.Column(db.String(100), nullable=False)
    video_link = db.Column(db.String(255), nullable=True)
    pdf_link = db.Column(db.String(255), nullable=True)
    course_id = db.Column(db.String(100), db.ForeignKey('courses.course_id'), nullable=False)  # Foreign key to Course table
    is_completed = db.Column(db.Boolean, default=False, nullable=False)

    # Relationship to Course
    course = db.relationship('Course', backref=db.backref('resources', lazy=True))



def initialize_database():
    """
    Initialize the database and pre-populate roles and a default HR admin.
    """
    with app.app_context():
        # Create all tables in the database
        db.create_all()

        print("Tables in the database:", db.metadata.tables.keys())
        # Add default roles if not already present
        roles = ['Learner', 'HR', 'Manager', 'Instructor']
        for role_name in roles:
            if not Role.query.filter_by(name=role_name).first():
                db.session.add(Role(name=role_name))

        # Add a default HR Admin user
        hr_role = Role.query.filter_by(name='HR').first()
        if hr_role and not User.query.filter_by(email='antayi@gmail.com').first():
            default_admin = User(
                full_name="Default HR Admin",
                email="antayi@gmail.com",
                password=generate_password_hash("Admin@123"),  # Default password (should be hashed in production)
                phone_number="9876543210",
                country="India",
                role_id=hr_role.id,
                is_approved=True  # HR is approved by default
            )
            db.session.add(default_admin)

        # Commit the session to save roles and the default admin to the database
        try:
            db.session.commit()
            print("Database initialized successfully with roles, tables, and default HR Admin.")
        except Exception as e:
            db.session.rollback()
            print(f"Error initializing database: {e}")


if __name__ == "__main__":
    initialize_database()
