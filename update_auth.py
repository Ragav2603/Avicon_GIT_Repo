import re

file_path = 'src/pages/Auth.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Update Email Input
content = re.sub(
    r'(<Input\s+id="email"[^>]*?)(\s*/>)',
    r'\1 aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}\2',
    content,
    flags=re.DOTALL
)

# Update Email Error
content = content.replace(
    '{errors.email && <p className="text-sm text-destructive">{errors.email}</p>}',
    '{errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email}</p>}'
)

# Update Password Input
content = re.sub(
    r'(<Input\s+id="password"[^>]*?)(\s*/>)',
    r'\1 aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined}\2',
    content,
    flags=re.DOTALL
)

# Update Password Error
content = content.replace(
    '{errors.password && <p className="text-sm text-destructive">{errors.password}</p>}',
    '{errors.password && <p id="password-error" className="text-sm text-destructive">{errors.password}</p>}'
)

# Update Confirm Password Input
content = re.sub(
    r'(<Input\s+id="confirmPassword"[^>]*?)(\s*/>)',
    r'\1 aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}\2',
    content,
    flags=re.DOTALL
)

# Update Confirm Password Error
content = content.replace(
    '{errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}',
    '{errors.confirmPassword && <p id="confirm-password-error" className="text-sm text-destructive">{errors.confirmPassword}</p>}'
)

with open(file_path, 'w') as f:
    f.write(content)

print("Updated src/pages/Auth.tsx")
