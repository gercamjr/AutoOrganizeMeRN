# COPILOT EDITS OPERATIONAL GUIDELINES

## PRIME DIRECTIVE

    Avoid working on more than one file at a time.
    Multiple simultaneous edits to a file will cause corruption.
    Be chatty and teach about what you are doing while coding.

## LARGE FILE & COMPLEX CHANGE PROTOCOL

### MANDATORY PLANNING PHASE

    When working with large files (>300 lines) or complex changes:
    	1. ALWAYS start by creating a detailed plan BEFORE making any edits
            2. Your plan MUST include:
                   - All functions/sections that need modification
                   - The order in which changes should be applied
                   - Dependencies between changes
                   - Estimated number of separate edits required

            3. Format your plan as:

## PROPOSED EDIT PLAN

    Working with: [filename]
    Total planned edits: [number]

### MAKING EDITS

    - Focus on one conceptual change at a time
    - Show clear "before" and "after" snippets when proposing changes
    - Include concise explanations of what changed and why
    - Always check if the edit maintains the project's coding style

### Edit sequence:

    1. [First specific change] - Purpose: [why]
    2. [Second specific change] - Purpose: [why]
    3. Do you approve this plan? I'll proceed with Edit [number] after your confirmation.
    4. WAIT for explicit user confirmation before making ANY edits when user ok edit [number]

### EXECUTION PHASE

    - After each individual edit, clearly indicate progress:
    	"✅ Completed edit [#] of [total]. Ready for next edit?"
    - If you discover additional needed changes during editing:
    - STOP and update the plan
    - Get approval before continuing

### REFACTORING GUIDANCE

    When refactoring large files:
    - Break work into logical, independently functional chunks
    - Ensure each intermediate state maintains functionality
    - Consider temporary duplication as a valid interim step
    - Always indicate the refactoring pattern being applied

### RATE LIMIT AVOIDANCE

    - For very large files, suggest splitting changes across multiple sessions
    - Prioritize changes that are logically complete units
    - Always provide clear stopping points

## General Requirements

    Use modern technologies as described below for all code suggestions. Prioritize clean, maintainable code with appropriate comments.

## HTML/CSS Requirements

    - **HTML**:
    - Use HTML5 semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<search>`, etc.)
    - Include appropriate ARIA attributes for accessibility
    - Ensure valid markup that passes W3C validation
    - Use responsive design practices
    - Optimize images using modern formats (`WebP`, `AVIF`)
    - Include `loading="lazy"` on images where applicable
    - Generate `srcset` and `sizes` attributes for responsive images when relevant
    - Prioritize SEO-friendly elements (`<title>`, `<meta description>`, Open Graph tags)

    - **CSS**:
    - Use modern CSS features including:
    - CSS Grid and Flexbox for layouts
    - CSS Custom Properties (variables)
    - CSS animations and transitions
    - Media queries for responsive design
    - Logical properties (`margin-inline`, `padding-block`, etc.)
    - Modern selectors (`:is()`, `:where()`, `:has()`)
    - Follow BEM or similar methodology for class naming
    - Use CSS nesting where appropriate
    - Include dark mode support with `prefers-color-scheme`
    - Prioritize modern, performant fonts and variable fonts for smaller file sizes
    - Use modern units (`rem`, `vh`, `vw`) instead of traditional pixels (`px`) for better responsiveness

## Documentation Requirements

    - Include JSDoc comments for JavaScript/TypeScript.
    - Document complex functions with clear examples.
    - Maintain concise Markdown documentation.
    - Minimum docblock info: `param`, `return`, `throws`, `author`

## Security Considerations

    - Sanitize all user inputs thoroughly.
    - Parameterize database queries.
    - Enforce strong Content Security Policies (CSP).
    - Use CSRF protection where applicable.
    - Limit privileges and enforce role-based access control.
    - Implement detailed internal logging and monitoring.
