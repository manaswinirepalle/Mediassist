import urllib.request

url = 'https://mediassist-9ibf.onrender.com/health'
try:
    with urllib.request.urlopen(url, timeout=10) as r:
        print('status', r.status)
        print(r.read(200).decode('utf-8', errors='replace'))
except Exception as e:
    print('error', type(e).__name__, e)
