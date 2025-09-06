#!/usr/bin/env python3
"""
Database population script for AI-native RCM Platform
Generates comprehensive mock patient data for GCC healthcare systems
"""

import os
import sys
from datetime import datetime, date, timedelta
import random
from faker import Faker

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import Flask and create app instance
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///rcm_platform.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Import and initialize database
from app.models.models import db, Patient, InsuranceProvider, EligibilityCheck, PriorAuthorization, Claim
db.init_app(app)

# Initialize Faker with Arabic locale for GCC region
fake = Faker(['ar_SA', 'en_US'])

# GCC-specific data
GCC_COUNTRIES = ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain']

INSURANCE_PROVIDERS = [
    {'code': 'daman', 'name': 'Daman Health Insurance', 'country': 'UAE'},
    {'code': 'tawuniya', 'name': 'Tawuniya Insurance', 'country': 'Saudi Arabia'},
    {'code': 'oman_insurance', 'name': 'Oman Insurance Company', 'country': 'Oman'},
    {'code': 'gulf_insurance', 'name': 'Gulf Insurance Group', 'country': 'Kuwait'},
    {'code': 'qic', 'name': 'Qatar Insurance Company', 'country': 'Qatar'},
    {'code': 'solidarity_bahrain', 'name': 'Solidarity Bahrain', 'country': 'Bahrain'},
    {'code': 'allianz_gcc', 'name': 'Allianz GCC', 'country': 'UAE'},
    {'code': 'axa_gulf', 'name': 'AXA Gulf', 'country': 'UAE'},
    {'code': 'bupa_arabia', 'name': 'Bupa Arabia', 'country': 'Saudi Arabia'},
    {'code': 'medgulf', 'name': 'MedGulf Insurance', 'country': 'Saudi Arabia'}
]

# Common Arabic names for the GCC region
ARABIC_FIRST_NAMES_MALE = [
    'Ahmed', 'Mohammed', 'Abdullah', 'Omar', 'Ali', 'Hassan', 'Khalid', 'Fahad', 
    'Saad', 'Faisal', 'Nasser', 'Mansour', 'Abdulrahman', 'Saud', 'Turki'
]

ARABIC_FIRST_NAMES_FEMALE = [
    'Fatima', 'Aisha', 'Maryam', 'Khadija', 'Zahra', 'Noura', 'Sarah', 'Hanan',
    'Layla', 'Amina', 'Reem', 'Lina', 'Nadia', 'Hala', 'Dina'
]

ARABIC_LAST_NAMES = [
    'Al-Rashid', 'Al-Zahra', 'Al-Mansouri', 'Al-Khalifa', 'Al-Sabah', 'Al-Thani',
    'Al-Maktoum', 'Al-Nahyan', 'Al-Saud', 'Al-Qasimi', 'Al-Sharqi', 'Al-Nuaimi',
    'Al-Otaiba', 'Al-Mazrouei', 'Al-Shamsi', 'Al-Kaabi', 'Al-Marri', 'Al-Kuwari'
]

SERVICE_TYPES = [
    'general_consultation', 'specialist_consultation', 'emergency', 'surgery',
    'diagnostic_imaging', 'laboratory_tests', 'physiotherapy', 'dental',
    'maternity', 'pediatric', 'cardiology', 'orthopedic', 'dermatology'
]

def generate_national_id(country):
    """Generate realistic national ID based on country"""
    country_codes = {
        'UAE': '784',
        'Saudi Arabia': '966',
        'Qatar': '974',
        'Kuwait': '965',
        'Oman': '968',
        'Bahrain': '973'
    }
    
    code = country_codes.get(country, '784')
    year = random.randint(1970, 2005)
    number = random.randint(1000000, 9999999)
    return f"{code}-{year}-{number}"

def generate_phone_number(country):
    """Generate realistic phone numbers for GCC countries"""
    country_prefixes = {
        'UAE': '+971',
        'Saudi Arabia': '+966',
        'Qatar': '+974',
        'Kuwait': '+965',
        'Oman': '+968',
        'Bahrain': '+973'
    }
    
    prefix = country_prefixes.get(country, '+971')
    number = ''.join([str(random.randint(0, 9)) for _ in range(8)])
    return f"{prefix} {number[:2]} {number[2:5]} {number[5:]}"

def generate_coverage_details():
    """Generate realistic insurance coverage details"""
    return {
        'deductible': random.choice([0, 500, 1000, 1500, 2000]),
        'copay': random.choice([0, 25, 50, 75, 100]),
        'out_of_pocket_max': random.choice([3000, 5000, 7500, 10000, 15000]),
        'coverage_percentage': random.choice([70, 75, 80, 85, 90, 95]),
        'annual_limit': random.choice([50000, 100000, 200000, 500000, 1000000]),
        'family_coverage': random.choice([True, False]),
        'maternity_coverage': random.choice([True, False]),
        'dental_coverage': random.choice([True, False]),
        'vision_coverage': random.choice([True, False])
    }

