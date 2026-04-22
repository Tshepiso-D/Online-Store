import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import {
      getAuth,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      updateProfile,
      signInWithPopup,
      GoogleAuthProvider,
      sendPasswordResetEmail,
      onAuthStateChanged
    } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

    //FIREBASE CONFIG
    const firebaseConfig = {
    apiKey: "AIzaSyBs1zYa48tp2rClsfuJlkcnXE6etVZ3gks",
    authDomain: "urbanthreadsstore-a74bb.firebaseapp.com",
    projectId: "urbanthreadsstore-a74bb",
    storageBucket: "urbanthreadsstore-a74bb.firebasestorage.app",
    messagingSenderId: "736971252961",
    appId: "1:736971252961:web:ba7423c0a0b0e7a3de43a0",
    measurementId: "G-D86JS9F2Q7"
  };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    // Redirect if already logged in
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const redirect = new URLSearchParams(location.search).get('redirect') || 'index.html';
        location.href = redirect;
      }
    });

    window.handleLogin = async function() {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const btn = document.getElementById('login-btn');
      if (!email || !password) return showError('Please fill in all fields.');
      btn.disabled = true;
      btn.classList.add('loading');
      btn.textContent = 'SIGNING IN...';
      try {
        await signInWithEmailAndPassword(auth, email, password);
        showSuccess('Success! Redirecting...');
        setTimeout(() => { location.href = 'index.html'; }, 1000);
      } catch (err) {
        showError(getErrorMessage(err.code));
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.textContent = 'SIGN IN';
      }
    };

    window.handleSignup = async function() {
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;
      const btn = document.getElementById('signup-btn');

      if (!name || !email || !password || !confirm) return showError('Please fill in all fields.');
      if (password !== confirm) return showError('Passwords do not match.');
      if (password.length < 6) return showError('Password must be at least 6 characters.');

      btn.disabled = true;
      btn.classList.add('loading');
      btn.textContent = 'CREATING ACCOUNT...';
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        showSuccess('Account created! Welcome to Urban Threads 🔥');
        setTimeout(() => { location.href = 'index.html'; }, 1200);
      } catch (err) {
        showError(getErrorMessage(err.code));
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.textContent = 'CREATE ACCOUNT';
      }
    };

    window.handleGoogle = async function() {
      try {
        await signInWithPopup(auth, provider);
        showSuccess('Signed in with Google! Redirecting...');
        setTimeout(() => { location.href = 'index.html'; }, 1000);
      } catch (err) {
        showError(getErrorMessage(err.code));
      }
    };

    window.handleForgotPassword = async function(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      if (!email) return showError('Enter your email address first.');
      try {
        await sendPasswordResetEmail(auth, email);
        showSuccess('Password reset email sent! Check your inbox.');
      } catch (err) {
        showError(getErrorMessage(err.code));
      }
    };

    function getErrorMessage(code) {
      const messages = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed.',
        'auth/network-request-failed': 'Network error. Check your connection.',
      };
      return messages[code] || 'An error occurred. Please try again.';
    }

    function showError(msg) {
      const el = document.getElementById('form-error');
      el.textContent = msg;
      el.classList.add('show');
      document.getElementById('form-success').classList.remove('show');
      setTimeout(() => el.classList.remove('show'), 5000);
    }

    function showSuccess(msg) {
      const el = document.getElementById('form-success');
      el.textContent = msg;
      el.classList.add('show');
      document.getElementById('form-error').classList.remove('show');
    }

    // Key press enter handlers
    document.getElementById('login-password').addEventListener('keydown', e => {
      if (e.key === 'Enter') handleLogin();
    });

    window.switchMode = function(mode) {
      const isLogin = mode === 'login';
      document.getElementById('login-form').style.display = isLogin ? 'block' : 'none';
      document.getElementById('signup-form').style.display = isLogin ? 'none' : 'block';
      document.getElementById('tab-login').classList.toggle('active', isLogin);
      document.getElementById('tab-signup').classList.toggle('active', !isLogin);
      document.getElementById('form-title').innerHTML = isLogin ? 'WELCOME<br><span style="color:var(--accent)">BACK</span>' : 'JOIN THE<br><span style="color:var(--accent)">CREW</span>';
      document.getElementById('form-subtitle').textContent = isLogin
        ? 'Sign in to your Urban Threads account.'
        : 'Create a free account and start shopping.';
      document.getElementById('form-error').classList.remove('show');
      document.getElementById('form-success').classList.remove('show');
    };

    window.togglePw = function(id, btn) {
      const input = document.getElementById(id);
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁' : '🙈';
    };

    const cursor = document.getElementById('cursor');
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, input').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    // Check signup param in URL
    if (new URLSearchParams(location.search).get('signup') === '1') switchMode('signup');