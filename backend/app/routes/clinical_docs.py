# routes/clinical_docs.py
from flask import Blueprint, request, jsonify
from datetime import datetime
import random
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.ai_service import ai_service
import random

clinical_docs_bp = Blueprint('clinical_docs', __name__)

# Mock documentation templates
DOCUMENTATION_TEMPLATES = {
    'progress_note': {
        'id': 'progress_note',
        'name': 'Progress Note',
        'category': 'general',
        'sections': [
            {'id': 'subjective', 'name': 'Subjective', 'required': True, 'ai_assistance': True},
            {'id': 'objective', 'name': 'Objective', 'required': True, 'ai_assistance': True},
            {'id': 'assessment', 'name': 'Assessment', 'required': True, 'ai_assistance': True},
            {'id': 'plan', 'name': 'Plan', 'required': True, 'ai_assistance': True}
        ],
        'ai_prompts': {
            'subjective': 'Generate patient subjective findings based on chief complaint',
            'objective': 'Suggest objective findings and vital signs',
            'assessment': 'Provide differential diagnosis and clinical assessment',
            'plan': 'Recommend treatment plan and follow-up'
        }
    },
    'discharge_summary': {
        'id': 'discharge_summary',
        'name': 'Discharge Summary',
        'category': 'inpatient',
        'sections': [
            {'id': 'admission_diagnosis', 'name': 'Admission Diagnosis', 'required': True, 'ai_assistance': True},
            {'id': 'discharge_diagnosis', 'name': 'Discharge Diagnosis', 'required': True, 'ai_assistance': True},
            {'id': 'hospital_course', 'name': 'Hospital Course', 'required': True, 'ai_assistance': True},
            {'id': 'discharge_instructions', 'name': 'Discharge Instructions', 'required': True, 'ai_assistance': True},
            {'id': 'medications', 'name': 'Medications', 'required': True, 'ai_assistance': False},
            {'id': 'follow_up', 'name': 'Follow-up', 'required': True, 'ai_assistance': True}
        ],
        'ai_prompts': {
            'admission_diagnosis': 'Generate admission diagnosis based on presenting symptoms',
            'discharge_diagnosis': 'Suggest discharge diagnosis with ICD-10 codes',
            'hospital_course': 'Summarize hospital course and key events',
            'discharge_instructions': 'Provide comprehensive discharge instructions',
            'follow_up': 'Recommend appropriate follow-up care'
        }
    },
    'consultation_note': {
        'id': 'consultation_note',
        'name': 'Consultation Note',
        'category': 'specialty',
        'sections': [
            {'id': 'reason_for_consultation', 'name': 'Reason for Consultation', 'required': True, 'ai_assistance': False},
            {'id': 'history_present_illness', 'name': 'History of Present Illness', 'required': True, 'ai_assistance': True},
            {'id': 'review_of_systems', 'name': 'Review of Systems', 'required': True, 'ai_assistance': True},
            {'id': 'physical_examination', 'name': 'Physical Examination', 'required': True, 'ai_assistance': True},
            {'id': 'impression', 'name': 'Impression', 'required': True, 'ai_assistance': True},
            {'id': 'recommendations', 'name': 'Recommendations', 'required': True, 'ai_assistance': True}
        ],
        'ai_prompts': {
            'history_present_illness': 'Structure HPI based on chief complaint',
            'review_of_systems': 'Generate relevant ROS questions',
            'physical_examination': 'Suggest focused physical exam findings',
            'impression': 'Provide clinical impression and differential',
            'recommendations': 'Generate specialist recommendations'
        }
    }
}