def create_insurance_providers():
    """Create insurance provider records"""
    print("Creating insurance providers...")
    
    for provider_data in INSURANCE_PROVIDERS:
        existing = InsuranceProvider.query.filter_by(code=provider_data['code']).first()
        if not existing:
            contact_info = {
                'phone': generate_phone_number(provider_data['country']),
                'email': f"support@{provider_data['code']}.com",
                'website': f"https://www.{provider_data['code']}.com",
                'address': f"{fake.address()}, {provider_data['country']}"
            }
            
            provider = InsuranceProvider(
                code=provider_data['code'],
                name=provider_data['name'],
                country=provider_data['country'],
                contact_info=contact_info,
                api_endpoint=f"https://api.{provider_data['code']}.com/v1",
                is_active=True
            )
            db.session.add(provider)
    
    db.session.commit()
    print(f"Created {len(INSURANCE_PROVIDERS)} insurance providers")

def create_patients(num_patients=50):
    """Create comprehensive patient records"""
    print(f"Creating {num_patients} patients...")
    
    patients_created = 0
    
    for i in range(num_patients):
        # Generate patient demographics
        gender = random.choice(['male', 'female'])
        
        if gender == 'male':
            first_name = random.choice(ARABIC_FIRST_NAMES_MALE)
        else:
            first_name = random.choice(ARABIC_FIRST_NAMES_FEMALE)
        
        last_name = random.choice(ARABIC_LAST_NAMES)
        
        # Generate birth date (18-80 years old)
        birth_year = random.randint(1944, 2006)
        birth_month = random.randint(1, 12)
        birth_day = random.randint(1, 28)
        dob = date(birth_year, birth_month, birth_day)
        
        # Select random country and insurance provider
        country = random.choice(GCC_COUNTRIES)
        provider_data = random.choice(INSURANCE_PROVIDERS)
        
        # Generate unique patient ID
        patient_id = f"P{str(i+1).zfill(3)}"
        
        # Check if patient already exists
        existing = Patient.query.filter_by(patient_id=patient_id).first()
        if existing:
            continue
        
        patient = Patient(
            patient_id=patient_id,
            first_name=first_name,
            last_name=last_name,
            dob=dob,
            national_id=generate_national_id(country),
            phone=generate_phone_number(country),
            email=f"{first_name.lower()}.{last_name.lower().replace('-', '')}@email.com",
            address=f"{fake.address()}, {country}",
            emergency_contact=f"{random.choice(ARABIC_FIRST_NAMES_MALE + ARABIC_FIRST_NAMES_FEMALE)} {random.choice(ARABIC_LAST_NAMES)}",
            emergency_phone=generate_phone_number(country),
            insurance_provider=provider_data['code'],
            insurance_id=f"{provider_data['code'].upper()}-{random.randint(2020, 2024)}-{str(random.randint(1, 9999)).zfill(4)}",
            policy_status=random.choice(['active', 'active', 'active', 'suspended', 'expired']),  # 75% active
            coverage_details=generate_coverage_details()
        )
        
        db.session.add(patient)
        patients_created += 1
    
    db.session.commit()
    print(f"Created {patients_created} patients")
    return patients_created

def create_eligibility_checks():
    """Create eligibility check records"""
    print("Creating eligibility checks...")
    
    patients = Patient.query.all()
    checks_created = 0
    
    for patient in patients:
        # Create 1-5 eligibility checks per patient
        num_checks = random.randint(1, 5)
        
        for _ in range(num_checks):
            service_type = random.choice(SERVICE_TYPES)
            check_date = fake.date_time_between(start_date='-6M', end_date='now')
            
            # Generate AI prediction based on service type and coverage
            coverage_pct = patient.coverage_details.get('coverage_percentage', 80)
            
            base_costs = {
                'general_consultation': 200,
                'specialist_consultation': 500,
                'emergency': 1000,
                'surgery': 15000,
                'diagnostic_imaging': 800,
                'laboratory_tests': 300,
                'physiotherapy': 150,
                'dental': 400,
                'maternity': 8000,
                'pediatric': 250,
                'cardiology': 1200,
                'orthopedic': 2000,
                'dermatology': 350
            }
            
            total_cost = base_costs.get(service_type, 500)
            patient_cost = total_cost * (1 - coverage_pct / 100)
            
            ai_prediction = {
                'coverage_likelihood': random.randint(70, 98),
                'estimated_patient_cost': round(patient_cost, 2),
                'estimated_total_cost': total_cost,
                'confidence_score': round(random.uniform(0.7, 0.95), 2),
                'risk_factors': random.choice([
                    ['Pre-existing condition'],
                    ['High deductible'],
                    ['Service not covered'],
                    ['Prior authorization required'],
                    []
                ])
            }
            
            recommendations = []
            if patient.coverage_details.get('deductible', 0) > 1000:
                recommendations.append('Consider scheduling multiple services together to meet deductible')
            if service_type in ['surgery', 'maternity']:
                recommendations.append('Prior authorization required - submit request 5-7 days in advance')
            recommendations.append(f'Estimated copay: ${patient.coverage_details.get("copay", 50)}')
            
            eligibility_check = EligibilityCheck(
                patient_id=patient.id,
                service_type=service_type,
                status=random.choice(['eligible', 'eligible', 'not_eligible', 'pending']),
                check_date=check_date,
                coverage_details=patient.coverage_details,
                ai_prediction=ai_prediction,
                recommendations=recommendations,
                provider_response={
                    'response_time': f"{random.randint(1, 30)} seconds",
                    'verification_method': random.choice(['API', 'Manual', 'Automated']),
                    'reference_number': f"REF-{random.randint(100000, 999999)}"
                }
            )
            
            db.session.add(eligibility_check)
            checks_created += 1
    
    db.session.commit()
    print(f"Created {checks_created} eligibility checks")

