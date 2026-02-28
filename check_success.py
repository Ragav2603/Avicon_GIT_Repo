import urllib.request, json
req = urllib.request.Request('https://api.github.com/repos/Ragav2603/Avicon_GIT_Repo/actions/runs?status=success')
req.add_header('User-Agent', 'Mozilla/5.0')
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        if data.get('workflow_runs'):
            print(f"Last success was: {data['workflow_runs'][0]['created_at']}")
except Exception as e:
    print(f'Error: {e}')
