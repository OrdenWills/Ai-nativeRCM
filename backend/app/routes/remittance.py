from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random
import uuid
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.ai_service import ai_service

remittance_bp = Blueprint('remittance', __name__)

# Mock data for remittance and reconciliation
mock_payments = [
    {
        'id': 'PAY001',
        'claim_id': 'CLM001',
        'patient_name': 'Ahmed Al-Rashid',
        'payer': 'Saudi Health Insurance',
        'amount_billed': 1500.00,
        'amount_paid': 1350.00,
        'payment_date': '2024-01-15',
        'status': 'posted',
        'denial_reason': None,
        'adjustment_codes': ['CO-45'],
        'adjustment_amount': 150.00
    },
    {
        'id': 'PAY002',
        'claim_id': 'CLM002',
        'patient_name': 'Fatima Al-Zahra',
        'payer': 'UAE National Insurance',
        'amount_billed': 800.00,
        'amount_paid': 0.00,
        'payment_date': None,
        'status': 'denied',
        'denial_reason': 'Prior authorization required',
        'adjustment_codes': ['CO-197'],
        'adjustment_amount': 800.00
    }
]

mock_reconciliation_sessions = [
    {
        'id': 'REC001',
        'session_date': '2024-01-15',
        'total_payments': 15,
        'matched_payments': 12,
        'unmatched_payments': 3,
        'total_amount': 25000.00,
        'matched_amount': 22500.00,
        'discrepancies': 2500.00,
        'status': 'completed',
        'ai_confidence': 0.94
    }
]