def create_prior_authorizations():
    """Create prior authorization records"""
    print("Creating prior authorizations...")
    
    patients = Patient.query.all()
    auths_created = 0
    
    for patient in patients:
        # 30% chance of having prior authorizations
        if random.random() < 0.3:
            num_auths = random.randint(1, 3)
            
            for _ in range(num_auths):
                service_type = random.choice(['surgery', 'specialist_consultation', 'diagnostic_imaging', 'maternity'])
                submitted_date = fake.date_time_between(start_date='-3M', end_date='now')
                
                status = random.choice(['pending', 'approved', 'denied', 'expired'])
                
                approved_date = None
                expiration_date = None
                
                if status == 'approved':
                    approved_date = submitted_date + timedelta(days=random.randint(1, 7))
                    expiration_date = approved_date + timedelta(days=random.randint(30, 180))
                
                prior_auth = PriorAuthorization(
                    patient_id=patient.id,
                    service_type=service_type,
                    status=status,
                    submitted_date=submitted_date,
                    approved_date=approved_date,
                    expiration_date=expiration_date,
                    notes=f"Prior authorization for {service_type}. Reference: PA-{random.randint(100000, 999999)}"
                )
                
                db.session.add(prior_auth)
                auths_created += 1
    
    db.session.commit()
    print(f"Created {auths_created} prior authorizations")

def create_claims():
    """Create claim records"""
    print("Creating claims...")
    
    patients = Patient.query.all()
    claims_created = 0
    
    for patient in patients:
        # 40% chance of having claims
        if random.random() < 0.4:
            num_claims = random.randint(1, 4)
            
            for _ in range(num_claims):
                service_type = random.choice(SERVICE_TYPES)
                submitted_date = fake.date_time_between(start_date='-6M', end_date='now')
                
                # Generate claim amount based on service type
                base_amounts = {
                    'general_consultation': (150, 300),
                    'specialist_consultation': (400, 800),
                    'emergency': (800, 2000),
                    'surgery': (10000, 25000),
                    'diagnostic_imaging': (500, 1200),
                    'laboratory_tests': (100, 500),
                    'physiotherapy': (80, 200),
                    'dental': (200, 800),
                    'maternity': (5000, 12000),
                    'pediatric': (150, 400),
                    'cardiology': (800, 2000),
                    'orthopedic': (1000, 3000),
                    'dermatology': (200, 600)
                }
                
                min_amount, max_amount = base_amounts.get(service_type, (200, 500))
                amount = round(random.uniform(min_amount, max_amount), 2)
                
                # Generate diagnosis and procedure codes
                diagnosis_codes = [f"ICD-{random.randint(10, 99)}.{random.randint(1, 9)}" for _ in range(random.randint(1, 3))]
                procedure_codes = [f"CPT-{random.randint(10000, 99999)}" for _ in range(random.randint(1, 2))]
                
                claim = Claim(
                    patient_id=patient.id,
                    status=random.choice(['submitted', 'processing', 'approved', 'denied', 'paid']),
                    amount=amount,
                    submitted_date=submitted_date,
                    diagnosis_codes=diagnosis_codes,
                    procedure_codes=procedure_codes,
                    notes=f"Claim for {service_type} services. Total amount: ${amount}"
                )
                
                db.session.add(claim)
                claims_created += 1
    
    db.session.commit()
    print(f"Created {claims_created} claims")

def main():
    """Main function to populate the database"""
    print("Starting database population for AI-native RCM Platform...")
    print("=" * 60)
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created/verified")
        
        # Populate data
        create_insurance_providers()
        num_patients = create_patients(50)  # Create 50 patients
        create_eligibility_checks()
        create_prior_authorizations()
        create_claims()
        
        print("=" * 60)
        print("Database population completed successfully!")
        print(f"Summary:")
        print(f"- Insurance Providers: {len(INSURANCE_PROVIDERS)}")
        print(f"- Patients: {num_patients}")
        print(f"- Eligibility Checks: {EligibilityCheck.query.count()}")
        print(f"- Prior Authorizations: {PriorAuthorization.query.count()}")
        print(f"- Claims: {Claim.query.count()}")

if __name__ == "__main__":
    main()
