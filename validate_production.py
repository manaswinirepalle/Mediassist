#!/usr/bin/env python3
"""
MediAssist AI - Comprehensive Production Verification Script
Tests all endpoints, configuration, and deployment readiness
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Tuple

# Configuration
BACKEND_URL = "https://mediassist-9ibf.onrender.com"
FRONTEND_URL = "https://mediassist-ai.vercel.app"
LOCAL_BACKEND = "http://localhost:8000"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class MediAssistValidator:
    def __init__(self, backend_url=BACKEND_URL):
        self.backend_url = backend_url
        self.results = []
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'MediAssist-Validator/1.0',
        })

    def log(self, message: str, level: str = "info"):
        """Log with colors"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if level == "success":
            print(f"{GREEN}[✓]{RESET} {timestamp} - {message}")
        elif level == "error":
            print(f"{RED}[✗]{RESET} {timestamp} - {message}")
        elif level == "warning":
            print(f"{YELLOW}[!]{RESET} {timestamp} - {message}")
        else:
            print(f"{BLUE}[*]{RESET} {timestamp} - {message}")

    def test_health_check(self) -> Tuple[bool, str]:
        """Test /health endpoint"""
        self.log(f"Testing /health endpoint at {self.backend_url}/health")
        try:
            response = self.session.get(f"{self.backend_url}/health", timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Validate response structure
            required_fields = ["status", "version", "ai_enabled", "timestamp", "knowledge_base_size"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                msg = f"Missing fields: {', '.join(missing_fields)}"
                self.log(msg, "error")
                return False, msg
            
            if data["status"] != "healthy":
                msg = f"Health status: {data['status']} (expected 'healthy')"
                self.log(msg, "warning")
                return False, msg
            
            self.log(f"✓ Status: {data['status']}", "success")
            self.log(f"  Version: {data['version']}")
            self.log(f"  AI Enabled: {data['ai_enabled']}")
            self.log(f"  KB Size: {data['knowledge_base_size']} documents")
            
            return True, "Health check passed"
            
        except requests.exceptions.Timeout:
            msg = "Request timeout - backend not responding"
            self.log(msg, "error")
            return False, msg
        except requests.exceptions.ConnectionError as e:
            msg = f"Connection error: {str(e)}"
            self.log(msg, "error")
            return False, msg
        except Exception as e:
            msg = f"Unexpected error: {str(e)}"
            self.log(msg, "error")
            return False, msg

    def test_ask_endpoint(self, question: str = "What are symptoms of fever?") -> Tuple[bool, str]:
        """Test /ask endpoint"""
        self.log(f"Testing /ask endpoint with question: '{question}'")
        try:
            payload = {"question": question}
            response = self.session.post(
                f"{self.backend_url}/ask",
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Validate response structure
            required_fields = ["id", "question", "answer", "sources", "mode", "ai_powered", "timestamp", "response_time_ms"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                msg = f"Missing fields: {', '.join(missing_fields)}"
                self.log(msg, "error")
                return False, msg
            
            self.log(f"✓ Question processed successfully", "success")
            self.log(f"  Mode: {data['mode']}")
            self.log(f"  Response time: {data['response_time_ms']}ms")
            self.log(f"  Sources found: {len(data['sources'])}")
            self.log(f"  Answer length: {len(data['answer'])} characters")
            
            return True, "Ask endpoint working"
            
        except requests.exceptions.Timeout:
            msg = "Request timeout - backend processing too slow"
            self.log(msg, "error")
            return False, msg
        except requests.exceptions.ConnectionError as e:
            msg = f"Connection error: {str(e)}"
            self.log(msg, "error")
            return False, msg
        except Exception as e:
            msg = f"Unexpected error: {str(e)}"
            self.log(msg, "error")
            return False, msg

    def test_cors_headers(self) -> Tuple[bool, str]:
        """Test CORS headers"""
        self.log("Testing CORS headers")
        try:
            headers = {
                "Origin": FRONTEND_URL,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            }
            response = self.session.options(f"{self.backend_url}/ask", headers=headers, timeout=10)
            
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
            }
            
            if cors_headers["Access-Control-Allow-Origin"]:
                self.log(f"✓ CORS enabled for origin: {cors_headers['Access-Control-Allow-Origin']}", "success")
                return True, "CORS configured"
            else:
                msg = "CORS headers not found"
                self.log(msg, "warning")
                return False, msg
                
        except Exception as e:
            msg = f"CORS check error: {str(e)}"
            self.log(msg, "warning")
            return False, msg

    def test_history_endpoint(self) -> Tuple[bool, str]:
        """Test /history endpoint"""
        self.log("Testing /history endpoint")
        try:
            response = self.session.get(f"{self.backend_url}/history", timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            required_fields = ["history", "total"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                msg = f"Missing fields: {', '.join(missing_fields)}"
                self.log(msg, "error")
                return False, msg
            
            self.log(f"✓ History accessible", "success")
            self.log(f"  Total messages: {data['total']}")
            
            return True, "History endpoint working"
            
        except Exception as e:
            msg = f"History endpoint error: {str(e)}"
            self.log(msg, "error")
            return False, msg

    def test_error_handling(self) -> Tuple[bool, str]:
        """Test error handling"""
        self.log("Testing error handling")
        try:
            # Test empty question
            payload = {"question": ""}
            response = self.session.post(
                f"{self.backend_url}/ask",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                if "detail" in data:
                    self.log(f"✓ Error handling works: {data['detail']}", "success")
                    return True, "Error handling functional"
            
            return False, "Error handling not working as expected"
            
        except Exception as e:
            msg = f"Error handling test failed: {str(e)}"
            self.log(msg, "error")
            return False, msg

    def run_all_tests(self):
        """Run all tests"""
        print(f"\n{BLUE}{'='*60}{RESET}")
        print(f"{BLUE}MediAssist AI - Production Validation{RESET}")
        print(f"{BLUE}Backend: {self.backend_url}{RESET}")
        print(f"{BLUE}Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{RESET}")
        print(f"{BLUE}{'='*60}{RESET}\n")

        tests = [
            ("Health Check", self.test_health_check),
            ("Ask Endpoint", self.test_ask_endpoint),
            ("CORS Headers", self.test_cors_headers),
            ("History Endpoint", self.test_history_endpoint),
            ("Error Handling", self.test_error_handling),
        ]

        passed = 0
        failed = 0

        for test_name, test_func in tests:
            print(f"\n{BLUE}▸ {test_name}{RESET}")
            success, message = test_func()
            
            if success:
                passed += 1
            else:
                failed += 1
            
            self.results.append({
                "test": test_name,
                "passed": success,
                "message": message,
            })
            
            time.sleep(0.5)  # Brief pause between tests

        # Summary
        print(f"\n{BLUE}{'='*60}{RESET}")
        print(f"{BLUE}Test Summary{RESET}")
        print(f"{BLUE}{'='*60}{RESET}")
        print(f"{GREEN}Passed: {passed}/{len(tests)}{RESET}")
        print(f"{RED}Failed: {failed}/{len(tests)}{RESET}")
        
        if failed == 0:
            print(f"\n{GREEN}✓ All tests passed! App is production-ready.{RESET}")
        else:
            print(f"\n{RED}✗ Some tests failed. See details above.{RESET}")
        
        print(f"{BLUE}{'='*60}{RESET}\n")

        return failed == 0


def main():
    import sys
    
    # Determine backend URL
    if len(sys.argv) > 1:
        backend_url = sys.argv[1]
    else:
        # Try production first, fallback to local
        validator = MediAssistValidator(BACKEND_URL)
        test_ok, _ = validator.test_health_check()
        
        if not test_ok:
            print(f"\n{YELLOW}Production backend not accessible. Trying localhost...{RESET}\n")
            backend_url = LOCAL_BACKEND
        else:
            backend_url = BACKEND_URL

    validator = MediAssistValidator(backend_url)
    success = validator.run_all_tests()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
