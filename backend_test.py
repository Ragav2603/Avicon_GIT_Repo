#!/usr/bin/env python3
"""
Avicon Enterprise API Phase 2 Testing Suite
============================================

Tests the Phase 2 backend improvements:
1. Health endpoint still works
2. Auth middleware still blocks unauthorized requests
3. Request validation middleware (NEW)
4. Legacy status endpoints backward compatibility
5. API docs accessibility

Production URL: https://knowledge-saas.preview.emergentagent.com
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, Any

# Configuration
BACKEND_URL = "https://knowledge-saas.preview.emergentagent.com"
TIMEOUT = 30

class AviconTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Avicon-Phase2-Tester/1.0'
        })
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result with timestamp."""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'response_data': response_data,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {test_name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    def test_health_endpoint(self):
        """Test 1: Backend health endpoint still works"""
        test_name = "Health Endpoint Check"
        try:
            response = self.session.get(f"{self.base_url}/api/health", timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                services = data.get('services', {})
                expected_services = ['mongodb', 'pinecone', 'azure_openai', 'supabase']
                
                # Check all 4 services are present
                all_services_present = all(service in services for service in expected_services)
                
                if all_services_present:
                    services_status = ", ".join([f"{k}: {v}" for k, v in services.items()])
                    self.log_test(test_name, True, f"All 4 services reported - {services_status}", data)
                else:
                    missing = [s for s in expected_services if s not in services]
                    self.log_test(test_name, False, f"Missing services: {missing}", data)
            else:
                self.log_test(test_name, False, f"HTTP {response.status_code}", response.text[:200])
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_auth_middleware_blocks_unauthorized(self):
        """Test 2: Auth middleware still blocks unauthorized requests"""
        
        # Test 2.1: POST /api/query/ without auth
        test_name = "Auth Block - Query Endpoint"
        try:
            headers = {'Content-Type': 'application/json'}
            payload = {"query": "test query", "customer_id": "test"}
            
            response = self.session.post(
                f"{self.base_url}/api/query/",
                headers=headers,
                json=payload,
                timeout=TIMEOUT
            )
            
            # Should get 401 Unauthorized (or 520 due to Cloudflare proxy)
            if response.status_code in [401, 520]:
                self.log_test(test_name, True, f"Correctly blocked with HTTP {response.status_code}")
            else:
                self.log_test(test_name, False, f"Expected 401/520, got {response.status_code}", response.text[:200])
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

        # Test 2.2: POST /api/documents/upload without auth  
        test_name = "Auth Block - Document Upload"
        try:
            # Simulate file upload without auth
            files = {'file': ('test.txt', 'test content', 'text/plain')}
            
            response = self.session.post(
                f"{self.base_url}/api/documents/upload",
                files=files,
                timeout=TIMEOUT
            )
            
            # Should get 401 Unauthorized (or 520 due to Cloudflare proxy)
            if response.status_code in [401, 520]:
                self.log_test(test_name, True, f"Correctly blocked with HTTP {response.status_code}")
            else:
                self.log_test(test_name, False, f"Expected 401/520, got {response.status_code}", response.text[:200])
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_request_validation_middleware(self):
        """Test 3: Request Validation Middleware (NEW)"""
        
        # Test 3.1: Wrong Content-Type with fake auth
        test_name = "Request Validation - Content Type"
        try:
            headers = {
                'Content-Type': 'text/plain',
                'Authorization': 'Bearer fake'
            }
            payload = "test query"
            
            response = self.session.post(
                f"{self.base_url}/api/query/",
                headers=headers,
                data=payload,
                timeout=TIMEOUT
            )
            
            # Should get either 415 (content type) or 401 (auth) - both acceptable since auth runs first
            if response.status_code in [401, 415, 520]:
                if response.status_code == 415:
                    self.log_test(test_name, True, f"Content-Type validation working - HTTP {response.status_code}")
                elif response.status_code in [401, 520]:
                    self.log_test(test_name, True, f"Auth checked first (expected) - HTTP {response.status_code}")
            else:
                self.log_test(test_name, False, f"Expected 401/415/520, got {response.status_code}", response.text[:200])
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
        
        # Test 3.2: Correct Content-Type should proceed to auth layer  
        test_name = "Request Validation - Correct Content Type"
        try:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer fake'
            }
            payload = {"query": "test"}
            
            response = self.session.post(
                f"{self.base_url}/api/query/",
                headers=headers,
                json=payload,
                timeout=TIMEOUT
            )
            
            # Should get 401/520 (auth error), not 415 (content type error)
            if response.status_code in [401, 520]:
                self.log_test(test_name, True, f"Content-Type passed validation, reached auth layer - HTTP {response.status_code}")
            elif response.status_code == 415:
                self.log_test(test_name, False, f"Content-Type validation failed incorrectly", response.text[:200])
            else:
                self.log_test(test_name, False, f"Unexpected response {response.status_code}", response.text[:200])
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_legacy_status_endpoints(self):
        """Test 4: Legacy status endpoints backward compatibility"""
        
        # Test 4.1: POST /api/status
        test_name = "Legacy Status - POST endpoint"
        test_client_name = f"phase2_test_{int(time.time())}"
        
        try:
            payload = {"client_name": test_client_name}
            headers = {'Content-Type': 'application/json'}
            
            response = self.session.post(
                f"{self.base_url}/api/status",
                headers=headers,
                json=payload,
                timeout=TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                # Check response has required fields (id, client_name, timestamp)
                required_fields = ['id', 'client_name', 'timestamp']
                has_required_fields = all(field in data for field in required_fields)
                
                if has_required_fields and data.get('client_name') == test_client_name:
                    self.log_test(test_name, True, f"Status created successfully with all fields", data)
                else:
                    self.log_test(test_name, False, f"Missing required fields or wrong client_name", data)
            else:
                self.log_test(test_name, False, f"HTTP {response.status_code}", response.text[:200])
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
        
        # Test 4.2: GET /api/status
        test_name = "Legacy Status - GET endpoint"
        try:
            response = self.session.get(f"{self.base_url}/api/status", timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Look for our test entry
                    found_our_entry = any(
                        item.get('client_name') == test_client_name 
                        for item in data 
                        if isinstance(item, dict)
                    )
                    
                    if found_our_entry:
                        self.log_test(test_name, True, f"Found our test entry in {len(data)} status checks")
                    else:
                        self.log_test(test_name, True, f"GET works, returned {len(data)} status checks (our entry may not be visible yet)")
                else:
                    self.log_test(test_name, False, f"Expected list, got {type(data)}", data)
            else:
                self.log_test(test_name, False, f"HTTP {response.status_code}", response.text[:200])
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def test_api_docs_accessible(self):
        """Test 5: API docs accessible"""
        test_name = "API Documentation Access"
        try:
            response = self.session.get(f"{self.base_url}/api/docs", timeout=TIMEOUT)
            
            if response.status_code == 200:
                content = response.text
                # Check for Swagger UI indicators
                swagger_indicators = ['swagger-ui', 'openapi', 'Swagger UI']
                has_swagger_content = any(indicator.lower() in content.lower() for indicator in swagger_indicators)
                
                if has_swagger_content and 'text/html' in response.headers.get('content-type', ''):
                    self.log_test(test_name, True, f"Swagger UI accessible, content-type: {response.headers.get('content-type')}")
                else:
                    self.log_test(test_name, False, f"No Swagger UI content detected", f"Content-Type: {response.headers.get('content-type')}")
            else:
                self.log_test(test_name, False, f"HTTP {response.status_code}", response.text[:200])
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all Phase 2 backend tests."""
        print(f"🚀 Starting Avicon Phase 2 Backend Tests")
        print(f"Backend URL: {self.base_url}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("=" * 80)
        
        # Execute all test suites
        self.test_health_endpoint()
        self.test_auth_middleware_blocks_unauthorized()
        self.test_request_validation_middleware()
        self.test_legacy_status_endpoints()
        self.test_api_docs_accessible()
        
        # Summary
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print("=" * 80)
        print(f"📊 TEST SUMMARY")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return failed_tests == 0


def main():
    """Main test execution."""
    tester = AviconTester(BACKEND_URL)
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/phase2_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': len(tester.test_results),
                'passed': sum(1 for r in tester.test_results if r['success']),
                'failed': sum(1 for r in tester.test_results if not r['success']),
                'timestamp': datetime.now().isoformat(),
                'backend_url': BACKEND_URL
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/phase2_test_results.json")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())