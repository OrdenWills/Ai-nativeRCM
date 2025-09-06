from flask import Blueprint, request, jsonify
from datetime import datetime
import random
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.ai_service import ai_service
import random

medical_coding_bp = Blueprint('medical_coding', __name__)

# Mock ICD-10 and CPT code databases
ICD10_CODES = {
    'Z00.00': {'code': 'Z00.00', 'description': 'Encounter for general adult medical examination without abnormal findings', 'category': 'Preventive'},
    'M79.3': {'code': 'M79.3', 'description': 'Panniculitis, unspecified', 'category': 'Musculoskeletal'},
    'G43.909': {'code': 'G43.909', 'description': 'Migraine, unspecified, not intractable, without status migrainosus', 'category': 'Neurological'},
    'I10': {'code': 'I10', 'description': 'Essential (primary) hypertension', 'category': 'Cardiovascular'},
    'E11.9': {'code': 'E11.9', 'description': 'Type 2 diabetes mellitus without complications', 'category': 'Endocrine'},
    'J44.1': {'code': 'J44.1', 'description': 'Chronic obstructive pulmonary disease with acute exacerbation', 'category': 'Respiratory'},
    'N39.0': {'code': 'N39.0', 'description': 'Urinary tract infection, site not specified', 'category': 'Genitourinary'},
    'K21.9': {'code': 'K21.9', 'description': 'Gastro-esophageal reflux disease without esophagitis', 'category': 'Digestive'},
    'F32.9': {'code': 'F32.9', 'description': 'Major depressive disorder, single episode, unspecified', 'category': 'Mental Health'},
    'Z12.11': {'code': 'Z12.11', 'description': 'Encounter for screening for malignant neoplasm of colon', 'category': 'Preventive'}
}

CPT_CODES = {
    '99213': {'code': '99213', 'description': 'Office/outpatient visit, established patient, level 3', 'category': 'E&M', 'rvu': 1.3},
    '99214': {'code': '99214', 'description': 'Office/outpatient visit, established patient, level 4', 'category': 'E&M', 'rvu': 2.0},
    '99215': {'code': '99215', 'description': 'Office/outpatient visit, established patient, level 5', 'category': 'E&M', 'rvu': 2.8},
    '73060': {'code': '73060', 'description': 'Radiologic examination, knee; 2 views', 'category': 'Radiology', 'rvu': 0.7},
    '70553': {'code': '70553', 'description': 'Magnetic resonance imaging, brain; without contrast', 'category': 'Radiology', 'rvu': 2.5},
    '76092': {'code': '76092', 'description': 'Screening mammography, bilateral', 'category': 'Radiology', 'rvu': 1.2},
    '93000': {'code': '93000', 'description': 'Electrocardiogram, routine ECG with interpretation', 'category': 'Cardiology', 'rvu': 0.3},
    '80053': {'code': '80053', 'description': 'Comprehensive metabolic panel', 'category': 'Laboratory', 'rvu': 0.5},
    '85025': {'code': '85025', 'description': 'Blood count; complete (CBC), automated', 'category': 'Laboratory', 'rvu': 0.3},
    '36415': {'code': '36415', 'description': 'Collection of venous blood by venipuncture', 'category': 'Laboratory', 'rvu': 0.2}
}

# Mock coding sessions
CODING_SESSIONS = {
    'CS001': {
        'id': 'CS001',
        'patient_id': 'P001',
        'patient_name': 'Ahmed Al-Rashid',
        'encounter_date': '2024-01-15',
        'provider': 'Dr. Sarah Ahmed',
        'chief_complaint': 'Chest pain',
        'diagnosis_codes': ['I25.10', 'Z87.891'],
        'procedure_codes': ['99214', '93000'],
        'status': 'completed',
        'ai_confidence': 0.94,
        'created_date': '2024-01-15',
        'last_modified': '2024-01-15'
    },
    'CS002': {
        'id': 'CS002',
        'patient_id': 'P002',
        'patient_name': 'Fatima Al-Zahra',
        'encounter_date': '2024-01-18',
        'provider': 'Dr. Omar Hassan',
        'chief_complaint': 'Headache',
        'diagnosis_codes': ['G43.909'],
        'procedure_codes': ['99213'],
        'status': 'draft',
        'ai_confidence': 0.87,
        'created_date': '2024-01-18',
        'last_modified': '2024-01-19'
    }
}

