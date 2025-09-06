from flask import Blueprint, jsonify
from app.models.models import db, Patient, Claim, PriorAuthorization, EligibilityCheck, InsuranceProvider
from datetime import datetime, timedelta
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    """Get comprehensive dashboard statistics from the database"""
    try:
        # Basic counts
        total_patients = Patient.query.count()
        total_claims = Claim.query.count()
        total_prior_auths = PriorAuthorization.query.count()
        total_eligibility_checks = EligibilityCheck.query.count()
        
        # Claims statistics
        pending_claims = Claim.query.filter_by(status='pending').count()
        approved_claims = Claim.query.filter_by(status='approved').count()
        denied_claims = Claim.query.filter_by(status='denied').count()
        submitted_claims = Claim.query.filter_by(status='submitted').count()
        
        # Calculate total claim amounts
        total_claim_amount = db.session.query(func.sum(Claim.amount)).scalar() or 0
        approved_amount = db.session.query(func.sum(Claim.amount)).filter(Claim.status == 'approved').scalar() or 0
        
        # Prior Authorization statistics
        pending_auths = PriorAuthorization.query.filter_by(status='pending').count()
        approved_auths = PriorAuthorization.query.filter_by(status='approved').count()
        denied_auths = PriorAuthorization.query.filter_by(status='denied').count()
        expired_auths = PriorAuthorization.query.filter_by(status='expired').count()
        
        # Eligibility statistics
        eligible_checks = EligibilityCheck.query.filter_by(status='eligible').count()
        not_eligible_checks = EligibilityCheck.query.filter_by(status='not_eligible').count()
        pending_eligibility = EligibilityCheck.query.filter_by(status='pending').count()
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_claims = Claim.query.filter(Claim.submitted_date >= thirty_days_ago).count()
        recent_eligibility = EligibilityCheck.query.filter(EligibilityCheck.check_date >= thirty_days_ago).count()
        recent_prior_auths = PriorAuthorization.query.filter(PriorAuthorization.submitted_date >= thirty_days_ago).count()
        
        # Insurance provider distribution
        provider_stats = db.session.query(
            Patient.insurance_provider,
            func.count(Patient.id).label('patient_count')
        ).group_by(Patient.insurance_provider).all()
        
        # Calculate success rates
        claims_approval_rate = (approved_claims / total_claims * 100) if total_claims > 0 else 0
        auth_approval_rate = (approved_auths / total_prior_auths * 100) if total_prior_auths > 0 else 0
        eligibility_success_rate = (eligible_checks / total_eligibility_checks * 100) if total_eligibility_checks > 0 else 0
        
        return jsonify({
            'overview': {
                'total_patients': total_patients,
                'total_claims': total_claims,
                'total_prior_auths': total_prior_auths,
                'total_eligibility_checks': total_eligibility_checks,
                'total_claim_amount': round(total_claim_amount, 2),
                'approved_amount': round(approved_amount, 2)
            },
            'claims': {
                'total': total_claims,
                'pending': pending_claims,
                'approved': approved_claims,
                'denied': denied_claims,
                'submitted': submitted_claims,
                'approval_rate': round(claims_approval_rate, 1),
                'total_amount': round(total_claim_amount, 2),
                'approved_amount': round(approved_amount, 2)
            },
            'prior_authorizations': {
                'total': total_prior_auths,
                'pending': pending_auths,
                'approved': approved_auths,
                'denied': denied_auths,
                'expired': expired_auths,
                'approval_rate': round(auth_approval_rate, 1)
            },
            'eligibility': {
                'total': total_eligibility_checks,
                'eligible': eligible_checks,
                'not_eligible': not_eligible_checks,
                'pending': pending_eligibility,
                'success_rate': round(eligibility_success_rate, 1)
            },
            'recent_activity': {
                'claims_last_30_days': recent_claims,
                'eligibility_checks_last_30_days': recent_eligibility,
                'prior_auths_last_30_days': recent_prior_auths
            },
            'insurance_providers': [
                {
                    'name': provider,
                    'patient_count': count
                }
                for provider, count in provider_stats
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/recent-activity', methods=['GET'])
def get_recent_activity():
    """Get recent activity for dashboard feed"""
    try:
        # Get recent claims (last 10)
        recent_claims = Claim.query.order_by(Claim.submitted_date.desc()).limit(10).all()
        
        # Get recent eligibility checks (last 10)
        recent_eligibility = EligibilityCheck.query.order_by(EligibilityCheck.check_date.desc()).limit(10).all()
        
        # Get recent prior auths (last 10)
        recent_auths = PriorAuthorization.query.order_by(PriorAuthorization.submitted_date.desc()).limit(10).all()
        
        activities = []
        
        # Add claims to activity feed
        for claim in recent_claims:
            activities.append({
                'type': 'claim',
                'id': claim.id,
                'patient_id': claim.patient_id,
                'status': claim.status,
                'amount': claim.amount,
                'date': claim.submitted_date.isoformat() if claim.submitted_date else None,
                'description': f'Claim ${claim.amount} - {claim.status}'
            })
        
        # Add eligibility checks to activity feed
        for check in recent_eligibility:
            activities.append({
                'type': 'eligibility',
                'id': check.id,
                'patient_id': check.patient_id,
                'status': check.status,
                'service_type': check.service_type,
                'date': check.check_date.isoformat() if check.check_date else None,
                'description': f'Eligibility check for {check.service_type} - {check.status}'
            })
        
        # Add prior auths to activity feed
        for auth in recent_auths:
            activities.append({
                'type': 'prior_auth',
                'id': auth.id,
                'patient_id': auth.patient_id,
                'status': auth.status,
                'service_type': auth.service_type,
                'date': auth.submitted_date.isoformat() if auth.submitted_date else None,
                'description': f'Prior auth for {auth.service_type} - {auth.status}'
            })
        
        # Sort by date (most recent first)
        activities.sort(key=lambda x: x['date'] or '', reverse=True)
        
        return jsonify({
            'activities': activities[:20]  # Return top 20 most recent
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/ai-insights', methods=['GET'])
def get_ai_insights():
    """Get AI-powered insights for the dashboard"""
    try:
        # Calculate various metrics for AI insights
        total_claims = Claim.query.count()
        approved_claims = Claim.query.filter_by(status='approved').count()
        denied_claims = Claim.query.filter_by(status='denied').count()
        
        total_eligibility = EligibilityCheck.query.count()
        eligible_count = EligibilityCheck.query.filter_by(status='eligible').count()
        
        # Generate insights based on data patterns
        insights = []
        
        if total_claims > 0:
            approval_rate = (approved_claims / total_claims) * 100
            if approval_rate < 70:
                insights.append({
                    'type': 'warning',
                    'title': 'Low Claims Approval Rate',
                    'message': f'Claims approval rate is {approval_rate:.1f}%. Consider reviewing denial patterns.',
                    'action': 'Review denied claims for common issues'
                })
            elif approval_rate > 85:
                insights.append({
                    'type': 'success',
                    'title': 'High Claims Approval Rate',
                    'message': f'Excellent claims approval rate of {approval_rate:.1f}%.',
                    'action': 'Continue current best practices'
                })
        
        if total_eligibility > 0:
            eligibility_rate = (eligible_count / total_eligibility) * 100
            if eligibility_rate < 60:
                insights.append({
                    'type': 'info',
                    'title': 'Eligibility Check Optimization',
                    'message': f'Only {eligibility_rate:.1f}% of eligibility checks are positive. Consider pre-screening.',
                    'action': 'Implement pre-eligibility screening'
                })
        
        # Add trend insights
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_claims = Claim.query.filter(Claim.submitted_date >= thirty_days_ago).count()
        
        if recent_claims > total_claims * 0.4:  # More than 40% of claims in last 30 days
            insights.append({
                'type': 'info',
                'title': 'High Recent Activity',
                'message': 'Significant increase in claims volume over the last 30 days.',
                'action': 'Monitor processing capacity and staff allocation'
            })
        
        return jsonify({
            'insights': insights,
            'generated_at': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
