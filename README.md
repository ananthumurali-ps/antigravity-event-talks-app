# BigQuery Release Notes Radar

A beautiful, modern single-page web application built with **Python Flask** and **Vanilla HTML, CSS, and JavaScript** that tracks the official BigQuery Release notes and enables users to easily select and tweet individual updates.

## 🚀 Features

- **Real-time Feed Fetching**: Dynamically fetches and parses the official BigQuery release XML feed.
- **Granular Update Splitting**: Splits entry updates (by HTML headers) into distinct, interactive cards instead of showing single blocks of text.
- **Color-Coded Statuses**: Categorizes updates with vibrant, status-specific badges (`Feature`, `Issue`, `Change`, `Deprecation`, etc.).
- **Interactive Tweet Composer**: Click on any release card to slide up a Glassmorphic Tweet composer. Pre-formats the update, enforces the 280-character limit, and shares via Twitter Web Intents.
- **Polished Aesthetics**: High-end dark mode layout styled with custom grids, glowing background orbs, smooth hover effects, custom scrollbars, and micro-interactions.
- **Smooth Feed Refreshing**: Spinner indicator and skeleton loaders for visual feedback during refreshing.

## 🛠️ Tech Stack

- **Backend**: Python, Flask
- **Frontend**: Plain Vanilla HTML5, CSS3, and JavaScript (ES6)
- **Styling**: Modern CSS Custom Properties (Variables), CSS Flexbox/Grid, Backdrop-filters (Glassmorphism)
- **Icons**: FontAwesome 6

## 📦 Getting Started

### Prerequisites
- Python 3.10+ installed

### Setup & Run
1. **Clone the Repository** (or navigate to the project folder):
   ```bash
   cd antigravity-event-talks-app
   ```

2. **Initialize a Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install flask
   ```

4. **Run the Server**:
   ```bash
   python app.py
   ```

5. **Open in Browser**:
   Navigate to [http://127.0.0.1:5001](http://127.0.0.1:5001).

## 📂 Project Structure

```text
├── app.py                  # Flask Web Server & feed parser
├── templates/
│   └── index.html          # Main Frontend Markup & Tweet Drawer structure
├── static/
│   ├── css/
│   │   └── style.css       # Custom design system, badges, skeleton loader, and layouts
│   └── js/
│       └── app.js          # DOMParser, event bindings, and tweet generation
├── .gitignore              # Ignored local environments and OS artifacts
└── README.md               # Project documentation
```

## 📝 License
This project is licensed under the MIT License.