@remittance_bp.route('/payments', methods=['GET'])
def get_payments():
    """Get list of payments with filtering options"""
    try:
        status = request.args.get('status')
        payer = request.args.get('payer')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        filtered_payments = mock_payments.copy()
        
        if status:
            filtered_payments = [p for p in filtered_payments if p['status'] == status]
        if payer:
            filtered_payments = [p for p in filtered_payments if payer.lower() in p['payer'].lower()]
        
        return jsonify({
            'success': True,
            'payments': filtered_payments,
            'total': len(filtered_payments)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@remittance_bp.route('/payments/post', methods=['POST'])
def post_payment():
    """Post a new payment"""
    try:
        data = request.get_json()
        
        new_payment = {
            'id': f'PAY{random.randint(100, 999)}',
            'claim_id': data.get('claim_id'),
            'patient_name': data.get('patient_name'),
            'payer': data.get('payer'),
            'amount_billed': float(data.get('amount_billed', 0)),
            'amount_paid': float(data.get('amount_paid', 0)),
            'payment_date': data.get('payment_date'),
            'status': 'posted',
            'denial_reason': data.get('denial_reason'),
            'adjustment_codes': data.get('adjustment_codes', []),
            'adjustment_amount': float(data.get('adjustment_amount', 0))
        }
        
        mock_payments.append(new_payment)
        
        return jsonify({
            'success': True,
            'message': 'Payment posted successfully',
            'payment': new_payment
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@remittance_bp.route('/payments/batch-post', methods=['POST'])
def batch_post_payments():
    """Post multiple payments at once"""
    try:
        data = request.get_json()
        payments_data = data.get('payments', [])
        
        posted_payments = []
        for payment_data in payments_data:
            new_payment = {
                'id': f'PAY{random.randint(100, 999)}',
                'claim_id': payment_data.get('claim_id'),
                'patient_name': payment_data.get('patient_name'),
                'payer': payment_data.get('payer'),
                'amount_billed': float(payment_data.get('amount_billed', 0)),
                'amount_paid': float(payment_data.get('amount_paid', 0)),
                'payment_date': payment_data.get('payment_date'),
                'status': 'posted',
                'denial_reason': payment_data.get('denial_reason'),
                'adjustment_codes': payment_data.get('adjustment_codes', []),
                'adjustment_amount': float(payment_data.get('adjustment_amount', 0))
            }
            posted_payments.append(new_payment)
            mock_payments.append(new_payment)
        
        return jsonify({
            'success': True,
            'message': f'{len(posted_payments)} payments posted successfully',
            'payments': posted_payments
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@remittance_bp.route('/reconciliation/auto', methods=['POST'])
def auto_reconciliation():
    """Perform automated reconciliation using AI"""
    try:
        data = request.get_json()
        
        # Mock AI reconciliation process
        session_id = f'REC{random.randint(100, 999)}'
        
        # Simulate reconciliation results
        total_payments = random.randint(20, 50)
        matched_payments = int(total_payments * 0.85)
        unmatched_payments = total_payments - matched_payments
        
        reconciliation_result = {
            'session_id': session_id,
            'total_payments': total_payments,
            'matched_payments': matched_payments,
            'unmatched_payments': unmatched_payments,
            'match_rate': (matched_payments / total_payments) * 100,
            'ai_confidence': round(random.uniform(0.85, 0.98), 2),
            'discrepancies': [
                {
                    'payment_id': f'PAY{random.randint(100, 999)}',
                    'issue': 'Amount mismatch',
                    'expected': 1500.00,
                    'actual': 1350.00,
                    'difference': 150.00
                },
                {
                    'payment_id': f'PAY{random.randint(100, 999)}',
                    'issue': 'Missing payment',
                    'expected': 800.00,
                    'actual': 0.00,
                    'difference': 800.00
                }
            ],
            'recommendations': [
                'Review adjustment codes for payment PAY123',
                'Follow up on missing payment for claim CLM456',
                'Verify payer contract terms for discrepancy resolution'
            ]
        }
        
        return jsonify({
            'success': True,
            'reconciliation': reconciliation_result
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@remittance_bp.route('/reconciliation/sessions', methods=['GET'])
def get_reconciliation_sessions():
    """Get reconciliation session history"""
    try:
        return jsonify({
            'success': True,
            'sessions': mock_reconciliation_sessions
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@remittance_bp.route('/denial-prediction', methods=['POST'])
def predict_denials():
    """AI-powered denial prediction"""
    try:
        data = request.get_json()
        claim_data = data.get('claim_data', {})
        
        # Use real Gemini AI service for denial prediction
        try:
            ai_prediction = ai_service.predict_denial(claim_data)
            
            if 'error' not in ai_prediction:
                return jsonify({
                    'success': True,
                    'prediction': ai_prediction
                })
        except Exception as ai_error:
            print(f"AI Denial Prediction Error: {ai_error}")
        
        # Fallback to mock prediction if AI fails
        denial_risk = random.uniform(0.3, 0.7)
        risk_level = 'Medium'
        
        prediction = {
            'denial_probability': round(denial_risk, 2),
            'risk_level': risk_level,
            'risk_factors': ['AI prediction temporarily unavailable'],
            'recommendations': [
                'Manual review required',
                'Verify clinical documentation',
                'Check prior authorization status'
            ]
        }
        
        return jsonify({
            'success': True,
            'prediction': prediction
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@remittance_bp.route('/analytics', methods=['GET'])
def get_remittance_analytics():
    """Get remittance and reconciliation analytics"""
    try:
        analytics = {
            'payment_metrics': {
                'total_payments_this_month': 156,
                'total_amount_collected': 245000.00,
                'average_payment_time': 18.5,
                'collection_rate': 87.3
            },
            'reconciliation_metrics': {
                'auto_match_rate': 92.1,
                'manual_review_required': 7.9,
                'average_reconciliation_time': 2.3,
                'discrepancy_resolution_rate': 94.5
            },
            'denial_metrics': {
                'denial_rate': 12.4,
                'top_denial_reasons': [
                    ['Prior authorization required', 35],
                    ['Incomplete documentation', 28],
                    ['Duplicate claim', 15],
                    ['Coverage terminated', 12]
                ],
                'denial_prediction_accuracy': 89.2
            },
            'financial_summary': {
                'net_collection_rate': 94.2,
                'days_in_ar': 32.1,
                'write_off_percentage': 3.8,
                'adjustment_rate': 8.7
            },
            'ai_insights': [
                'Denial rate decreased by 15% this month due to improved documentation',
                'Auto-reconciliation accuracy improved to 92.1%',
                'Top payer Saudi Health Insurance shows 95% collection rate',
                'Recommend focusing on prior authorization workflow optimization'
            ]
        }
        
        return jsonify({
            'success': True,
            'analytics': analytics
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@remittance_bp.route('/era-processing', methods=['POST'])
def process_era():
    """Process Electronic Remittance Advice (ERA) files"""
    try:
        # Mock ERA processing
        era_result = {
            'file_name': 'ERA_20240115_001.txt',
            'processed_date': datetime.now().isoformat(),
            'total_claims': 25,
            'total_amount': 45000.00,
            'payments_posted': 23,
            'denials_identified': 2,
            'adjustments_applied': 15,
            'processing_status': 'completed',
            'errors': []
        }
        
        return jsonify({
            'success': True,
            'era_result': era_result
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@remittance_bp.route('/aging-report', methods=['GET'])
def get_aging_report():
    """Generate accounts receivable aging report"""
    try:
        aging_report = {
            'report_date': datetime.now().isoformat(),
            'aging_buckets': {
                '0-30_days': {'count': 45, 'amount': 125000.00},
                '31-60_days': {'count': 28, 'amount': 78000.00},
                '61-90_days': {'count': 15, 'amount': 42000.00},
                '91-120_days': {'count': 8, 'amount': 18000.00},
                '120+_days': {'count': 12, 'amount': 25000.00}
            },
            'total_ar': 288000.00,
            'average_days': 42.3,
            'collection_opportunities': [
                {'bucket': '61-90_days', 'priority': 'high', 'action': 'Follow up with payers'},
                {'bucket': '120+_days', 'priority': 'urgent', 'action': 'Consider write-off evaluation'}
            ]
        }
        
        return jsonify({
            'success': True,
            'aging_report': aging_report
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
