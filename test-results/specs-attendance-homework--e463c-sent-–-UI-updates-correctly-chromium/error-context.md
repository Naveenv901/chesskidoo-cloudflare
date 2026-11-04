# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\attendance-homework-workflow.spec.js >> Coach marks present, assigns homework, then marks absent – UI updates correctly
- Location: e2e\specs\attendance-homework-workflow.spec.js:53:1

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "http://localhost:5174 /student/attendance", waiting until "load"

```

```
Tearing down "context" exceeded the test timeout of 30000ms.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - button "♟" [ref=e3] [cursor=pointer]
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e7]: ♘
        - heading "CHESSKIDOO" [level=2] [ref=e8]
        - paragraph [ref=e9]: CHESS ACADEMY
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]: Email or Username
          - textbox "Enter email or username" [ref=e13]
        - generic [ref=e14]:
          - generic [ref=e15]: Password
          - generic [ref=e16]:
            - textbox "Enter password" [ref=e17]
            - button "Show password" [ref=e18] [cursor=pointer]:
              - img [ref=e19]
        - button "Sign In" [ref=e22] [cursor=pointer]
      - generic [ref=e23]:
        - generic [ref=e24] [cursor=pointer]: Forgot Password?
        - generic [ref=e25]: "|"
        - link "🏠 Return to Home" [ref=e26] [cursor=pointer]:
          - /url: https://chesskidoo.com
  - text: ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟ ▾ ▾ ▾ ♟ ♟
```