# Premium UI/UX Design Guidelines

## 1. The "Premium" Standard
Your goal is to make the user say "Wow".
- **No Default Colors**: Never use `red`, `blue`, `green`. Use tailored hex/hsl values (e.g., `text-emerald-500`, `bg-slate-900`).
- **Whitespace**: Generous padding/margin. "Dense" UIs look cheap.
- **Typography**: Hierarchy is key. Headlines should be bold/black. Body text should be legible (gray-600/400).

## 2. Visual Requirements
### Color Palette
- **Primary**: Deep, saturated brand color.
- **Surface**: Off-white or subtle gray for light mode; Deep charcoal/navy for dark mode (avoid pure black #000).
- **Accents**: Subtle gradients are preferred over flat colors for buttons/cards.

### Components
- **Buttons**:
    - Must have `:hover` and `:active` states.
    - Subtle `box-shadow` or `ring` on focus.
    - Transitions on all property changes (`transition-all duration-200`).
- **Cards**:
    - Subtle border (1px solid gray-200/800).
    - Soft shadow (`shadow-md` or `shadow-lg`).
    - Rounded corners (`rounded-xl` or `2xl`).
- **Inputs**:
    - Ring focus effect is mandatory.
    - Error states must be clear with icon + text.

## 3. Interaction Design
- **Feedback**: Every click must have visual feedback.
- **Loading**: Use Skeletons (shimmer effects) instead of spinners for initial load.
- **Transitions**: Pages should fade in/slide up. Elements should stagger-animate in.

## 4. CSS Variable System (Copy-Paste)
When starting a project (Vanilla CSS), inject this:
```css
:root {
    --primary: 220 50% 50%;
    --surface: 220 20% 98%;
    --text-main: 220 40% 10%;
    --text-muted: 220 20% 50%;
    --radius: 0.75rem;
    --transition: 200ms ease-out;
}
/* Dark Mode support is mandatory */
@media (prefers-color-scheme: dark) {
    :root {
        --surface: 220 40% 10%;
        --text-main: 220 20% 95%;
    }
}
```
