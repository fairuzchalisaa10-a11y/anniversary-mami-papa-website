from flask import Flask, render_template
import os

app = Flask(__name__)

# Set template folder
app.template_folder = 'templates'
app.static_folder = 'static'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/config')
def config():
    return {'theme': 'anniversary'}

if __name__ == '__main__':
    app.run(debug=False, use_reloader=False, host='0.0.0.0', port=5000)
