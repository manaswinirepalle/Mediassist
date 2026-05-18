import urllib.request
url = 'http://127.0.0.1:8000/health'
try:
    with urllib.request.urlopen(url, timeout=5) as r:
        print('status', r.status)
        print(r.read(500).decode('utf-8', errors='replace'))
except Exception as e:
    print('error', type(e).__name__, e)
