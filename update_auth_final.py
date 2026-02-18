file_path = 'src/pages/Auth.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Update Email Input
# I need to be careful with indentation. The read_file showed 2 spaces of indentation for Input props inside form? No, inside div.
# Let's inspect the read_file output again carefully.
# <Input ...
#   className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
# />
# The indentation of `className` seems to be 20 spaces?
# Let's count:
# <Input
#   id="email"
# ...
#   className=...

# I will use a simpler replace strategy: replacing the className line + ending tag.

content = content.replace(
    'className={`pl-10 ${errors.email ? "border-destructive" : ""}`}\n                  />',
    'className={`pl-10 ${errors.email ? "border-destructive" : ""}`}\n                    aria-invalid={!!errors.email}\n                    aria-describedby={errors.email ? "email-error" : undefined}\n                  />'
)

content = content.replace(
    'className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}\n                  />',
    'className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}\n                    aria-invalid={!!errors.password}\n                    aria-describedby={errors.password ? "password-error" : undefined}\n                  />'
)

content = content.replace(
    'className={`pl-10 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}\n                  />',
    'className={`pl-10 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}\n                    aria-invalid={!!errors.confirmPassword}\n                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}\n                  />'
)

with open(file_path, 'w') as f:
    f.write(content)

print("Updated src/pages/Auth.tsx (final attempt with correct heredoc)")
