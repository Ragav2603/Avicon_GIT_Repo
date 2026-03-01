import re

file_path = "frontend/src/pages/RFPDetails.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Replace the N+1 query pattern with a batch request
search_str = """      // Parallel fetch to avoid N+1 query pattern
      const results = await Promise.all(
        submissionsWithAttachments.map(submission =>
          supabase.storage
            .from('proposal-attachments')
            .createSignedUrl(submission.attachment_url!, 3600)
            .then(({ data, error }) => ({
              key: submission.attachment_url!,
              url: !error && data ? data.signedUrl : '',
            }))
        )
      );

      const urlMap: Record<string, string> = {};
      for (const result of results) {
        if (result.url) {
          urlMap[result.key] = result.url;
        }
      }"""

replace_str = """      // Batch fetch to avoid N+1 query pattern and connection pool exhaustion
      const uniquePaths = [...new Set(submissionsWithAttachments.map(s => s.attachment_url!))];

      const { data, error } = await supabase.storage
        .from('proposal-attachments')
        .createSignedUrls(uniquePaths, 3600);

      const urlMap: Record<string, string> = {};

      if (!error && data) {
        for (const result of data) {
          if (result.signedUrl) {
            urlMap[result.path] = result.signedUrl;
          }
        }
      }"""

if search_str in content:
    content = content.replace(search_str, replace_str)
    with open(file_path, "w") as f:
        f.write(content)
    print("Successfully replaced N+1 with batch request.")
else:
    print("Could not find the target string to replace.")
