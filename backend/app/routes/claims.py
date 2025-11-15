# routes/claims.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random
import uuid
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.ai_service import ai_service

claims_bp = Blueprint('claims', __name__)

# Mock claims database
CLAIMS_DB = {
    'CLM001': {
        'id': 'CLM001',
        'patient_id': 'P001',
        'patient_name': 'Ahmed Al-Rashid',
        'provider': 'Dr. Sarah Ahmed',
        'facility': 'Dubai Medical Center',
        'service_date': '2024-01-15',
        'submission_date': '2024-01-16',
        'claim_amount': 2500.00,
        'allowed_amount': 2000.00,
        'paid_amount': 1600.00,
        'patient_responsibility': 400.00,
        'status': 'paid',
        'insurance_provider': 'Daman Health Insurance',
        'diagnosis_codes': ['Z00.00', 'M79.3'],
        'procedure_codes': ['99213', '73060'],
        'ai_scrubbing': {
            'errors_found': 0,
            'warnings': 1,
            'confidence_score': 0.94,
            'issues': ['Minor: Service date close to weekend']
        },
        'denial_reason': None,
        'payment_date': '2024-01-25'
    },
    'CLM002': {
        'id': 'CLM002',
        'patient_id': 'P002',
        'patient_name': 'Fatima Al-Zahra',
        'provider': 'Dr. Omar Hassan',
        'facility': 'Riyadh Neurology Clinic',
        'service_date': '2024-01-18',
        'submission_date': '2024-01-19',
        'claim_amount': 1800.00,
        'allowed_amount': 1500.00,
        'paid_amount': 0.00,
        'patient_responsibility': 0.00,
        'status': 'denied',
        'insurance_provider': 'Tawuniya Insurance',
        'diagnosis_codes': ['G43.909'],
        'procedure_codes': ['70553'],
        'ai_scrubbing': {
            'errors_found': 2,
            'warnings': 0,
            'confidence_score': 0.67,
            'issues': ['Error: Missing prior authorization', 'Error: Diagnosis code mismatch']
        },
        'denial_reason': 'Prior authorization required',
        'payment_date': None
    },
    'CLM003': {
        'id': 'CLM003',
        'patient_id': 'P001',
        'patient_name': 'Ahmed Al-Rashid',
        'provider': 'Dr. Layla Mansour',
        'facility': 'Kuwait Diagnostic Center',
        'service_date': '2024-01-20',
        'submission_date': '2024-01-21',
        'claim_amount': 850.00,
        'allowed_amount': 850.00,
        'paid_amount': 0.00,
        'patient_responsibility': 85.00,
        'status': 'processing',
        'insurance_provider': 'Gulf Insurance Group',
        'diagnosis_codes': ['Z12.11'],
        'procedure_codes': ['76092'],
        'ai_scrubbing': {
            'errors_found': 0,
            'warnings': 0,
            'confidence_score': 0.98,
            'issues': []
        },
        'denial_reason': None,
        'payment_date': None
    }
}

