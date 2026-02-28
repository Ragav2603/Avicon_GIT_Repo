import urllib.request, json
req = urllib.request.Request('https://api.github.com/repos/Ragav2603/Avicon_GIT_Repo/actions/jobs/65213600985/logs')
req.add_header('User-Agent', 'Mozilla/5.0')
try:
    with urllib.request.urlopen(req) as response:
        logs = response.read().decode('utf-8')
        print(logs[-2000:])
except Exception as e:
    print(f'Error fetching logs: {e}')
