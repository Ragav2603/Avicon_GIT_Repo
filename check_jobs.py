import urllib.request, json
req = urllib.request.Request('https://api.github.com/repos/Ragav2603/Avicon_GIT_Repo/actions/runs/22508883523/jobs')
req.add_header('User-Agent', 'Mozilla/5.0')
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        for job in data.get('jobs', []):
            if job['conclusion'] == 'failure':
                print(f"FAILED JOB: {job['name']}")
                for step in job['steps']:
                    if step['conclusion'] == 'failure':
                        print(f"   FAILED STEP: {step['name']}")
except Exception as e:
    print(f'Error: {e}')
