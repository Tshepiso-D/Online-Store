 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

    // FIREBASE CONFIG
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

    onAuthStateChanged(auth, (user) => {
      const userDisplay = document.getElementById('user-display');
      const authBtn = document.getElementById('auth-btn');
      if (user) {
        const name = user.displayName || user.email.split('@')[0];
        userDisplay.textContent = `HEY, ${name.toUpperCase()}`;
        authBtn.textContent = 'Sign Out';
        authBtn.href = '#';
        authBtn.addEventListener('click', (e) => {
          e.preventDefault();
          signOut(auth).then(() => location.reload());
        });
      } else {
        userDisplay.textContent = '';
        authBtn.textContent = 'Sign In';
        authBtn.href = 'login.html';
      }
    });

    // Cart count from localStorage
    const cart = JSON.parse(localStorage.getItem('ut_cart') || '[]');
    document.getElementById('cart-count').textContent = cart.reduce((s,i) => s + i.qty, 0);

    document.querySelectorAll('a, button, .cat-card, .product-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));