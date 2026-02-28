import urllib.request, json
req = urllib.request.Request('https://api.github.com/repos/Ragav2603/Avicon_GIT_Repo/actions/runs')
req.add_header('User-Agent', 'Mozilla/5.0')
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        for run in data.get('workflow_runs', [])[:2]:
            print(f"ID: {run['id']}, Status: {run['status']}, Conclusion: {run['conclusion']}")
            print(f"Name: {run['name']}, Commit: {run['head_commit']['message'][:50]}")
except Exception as e:
    print(f'Error: {e}')
