import sys

filepath = "src/components/dashboard/SubmissionReviewTable.tsx"

with open(filepath, "r") as f:
    content = f.read()

# Add useMemo to imports
if 'import { useState } from "react";' in content:
    content = content.replace('import { useState } from "react";', 'import { useState, useMemo } from "react";')
elif 'import { useState, useMemo } from "react";' in content:
    pass # Already imported
else:
    print("Could not find import statement. Content might differ.")
    # Fallback: maybe import { useState, useEffect } ...
    # Just try to find "import { " and insert useMemo if not present.
    # But safer to just modify the exact line if possible.
    sys.exit(1)

# Find start of block
start_marker = "const sortedSubmissions = [...submissions].sort((a, b) => {"
start_idx = content.find(start_marker)

if start_idx == -1:
    print("Could not find start of sortedSubmissions block")
    sys.exit(1)

# Find end of block.
# It ends with `return 0;` followed by `  });`
end_marker = "});"

return_0_idx = content.find("return 0;", start_idx)
if return_0_idx == -1:
    print("Could not find return 0; inside block")
    sys.exit(1)

end_idx = content.find(end_marker, return_0_idx)
if end_idx == -1:
    print("Could not find end of sortedSubmissions block")
    sys.exit(1)

end_idx += len(end_marker)

original_block = content[start_idx:end_idx]

new_block = """const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Handle null scores
      if (aVal === null && bVal !== null) return 1;
      if (aVal !== null && bVal === null) return -1;

      return 0;
    });
  }, [submissions, sortField, sortDirection]);"""

content = content.replace(original_block, new_block)

with open(filepath, "w") as f:
    f.write(content)

print("Successfully modified file")