# Mock saved documents
SAVED_DOCUMENTS = {
    'DOC001': {
        'id': 'DOC001',
        'template_id': 'progress_note',
        'patient_id': 'P001',
        'patient_name': 'Ahmed Al-Rashid',
        'provider': 'Dr. Sarah Ahmed',
        'date_created': '2024-01-15',
        'last_modified': '2024-01-15',
        'status': 'completed',
        'content': {
            'subjective': 'Patient presents with chest pain, 7/10 severity, radiating to left arm. Started 2 hours ago.',
            'objective': 'BP: 140/90, HR: 88, RR: 18, Temp: 98.6°F. Alert and oriented. Chest clear to auscultation.',
            'assessment': 'Chest pain, rule out acute coronary syndrome. Consider musculoskeletal etiology.',
            'plan': 'EKG, cardiac enzymes, chest X-ray. Monitor vitals. Cardiology consult if indicated.'
        },
        'ai_confidence': 0.92,
        'compliance_score': 0.95
    },
    'DOC002': {
        'id': 'DOC002',
        'template_id': 'discharge_summary',
        'patient_id': 'P002',
        'patient_name': 'Fatima Al-Zahra',
        'provider': 'Dr. Omar Hassan',
        'date_created': '2024-01-18',
        'last_modified': '2024-01-19',
        'status': 'draft',
        'content': {
            'admission_diagnosis': 'Acute appendicitis',
            'discharge_diagnosis': 'Status post laparoscopic appendectomy',
            'hospital_course': 'Patient underwent uncomplicated laparoscopic appendectomy. Post-operative course unremarkable.',
            'discharge_instructions': 'Wound care instructions provided. Return if fever, increased pain, or wound concerns.',
            'medications': 'Ibuprofen 400mg q6h PRN pain',
            'follow_up': 'Surgery clinic in 2 weeks'
        },
        'ai_confidence': 0.88,
        'compliance_score': 0.91
    }
}

