from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///rcm_platform.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize database
from app.models.models import db
db.init_app(app)

# Import and register blueprints
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.routes.auth import auth_bp
from app.routes.eligibility import eligibility_bp
from app.routes.prior_auth import prior_auth_bp
from app.routes.claims import claims_bp
from app.routes.clinical_docs import clinical_docs_bp
from app.routes.medical_coding import medical_coding_bp
from app.routes.remittance import remittance_bp
from app.routes.dashboard import dashboard_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(eligibility_bp, url_prefix='/eligibility')
app.register_blueprint(prior_auth_bp, url_prefix='/prior-auth')
app.register_blueprint(claims_bp, url_prefix='/claims')
app.register_blueprint(clinical_docs_bp, url_prefix='/clinical-docs')
app.register_blueprint(medical_coding_bp, url_prefix='/medical-coding')
app.register_blueprint(remittance_bp, url_prefix='/remittance')
app.register_blueprint(dashboard_bp, url_prefix='/dashboard')


@app.route('/')
def health_check():
    return {'status': 'healthy', 'message': 'AI-native RCM Platform API is running'}

# Create database tables
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")

if __name__ == '__main__':
    app.run(debug=True, port=5002)
