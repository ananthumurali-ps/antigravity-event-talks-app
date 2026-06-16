import os
import ssl
import urllib.request
import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def fetch_and_parse_feed():
    try:
        # Create unverified SSL context to bypass macOS cert verification errors
        context = ssl._create_unverified_context()
        
        # Set a user-agent to resemble a standard browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        req = urllib.request.Request(FEED_URL, headers=headers)
        
        with urllib.request.urlopen(req, context=context, timeout=15) as response:
            xml_data = response.read()
            
        root = ET.fromstring(xml_data)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        entries = []
        
        for entry in root.findall('atom:entry', ns):
            title = entry.find('atom:title', ns)
            title_text = title.text if title is not None else "Unknown Date"
            
            entry_id = entry.find('atom:id', ns)
            id_text = entry_id.text if entry_id is not None else ""
            
            updated = entry.find('atom:updated', ns)
            updated_text = updated.text if updated is not None else ""
            
            link = entry.find('atom:link', ns)
            link_href = link.attrib.get('href', '') if link is not None else ''
            
            content = entry.find('atom:content', ns)
            content_html = content.text if content is not None else ""
            
            entries.append({
                'title': title_text,
                'id': id_text,
                'updated': updated_text,
                'link': link_href,
                'content': content_html
            })
            
        return entries, None
    except Exception as e:
        return [], str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes')
def get_notes():
    entries, error = fetch_and_parse_feed()
    if error:
        return jsonify({'error': error, 'entries': []}), 500
    return jsonify({'entries': entries})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
