# Imaginarium Frontend

This directory contains the frontend source code for the Imaginarium application.

## Structure

```
src/
├── index.html              # Main HTML file
├── static/                 # Static assets
│   ├── css/               # Stylesheets
│   │   ├── base.css       # Base styles and common elements
│   │   ├── layout.css     # Layout and screen management
│   │   └── pages/         # Page-specific styles
│   │       ├── intro.css
│   │       ├── story.css
│   │       └── conclusion.css
│   └── js/                # JavaScript modules
│       ├── main.js        # Main application controller
│       ├── ui.js          # UI rendering and DOM updates
│       ├── storyManager.js # Story management logic
│       └── pages/         # Page-specific functionality
│           ├── introPage.js
│           ├── storyPage.js
│           └── conclusionPage.js
├── run_frontend.py        # Simple HTTP server for development
└── README.md              # This file
```

## Running the Frontend

### Option 1: Direct HTML (Mock Data)
```bash
# Open index.html directly in your browser
start index.html
```

### Option 2: Local Development Server
```bash
# Run a simple HTTP server
python run_frontend.py
# Then visit: http://localhost:8000
```

### Option 3: Full Application with Backend
```bash
# From the project root directory
python ../app.py
# Then visit: http://localhost:5000
```

## Development

The frontend uses a modular architecture:

- **HTML**: Single page application with multiple screens
- **CSS**: Modular stylesheets for maintainability
- **JavaScript**: ES6 modules with clean separation of concerns

Each page (intro, story, conclusion) has its own CSS and JavaScript files for easy maintenance and scalability.