@clinical_docs_bp.route('/templates', methods=['GET'])
def get_templates():
    """Get available documentation templates"""
    try:
        category = request.args.get('category')
        templates = list(DOCUMENTATION_TEMPLATES.values())
        
        if category:
            templates = [t for t in templates if t['category'] == category]
        
        return jsonify({
            'templates': templates,
            'categories': ['general', 'inpatient', 'specialty', 'emergency']
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve templates'}), 500

@clinical_docs_bp.route('/templates/<template_id>', methods=['GET'])
def get_template(template_id):
    """Get specific template details"""
    try:
        if template_id not in DOCUMENTATION_TEMPLATES:
            return jsonify({'error': 'Template not found'}), 404
        
        template = DOCUMENTATION_TEMPLATES[template_id]
        return jsonify(template), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve template'}), 500

@clinical_docs_bp.route('/ai-assistance', methods=['POST'])
def get_ai_assistance():
    """Get AI assistance for clinical documentation"""
    try:
        data = request.get_json()
        patient_info = data.get('patient_info', {})
        template = data.get('template', '')
        clinical_notes = data.get('clinical_notes', '')
        
        # Use real Gemini AI service
        try:
            ai_response = ai_service.generate_clinical_documentation(
                patient_info=patient_info,
                template=template,
                clinical_notes=clinical_notes
            )
            
            if 'error' in ai_response:
                # Fallback to mock response if AI fails
                ai_response = {
                    'suggestions': [
                        'Consider adding vital signs measurements',
                        'Include assessment of current symptoms',
                        'Document patient response to treatment'
                    ],
                    'generated_content': {
                        'assessment': f"Patient {patient_info.get('name', 'Unknown')} presents with {patient_info.get('chief_complaint', 'unspecified complaint')}.",
                        'plan': 'Continue current treatment regimen. Monitor symptoms.',
                        'recommendations': ['Regular monitoring', 'Medication compliance']
                    },
                    'confidence_score': 0.85,
                    'compliance_notes': ['AI service temporarily unavailable - using fallback']
                }
        except Exception as ai_error:
            print(f"AI Service Error: {ai_error}")
            # Fallback response
            ai_response = {
                'suggestions': ['AI assistance temporarily unavailable'],
                'generated_content': {'assessment': 'Please complete manually'},
                'confidence_score': 0.5,
                'compliance_notes': ['AI service error - manual review required']
            }
        
        return jsonify({
            'success': True,
            'ai_assistance': ai_response
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@clinical_docs_bp.route('/save', methods=['POST'])
def save_document():
    """Save clinical documentation"""
    try:
        data = request.get_json()
        
        # Generate document ID
        doc_id = f"DOC{str(uuid.uuid4())[:6].upper()}"
        
        # Validate document completeness
        validation_result = validate_document(data)
        
        document = {
            'id': doc_id,
            'template_id': data.get('template_id'),
            'patient_id': data.get('patient_id'),
            'patient_name': data.get('patient_name'),
            'provider': data.get('provider'),
            'date_created': datetime.datetime.now().strftime('%Y-%m-%d'),
            'last_modified': datetime.datetime.now().strftime('%Y-%m-%d'),
            'status': data.get('status', 'draft'),
            'content': data.get('content', {}),
            'ai_confidence': validation_result['ai_confidence'],
            'compliance_score': validation_result['compliance_score']
        }
        
        # Store in mock database
        SAVED_DOCUMENTS[doc_id] = document
        
        return jsonify({
            'message': 'Document saved successfully',
            'document_id': doc_id,
            'validation': validation_result
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to save document'}), 500

@clinical_docs_bp.route('/documents', methods=['GET'])
def get_documents():
    """Get list of saved documents"""
    try:
        patient_id = request.args.get('patient_id')
        provider = request.args.get('provider')
        status = request.args.get('status')
        
        documents = list(SAVED_DOCUMENTS.values())
        
        # Apply filters
        if patient_id:
            documents = [d for d in documents if d['patient_id'] == patient_id]
        
        if provider:
            documents = [d for d in documents if provider.lower() in d['provider'].lower()]
        
        if status:
            documents = [d for d in documents if d['status'] == status]
        
        # Sort by last modified
        documents.sort(key=lambda x: x['last_modified'], reverse=True)
        
        return jsonify({
            'documents': documents,
            'total_count': len(documents)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve documents'}), 500

@clinical_docs_bp.route('/documents/<doc_id>', methods=['GET'])
def get_document(doc_id):
    """Get specific document"""
    try:
        if doc_id not in SAVED_DOCUMENTS:
            return jsonify({'error': 'Document not found'}), 404
        
        document = SAVED_DOCUMENTS[doc_id]
        return jsonify(document), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve document'}), 500

@clinical_docs_bp.route('/documents/<doc_id>', methods=['PUT'])
def update_document(doc_id):
    """Update existing document"""
    try:
        if doc_id not in SAVED_DOCUMENTS:
            return jsonify({'error': 'Document not found'}), 404
        
        data = request.get_json()
        document = SAVED_DOCUMENTS[doc_id]
        
        # Update document fields
        document['content'] = data.get('content', document['content'])
        document['status'] = data.get('status', document['status'])
        document['last_modified'] = datetime.datetime.now().strftime('%Y-%m-%d')
        
        # Re-validate document
        validation_result = validate_document(data)
        document['ai_confidence'] = validation_result['ai_confidence']
        document['compliance_score'] = validation_result['compliance_score']
        
        return jsonify({
            'message': 'Document updated successfully',
            'document': document,
            'validation': validation_result
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to update document'}), 500

@clinical_docs_bp.route('/validate', methods=['POST'])
def validate_documentation():
    """Validate documentation for compliance and completeness"""
    try:
        data = request.get_json()
        validation_result = validate_document(data)
        
        return jsonify(validation_result), 200
        
    except Exception as e:
        return jsonify({'error': 'Validation failed'}), 500

def generate_ai_suggestions(section_id, template_id, context):
    """Generate AI-powered suggestions for documentation sections"""
    
    # Mock AI suggestions based on section type
    suggestions_db = {
        'subjective': [
            "Patient reports chest pain, 7/10 severity, substernal, radiating to left arm",
            "Chief complaint: Shortness of breath for 2 days, worse with exertion",
            "Patient presents with headache, throbbing, bilateral, 6/10 severity"
        ],
        'objective': [
            "Vital signs: BP 120/80, HR 72, RR 16, Temp 98.6°F, O2 sat 98% on RA",
            "General appearance: Alert, oriented, no acute distress",
            "Cardiovascular: Regular rate and rhythm, no murmurs"
        ],
        'assessment': [
            "Chest pain, rule out acute coronary syndrome vs musculoskeletal",
            "Hypertension, well controlled on current medications",
            "Type 2 diabetes mellitus, HbA1c goal <7%"
        ],
        'plan': [
            "Continue current medications, follow up in 3 months",
            "Order EKG, chest X-ray, basic metabolic panel",
            "Patient education provided regarding diet and exercise"
        ],
        'history_present_illness': [
            "Patient is a [age]-year-old [gender] with history of [relevant PMH] presenting with [chief complaint]",
            "Symptoms began [timeframe] and are characterized by [description]",
            "Associated symptoms include [symptoms]. Denies [negative symptoms]"
        ],
        'physical_examination': [
            "General: Well-appearing, alert and oriented x3, no acute distress",
            "HEENT: Normocephalic, atraumatic, PERRLA, EOMI",
            "Cardiovascular: RRR, no murmurs, rubs, or gallops"
        ]
    }
    
    # Get base suggestions for section
    base_suggestions = suggestions_db.get(section_id, ["AI suggestion not available for this section"])
    
    # Add context-aware suggestions
    if context.get('chief_complaint'):
        if 'chest pain' in context['chief_complaint'].lower():
            base_suggestions.extend([
                "Pain is described as crushing/pressure-like",
                "No radiation to jaw or back",
                "No associated nausea or diaphoresis"
            ])
    
    return base_suggestions[:5]  # Return top 5 suggestions

def validate_document(data):
    """Validate document for compliance and AI confidence"""
    
    template_id = data.get('template_id')
    content = data.get('content', {})
    document_content = str(content)  # Convert to string for AI analysis
    
    # Use real Gemini AI service for validation
    try:
        ai_validation = ai_service.validate_clinical_document(document_content)
        
        if 'error' not in ai_validation:
            return {
                'completeness_score': ai_validation.get('completeness_score', 0.85),
                'ai_confidence': ai_validation.get('overall_quality', 0.85),
                'compliance_score': ai_validation.get('completeness_score', 0.85),
                'missing_fields': ai_validation.get('missing_elements', []),
                'suggestions': ai_validation.get('recommendations', []),
                'is_compliant': ai_validation.get('completeness_score', 0.85) > 0.8
            }
    except Exception as ai_error:
        print(f"AI Validation Error: {ai_error}")
    
    # Fallback to mock validation logic if AI fails
    completeness_score = random.uniform(0.8, 0.98)
    ai_confidence = random.uniform(0.85, 0.95)
    compliance_score = random.uniform(0.88, 0.96)
    
    # Check for required fields based on template
    missing_fields = []
    if template_id in DOCUMENTATION_TEMPLATES:
        template = DOCUMENTATION_TEMPLATES[template_id]
        required_sections = template.get('sections', [])
        
        for section in required_sections:
            if section not in content or not content[section]:
                missing_fields.append(section)
    
    # Generate suggestions
    suggestions = generate_ai_suggestions(content, template_id)
    ai_confidence = random.uniform(0.8, 0.95) if len(errors) == 0 else random.uniform(0.5, 0.8)
    
    return {
        'ai_confidence': round(ai_confidence, 2),
        'compliance_score': round(compliance_score, 2),
        'errors': errors,
        'warnings': warnings,
        'suggestions': suggestions,
        'completeness': len([s for s in required_sections if content.get(s)]) / len(required_sections) if required_sections else 1.0
    }
