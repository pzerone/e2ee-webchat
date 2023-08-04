import sqlite3
from flask import Flask, render_template, session, request, redirect, flash
from flask_socketio import SocketIO, emit
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'deadbeef'
socketio = SocketIO(app, logger=True, engineio_logger=True)


# SQLite database connection
conn = sqlite3.connect('database.db')
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
        private_key  TEXT NOT NULL
        public_key   TEXT NOT NULL
    )
''')
conn.commit()
conn.close()


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        if not username or not password:
            flash('Username or password values invalid')
            return redirect('/signup')
        
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()

        # Check if the username is already taken
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            flash('Username already exists', 'error')
            conn.close()
            return redirect('/signup')

        # Insert new user into the database
        keyPair = generateKeyPair()
        cursor.execute("INSERT INTO users (username, password, private_key, public_key) VALUES (?, ?, ?, ?)",
        (username, generate_password_hash(password), keyPair[0], keyPair[1]))
        
        conn.commit()
        conn.close()

        flash("Sign-up completed. Please Log-in")
        return redirect('/login')
        
    return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()

        # Retrieve the hashed password for the given username
        user = cursor.execute("SELECT username, password FROM users WHERE username = ?", (username,)).fetchone()

        error = None
        if user is None:
            error = 'Incorrect username.'
        elif not check_password_hash(user[1], password):
            error = 'Incorrect password.'

        if error is None:
            session.clear()
            session['username'] = user[0]
            return redirect('/')

        flash(error)
    return render_template('login.html')


@app.route('/')
def index():
    if session.get('username', None) == None:
        return redirect('/login')
    else:
        return render_template('index.html')


user_sessions = {}

@socketio.on('connect')
def handle_connect():
    print(f"{session.get('username', None)} Connected")
    user_sessions[session.get('username')] = request.sid


@socketio.on('disconnect')
def handle_disconnect():
    print(f"{session.get('username', None)} Disconnected")
    user_sessions.pop(session.get('username'))

@socketio.on('private_message')
def private_message(payload):
    recipient_session_id = user_sessions.get(payload.get('recipient'), None)
    message = payload.get('message', None)
    if recipient_session_id != None and message != None:
        payload['sender'] = list(user_sessions.keys())[list(user_sessions.values()).index(request.sid)]
        emit('new_mesage', payload, room=recipient_session_id)

if __name__ == '__main__':
    socketio.run(app, debug = True)