@claims_bp.route('/submit', methods=['POST'])
def submit_claim():
    try:
        data = request.get_json()
        
        # Generate unique claim ID
        claim_id = f"CLM{str(uuid.uuid4())[:6].upper()}"
        
        # AI-powered claims scrubbing
        scrubbing_result = ai_claims_scrubbing(data)
        
        # Calculate amounts
        claim_amount = float(data.get('claim_amount', 0))
        allowed_amount = claim_amount * random.uniform(0.8, 1.0)  # Mock calculation
        
        claim = {
            'id': claim_id,
            'patient_id': data.get('patient_id'),
            'patient_name': data.get('patient_name'),
            'provider': data.get('provider'),
            'facility': data.get('facility'),
            'service_date': data.get('service_date'),
            'submission_date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'claim_amount': claim_amount,
            'allowed_amount': round(allowed_amount, 2),
            'paid_amount': 0.00,
            'patient_responsibility': 0.00,
            'status': 'submitted' if scrubbing_result['errors_found'] == 0 else 'review_required',
            'insurance_provider': data.get('insurance_provider'),
            'diagnosis_codes': data.get('diagnosis_codes', []),
            'procedure_codes': data.get('procedure_codes', []),
            'ai_scrubbing': scrubbing_result,
            'denial_reason': None,
            'payment_date': None
        }
        
        # Store in mock database
        CLAIMS_DB[claim_id] = claim
        
        return jsonify({
            'message': 'Claim submitted successfully',
            'claim_id': claim_id,
            'status': claim['status'],
            'ai_scrubbing': scrubbing_result,
            'estimated_processing_time': '7-14 business days'
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to submit claim'}), 500

@claims_bp.route('/batch-submit', methods=['POST'])
def batch_submit_claims():
    try:
        data = request.get_json()
        claims_data = data.get('claims', [])
        
        if not claims_data:
            return jsonify({'error': 'No claims provided'}), 400
        
        submitted_claims = []
        failed_claims = []
        
        for claim_data in claims_data:
            try:
                # Generate unique claim ID
                claim_id = f"CLM{str(uuid.uuid4())[:6].upper()}"
                
                # AI scrubbing
                scrubbing_result = ai_claims_scrubbing(claim_data)
                
                claim_amount = float(claim_data.get('claim_amount', 0))
                allowed_amount = claim_amount * random.uniform(0.8, 1.0)
                
                claim = {
                    'id': claim_id,
                    'patient_id': claim_data.get('patient_id'),
                    'patient_name': claim_data.get('patient_name'),
                    'provider': claim_data.get('provider'),
                    'facility': claim_data.get('facility'),
                    'service_date': claim_data.get('service_date'),
                    'submission_date': datetime.datetime.now().strftime('%Y-%m-%d'),
                    'claim_amount': claim_amount,
                    'allowed_amount': round(allowed_amount, 2),
                    'paid_amount': 0.00,
                    'patient_responsibility': 0.00,
                    'status': 'submitted' if scrubbing_result['errors_found'] == 0 else 'review_required',
                    'insurance_provider': claim_data.get('insurance_provider'),
                    'diagnosis_codes': claim_data.get('diagnosis_codes', []),
                    'procedure_codes': claim_data.get('procedure_codes', []),
                    'ai_scrubbing': scrubbing_result,
                    'denial_reason': None,
                    'payment_date': None
                }
                
                CLAIMS_DB[claim_id] = claim
                submitted_claims.append(claim_id)
                
            except Exception as e:
                failed_claims.append({
                    'patient_id': claim_data.get('patient_id'),
                    'error': str(e)
                })
        
        return jsonify({
            'message': f'Batch submission completed',
            'submitted_count': len(submitted_claims),
            'failed_count': len(failed_claims),
            'submitted_claims': submitted_claims,
            'failed_claims': failed_claims
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Batch submission failed'}), 500

@claims_bp.route('/status/<claim_id>', methods=['GET'])
def get_claim_status(claim_id):
    try:
        if claim_id not in CLAIMS_DB:
            return jsonify({'error': 'Claim not found'}), 404
        
        claim = CLAIMS_DB[claim_id]
        return jsonify(claim), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve claim status'}), 500

@claims_bp.route('/list', methods=['GET'])
def get_claims_list():
    try:
        status_filter = request.args.get('status')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        claims_list = list(CLAIMS_DB.values())
        
        # Apply filters
        if status_filter:
            claims_list = [c for c in claims_list if c['status'] == status_filter]
        
        if date_from:
            claims_list = [c for c in claims_list if c['submission_date'] >= date_from]
        
        if date_to:
            claims_list = [c for c in claims_list if c['submission_date'] <= date_to]
        
        # Sort by submission date
        claims_list.sort(key=lambda x: x['submission_date'], reverse=True)
        
        # Calculate summary statistics
        total_claims = len(claims_list)
        total_amount = sum(c['claim_amount'] for c in claims_list)
        paid_amount = sum(c['paid_amount'] for c in claims_list)
        
        status_counts = {}
        for claim in claims_list:
            status = claim['status']
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return jsonify({
            'claims': claims_list,
            'summary': {
                'total_claims': total_claims,
                'total_amount': round(total_amount, 2),
                'paid_amount': round(paid_amount, 2),
                'status_breakdown': status_counts
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve claims'}), 500

@claims_bp.route('/analytics', methods=['GET'])
def get_claims_analytics():
    try:
        claims_list = list(CLAIMS_DB.values())
        
        # Calculate analytics
        total_claims = len(claims_list)
        total_submitted = sum(c['claim_amount'] for c in claims_list)
        total_paid = sum(c['paid_amount'] for c in claims_list)
        
        denial_rate = len([c for c in claims_list if c['status'] == 'denied']) / total_claims * 100 if total_claims > 0 else 0
        
        avg_processing_time = 8.5  # Mock average
        
        # AI insights
        ai_insights = [
            f"Denial rate decreased by 12% this month",
            f"Claims with AI pre-screening have 85% approval rate",
            f"Average processing time: {avg_processing_time} days"
        ]
        
        return jsonify({
            'total_claims': total_claims,
            'total_submitted': round(total_submitted, 2),
            'total_paid': round(total_paid, 2),
            'denial_rate': round(denial_rate, 1),
            'avg_processing_time': avg_processing_time,
            'ai_insights': ai_insights
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve analytics'}), 500

def ai_claims_scrubbing(claim_data):
    """AI-powered claims scrubbing and validation"""
    
    # Use real Gemini AI service for claim scrubbing
    try:
        ai_scrub_result = ai_service.scrub_claim(claim_data)
        
        if 'error' not in ai_scrub_result:
            return {
                'errors_found': len(ai_scrub_result.get('errors', [])),
                'warnings': len(ai_scrub_result.get('warnings', [])),
                'errors': ai_scrub_result.get('errors', []),
                'warnings': ai_scrub_result.get('warnings', []),
                'confidence_score': ai_scrub_result.get('confidence_score', 0.85),
                'recommendations': ai_scrub_result.get('recommendations', [])
            }
    except Exception as ai_error:
        print(f"AI Claim Scrubbing Error: {ai_error}")
    
    # Fallback to mock validation logic if AI fails
    errors = []
    warnings = []
    confidence_score = 1.0
    
    # Check required fields
    required_fields = ['patient_id', 'diagnosis_codes', 'procedure_codes', 'claim_amount']
    for field in required_fields:
        if not claim_data.get(field):
            errors.append(f"Missing required field: {field}")
            confidence_score -= 0.2
    
    # Validate diagnosis and procedure code alignment
    diagnosis_codes = claim_data.get('diagnosis_codes', [])
    procedure_codes = claim_data.get('procedure_codes', [])
    
    # Mock validation logic
    if diagnosis_codes and procedure_codes:
        # Check for common mismatches
        if 'Z00.00' in diagnosis_codes and '70553' in procedure_codes:
            errors.append("Procedure code 70553 (MRI) not typically associated with routine examination")
            confidence_score -= 0.3
        
        if len(diagnosis_codes) > 3:
            warnings.append("High number of diagnosis codes - verify medical necessity")
            confidence_score -= 0.1
    
    # Check claim amount reasonableness
    claim_amount = float(claim_data.get('claim_amount', 0))
    if claim_amount > 10000:
        warnings.append("High claim amount - may require additional documentation")
        confidence_score -= 0.05
    elif claim_amount <= 0:
        errors.append("Invalid claim amount")
        confidence_score -= 0.3
    
    return {
        'errors_found': len(errors),
        'warnings': len(warnings),
        'confidence_score': max(0.0, round(confidence_score, 2)),
        'issues': issues
    }
