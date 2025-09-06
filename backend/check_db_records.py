#!/usr/bin/env python3
"""
Script to check database records for dashboard integration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from dotenv import load_dotenv
from app.models.models import db, Patient, Claim, PriorAuthorization, EligibilityCheck, InsuranceProvider

def check_database_records():
    # Load environment variables
    load_dotenv()
    
    # Create Flask app
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///rcm_platform.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    db.init_app(app)
    
    with app.app_context():
        print("=== DATABASE RECORDS SUMMARY ===\n")
        
        # Check Patients
        patient_count = Patient.query.count()
        print(f"📋 Patients: {patient_count}")
        if patient_count > 0:
            patients = Patient.query.limit(3).all()
            for patient in patients:
                print(f"  - {patient.patient_id}: {patient.first_name} {patient.last_name} ({patient.insurance_provider})")
        
        # Check Claims
        claim_count = Claim.query.count()
        print(f"\n💰 Claims: {claim_count}")
        if claim_count > 0:
            claims = Claim.query.limit(3).all()
            for claim in claims:
                print(f"  - ID {claim.id}: ${claim.amount} - Status: {claim.status}")
        
        # Check Prior Authorizations
        prior_auth_count = PriorAuthorization.query.count()
        print(f"\n🔐 Prior Authorizations: {prior_auth_count}")
        if prior_auth_count > 0:
            prior_auths = PriorAuthorization.query.limit(3).all()
            for auth in prior_auths:
                print(f"  - ID {auth.id}: {auth.service_type} - Status: {auth.status}")
        
        # Check Eligibility Checks
        eligibility_count = EligibilityCheck.query.count()
        print(f"\n✅ Eligibility Checks: {eligibility_count}")
        if eligibility_count > 0:
            eligibility_checks = EligibilityCheck.query.limit(3).all()
            for check in eligibility_checks:
                print(f"  - ID {check.id}: {check.service_type} - Status: {check.status}")
        
        # Check Insurance Providers
        insurance_count = InsuranceProvider.query.count()
        print(f"\n🏥 Insurance Providers: {insurance_count}")
        if insurance_count > 0:
            providers = InsuranceProvider.query.all()
            for provider in providers:
                print(f"  - {provider.code}: {provider.name} ({provider.country})")
        
        print("\n=== DASHBOARD STATISTICS CALCULATION ===")
        
        # Calculate statistics for dashboard
        if claim_count > 0:
            pending_claims = Claim.query.filter_by(status='pending').count()
            approved_claims = Claim.query.filter_by(status='approved').count()
            denied_claims = Claim.query.filter_by(status='denied').count()
            total_claim_amount = db.session.query(db.func.sum(Claim.amount)).scalar() or 0
            
            print(f"Claims Statistics:")
            print(f"  - Pending: {pending_claims}")
            print(f"  - Approved: {approved_claims}")
            print(f"  - Denied: {denied_claims}")
            print(f"  - Total Amount: ${total_claim_amount:,.2f}")
        
        if prior_auth_count > 0:
            pending_auths = PriorAuthorization.query.filter_by(status='pending').count()
            approved_auths = PriorAuthorization.query.filter_by(status='approved').count()
            
            print(f"\nPrior Authorization Statistics:")
            print(f"  - Pending: {pending_auths}")
            print(f"  - Approved: {approved_auths}")
        
        if eligibility_count > 0:
            eligible_checks = EligibilityCheck.query.filter_by(status='eligible').count()
            not_eligible_checks = EligibilityCheck.query.filter_by(status='not_eligible').count()
            pending_checks = EligibilityCheck.query.filter_by(status='pending').count()
            
            print(f"\nEligibility Check Statistics:")
            print(f"  - Eligible: {eligible_checks}")
            print(f"  - Not Eligible: {not_eligible_checks}")
            print(f"  - Pending: {pending_checks}")

if __name__ == "__main__":
    check_database_records()
