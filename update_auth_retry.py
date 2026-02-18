import re

file_path = 'src/pages/Auth.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Helper function to inject props into Input components
def inject_props(match):
    # match.group(0) is the entire Input tag
    tag = match.group(0)

    # Check if we are dealing with email, password, or confirmPassword
    if 'id="email"' in tag:
        addition = ' aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}'
    elif 'id="password"' in tag:
        addition = ' aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined}'
    elif 'id="confirmPassword"' in tag:
        addition = ' aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}'
    else:
        return tag

    # Inject before the self-closing />
    return tag.replace('/>', addition + ' />')

# Regex to match Input tags across multiple lines
# We look for <Input ... />
pattern = re.compile(r'<Input\s+[^>]*?/>', re.DOTALL)

# Use substitution with a callback function
new_content = pattern.sub(inject_props, content)

# Also update the error messages (these worked last time, but verify)
# Email Error
new_content = new_content.replace(
    '{errors.email && <p className="text-sm text-destructive">{errors.email}</p>}',
    '{errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email}</p>}'
)
# Password Error
new_content = new_content.replace(
    '{errors.password && <p className="text-sm text-destructive">{errors.password}</p>}',
    '{errors.password && <p id="password-error" className="text-sm text-destructive">{errors.password}</p>}'
)
# Confirm Password Error
new_content = new_content.replace(
    '{errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}',
    '{errors.confirmPassword && <p id="confirm-password-error" className="text-sm text-destructive">{errors.confirmPassword}</p>}'
)

with open(file_path, 'w') as f:
    f.write(new_content)

print("Updated src/pages/Auth.tsx with retry")