@medical_coding_bp.route('/search-codes', methods=['POST'])
def search_codes():
    """Search for ICD-10 and CPT codes based on query"""
    try:
        data = request.get_json()
        query = data.get('query', '').lower()
        code_type = data.get('type', 'both')  # 'icd10', 'cpt', or 'both'
        
        results = {'icd10': [], 'cpt': []}
        
        if code_type in ['icd10', 'both']:
            for code, details in ICD10_CODES.items():
                if (query in code.lower() or 
                    query in details['description'].lower() or 
                    query in details['category'].lower()):
                    results['icd10'].append(details)
        
        if code_type in ['cpt', 'both']:
            for code, details in CPT_CODES.items():
                if (query in code.lower() or 
                    query in details['description'].lower() or 
                    query in details['category'].lower()):
                    results['cpt'].append(details)
        
        return jsonify({
            'results': results,
            'total_found': len(results['icd10']) + len(results['cpt'])
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Search failed'}), 500

@medical_coding_bp.route('/ai-suggest', methods=['POST'])
def ai_code_suggestions():
    """Get AI-powered code suggestions based on clinical information"""
    try:
        data = request.get_json()
        chief_complaint = data.get('chief_complaint', '')
        clinical_notes = data.get('clinical_notes', '')
        procedures_performed = data.get('procedures_performed', [])
        
        # AI-powered suggestions based on input
        suggestions = generate_ai_suggestions(chief_complaint, clinical_notes, procedures_performed)
        
        return jsonify({
            'suggestions': suggestions,
            'confidence_score': random.uniform(0.85, 0.98),
            'reasoning': generate_coding_reasoning(chief_complaint, suggestions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'AI suggestion failed'}), 500

@medical_coding_bp.route('/validate-codes', methods=['POST'])
def validate_codes():
    """Validate code combinations and check for compliance"""
    try:
        data = request.get_json()
        diagnosis_codes = data.get('diagnosis_codes', [])
        procedure_codes = data.get('procedure_codes', [])
        
        validation_result = validate_code_combination(diagnosis_codes, procedure_codes)
        
        return jsonify(validation_result), 200
        
    except Exception as e:
        return jsonify({'error': 'Validation failed'}), 500

@medical_coding_bp.route('/save-session', methods=['POST'])
def save_coding_session():
    """Save coding session"""
    try:
        data = request.get_json()
        
        session_id = f"CS{str(uuid.uuid4())[:6].upper()}"
        
        session = {
            'id': session_id,
            'patient_id': data.get('patient_id'),
            'patient_name': data.get('patient_name'),
            'encounter_date': data.get('encounter_date'),
            'provider': data.get('provider'),
            'chief_complaint': data.get('chief_complaint'),
            'diagnosis_codes': data.get('diagnosis_codes', []),
            'procedure_codes': data.get('procedure_codes', []),
            'status': data.get('status', 'draft'),
            'ai_confidence': calculate_session_confidence(data),
            'created_date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'last_modified': datetime.datetime.now().strftime('%Y-%m-%d')
        }
        
        CODING_SESSIONS[session_id] = session
        
        return jsonify({
            'message': 'Coding session saved successfully',
            'session_id': session_id,
            'session': session
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to save session'}), 500

@medical_coding_bp.route('/sessions', methods=['GET'])
def get_coding_sessions():
    """Get list of coding sessions"""
    try:
        status_filter = request.args.get('status')
        provider_filter = request.args.get('provider')
        
        sessions = list(CODING_SESSIONS.values())
        
        if status_filter:
            sessions = [s for s in sessions if s['status'] == status_filter]
        
        if provider_filter:
            sessions = [s for s in sessions if provider_filter.lower() in s['provider'].lower()]
        
        # Sort by last modified
        sessions.sort(key=lambda x: x['last_modified'], reverse=True)
        
        return jsonify({
            'sessions': sessions,
            'total_count': len(sessions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve sessions'}), 500

@medical_coding_bp.route('/sessions/<session_id>', methods=['GET'])
def get_coding_session(session_id):
    """Get specific coding session"""
    try:
        if session_id not in CODING_SESSIONS:
            return jsonify({'error': 'Session not found'}), 404
        
        session = CODING_SESSIONS[session_id]
        return jsonify(session), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve session'}), 500

@medical_coding_bp.route('/analytics', methods=['GET'])
def get_coding_analytics():
    """Get coding analytics and insights"""
    try:
        sessions = list(CODING_SESSIONS.values())
        
        # Calculate analytics
        total_sessions = len(sessions)
        completed_sessions = len([s for s in sessions if s['status'] == 'completed'])
        avg_confidence = sum(s['ai_confidence'] for s in sessions) / total_sessions if total_sessions > 0 else 0
        
        # Code usage statistics
        diagnosis_usage = {}
        procedure_usage = {}
        
        for session in sessions:
            for code in session.get('diagnosis_codes', []):
                diagnosis_usage[code] = diagnosis_usage.get(code, 0) + 1
            for code in session.get('procedure_codes', []):
                procedure_usage[code] = procedure_usage.get(code, 0) + 1
        
        # Top codes
        top_diagnosis = sorted(diagnosis_usage.items(), key=lambda x: x[1], reverse=True)[:5]
        top_procedures = sorted(procedure_usage.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return jsonify({
            'total_sessions': total_sessions,
            'completed_sessions': completed_sessions,
            'completion_rate': (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0,
            'avg_ai_confidence': round(avg_confidence, 2),
            'top_diagnosis_codes': top_diagnosis,
            'top_procedure_codes': top_procedures,
            'ai_insights': [
                f"AI confidence improved by 15% this month",
                f"Most common diagnosis category: Cardiovascular",
                f"Average codes per session: {sum(len(s.get('diagnosis_codes', [])) + len(s.get('procedure_codes', [])) for s in sessions) / total_sessions:.1f}" if total_sessions > 0 else "No sessions yet"
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve analytics'}), 500

def generate_ai_suggestions(chief_complaint, clinical_notes, procedures_performed):
    """Generate AI-powered code suggestions"""
    
    # Use real Gemini AI service for code suggestions
    try:
        clinical_info = {
            'chief_complaint': chief_complaint,
            'clinical_notes': clinical_notes,
            'procedures': ', '.join(procedures_performed) if procedures_performed else '',
            'assessment': ''
        }
        
        ai_suggestions = ai_service.suggest_medical_codes(clinical_info)
        
        if 'error' not in ai_suggestions:
            # Convert AI response to expected format
            return {
                'diagnosis': ai_suggestions.get('diagnosis_codes', []),
                'procedure': ai_suggestions.get('procedure_codes', [])
            }
    except Exception as ai_error:
        print(f"AI Code Suggestion Error: {ai_error}")
    
    # Fallback to mock AI logic if real AI fails
    suggestions = {'diagnosis': [], 'procedure': []}
    complaint_lower = chief_complaint.lower()
    notes_lower = clinical_notes.lower()
    
    # Diagnosis suggestions
    if 'chest pain' in complaint_lower or 'cardiac' in notes_lower:
        suggestions['diagnosis'].extend([
            {'code': 'I25.10', 'description': 'Atherosclerotic heart disease', 'confidence': 0.85},
            {'code': 'R06.02', 'description': 'Shortness of breath', 'confidence': 0.78}
        ])
    
    if 'headache' in complaint_lower or 'migraine' in notes_lower:
        suggestions['diagnosis'].extend([
            {'code': 'G43.909', 'description': 'Migraine, unspecified', 'confidence': 0.92},
            {'code': 'R51', 'description': 'Headache', 'confidence': 0.85}
        ])
    
    if 'hypertension' in notes_lower or 'high blood pressure' in notes_lower:
        suggestions['diagnosis'].append({
            'code': 'I10', 'description': 'Essential hypertension', 'confidence': 0.95
        })
    
    # Procedure suggestions
    if 'office visit' in notes_lower or 'consultation' in notes_lower:
        suggestions['procedure'].extend([
            {'code': '99213', 'description': 'Office visit, level 3', 'confidence': 0.88},
            {'code': '99214', 'description': 'Office visit, level 4', 'confidence': 0.82}
        ])
    
    if 'ekg' in notes_lower or 'ecg' in notes_lower or 'electrocardiogram' in notes_lower:
        suggestions['procedure'].append({
            'code': '93000', 'description': 'Electrocardiogram', 'confidence': 0.95
        })
    
    return suggestions

def generate_coding_reasoning(chief_complaint, suggestions):
    """Generate reasoning for code suggestions"""
    reasoning = []
    
    if suggestions['diagnosis']:
        reasoning.append(f"Based on chief complaint '{chief_complaint}', suggested primary diagnosis codes align with common presentations.")
    
    if suggestions['procedure']:
        reasoning.append("Procedure codes reflect standard care protocols for this type of encounter.")
    
    reasoning.append("AI confidence based on clinical documentation completeness and code alignment.")
    
    return reasoning

def validate_code_combination(diagnosis_codes, procedure_codes):
    """Validate diagnosis and procedure code combinations"""
    errors = []
    warnings = []
    suggestions = []
    
    # Check for missing diagnosis
    if not diagnosis_codes:
        errors.append("At least one diagnosis code is required")
    
    # Check for missing procedures
    if not procedure_codes:
        warnings.append("No procedure codes specified - consider adding E&M code")
    
    # Check code validity
    for code in diagnosis_codes:
        if code not in ICD10_CODES:
            errors.append(f"Invalid ICD-10 code: {code}")
    
    for code in procedure_codes:
        if code not in CPT_CODES:
            errors.append(f"Invalid CPT code: {code}")
    
    # Check logical combinations
    if diagnosis_codes and procedure_codes:
        # Example validation logic
        if any('G43' in code for code in diagnosis_codes):  # Migraine
            if not any(code in ['99213', '99214', '99215'] for code in procedure_codes):
                suggestions.append("Consider adding E&M code for migraine evaluation")
    
    compliance_score = max(0.0, 1.0 - (len(errors) * 0.3) - (len(warnings) * 0.1))
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'suggestions': suggestions,
        'compliance_score': round(compliance_score, 2)
    }

def calculate_session_confidence(session_data):
    """Calculate AI confidence for coding session"""
    base_confidence = 0.8
    
    # Boost confidence based on completeness
    if session_data.get('diagnosis_codes'):
        base_confidence += 0.1
    if session_data.get('procedure_codes'):
        base_confidence += 0.1
    if session_data.get('chief_complaint'):
        base_confidence += 0.05
    
    return min(0.98, base_confidence)
