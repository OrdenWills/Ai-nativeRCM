# Database models for the RCM platform

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
import json

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(20), unique=True, nullable=False)  # P001, P002, etc.
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    national_id = db.Column(db.String(50), unique=True)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    address = db.Column(db.Text)
    emergency_contact = db.Column(db.String(100))
    emergency_phone = db.Column(db.String(20))
    insurance_provider = db.Column(db.String(100))
    insurance_id = db.Column(db.String(50))
    policy_status = db.Column(db.String(20), default='active')
    coverage_details = db.Column(db.JSON)  # Store deductible, copay, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    claims = db.relationship('Claim', backref='patient', lazy=True)
    prior_authorizations = db.relationship('PriorAuthorization', backref='patient', lazy=True)
    eligibility_checks = db.relationship('EligibilityCheck', backref='patient', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'name': f'{self.first_name} {self.last_name}',
            'first_name': self.first_name,
            'last_name': self.last_name,
            'dob': self.dob.isoformat() if self.dob else None,
            'national_id': self.national_id,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'emergency_contact': self.emergency_contact,
            'emergency_phone': self.emergency_phone,
            'insurance_provider': self.insurance_provider,
            'insurance_id': self.insurance_id,
            'policy_status': self.policy_status,
            'coverage_details': self.coverage_details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Claim(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    submitted_date = db.Column(db.DateTime, default=datetime.utcnow)
    diagnosis_codes = db.Column(db.JSON)
    procedure_codes = db.Column(db.JSON)
    notes = db.Column(db.Text)

class PriorAuthorization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    service_type = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    submitted_date = db.Column(db.DateTime, default=datetime.utcnow)
    approved_date = db.Column(db.DateTime)
    expiration_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'service_type': self.service_type,
            'status': self.status,
            'submitted_date': self.submitted_date.isoformat() if self.submitted_date else None,
            'approved_date': self.approved_date.isoformat() if self.approved_date else None,
            'expiration_date': self.expiration_date.isoformat() if self.expiration_date else None,
            'notes': self.notes
        }

class EligibilityCheck(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    service_type = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # eligible, not_eligible, pending
    check_date = db.Column(db.DateTime, default=datetime.utcnow)
    coverage_details = db.Column(db.JSON)
    ai_prediction = db.Column(db.JSON)
    recommendations = db.Column(db.JSON)
    provider_response = db.Column(db.JSON)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'service_type': self.service_type,
            'status': self.status,
            'check_date': self.check_date.isoformat() if self.check_date else None,
            'coverage_details': self.coverage_details,
            'ai_prediction': self.ai_prediction,
            'recommendations': self.recommendations,
            'provider_response': self.provider_response
        }

class InsuranceProvider(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)  # daman, tawuniya, etc.
    name = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    contact_info = db.Column(db.JSON)
    api_endpoint = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'country': self.country,
            'contact_info': self.contact_info,
            'api_endpoint': self.api_endpoint,
            'is_active': self.is_active
        }
