import urllib.request
url = 'http://127.0.0.1:8000/health'
req = urllib.request.Request(url, headers={'Origin': 'http://localhost:5173'})
try:
    with urllib.request.urlopen(req, timeout=5) as r:
        print('status', r.status)
        for k, v in r.getheaders():
            if k.lower().startswith('access-control'):
                print(k, v)
        print(r.read(300).decode('utf-8', errors='replace'))
except Exception as e:
    print('error', type(e).__name__, e)
