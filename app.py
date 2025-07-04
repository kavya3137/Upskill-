import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_mail import Mail, Message
from sqlalchemy import func
import pycountry
from flask import Flask, request, send_file
from fpdf import FPDF 
from PIL import Image, ImageDraw, ImageFont
import io
from reportlab.pdfgen import canvas
from reportlab.lib import colors


app = Flask(__name__)
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:/y/database.db'  # Your database URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Mail Configuration
app.config['MAIL_SERVER'] = 'smtp.office365.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'bl.en.u4cse22276@bl.students.amrita.edu'  # Your Outlook email
app.config['MAIL_PASSWORD'] = 'ogeodhti'  # Your Outlook email password
app.config['MAIL_DEFAULT_SENDER'] = 'bl.en.u4cse22276@bl.students.amrita.edu'

# Initialize Extensions
db = SQLAlchemy(app)
mail = Mail(app)

# Database Models
class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

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
    is_approved = db.Column(db.Boolean, default=False) 

class LearnerManager(db.Model):
    __tablename__ = 'manager_team'
    id = db.Column(db.Integer, primary_key=True)
    learner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)  # Track when the learner was assigned
    is_approved = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    learner = db.relationship('User', foreign_keys=[learner_id], backref='manager_assignments')
    manager = db.relationship('User', foreign_keys=[manager_id], backref='team_members')


class PasswordReset(db.Model):
    __tablename__ = 'password_resets'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), db.ForeignKey('users.email'), nullable=False)
    otp = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)
    user = db.relationship('User', backref=db.backref('password_resets', lazy=True))

class Course(db.Model):
    __tablename__ = 'courses'  # Make sure to define the table name
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.String(50), unique=True, nullable=False)
    course_title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    instructor_name = db.Column(db.String(100))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    status = db.Column(db.String(50))
    video_link = db.Column(db.String(255))
    pdf_link = db.Column(db.String(255))  

    # Relationships
    enrollments = db.relationship('Enrollment', back_populates='course')
    resources = db.relationship('Resource', back_populates='course')  # Corrected: 'resources' relationship
    quizzes = db.relationship('Quiz', back_populates='course')
    
class Resource(db.Model):
    __tablename__ = 'resource'  # Correct table name
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id'), nullable=False)  # Fixed foreign key reference to 'courses.id'
    is_completed = db.Column(db.Boolean, default=False)
    
    # Relationship with Course
    course = db.relationship('Course', back_populates='resources')  # Corrected back_populates

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)  # Matches Course.id
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False, default="Enrolled")  # Enrolled, Completed

    # Relationships
    user = db.relationship('User', backref=db.backref('enrollments', lazy=True))
    course = db.relationship('Course', back_populates='enrollments')  # Matches the relationship in Course

class Quiz(db.Model):
    __tablename__ = 'quizzes'  # Defines the table name in the database
    id = db.Column(db.Integer, primary_key=True)  # Primary key for the quiz
    course_id = db.Column(db.String(20), db.ForeignKey('courses.course_id'), nullable=False)  # Foreign key linking to the 'courses' table
    question = db.Column(db.String(255), nullable=False)  # The question for the quiz
    option_a = db.Column(db.String(100), nullable=False)  # Option 1 for the question
    option_b = db.Column(db.String(100), nullable=False)  # Option 2 for the question
    option_c = db.Column(db.String(100), nullable=False)  # Option 3 for the question
    option_d = db.Column(db.String(100), nullable=False)  # Option 4 for the question
    correct_option = db.Column(db.String(1), nullable=False)  # The correct option for the quiz

    # Define a relationship to the 'Course' model (assuming you have a 'courses' table)
    course = db.relationship('Course', back_populates='quizzes')

class UserProgress(db.Model):
    __tablename__ = 'user_progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.String(20), db.ForeignKey('courses.id'), nullable=False)
    progress = db.Column(db.Integer, default=0)  # Progress percentage (0-100)
    last_updated = db.Column(db.DateTime, nullable=False, default=datetime.utcnow) 

    user = db.relationship('User', backref=db.backref('user_progress', lazy=True))
    course = db.relationship('Course', backref=db.backref('course_progress', lazy=True))

class QuizResult(db.Model):
    __tablename__ = 'quiz_result'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.String(20), db.ForeignKey('courses.id'), nullable=False)
    correct_count = db.Column(db.Integer, default=0)
    incorrect_count = db.Column(db.Integer, default=0)
    unanswered_count = db.Column(db.Integer, default=0)
    score = db.Column(db.Integer, default=0)
    

    user = db.relationship('User', backref=db.backref('quiz_results', lazy=True))
    course = db.relationship('Course', backref=db.backref('quiz_results', lazy=True))

# Initialize Database with Roles
def initialize_database():
    """
    Initialize the database and pre-populate roles if they don't exist.
    """
    with app.app_context():
        # Create all tables in the database
        db.create_all()

        # Add default roles if not already present
        roles = ['Learner', 'HR', 'Manager', 'Instructor']
        for role_name in roles:
            if not Role.query.filter_by(name=role_name).first():
                db.session.add(Role(name=role_name))

        # Commit the session to save roles to the database
        try:
            db.session.commit()
            print("Database initialized successfully with roles and tables.")
        except Exception as e:
            db.session.rollback()
            print(f"An error occurred while initializing the database: {e}")

# Routes for SignUp, Login, etc.

@app.route('/unassigned_learners', methods=['GET'])
def get_unassigned_learners():
    # Get all learners who are not in the LearnerManager table
    unassigned_learners = User.query.filter_by(role_id=1).filter(
        ~User.id.in_(
            db.session.query(LearnerManager.learner_id).distinct()
        )
    ).all()

    response = [{"learner_id": learner.id, "learner_name": learner.full_name, "learner_email": learner.email} for learner in unassigned_learners]

    return jsonify(response)


