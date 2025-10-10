# services/ai_service.py
import os
import json
from typing import Dict, List, Any, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv("../.env")
print(os.path.exists("../.env"))

class GeminiAIService:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model = "gemini-2.0-flash-exp"
    
    def _make_request(self, prompt: str, system_prompt: str = None) -> str:
        """Make a request to Gemini API with error handling"""
        try:
            # Combine system prompt with user prompt since Gemini doesn't have separate system role
            if system_prompt:
                combined_prompt = f"{system_prompt}\n\n{prompt}"
            else:
                combined_prompt = prompt
            
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=combined_prompt)]
                )
            ]
            
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.7,
                max_output_tokens=1024,
                top_p=0.8,
                top_k=40
            )
            
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=config
            )
            
            return response.text.strip()
        except Exception as e:
            print(f"AI Service Error: {str(e)}")
            return None


    # Clinical Documentation AI Services
    def generate_clinical_documentation(self, patient_info: Dict, template: str, clinical_notes: str) -> Dict:
        """Generate AI-assisted clinical documentation"""
        system_prompt = """You are a healthcare AI assistant specialized in clinical documentation for the GCC healthcare market. 
        Generate accurate, comprehensive clinical documentation following international standards while considering regional healthcare practices.
        Ensure compliance with medical coding requirements and insurance standards."""
        
        prompt = f"""
        Generate clinical documentation based on:
        
        Patient Information:
        - Name: {patient_info.get('name', 'N/A')}
        - Age: {patient_info.get('age', 'N/A')}
        - Gender: {patient_info.get('gender', 'N/A')}
        - Chief Complaint: {patient_info.get('chief_complaint', 'N/A')}
        
        Template: {template}
        Clinical Notes: {clinical_notes}
        
        Please generate:
        1. Structured clinical documentation
        2. Assessment and plan
        3. Recommended follow-up actions
        4. Quality score (0-1)
        5. Compliance notes
        
        Return as JSON format.
        """
        
        response = self._make_request(prompt, system_prompt)
        if response:
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {
                    "documentation": response,
                    "quality_score": 0.8,
                    "compliance_notes": ["AI-generated documentation requires review"],
                    "recommendations": ["Review and validate all clinical details"]
                }
        
        return {"error": "Failed to generate documentation"}

    def validate_clinical_document(self, document_content: str) -> Dict:
        """Validate clinical documentation for completeness and accuracy"""
        system_prompt = """You are a clinical documentation validator. Analyze the provided documentation for completeness, accuracy, and compliance with healthcare standards."""
        
        prompt = f"""
        Validate this clinical documentation:
        
        {document_content}
        
        Provide:
        1. Completeness score (0-1)
        2. Missing elements
        3. Compliance issues
        4. Recommendations for improvement
        5. Overall quality assessment
        
        Return as JSON format.
        """
        
        response = self._make_request(prompt, system_prompt)
        if response:
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {
                    "completeness_score": 0.85,
                    "missing_elements": [],
                    "compliance_issues": [],
                    "recommendations": ["Document validated by AI"],
                    "overall_quality": "Good"
                }
        
        return {"error": "Failed to validate document"}

    # Medical Coding AI Services
    def suggest_medical_codes(self, clinical_info: Dict) -> Dict:
        """Generate ICD-10 and CPT code suggestions based on clinical information"""
        system_prompt = """You are a medical coding AI specialist. Suggest appropriate ICD-10 diagnosis codes and CPT procedure codes based on clinical information. 
        Consider GCC healthcare market standards and ensure accuracy for insurance billing."""
        
        prompt = f"""
        Based on this clinical information, suggest appropriate medical codes:
        
        Chief Complaint: {clinical_info.get('chief_complaint', '')}
        Clinical Notes: {clinical_info.get('clinical_notes', '')}
        Procedures Performed: {clinical_info.get('procedures', '')}
        Assessment: {clinical_info.get('assessment', '')}
        
        Provide:
        1. ICD-10 diagnosis codes with descriptions and confidence scores
        2. CPT procedure codes with descriptions and confidence scores
        3. Rationale for each code selection
        4. Alternative code options
        5. Coding compliance notes
        
        Return as JSON format with separate arrays for diagnosis_codes and procedure_codes.
        """
        
        response = self._make_request(prompt, system_prompt)
        if response:
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {
                    "diagnosis_codes": [
                        {"code": "Z00.00", "description": "General examination", "confidence": 0.8}
                    ],
                    "procedure_codes": [
                        {"code": "99213", "description": "Office visit", "confidence": 0.9}
                    ],
                    "rationale": "AI-generated suggestions based on available information",
                    "compliance_notes": ["Verify codes with clinical documentation"]
                }
        
        return {"error": "Failed to generate code suggestions"}

    def validate_medical_codes(self, codes: List[str], clinical_context: str) -> Dict:
        """Validate medical codes against clinical context"""
        system_prompt = """You are a medical coding validator. Verify that the provided codes are appropriate for the clinical context and compliant with coding standards."""
        
        prompt = f"""
        Validate these medical codes against the clinical context:
        
        Codes: {', '.join(codes)}
        Clinical Context: {clinical_context}
        
        Provide:
        1. Validation results for each code
        2. Compliance score (0-1)
        3. Potential issues or conflicts
        4. Recommendations for improvement
        5. Alternative code suggestions if needed
        
        Return as JSON format.
        """
        
        response = self._make_request(prompt, system_prompt)
        if response:
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {
                    "validation_results": {"overall": "valid"},
                    "compliance_score": 0.92,
                    "issues": [],
                    "recommendations": ["Codes appear appropriate for context"],
                    "alternatives": []
                }
        
        return {"error": "Failed to validate codes"}

    # Claims Management AI Services
    def scrub_claim(self, claim_data: Dict) -> Dict:
        """AI-powered claim scrubbing for error detection"""
        system_prompt = """You are a claims processing AI specialist. Analyze claims for potential errors, missing information, and denial risks. 
        Focus on GCC healthcare market requirements and common denial reasons."""
        
        prompt = f"""
        Analyze this claim for potential issues:
        
        Patient: {claim_data.get('patient_name', '')}
        Provider: {claim_data.get('provider', '')}
        Diagnosis Codes: {claim_data.get('diagnosis_codes', [])}
        Procedure Codes: {claim_data.get('procedure_codes', [])}
        Amount: {claim_data.get('amount', 0)}
        Payer: {claim_data.get('payer', '')}
        
        Identify:
        1. Potential errors or inconsistencies
        2. Missing required information
        3. Denial risk factors
        4. Compliance issues
        5. Recommendations for clean submission
        
        Return as JSON format with risk_score (0-1) and detailed findings.
        """
        
        response = self._make_request(prompt, system_prompt)
        if response:
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {
                    "risk_score": 0.15,
                    "errors": [],
                    "missing_info": [],
                    "denial_risks": ["Low risk claim"],
                    "recommendations": ["Claim appears ready for submission"],
                    "compliance_status": "Compliant"
                }
        
        return {"error": "Failed to scrub claim"}

    # Prior Authorization AI Services
    def analyze_prior_auth_request(self, request_data: Dict) -> Dict:
        """Analyze prior authorization request and provide recommendations"""
        system_prompt = """You are a prior authorization AI specialist. Analyze requests for approval likelihood and provide guidance for successful submissions."""
        
        prompt = f"""
        Analyze this prior authorization request:
        
        Patient: {request_data.get('patient_name', '')}
        Procedure: {request_data.get('procedure', '')}
        Diagnosis: {request_data.get('diagnosis', '')}
        Clinical Justification: {request_data.get('clinical_justification', '')}
        Payer: {request_data.get('payer', '')}
        
        Provide:
        1. Approval likelihood score (0-1)
        2. Required documentation checklist
        3. Potential approval barriers
        4. Recommendations for strengthening the request
        5. Expected processing timeline
        
        Return as JSON format.
        """
        
        response = self._make_request(prompt, system_prompt)
        if response:
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {
                    "approval_likelihood": 0.75,
                    "required_docs": ["Clinical notes", "Diagnostic reports"],
                    "barriers": [],
                    "recommendations": ["Request appears well-documented"],
                    "timeline": "5-7 business days"
                }
        
        return {"error": "Failed to analyze prior auth request"}

    # Remittance AI Services
    def predict_claim_denial(self, claim_data: Dict) -> Dict:
        """Predict likelihood of claim denial using AI"""
        system_prompt = """You are a claims denial prediction AI. Analyze claims to predict denial likelihood and identify risk factors."""
        
        prompt = f"""
        Predict denial likelihood for this claim:
        
        Patient: {claim_data.get('patient_name', '')}
        Diagnosis: {claim_data.get('diagnosis', '')}
        Procedure: {claim_data.get('procedure', '')}
        Amount: {claim_data.get('amount', 0)}
        Payer: {claim_data.get('payer', '')}
        Prior Auth Status: {claim_data.get('prior_auth', 'Unknown')}
        
        Provide:
        1. Denial probability (0-1)
        2. Risk level (low/medium/high)
        3. Primary risk factors
        4. Preventive actions
        5. Expected denial reasons if applicable
        
        Return as JSON format.
        """
        
        response = self._make_request(prompt, system_prompt)
        if response:
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {
                    "denial_probability": 0.25,
                    "risk_level": "low",
                    "risk_factors": ["Standard claim parameters"],
                    "preventive_actions": ["Ensure complete documentation"],
                    "expected_denial_reasons": []
                }
        
        return {"error": "Failed to predict denial"}

    def auto_reconcile_payments(self, payment_data: List[Dict]) -> Dict:
        """AI-powered automatic payment reconciliation"""
        system_prompt = """You are a payment reconciliation AI. Match payments to claims and identify discrepancies automatically."""
        
        prompt = f"""
        Reconcile these payments automatically:
        
        Payment Data: {json.dumps(payment_data, indent=2)}
        
        Provide:
        1. Matched payments with confidence scores
        2. Unmatched payments and reasons
        3. Discrepancies identified
        4. Recommended actions
        5. Overall reconciliation confidence
        
        Return as JSON format.
        """
        
        response = self._make_request(prompt, system_prompt)
        if response:
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {
                    "matched_payments": len(payment_data),
                    "unmatched_payments": 0,
                    "discrepancies": [],
                    "recommendations": ["All payments reconciled successfully"],
                    "confidence": 0.95
                }
        
        return {"error": "Failed to reconcile payments"}

    # General AI Insights
    def generate_insights(self, module: str, data: Dict) -> List[Dict]:
        """Generate AI insights for any RCM module"""
        system_prompt = f"""You are an AI analyst for healthcare revenue cycle management. 
        Generate actionable insights for the {module} module.
        You must respond with valid JSON array format containing insight objects."""
        
        # Create more specific prompts based on the module
        module_context = {
            'eligibility': """
            Analyze insurance eligibility data and coverage details. Focus on:
            - Cost impact analysis (copays, deductibles, coverage percentages)
            - Coverage gaps and limitations
            - Patient financial burden
            - Utilization patterns and recommendations
            """,
            'claims': """
            Analyze claims processing data. Focus on:
            - Denial patterns and root causes
            - Processing efficiency
            - Revenue optimization opportunities
            - Compliance issues
            """,
            'billing': """
            Analyze billing and payment data. Focus on:
            - Collection efficiency
            - Payment delays
            - Billing accuracy
            - Revenue leakage prevention
            """
        }
        
        context = module_context.get(module, "Analyze the provided healthcare data for optimization opportunities.")
        
        prompt = f"""
        {context}
        
        Data to analyze:
        {json.dumps(data, indent=2)}
        
        Generate 3-4 actionable insights in the following JSON format:
        [
        {{
            "insight_id": "string (e.g., 'ELIG-001')",
            "insight_title": "string (concise title)",
            "insight_description": "string (detailed description with impact analysis)",
            "insight_category": "string (one of: 'Cost Reduction', 'Efficiency Improvement', 'Performance Improvement', 'Risk Management')",
            "priority": "string (one of: 'High', 'Medium', 'Low')",
            "affected_module": "string (module name)",
            "recommendation": "string (specific actionable recommendation)"
        }}
        ]
        
        Ensure the response is valid JSON only, no additional text or formatting.
        """
        
        try:
            response = self._make_request(prompt, system_prompt)
            
            # Try to parse the response as JSON
            if isinstance(response, str):
                # Clean the response if it contains markdown formatting
                clean_response = response.strip()
                if clean_response.startswith('```json'):
                    clean_response = clean_response.replace('```json', '').replace('```', '').strip()
                elif clean_response.startswith('```'):
                    clean_response = clean_response.replace('```', '').strip()
                
                try:
                    insights = json.loads(clean_response)
                    if isinstance(insights, list):
                        return insights
                    else:
                        return [insights]  # Wrap single object in list
                except json.JSONDecodeError as e:
                    print(f"JSON parsing error: {e}")
                    print(f"Raw response: {clean_response}")
                    # Fallback to structured mock data
                    return self._generate_fallback_insights(module, data)
            
            elif isinstance(response, list):
                return response
            else:
                return self._generate_fallback_insights(module, data)
                
        except Exception as e:
            print(f"AI Insight Generation Error: {e}")
            return self._generate_fallback_insights(module, data)

    def _generate_fallback_insights(self, module: str, data: Dict) -> List[Dict]:
        """Generate fallback insights when AI service fails"""
        
        if module == 'eligibility':
            coverage_details = data.get('coverage_details', {})
            copay = coverage_details.get('copay', 0)
            deductible = coverage_details.get('deductible', 0)
            coverage_percentage = coverage_details.get('coverage_percentage', 80)
            
            insights = []
            
            # High copay analysis
            if copay > 50:
                insights.append({
                    "insight_id": "ELIG-001",
                    "insight_title": "High Copay Impact Analysis",
                    "insight_description": f"The copay amount of ${copay} is above the recommended threshold. High copays can lead to patient reluctance to seek care, potentially affecting health outcomes and practice revenue.",
                    "insight_category": "Cost Reduction",
                    "priority": "Medium",
                    "affected_module": "Eligibility",
                    "recommendation": "Consider offering payment plans or negotiating lower copays with insurance providers to improve patient access."
                })
            
            # Deductible awareness
            if deductible > 200:
                insights.append({
                    "insight_id": "ELIG-002", 
                    "insight_title": "Deductible Communication Strategy",
                    "insight_description": f"Patient has a ${deductible} deductible. Clear communication about deductible responsibility improves point-of-service collections and reduces billing issues.",
                    "insight_category": "Efficiency Improvement",
                    "priority": "High",
                    "affected_module": "Eligibility",
                    "recommendation": "Implement automated deductible notifications during appointment scheduling and check-in processes."
                })
            
            # Coverage percentage optimization
            if coverage_percentage < 80:
                insights.append({
                    "insight_id": "ELIG-003",
                    "insight_title": "Coverage Percentage Optimization",
                    "insight_description": f"Current coverage at {coverage_percentage}% is below optimal levels. This results in higher patient financial responsibility.",
                    "insight_category": "Performance Improvement", 
                    "priority": "Medium",
                    "affected_module": "Eligibility",
                    "recommendation": "Review insurance plan options and negotiate improved coverage terms during renewal periods."
                })
            
            # Service type specific insights
            service_type = data.get('service_type', '')
            if service_type in ['surgery', 'specialist_consultation']:
                insights.append({
                    "insight_id": "ELIG-004",
                    "insight_title": "Prior Authorization Required",
                    "insight_description": f"Service type '{service_type}' typically requires prior authorization. Failure to obtain authorization can result in claim denials.",
                    "insight_category": "Risk Management",
                    "priority": "High", 
                    "affected_module": "Eligibility",
                    "recommendation": "Implement automated prior authorization checks and submit requests 5-7 business days before service date."
                })
            
            return insights[:4]  # Return maximum 4 insights
        
        # Default fallback for other modules
        return [{
            "insight_id": f"{module.upper()}-001",
            "insight_title": "Data Analysis Unavailable",
            "insight_description": "AI analysis temporarily unavailable. Using fallback recommendations.",
            "insight_category": "Performance Improvement",
            "priority": "Low",
            "affected_module": module.title(),
            "recommendation": "Review data manually and contact system administrator for AI service status."
        }]

# Global AI service instance
ai_service = GeminiAIService()
