---
name: Build Premium UI Component
description: Create a UI component that meets premium aesthetic standards.
---

# Skill: Build Premium UI Component

## 1. Structure (HTML)
- Use semantic tags (`<article>`, `<section>`, `<nav>`).
- Add `data-testid` attributes for testing.
- Ensure accessibility (`aria-label`, `role`).

## 2. Styling (The "Premium" Touch)
**Every component must check these boxes:**
- [ ] **Elevation**: Does it feel detached from the background? (Shadows/Borders)
- [ ] **Interaction**: Does it react to the cursor? (Hover scale, background shift, border color change).
- [ ] **Typography**: Is the hierarchy clear? (Bold headers, muted subtext).
- [ ] **Spacing**: Is it breathable? (Minimum `p-4` or `1rem` padding).

## 3. Animation (Mandatory)
Static UIs are dead UIs.
- **Entry**: Fade in on load.
- **Hover**: `transform: scale(1.02)` or `translate-y-1`.
- **Click**: Active state `scale(0.98)`.

## 4. Code Example (Tailwind)
```html
<button class="
    group relative overflow-hidden rounded-xl bg-indigo-600 px-8 py-3 
    text-white shadow-lg transition-all duration-300 
    hover:-translate-y-1 hover:shadow-indigo-500/30 
    active:scale-95
">
    <div class="relative z-10 font-bold tracking-wide">
        Get Started
    </div>
    <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
</button>
```