@app.route('/assign_learner', methods=['POST'])
def assign_learner():
    data = request.json
    learner_user_id = data.get('learner_id')  # ID of the learner
    manager_user_id = data.get('manager_id')  # ID of the manager

    # Check if the learner exists and has the correct role
    learner = User.query.get(learner_user_id)
    if not learner or learner.role_id != 1:  # role_id=1 is for learners
        return jsonify({"error": "Learner must have role_id=1."}), 400

    # Check if the manager exists and has the correct role
    manager = User.query.get(manager_user_id)
    if not manager or manager.role_id != 3:  # role_id=3 is for managers
        return jsonify({"error": "Manager not found or invalid role."}), 404

    # Check if the learner is already assigned to a manager
    existing_assignment = LearnerManager.query.filter_by(learner_id=learner_user_id).first()
    if existing_assignment:
        return jsonify({"error": "Learner is already assigned to a manager."}), 400

    # Assign the learner to the manager
    new_assignment = LearnerManager(learner_id=learner_user_id, manager_id=manager_user_id, is_approved=0)
    db.session.add(new_assignment)
    db.session.commit()

    # Update the approval status to 1 (approved)
    new_assignment.is_approved = 1
    db.session.commit()

    return jsonify({"message": "Learner successfully assigned to manager and approved."}), 200



