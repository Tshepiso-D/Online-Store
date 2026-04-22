  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
    import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
    const db = getFirestore(app);

    let currentUser = null;

    onAuthStateChanged(auth, async (user) => {
      const gate = document.getElementById('auth-gate');
      const content = document.getElementById('cart-content');
      const userDisplay = document.getElementById('user-display');

      if (user) {
        currentUser = user;
        const name = user.displayName || user.email.split('@')[0];
        userDisplay.textContent = `HEY, ${name.toUpperCase()}`;
        gate.style.display = 'none';
        content.style.display = 'block';

        // Try to load cart from Firestore, fallback to localStorage
        try {
          const cartRef = doc(db, 'carts', user.uid);
          const cartSnap = await getDoc(cartRef);
          if (cartSnap.exists()) {
            const firestoreCart = cartSnap.data().items || [];
            if (firestoreCart.length > 0) {
              localStorage.setItem('ut_cart', JSON.stringify(firestoreCart));
            }
          }
        } catch (e) {
          console.log('Firestore cart load failed, using localStorage:', e);
        }
        renderCart();
      } else {
        currentUser = null;
        gate.style.display = 'block';
        content.style.display = 'none';
      }
    });

    async function saveCartToFirestore(cart) {
      if (!currentUser) return;
      try {
        await setDoc(doc(db, 'carts', currentUser.uid), {
          items: cart,
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.log('Cart save to Firestore failed:', e);
      }
    }

    window.handleCheckout = async function() {
      const cart = JSON.parse(localStorage.getItem('ut_cart') || '[]');
      if (!cart.length) return;
      const btn = document.getElementById('checkout-btn');
      btn.disabled = true;
      btn.textContent = 'PROCESSING...';

      // Simulate order placement
      await new Promise(r => setTimeout(r, 1500));

      // Clear cart
      localStorage.setItem('ut_cart', '[]');
      await saveCartToFirestore([]);

      // Show success
      const orderId = 'UT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      document.getElementById('order-number').textContent = 'ORDER #' + orderId;
      document.getElementById('success-modal').classList.add('show');
      renderCart();

      btn.disabled = false;
      btn.textContent = 'CHECKOUT NOW';
    };

    window._saveCartToFirestore = saveCartToFirestore;
    
    const PROMO_CODES = {
      'URBAN20': 0.20,
      'FRESH10': 0.10,
      'THREADS15': 0.15,
    };

    let discountRate = 0;

    function getCart() {
      return JSON.parse(localStorage.getItem('ut_cart') || '[]');
    }

    function saveCart(cart) {
      localStorage.setItem('ut_cart', JSON.stringify(cart));
      if (window._saveCartToFirestore) window._saveCartToFirestore(cart);
    }

    window.renderCart = function() {
      const cart = getCart();
      const list = document.getElementById('cart-list');
      const emptyDiv = document.getElementById('empty-cart');

      document.getElementById('item-count').textContent = cart.reduce((s,i) => s + i.qty, 0);

      if (!cart.length) {
        list.innerHTML = '';
        emptyDiv.style.display = 'block';
        document.getElementById('checkout-btn').disabled = true;
        updateSummary(0);
        return;
      }

      emptyDiv.style.display = 'none';
      document.getElementById('checkout-btn').disabled = false;
      list.innerHTML = '';

      cart.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.style.animationDelay = (idx * 0.08) + 's';
        div.innerHTML = `
          <img class="item-img" src="${item.imageURL || 'https://via.placeholder.com/100x100/1c1c1c/888?text=+'}" 
               alt="${item.name}" onerror="this.src='https://via.placeholder.com/100x100/1c1c1c/888?text=+'"/>
          <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-cat">${item.category || 'Urban Threads'}</div>
            <div class="item-price-each">$${item.price.toFixed(2)} each</div>
            <div class="item-qty-controls">
              <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
              <div class="qty-num">${item.qty}</div>
              <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
            </div>
          </div>
          <div class="item-right">
            <div class="item-total">$${(item.price * item.qty).toFixed(2)}</div>
            <button class="remove-btn" onclick="removeItem('${item.id}')" title="Remove">✕</button>
          </div>
        `;
        list.appendChild(div);
      });

      const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
      updateSummary(subtotal);

      // Reattach cursor hover
      document.querySelectorAll('button, a').forEach(el => {
        el.addEventListener('mouseenter', () => document.getElementById('cursor').classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.getElementById('cursor').classList.remove('hovering'));
      });
    };

    function updateSummary(subtotal) {
      const shipping = subtotal > 0 && subtotal < 100 ? 9.99 : 0;
      const discount = subtotal * discountRate;
      const total = subtotal + shipping - discount;

      document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
      document.getElementById('shipping-val').textContent = shipping > 0 ? '$' + shipping.toFixed(2) : 'FREE';
      document.getElementById('discount-val').textContent = '-$' + discount.toFixed(2);
      document.getElementById('total-val').textContent = '$' + total.toFixed(2);
    }

    window.changeQty = function(id, delta) {
      let cart = getCart();
      const item = cart.find(i => i.id === id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
      saveCart(cart);
      renderCart();
    };

    window.removeItem = function(id) {
      let cart = getCart().filter(i => i.id !== id);
      saveCart(cart);
      renderCart();
    };

    window.clearCart = function() {
      if (!confirm('Remove all items from cart?')) return;
      saveCart([]);
      renderCart();
    };

    window.applyPromo = function() {
      const code = document.getElementById('promo-input').value.trim().toUpperCase();
      const msg = document.getElementById('promo-msg');
      if (PROMO_CODES[code]) {
        discountRate = PROMO_CODES[code];
        msg.textContent = `✓ Code "${code}" applied! ${(discountRate * 100)}% off.`;
        msg.className = 'promo-msg success';
        renderCart();
      } else {
        msg.textContent = `✕ Invalid promo code.`;
        msg.className = 'promo-msg error';
      }
      setTimeout(() => { if (msg.className.includes('error')) msg.className = 'promo-msg'; }, 3000);
    };

    // Cursor
    const cursor = document.getElementById('cursor');
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });