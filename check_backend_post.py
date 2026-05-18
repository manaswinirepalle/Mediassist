import json
import urllib.request

url = 'https://mediassist-9ibf.onrender.com/ask'
data = json.dumps({'question': 'What are the symptoms of diabetes?'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        print('status', r.status)
        print(r.read(4000).decode('utf-8', errors='replace'))
except Exception as e:
    print('error', type(e).__name__, e)
