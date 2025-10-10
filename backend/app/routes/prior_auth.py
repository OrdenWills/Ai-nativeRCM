from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random
import uuid
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.ai_service import ai_service
from werkzeug.utils import secure_filename

prior_auth_bp = Blueprint('prior_auth', __name__)

# Mock prior authorization database
PRIOR_AUTH_DB = {
    'PA001': {
        'id': 'PA001',
        'patient_id': 'P001',
        'patient_name': 'Ahmed Al-Rashid',
        'procedure_code': 'CPT-29881',
        'procedure_name': 'Arthroscopy, knee, surgical',
        'diagnosis': 'M23.91 - Other internal derangement of knee',
        'provider': 'Dr. Sarah Ahmed',
        'facility': 'Dubai Medical Center',
        'status': 'approved',
        'submitted_date': '2024-01-10',
        'decision_date': '2024-01-12',
        'estimated_cost': 15000,
        'ai_analysis': {
            'approval_likelihood': 92,
            'risk_factors': ['Previous knee injury'],
            'recommendations': ['Include MRI results', 'Physical therapy history required']
        },
        'documents': ['medical_history.pdf', 'mri_scan.pdf']
    },
    'PA002': {
        'id': 'PA002',
        'patient_id': 'P002',
        'patient_name': 'Fatima Al-Zahra',
        'procedure_code': 'CPT-70553',
        'procedure_name': 'MRI brain with contrast',
        'diagnosis': 'G43.909 - Migraine, unspecified',
        'provider': 'Dr. Omar Hassan',
        'facility': 'Riyadh Neurology Clinic',
        'status': 'pending',
        'submitted_date': '2024-01-15',
        'decision_date': None,
        'estimated_cost': 2500,
        'ai_analysis': {
            'approval_likelihood': 78,
            'risk_factors': ['Chronic migraines', 'Previous normal CT'],
            'recommendations': ['Include headache diary', 'Failed conservative treatment documentation']
        },
        'documents': ['referral_letter.pdf']
    }
}

ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@prior_auth_bp.route('/submit', methods=['POST'])
def submit_prior_auth():
    try:
        data = request.get_json()
        
        # Generate unique ID
        auth_id = f"PA{str(uuid.uuid4())[:6].upper()}"
        
        # AI-powered analysis of the request
        ai_analysis = analyze_prior_auth_request(data)
        
        prior_auth = {
            'id': auth_id,
            'patient_id': data.get('patient_id'),
            'patient_name': data.get('patient_name'),
            'procedure_code': data.get('procedure_code'),
            'procedure_name': data.get('procedure_name'),
            'diagnosis': data.get('diagnosis'),
            'provider': data.get('provider'),
            'facility': data.get('facility'),
            'status': 'pending',
            'submitted_date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'decision_date': None,
            'estimated_cost': data.get('estimated_cost', 0),
            'ai_analysis': ai_analysis,
            'documents': []
        }
        
        # Store in mock database
        PRIOR_AUTH_DB[auth_id] = prior_auth
        
        return jsonify({
            'message': 'Prior authorization submitted successfully',
            'authorization_id': auth_id,
            'ai_analysis': ai_analysis,
            'estimated_decision_time': '2-3 business days'
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to submit prior authorization'}), 500

@prior_auth_bp.route('/upload/<auth_id>', methods=['POST'])
def upload_document(auth_id):
    try:
        if auth_id not in PRIOR_AUTH_DB:
            return jsonify({'error': 'Authorization not found'}), 404
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # In production, save to cloud storage
            # file.save(os.path.join(upload_folder, filename))
            
            # Add to authorization record
            PRIOR_AUTH_DB[auth_id]['documents'].append(filename)
            
            # Re-analyze with new document
            updated_analysis = analyze_documents(PRIOR_AUTH_DB[auth_id])
            PRIOR_AUTH_DB[auth_id]['ai_analysis'] = updated_analysis
            
            return jsonify({
                'message': 'Document uploaded successfully',
                'filename': filename,
                'updated_analysis': updated_analysis
            }), 200
        
        return jsonify({'error': 'Invalid file type'}), 400
        
    except Exception as e:
        return jsonify({'error': 'File upload failed'}), 500

@prior_auth_bp.route('/status/<auth_id>', methods=['GET'])
def get_auth_status(auth_id):
    try:
        if auth_id not in PRIOR_AUTH_DB:
            return jsonify({'error': 'Authorization not found'}), 404
        
        auth = PRIOR_AUTH_DB[auth_id]
        return jsonify(auth), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve status'}), 500

@prior_auth_bp.route('/list', methods=['GET'])
def get_auth_list():
    try:
        # Filter by user/provider in production
        auth_list = list(PRIOR_AUTH_DB.values())
        
        # Sort by submitted date
        auth_list.sort(key=lambda x: x['submitted_date'], reverse=True)
        
        return jsonify({
            'authorizations': auth_list,
            'total_count': len(auth_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve authorizations'}), 500

@prior_auth_bp.route('/update-status/<auth_id>', methods=['PUT'])
def update_auth_status(auth_id):
    try:
        if auth_id not in PRIOR_AUTH_DB:
            return jsonify({'error': 'Authorization not found'}), 404
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'approved', 'denied', 'more_info_needed']:
            return jsonify({'error': 'Invalid status'}), 400
        
        PRIOR_AUTH_DB[auth_id]['status'] = new_status
        if new_status in ['approved', 'denied']:
            PRIOR_AUTH_DB[auth_id]['decision_date'] = datetime.datetime.now().strftime('%Y-%m-%d')
        
        return jsonify({
            'message': 'Status updated successfully',
            'authorization': PRIOR_AUTH_DB[auth_id]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to update status'}), 500

def analyze_prior_auth_request(data):
    """AI-powered analysis of prior authorization request"""
    
    # Use real Gemini AI service for prior authorization analysis
    try:
        ai_analysis = ai_service.analyze_prior_auth_request(data)
        
        if 'error' not in ai_analysis:
            return {
                'approval_likelihood': ai_analysis.get('approval_likelihood', 85),
                'risk_factors': ai_analysis.get('risk_factors', []),
                'recommendations': ai_analysis.get('recommendations', []),
                'confidence_score': ai_analysis.get('confidence_score', 0.85)
            }
    except Exception as ai_error:
        print(f"AI Prior Auth Analysis Error: {ai_error}")
    
    # Fallback to mock analysis if AI fails
    procedure = data.get('procedure', '').lower()
    diagnosis = data.get('diagnosis', '').lower()
    medical_history = data.get('medical_history', '').lower()
    
    approval_likelihood = 85
    risk_factors = []
    recommendations = ['AI analysis temporarily unavailable - manual review required']
    
    # Adjust likelihood based on procedure complexity
    if 'surgery' in procedure or 'operation' in procedure:
        approval_likelihood -= 10
        recommendations.append('Detailed surgical plan required')
        ai_analysis['recommendations'].extend(['Include referral reason', 'Primary care notes'])
        ai_analysis['required_documents'].extend(['referral_letter.pdf'])
    
    return ai_analysis

def analyze_documents(auth_record):
    """AI-powered document analysis"""
    base_analysis = auth_record['ai_analysis']
    documents = auth_record.get('documents', [])
    
    # Boost approval likelihood based on document completeness
    doc_bonus = min(len(documents) * 5, 15)
    base_analysis['approval_likelihood'] = min(base_analysis['approval_likelihood'] + doc_bonus, 98)
    
    # Add document-specific insights
    if any('mri' in doc.lower() for doc in documents):
        base_analysis['recommendations'].append('MRI results support medical necessity')
    
    if any('referral' in doc.lower() for doc in documents):
        base_analysis['recommendations'].append('Proper referral documentation provided')
    
    return base_analysis