@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    required_fields = ['full_name', 'email', 'password', 'confirm_password', 'phone_number', 'country', 'role']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"{field.replace('_', ' ').capitalize()} is required."}), 400

    password = data['password']
    confirm_password = data['confirm_password']
    if password != confirm_password:
        return jsonify({"error": "Passwords do not match!"}), 400

    if len(password) < 8 or not any(c.isupper() for c in password) or not any(c.isdigit() for c in password) or not any(
            c in '!@#$%^&*()_+' for c in password):
        return jsonify({
                           "error": "Password must be at least 8 characters long, contain a digit, a special character, and an uppercase letter."}), 400

    phone_number = data['phone_number']
    if len(phone_number) != 10 or not phone_number.isdigit():
        return jsonify({"error": "Phone number must be exactly 10 digits."}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email is already registered."}), 400

    # Validate the country name
    country = data['country']
    valid_countries = [country.name for country in pycountry.countries]
    if country not in valid_countries:
        return jsonify({"error": f"'{country}' is not a valid country."}), 400

    hashed_password = generate_password_hash(password)

    role_name = data.get('role', 'Learner')  # Default role is "Learner"
    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return jsonify({"error": f"Role '{role_name}' not found!"}), 400

    new_user = User(
        full_name=data['full_name'],
        email=data['email'],
        password=hashed_password,
        phone_number=data['phone_number'],
        country=data['country'],
        role_id=role.id,
        is_approved=False  # Default to False (awaiting approval)
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Signup successful, waiting for HR approval..."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Forgot Password Route
@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    print("Forgot password route reached!")
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required."}), 400

    # Check if the email exists
    user = User.query.filter(func.lower(User.email) == func.lower(email)).first()
    if not user:
        return jsonify({"error": "Email not found."}), 400

    # Generate OTP (6-digit)
    otp = str(random.randint(100000, 999999))

    # Store OTP in database
    otp_record = PasswordReset.query.filter_by(email=user.email).first()
    if otp_record:
        otp_record.otp = otp
        otp_record.created_at = datetime.utcnow()
        otp_record.is_verified = False
    else:
        otp_record = PasswordReset(email=user.email, otp=otp)
        db.session.add(otp_record)

    try:
        db.session.commit()

        # Send OTP to user's email
        send_otp_email(user.email, otp)
        return jsonify({"message": "OTP sent to your email address."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Function to Send OTP Email
def send_otp_email(to_email, otp):
    subject = "Your OTP for Password Reset/Login"
    body = f"Your OTP for password reset/login otp is: {otp}"

    message = MIMEMultipart()
    message["From"] = app.config['MAIL_USERNAME']
    message["To"] = to_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        # Connect to SMTP server
        server = smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT'])
        server.starttls()  # Secure the connection
        server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
        server.sendmail(app.config['MAIL_USERNAME'], to_email, message.as_string())
        print("OTP sent successfully!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        server.quit()

# Reset Password Route
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')
    confirm_new_password = data.get('confirm_new_password')

    # Check if all required fields are present
    if not all([email, otp, new_password, confirm_new_password]):
        return jsonify({"error": "All fields are required."}), 400

    # Check if passwords match
    if new_password != confirm_new_password:
        return jsonify({"error": "Passwords do not match!"}), 400

    # Validate password strength
    if len(new_password) < 8 or not any(c.isupper() for c in new_password) or not any(
            c.isdigit() for c in new_password) or not any(c in '!@#$%^&*()_+' for c in new_password):
        return jsonify({
                           "error": "Password must be at least 8 characters long, contain a digit, a special character, and an uppercase letter."}), 400

    # Find OTP record in database
    otp_record = PasswordReset.query.filter_by(email=email, otp=otp).first()
    if not otp_record:
        return jsonify({"error": "Invalid OTP."}), 400

    # Check if OTP is expired (valid for 5 minutes)
    if datetime.utcnow() - otp_record.created_at > timedelta(minutes=5):
        return jsonify({"error": "OTP has expired."}), 400

    # Hash new password
    hashed_password = generate_password_hash(new_password)

    # Update user password
    user = User.query.filter(func.lower(User.email) == func.lower(email)).first()
    user.password = hashed_password
    otp_record.is_verified = True  # Mark OTP as used

    try:
        db.session.commit()
        return jsonify({"message": "Password has been reset successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    # Check if user exists
    user = User.query.filter(func.lower(User.email) == func.lower(email)).first()

    if user and check_password_hash(user.password, password):  # Check if password matches
        # Check if user is approved
        if not user.is_approved:
            return jsonify({"error": "Your account is awaiting approval from HR."}), 403
       

        # Generate OTP
        otp = str(random.randint(100000, 999999))

        # Store OTP in the PasswordReset table
        otp_record = PasswordReset.query.filter_by(email=user.email).first()
        if otp_record:
            otp_record.otp = otp
            otp_record.created_at = datetime.utcnow()
            otp_record.is_verified = False
        else:
            otp_record = PasswordReset(email=user.email, otp=otp)
            db.session.add(otp_record)

        try:
            db.session.commit()

            # Send OTP to user's email
            send_otp_email(user.email, otp)

            # Return message with OTP verification step
            return jsonify({"message": "Login successful, OTP sent to your email.", "user_id": user.id, "redirect": "/verify-otp"}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    else:
        return jsonify({"error": "Invalid email or password."}), 400


@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required."}), 400

    # Find OTP record in database
    otp_record = PasswordReset.query.filter_by(email=email, otp=otp).first()
    if not otp_record:
        return jsonify({"error": "Invalid OTP."}), 400

    # Check if OTP is expired (valid for 5 minutes)
    if datetime.utcnow() - otp_record.created_at > timedelta(minutes=5):
        return jsonify({"error": "OTP has expired."}), 400

    # Mark OTP as verified
    otp_record.is_verified = True

    # Find user details
    user = User.query.filter(func.lower(User.email) == func.lower(email)).first()

    # Check user's role and redirect accordingly
    if user:
        role = user.role.name  # Get the user's role name

        # Redirect to the correct dashboard based on the role
        if role == "Learner":
            return jsonify({"message": "Login successful", "user_id": user.id, "redirect": "/learner_dashboard"})
        elif role == "Manager":
            return jsonify({"message": "Login successful","user_id": user.id,  "redirect": "/manager_dashboard"})
        elif role == "Instructor":
            return jsonify({"message": "Login successful","user_id": user.id,  "redirect": "/instructor_dashboard"})
        elif role == "HR":
            return jsonify({"message": "Login successful", "user_id": user.id, "redirect": "/hr_dashboard"})
    else:
        return jsonify({"error": "Invalid email or password."}), 400
    
@app.route('/approve_user', methods=['POST'])
def approve_user():
    # For testing, manually accept a 'role' parameter from the request body
    data = request.get_json()
    
    # Check if the 'role' field in the request is 'HR' (bypassing actual session or JWT)
    role = data.get('role')
    
    if role != 'HR':
        return jsonify({"error": "You must have the 'HR' role to approve or reject users."}), 403
    
    user_id = data.get('user_id')
    action = data.get('action')
    
    if not user_id or not action:
        return jsonify({"error": "user_id and action are required."}), 400
    
    if action not in ['approve', 'reject']:
        return jsonify({"error": "Action must be either 'approve' or 'reject'."}), 400
    
    user = User.query.get(user_id)
    
    if user:
        # Update the user's approval status based on the action
        if action == 'approve':
            user.is_approved = True
            db.session.commit()
            return jsonify({"message": f"User {user.full_name} approved successfully."}), 200
        elif action == 'reject':
            user.is_approved = False
            db.session.commit()
            return jsonify({"message": f"User {user.full_name} rejected successfully."}), 200
    else:
        return jsonify({"error": "User not found."}), 404
    
@app.route('/pending_users', methods=['POST'])
def get_pending_users():
    data = request.get_json()

    # Check if the role is provided in the request and ensure it's 'HR'
    if not data.get('role') or data['role'] != 'HR':
        return jsonify({"error": "You must have the 'HR' role to view pending users."}), 403

    # Query users who are not approved yet (is_approved = False)
    pending_users = User.query.filter_by(is_approved=False).all()

    # If no pending users found
    if not pending_users:
        return jsonify({"message": "No pending users for approval."}), 200

    # Prepare the response data with user details
    users_data = []
    for user in pending_users:
        users_data.append({
            "user_id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "country": user.country,
            "role": user.role.name,
        })

    return jsonify({"pending_users": users_data}), 200




# Get Sample Data Route
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({"message": "Hello from backend!"}), 200



@app.route('/api/instructors', methods=['GET'])
def get_instructors():
    instructors = User.query.join(Role).filter(Role.name == 'Instructor').all()
    instructor_list = [
        {"id": instructor.id, "full_name": instructor.full_name, "email": instructor.email}
        for instructor in instructors
    ]
    return jsonify({"instructors": instructor_list}), 200
    
# Route to Create a New Course
@app.route('/api/courses/create', methods=['POST'])
def create_course():
    data = request.get_json()
    required_fields = ['course_id', 'course_title', 'description', 'instructor_name', 'start_date', 'status']

    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"{field.replace('_', ' ').capitalize()} is required."}), 400

    # Check if course_id is unique
    if Course.query.filter_by(course_id=data['course_id']).first():
        return jsonify({"error": "Course ID already exists."}), 400

    # Parse dates
    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid start date format. Use YYYY-MM-DD."}), 400

    # Validate and get duration_weeks
    try:
        duration_weeks = int(data.get('duration_weeks', 4))  # Default to 4 weeks if not provided
    except ValueError:
        return jsonify({"error": "Duration weeks must be a valid integer."}), 400

    # Calculate end date
    end_date = start_date + timedelta(weeks=duration_weeks)

    # Create new course
    new_course = Course(
        course_id=data['course_id'],
        course_title=data['course_title'],
        description=data['description'],
        video_link=data.get('video_link'),  # Store video link
        pdf_link=data.get('pdf_link'),      # Store PDF link
        instructor_name=data['instructor_name'],
        start_date=start_date,
        end_date=end_date,
        status=data['status']
    )

    try:
        db.session.add(new_course)

        # Add resources if video_link and pdf_link are provided
        resources = []
        if 'video_link' in data and data['video_link']:
            resources.append(
                Resource(
                    title=f"{data['course_title']} Video",
                    resource_type="Video",
                    url=data['video_link'],
                    course_id=data['course_id']
                )
            )
        if 'pdf_link' in data and data['pdf_link']:
            resources.append(
                Resource(
                    title=f"{data['course_title']} PDF",
                    resource_type="PDF",
                    url=data['pdf_link'],
                    course_id=data['course_id']
                )
            )

        db.session.add_all(resources)
        db.session.commit()

        # Notify users if course is published
        if data['status'] == 'Published':
            users = User.query.all()
            recipient_emails = [user.email for user in users if user.email]
            send_course_notification(recipient_emails, new_course)

        return jsonify({"message": f"Course {'published' if data['status'] == 'Published' else 'saved as draft'} successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Updated Course Notification Function
def send_course_notification(emails, course):
    subject = f"New Course Published: {course.course_title}"
    body = f"""
    Hello,

    A new course has been published.

    Course ID: {course.course_id}
    Course Title: {course.course_title}
    Description: {course.description}
    Instructor: {course.instructor_name} 
    Start Date: {course.start_date}
    End Date: {course.end_date}

    Regards,
    Course Team
    """

    # SMTP server details
    smtp_server = "smtp.office365.com"  # Replace with your SMTP server
    smtp_port = 587  # TLS port
    smtp_username = "bl.en.u4cse22276@bl.students.amrita.edu"  # Use the sender's email
    smtp_password = "ogeodhti"  # Sender's email password or app-specific password

    try:
        # Connect to the SMTP server
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Start TLS encryption
            server.login(smtp_username, smtp_password)  # Log in to the SMTP server

            for email in emails:
                # Create the email message
                message = MIMEMultipart()
                message["From"] = smtp_username
                message["To"] = email
                message["Subject"] = subject
                message.attach(MIMEText(body, "plain"))

                # Send the email
                server.sendmail(smtp_username, email, message.as_string())
                print(f"Notification sent to {email}")

        print("Course notifications sent successfully!")
    except Exception as e:
        print(f"Error sending course notifications: {e}")


@app.route('/view-courses', methods=['GET'])
def view_courses():
    try:
        # Fetch all courses from the database
        courses = Course.query.all()

        # Format the course data for response
        course_list = []
        for course in courses:
            course_list.append({
                "course_id": course.course_id,
                "course_title": course.course_title,
                "description": course.description,
                "instructor_name": course.instructor_name,  # Assuming this field exists in the Course table
                "start_date": course.start_date.strftime('%Y-%m-%d'),
                "end_date": course.end_date.strftime('%Y-%m-%d')
            })

        return jsonify({"courses": course_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/view-course-status', methods=['GET'])
def view_course_status():
    try:
        # Get the user_id from the query parameters or the URL
        user_id = request.args.get('user_id', type=int)  # Get the 'user_id' from query parameters
        
        if not user_id:
            return jsonify({"error": "User ID not provided"}), 400  # Bad request if user_id is missing

        # Fetch all courses from the database
        courses = Course.query.all()

        # Format the course data for response
        course_list = []
        for course in courses:
            # Check if the user is enrolled in the current course
            enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=course.course_id).first()
            
            if enrollment:
                # If the user is enrolled, check if the course is completed
                status = "Completed" if enrollment.status == "Completed" else "Enrolled"
            else:
                # If the user is not enrolled
                status = "Not Enrolled"
            
            course_list.append({
                "course_id": course.course_id,
                "course_title": course.course_title,
                "description": course.description,
                "instructor_name": course.instructor_name,
                "start_date": course.start_date.strftime('%Y-%m-%d'),
                "end_date": course.end_date.strftime('%Y-%m-%d'),
                "status": status  # Add the enrollment status to the course data
            })

        return jsonify({"courses": course_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/enroll-course', methods=['POST'])
def enroll_course():
    try:
        # Get the 'user_id' and 'course_id' from the request body (JSON)
        data = request.get_json()
        user_id = data.get('user_id')
        course_id = data.get('course_id')

        if not user_id or not course_id:
            return jsonify({"error": "User ID or Course ID missing"}), 400  # Bad request if either is missing
        
        # Check if the user is already enrolled in the course
        existing_enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=course_id).first()
        
        if existing_enrollment:
            return jsonify({"message": "You are already enrolled in this course."}), 400
        
        # Create a new enrollment record
        new_enrollment = Enrollment(user_id=user_id, course_id=course_id, status="Enrolled")
        db.session.add(new_enrollment)
        db.session.commit()

        return jsonify({"message": "You have successfully enrolled in the course."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-courses', methods=['GET'])
def get_courses():
    try:
        # Get the user_id from the request (you can use session or user input method)
        user_id = request.args.get('user_id', type=int)

        if not user_id:
            return jsonify({"error": "User ID not provided"}), 400  # Bad request if user_id is missing

        # Fetch all courses from the database
        courses = Course.query.all()

        # Format the course data with the enrollment status for each course
        course_list = []
        for course in courses:
            # Check if the user is enrolled in the current course
            enrollment = Enrollment.query.filter_by(user_id=user_id, course_id=course.course_id).first()
            
            if enrollment:
                status = "Enrolled" if enrollment.status == "Enrolled" else "Completed"
            else:
                status = "Not Enrolled"
            
            course_list.append({
                "course_id": course.course_id,
                "course_title": course.course_title,
                "description": course.description,
                "instructor_name": course.instructor_name,
                "status": status  # Add the enrollment status to the course data
            })

        return jsonify({"courses": course_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-all-enrollments', methods=['GET'])
def get_all_enrollments():
    try:
        # Fetch all courses from the database
        courses = Course.query.all()
        if not courses:
            return jsonify({"error": "No courses found"}), 404
        
        all_enrollments = []
        
        for course in courses:
            enrollments = Enrollment.query.filter_by(course_id=course.course_id).all()
            enrollment_list = []
            
            for enrollment in enrollments:
                user = User.query.get(enrollment.user_id)
                if user:
                    enrollment_list.append({
                        "user_id": user.id,
                        "user_name": user.full_name,
                        "email": user.email,
                        "phone_number": user.phone_number,
                        "role": str(user.role),
                        "enrollment_date": enrollment.enrollment_date.strftime('%Y-%m-%d'),
                        "status": enrollment.status
                    })
                else:
                    enrollment_list.append({
                        "user_id": enrollment.user_id,
                        "user_name": "Unknown",
                        "email": "Unknown",
                        "phone_number": "Unknown",
                        "role": "Unknown",
                        "enrollment_date": enrollment.enrollment_date.strftime('%Y-%m-%d'),
                        "status": enrollment.status
                    })
                
            all_enrollments.append({
                "course_title": course.course_title,
                "course_id": course.course_id,
                "instructor_name": course.instructor_name,
                "enrollments": enrollment_list
            })
        
        return jsonify({"all_enrollments": all_enrollments}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/courses/edit', methods=['PUT'])
def edit_course():
    try:
        data = request.get_json()
        current_course_id = data.get('course_id')

        if not current_course_id:
            return jsonify({"error": "Course ID is required."}), 400

        course = Course.query.filter_by(course_id=current_course_id).first()

        if not course:
            return jsonify({"error": "Course not found."}), 404

        # Update course details
        course.course_title = data.get('course_title', course.course_title)
        course.description = data.get('description', course.description)
        course.instructor_name = data.get('instructor_name', course.instructor_name)
        
        if 'start_date' in data:
            try:
                course.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"error": "Invalid start date format. Use YYYY-MM-DD."}), 400

        if 'end_date' in data:
            try:
                course.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"error": "Invalid end date format. Use YYYY-MM-DD."}), 400

        db.session.commit()

        # Fetch all users to send the notification email
        users = User.query.all()
        recipient_emails = [user.email for user in users if user.email]  # Ensure email exists

        if recipient_emails:
            # Send email notifications
            send_course_notifications(recipient_emails, course)

        return jsonify({"message": "Course updated successfully."}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
def send_course_notifications(emails, course):
    subject = f" Course updated : {course.course_title}"
    body = f"""
    Hello,

    course has been updated.

    Course ID: {course.course_id}
    Course Title: {course.course_title}
    Description: {course.description}
    Instructor: {course.instructor_name} 
    Start Date: {course.start_date}
    End Date: {course.end_date}

    Regards,
    Course Team
    """

    # SMTP server details
    smtp_server = "smtp.office365.com"  # Replace with your SMTP server
    smtp_port = 587  # TLS port
    smtp_username = "bl.en.u4cse22276@bl.students.amrita.edu"  # Use the sender's email
    smtp_password = "ogeodhti"  # Sender's email password or app-specific password

    try:
        # Connect to the SMTP server
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Start TLS encryption
            server.login(smtp_username, smtp_password)  # Log in to the SMTP server

            for email in emails:
                # Create the email message
                message = MIMEMultipart()
                message["From"] = smtp_username
                message["To"] = email
                message["Subject"] = subject
                message.attach(MIMEText(body, "plain"))

                # Send the email
                server.sendmail(smtp_username, email, message.as_string())
                print(f"Notification sent to {email}")

        print("Course notifications sent successfully!")
    except Exception as e:
        print(f"Error sending course notifications: {e}")
@app.route('/get-enrolled-courses', methods=['GET'])
def get_enrolled_courses():
    try:
        # Get the user_id from query parameters
        user_id = request.args.get('user_id')

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        # Fetch all enrollments for the given user_id
        enrollments = Enrollment.query.filter_by(user_id=user_id).all()

        # Check if no enrollments found for the user
        if not enrollments:
            return jsonify({"message": "No enrollments found for this user"}), 404

        # Prepare the list of enrolled courses
        enrolled_courses = []

        for enrollment in enrollments:
            # Fetch the course using the course_id from the enrollment
            course = Course.query.filter_by(course_id=enrollment.course_id).first()

            if course:
                enrolled_courses.append({
                    "course_id": course.course_id,
                    "course_title": course.course_title,
                    "description": course.description,
                    "instructor_name": course.instructor_name,
                    "start_date": course.start_date.strftime('%Y-%m-%d') if course.start_date else None,
                    "end_date": course.end_date.strftime('%Y-%m-%d') if course.end_date else None,
                    "status": enrollment.status,
                    "enrollment_date": enrollment.enrollment_date.strftime('%Y-%m-%d')
                })

        # Return the enrolled courses for the user
        return jsonify({"user_id": user_id, "enrolled_courses": enrolled_courses}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/get-not-enrolled-courses', methods=['GET'])
def get_not_enrolled_courses():
    try:
        # Get the user_id from query parameters
        user_id = request.args.get('user_id')

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        # Fetch all enrollments for the given user_id
        enrolled_course_ids = [enrollment.course_id for enrollment in Enrollment.query.filter_by(user_id=user_id).all()]

        # Fetch all courses that are not enrolled by the user
        not_enrolled_courses = Course.query.filter(~Course.course_id.in_(enrolled_course_ids)).all()

        # Prepare the list of not enrolled courses
        courses = []
        for course in not_enrolled_courses:
            courses.append({
                "course_id": course.course_id,
                "course_title": course.course_title,
                "description": course.description,
                "instructor_name": course.instructor_name,
                "start_date": course.start_date.strftime('%Y-%m-%d') if course.start_date else None,
                "end_date": course.end_date.strftime('%Y-%m-%d') if course.end_date else None
            })

        # Return the not enrolled courses for the user
        return jsonify({"user_id": user_id, "not_enrolled_courses": courses}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/courses/<string:course_id>/resources', methods=['GET'])
def get_resources(course_id):
    # Fetch the course object using course_id
    course = Course.query.filter_by(course_id=course_id).first()

    if not course:
        return jsonify({"error": "Course not found"}), 404

    # Fetch all resources associated with the course using course.id
    resources = Resource.query.filter_by(course_id=course.course_id).all()

    if not resources:
        return jsonify({"error": "Resources not found"}), 404

    # Prepare a list of resource details to return
    resource_list = []
    for resource in resources:
        resource_list.append({
            "id": resource.id,
            "title": resource.title,
            "resource_type": resource.resource_type,
            "url": resource.url,
            "is_completed": resource.is_completed
        })

    return jsonify({"resources": resource_list}), 200

@app.route('/courses/<string:course_id>/quizzes', methods=['GET'])
def get_quizzes(course_id):
    quizzes = Quiz.query.filter_by(course_id=course_id).all()
    if not quizzes:
        return jsonify({"error": "No quizzes found for this course"}), 404
    
    quiz_list = []
    for quiz in quizzes:
        quiz_list.append({
            "id": quiz.id,
            "question": quiz.question,
            "option_a": quiz.option_a,
            "option_b": quiz.option_b,
            "option_c": quiz.option_c,
            "option_d": quiz.option_d,
            "correct_option": quiz.correct_option
        })
    return jsonify({"quizzes": quiz_list}), 200

@app.route('/update-progress', methods=['POST'])
def update_progress():
    # Get data from the request
    user_id = request.json.get('user_id')
    course_id = request.json.get('course_id')
    progress = request.json.get('progress')

    # Fetch the existing user progress from the database
    user_progress = UserProgress.query.filter_by(user_id=user_id, course_id=course_id).first()

    # Check if progress entry exists for the user and course
    if user_progress:
        # Update progress and last_updated column
        user_progress.progress = progress
        user_progress.last_updated = datetime.utcnow()  # Set the last_updated to current UTC time
    else:
        # If no existing entry, create a new one
        user_progress = UserProgress(user_id=user_id, course_id=course_id, progress=progress, last_updated=datetime.utcnow())
        db.session.add(user_progress)

    # Commit the changes to the database
    db.session.commit()

    return jsonify({"message": "Progress updated successfully!"}), 200

@app.route('/get-progress/<int:user_id>/<string:course_id>', methods=['GET'])
def get_progress(user_id, course_id):
    # Fetch the user progress for the given user_id and course_id
    user_progress = UserProgress.query.filter_by(user_id=user_id, course_id=course_id).first()

    # If progress exists, return it
    if user_progress:
        return jsonify({
            "user_id": user_progress.user_id,
            "course_id": user_progress.course_id,
            "progress": user_progress.progress,
            "last_updated": user_progress.last_updated
        }), 200

    # If no progress is found, return an error message
    return jsonify({"message": "Progress not found"}), 404

@app.route('/completed_courses', methods=['GET'])
def get_completed_courses():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"error": "Invalid or missing user_id"}), 400

    try:
        # Query to get completed courses
        completed_courses = db.session.query(UserProgress.course_id).filter(
            UserProgress.user_id == user_id,
            UserProgress.progress == 100
        ).all()

        # Extract course IDs from query result
        course_ids = [course_id[0] for course_id in completed_courses]

        return jsonify({
            "user_id": user_id,
            "completed_courses": course_ids
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/add-quiz', methods=['POST'])
def add_quiz():
    data = request.get_json()

    try:
        options = data['options']
        new_quiz = Quiz(
            course_id=data['course_id'],
            question=data['question'],
            option_a=options[0],
            option_b=options[1],
            option_c=options[2],
            option_d=options[3],
            correct_option=data['correct_option']
        )
        db.session.add(new_quiz)
        db.session.commit()
        return jsonify({"message": "Quiz added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/fetch-courses', methods=['GET'])
def fetch_courses():
    try:
        # Call the function to get course data
        courses = get_all_courses()
        return jsonify({"courses": courses}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_all_courses():
    # Fetch all courses from the database
    course_list = Course.query.all()  # Query to fetch all courses
    courses = []
    
    # Extract the required fields from the courses
    for course in course_list:
        courses.append({
            "course_id": course.course_id,
            
        })
    
    return courses


@app.route('/submit-quiz-result', methods=['POST'])
def submit_quiz_result():
    try:
        data = request.get_json()

        user_id = data.get('user_id')
        course_id = data.get('course_id')
        correct_count = data.get('correct_count')
        incorrect_count = data.get('incorrect_count')
        unanswered_count = data.get('unanswered_count')
        score = data.get('score')

        # Check if result already exists for this user and course
        existing_result = QuizResult.query.filter_by(user_id=user_id, course_id=course_id).first()

        if existing_result:
            # Update existing result
            existing_result.correct_count = correct_count
            existing_result.incorrect_count = incorrect_count
            existing_result.unanswered_count = unanswered_count
            existing_result.score = score
        else:
            # Create new result if doesn't exist
            new_result = QuizResult(
                user_id=user_id,
                course_id=course_id,
                correct_count=correct_count,
                incorrect_count=incorrect_count,
                unanswered_count=unanswered_count,
                score=score
            )
            db.session.add(new_result)

        # Commit changes to the database
        db.session.commit()

        return jsonify({'message': 'Quiz result saved successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/quiz-result/<int:user_id>/<course_id>', methods=['GET'])
def get_quiz_result(user_id, course_id):
    try:
        result = QuizResult.query.filter_by(user_id=user_id, course_id=course_id).first()

        if result:
            return jsonify({
                'user_id': result.user_id,
                'course_id': result.course_id,
                'correct_count': result.correct_count,
                'incorrect_count': result.incorrect_count,
                'unanswered_count': result.unanswered_count,
                'score': result.score
            }), 200
        else:
            return jsonify({'message': 'Quiz result not found for this user and course'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-user-course-progress/<user_id>', methods=['GET'])
def get_course_progress_by_user(user_id):
    try:
        # Fetch user progress and quiz results for the given user_id
        progress_data = db.session.query(
            UserProgress, QuizResult, Course.course_title
        ).join(Course, UserProgress.course_id == Course.course_id).filter(
            UserProgress.user_id == user_id,
            UserProgress.course_id == QuizResult.course_id
        ).all()

        # Prepare response data
        result = []
        for progress, quiz_result, course_title in progress_data:
            course_info = {
                'course_id': progress.course_id,
                'course_title': course_title,  # Corrected to fetch the course_title from Course
                'progress': progress.progress,
                'score': quiz_result.score,
                'correct_count': quiz_result.correct_count,
                'incorrect_count': quiz_result.incorrect_count,
                'unanswered_count': quiz_result.unanswered_count
            }
            result.append(course_info)

        return jsonify({'data': result}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/get-user-course-progress', methods=['GET'])
def get_user_course_progress():
    try:
        # Querying user_id and course_id from the UserProgress model
        user_course_progress = (
            db.session.query(UserProgress.user_id, UserProgress.course_id, UserProgress.progress)
            .filter(UserProgress.progress == 100  )   # Using the model UserProgress
            .all()
        )

        # If no data is found
        if not user_course_progress:
            return jsonify({'message': 'No user course progress data available'}), 404

        # Prepare the response data
        results = [
            {
                'user_id': progress.user_id,
                'course_id': progress.course_id,
                'progress': progress.progress
            }
            for progress in user_course_progress
        ]

        return jsonify({'data': results})

    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@app.route('/get-users-above-60', methods=['GET'])
def get_users_above_60():
    try:
        # Querying user_id, course_id, and progress_percentage for users with progress above 60%
        users_above_60 = (
            db.session.query(UserProgress.user_id, UserProgress.course_id, UserProgress.progress)
            .filter(UserProgress.progress >= 60 , UserProgress.progress<100 )  # Filtering for progress above 60%
            .all()
        )

        # If no data is found
        if not users_above_60:
            return jsonify({'message': 'No users with progress above 60%'}), 404

        # Prepare the response data
        results = [
            {
                'user_id': progress.user_id,
                'course_id': progress.course_id,
                'progress': progress.progress,
            }
            for progress in users_above_60
        ]

        return jsonify({'data': results})

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/get-users-with-30-progress', methods=['GET'])
def get_users_with_30_progress():
    try:
        # Querying user_id, course_id, and progress_percentage for users with exactly 30% progress
        users_with_30_progress = (
            db.session.query(UserProgress.user_id, UserProgress.course_id, UserProgress.progress)
            .filter(UserProgress.progress == 30)  # Filter for exactly 30% progress
            .all()
        )

        # If no data is found
        if not users_with_30_progress:
            return jsonify({'message': 'No users with exactly 30% progress'}), 404

        # Prepare the response data
        results = [
            {
                'user_id': progress.user_id,
                'course_id': progress.course_id,
                'progress_percentage': progress.progress,
            }
            for progress in users_with_30_progress
        ]

        return jsonify({'data': results})

    except Exception as e:
        return jsonify({'message': str(e)}), 500
    

@app.route('/generate_certificate', methods=['POST'])
def generate_certificate():
    data = request.json
    user_name = data.get("user_name", "Name")
    course_title = data.get("course_id", "Course ID")
    current_date = datetime.now().strftime("%B %d, %Y")

    # Load the certificate template image
    template_path = "C:/y/image.jpeg"  # Replace with your template image path
    image = Image.open(template_path)

    # Create a BytesIO stream to save the image as a PDF
    pdf_output = io.BytesIO()

    # Use ReportLab to create a PDF
    c = canvas.Canvas(pdf_output, pagesize=(image.width, image.height))
    
    # Draw the image on the PDF
    c.drawImage(template_path, 0, 0, width=image.width, height=image.height)

    # Adjust positions for the text
    name_position = (image.width // 2 - 90, 220)  # Slightly lower for the name
    course_position = (image.width // 2 - 180, 590)  # Adjusted for course title (moved down)
    date_position = (image.width // 2 - 90, 130)  # Adjusted for date (moved down)

    # Set gold color for the text
    gold = colors.Color(153/255, 150/255, 18/255)  # RGB value for gold

    
    c.setFont("Helvetica", 35) 
    c.setFillColor(gold)  
    c.drawString(name_position[0], name_position[1], user_name)  # Name position

    c.setFont("Helvetica", 40)
    c.drawString(course_position[0], course_position[1], course_title)  # Course title position

    c.setFont("Helvetica", 20)
    c.drawString(date_position[0], date_position[1], f"Date: {current_date}")  # Date position

    # Save the PDF
    c.save()

    # Rewind the PDF stream
    pdf_output.seek(0)

    # Send the PDF as a response
    return send_file(pdf_output, mimetype="application/pdf", as_attachment=True, download_name="Certificate.pdf")


@app.route('/all_enrolled_progress', methods=['GET'])
def all_enrolled_progress():
    try:
        # Querying user_id, course_id, and progress_percentage for users with exactly 30% progress
        all_enrolled_progress= (
                db.session.query(UserProgress.user_id, UserProgress.course_id, UserProgress.progress)
                .filter(UserProgress.progress >= 0, UserProgress.progress <= 100)  # Filter for progress between 0% and 100%
                .all()
)

        # If no data is found
        if not all_enrolled_progress:
            return jsonify({'message': 'No users with exactly 30% progress'}), 404

        # Prepare the response data
        results = [
            {
                'user_id': progress.user_id,
                'course_id': progress.course_id,
                'progress_percentage': progress.progress,
            }
            for progress in all_enrolled_progress
        ]

        return jsonify({'data': results})

    except Exception as e:
        return jsonify({'message': str(e)}), 500



@app.route('/progress/update', methods=['POST'])
def update_user_progress():
    """
    Update user progress for a specific course.
    """
    data = request.get_json()
    user_id = data.get('user_id')
    course_id = data.get('course_id')
    progress = data.get('progress')  # Should be a percentage (0-100)

    # Validate input
    if not user_id or not course_id or progress is None:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    # Fetch or create a UserProgress record
    user_progress = UserProgress.query.filter_by(user_id=user_id, course_id=course_id).first()
    if not user_progress:
        user_progress = UserProgress(user_id=user_id, course_id=course_id, progress=progress)
        db.session.add(user_progress)
    else:
        user_progress.progress = progress
        user_progress.last_updated = datetime.utcnow()

    # Commit changes
    try:
        db.session.commit()
        return jsonify({"status": "success", "message": "User progress updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"An error occurred: {e}"}), 500


@app.route('/manager_team_with_courses', methods=['GET'])
def manager_team_with_courses():
    manager_user_id = request.args.get('manager_id')

    if not manager_user_id:
        return jsonify({"error": "Manager ID is required."}), 400

    # Fetch learners assigned to the manager
    assignments = LearnerManager.query.filter_by(manager_id=manager_user_id).all()

    if not assignments:
        return jsonify({"message": "No learners assigned to this manager."}), 404

    manager_team = []
    for assignment in assignments:
        learner = User.query.get(assignment.learner_id)
        if learner:
            # Fetch enrolled courses for this learner
            enrollments = Enrollment.query.filter_by(user_id=learner.id).all()
            

            # Map enrolled courses
            enrolled_course_ids = {enrollment.course_id for enrollment in enrollments}
            enrolled_courses = [
                {
                    "course_id": enrollment.course_id,
                    
                    "status": "Enrolled" if enrollment.status == "Enrolled" else "Completed"
                }
                for enrollment in enrollments
            ]

            # Add not enrolled courses
            all_courses = Course.query.all()
            course_list = enrolled_courses + [
                {
                    "course_id": course.course_id,
                    "course_title": course.course_title,
                    "instructor_name": course.instructor_name,
                    "status": "Not Enrolled"
                }
                for course in all_courses if course.id not in enrolled_course_ids
            ]

            # Append learner data with their courses
            manager_team.append({
                "learner_id": learner.id,
                "learner_name": learner.full_name,
                "learner_email": learner.email,
                "enrolled_courses": course_list
            })

    return jsonify({"manager_team": manager_team}), 200


@app.route('/manager/team-course-progress/<manager_id>', methods=['GET'])
def get_team_course_progress(manager_id):
    try:
        # Fetch the team members for the given manager, excluding the manager
        team_members = db.session.query(User).join(
            LearnerManager,
            LearnerManager.learner_id == User.id  # Explicitly specify the onclause
        ).filter(
            LearnerManager.manager_id == manager_id,
            User.role_id != 3  # Assuming role_id = 3 corresponds to Manager
        ).all()

        # If the manager has no team members
        if not team_members:
            return jsonify({'message': 'No team members found'}), 404

        # Collect progress data for each team member
        team_progress_data = []

        for member in team_members:
            # Fetch the progress data for all courses of the member
            progress_data = db.session.query(
                Course.course_id,
                Course.course_title,
                UserProgress.progress,
                QuizResult.score,
                QuizResult.correct_count,
                QuizResult.incorrect_count,
                QuizResult.unanswered_count
            ).join(Course, UserProgress.course_id == Course.course_id) \
              .outerjoin(QuizResult, QuizResult.user_id == member.id) \
              .filter(
                  UserProgress.user_id == member.id
              ).all()

            # Prepare list to store the courses attended by the member
            courses_progress = []

            for course in progress_data:
                course_progress = {
                    'course_id': course.course_id,
                    'course_title': course.course_title,
                    'progress': course.progress,
                    'score': course.score if course.score is not None else 'Not Attempted',
                    'correct_count': course.correct_count if course.correct_count is not None else 0,
                    'incorrect_count': course.incorrect_count if course.incorrect_count is not None else 0,
                    'unanswered_count': course.unanswered_count if course.unanswered_count is not None else 0,
                    'status': 'Completed' if course.progress == 100 else 'In Progress'
                }
                courses_progress.append(course_progress)

            member_progress = {
                'user_id': member.id,
                'user_email': member.email,
                'courses_progress': courses_progress
            }

            team_progress_data.append(member_progress)

        return jsonify({'team_progress': team_progress_data}), 200

    except Exception as e:
        return jsonify({'error': 'An error occurred', 'details': str(e)}), 500

@app.route('/manager/team-course-progress/filter-by-course', methods=['GET'])
def filter_by_course():
    user_id = request.args.get('user_id')
    course_id = request.args.get('course_id')

    if not user_id and not course_id:
        return jsonify({'error': 'Either User ID or Course ID is required'}), 400

    try:
        # If user_id is provided, filter by user
        if user_id:
            progress_data = db.session.query(
                User.id.label('user_id'),
                User.email.label('user_email'),
                Course.course_id,
                Course.course_title,
                UserProgress.progress,
                QuizResult.score
            ).join(UserProgress, UserProgress.user_id == User.id) \
              .join(Course, UserProgress.course_id == Course.course_id) \
              .outerjoin(QuizResult, QuizResult.user_id == User.id) \
              .filter(User.id == user_id).all()

            if not progress_data:
                return jsonify({'message': 'No data found for the given user'}), 404

        # If course_id is provided, filter by course
        elif course_id:
            progress_data = db.session.query(
                User.id.label('user_id'),
                User.email.label('user_email'),
                Course.course_id,
                Course.course_title,
                UserProgress.progress,
                QuizResult.score
            ).join(UserProgress, UserProgress.user_id == User.id) \
              .join(Course, UserProgress.course_id == Course.course_id) \
              .outerjoin(QuizResult, QuizResult.user_id == User.id) \
              .filter(Course.course_id == course_id).all()

            if not progress_data:
                return jsonify({'message': 'No data found for the given course'}), 404

        # Manually map the query results to a list of dictionaries
        progress_list = []
        for row in progress_data:
            progress_dict = {
                'user_id': row.user_id,
                'user_email': row.user_email,
                'course_id': row.course_id,
                'course_title': row.course_title,
                'progress': row.progress,
                'score': row.score if row.score is not None else 'Not Attempted'
            }
            progress_list.append(progress_dict)

        return jsonify({'progress': progress_list}), 200

    except Exception as e:
        return jsonify({'error': 'An error occurred', 'details': str(e)}), 500


@app.route('/top-performers', methods=['GET'])
def get_top_performers():
    top_performers = (
        db.session.query(
            User.full_name,
            QuizResult.user_id,
            QuizResult.course_id,
            QuizResult.score
        )
        .join(User, User.id == QuizResult.user_id)
        .order_by(QuizResult.score.desc())
        .limit(5)
        .all()
    )

    results = [
        {
            'full_name': performer.full_name,
            'user_id': performer.user_id,
            'course_id': performer.course_id,
            'score': performer.score
        }
        for performer in top_performers
    ]

    return jsonify({'data': results})

@app.route('/notify-all-users', methods=['POST'])
def notify_all_users():
    # Get the top 5 performers (with highest scores)
    top_performers = (
        db.session.query(
            User.full_name,
            User.email,  # Assuming User has an email field
            QuizResult.user_id,
            QuizResult.course_id,
            QuizResult.score
        )
        .join(User, User.id == QuizResult.user_id)
        .order_by(QuizResult.score.desc())
        .limit(5)
        .all()
    )

    # Create the message body
    subject = "Top Performers of the Week"
    body = "Hello,\n\nHere are the top 5 performers for this week:\n\n"

    for performer in top_performers:
        body += f"Name: {performer.full_name}\nCourseID: {performer.course_id}\nScore: {performer.score}\n\n"

    body += "Keep up the great work!\n\nBest Regards,\nYour Team"

    # Get the email addresses of all users
    all_users = db.session.query(User).all()

    # Send email to all users
    for user in all_users:
        msg = Message(
            subject=subject,
            recipients=[user.email],  # Send to all users' emails
            body=body
        )
        try:
            mail.send(msg)
            print(f"Email sent to {user.email}")
        except Exception as e:
            print(f"Error sending email to {user.email}: {e}")

    return jsonify({'message': 'All users notified successfully about top performers'})


def calculate_points(progress):
    if progress == 100:
        return 40
    elif progress >= 60:
        return 20
    elif progress >= 30:
        return 10
    else:
        return 0

# API route to get user progress and calculate points
@app.route('/get-user-points', methods=['GET'])
def get_user_points():
    user_id = request.args.get('user_id')  # Get the user_id from request params

    # Query user progress data
    progress_data = UserProgress.query.filter_by(user_id=user_id).all()

    total_points = 0
    for progress_entry in progress_data:
        points = calculate_points(progress_entry.progress)
        total_points += points

    return jsonify({
        'user_id': user_id,
        'total_points': total_points
    })




if __name__ == '__main__':
    app.run(debug=True, host="127.0.0.1", port=5000)