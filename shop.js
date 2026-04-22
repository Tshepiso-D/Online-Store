import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
    import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
    const db = getFirestore(app);

    // Auth state
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
      }
    });

    // Load products from Firestore
    window.allProducts = [];

    async function loadProducts() {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        window.allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn('Firestore not configured — using demo data.', err);
        // Demo fallback data
        window.allProducts = [
          { id:'1', name:'Oversized Hoodie', price:49.99, category:'Hoodies', description:'Soft cotton hoodie in oversized fit.', imageURL:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80', badge:'HOT' },
          { id:'2', name:'Zip-Up Essential', price:54.99, category:'Hoodies', description:'Classic zip-up in heavy fleece.', imageURL:'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=400&q=80' },
          { id:'3', name:'Graphic Tee Vol.3', price:29.99, category:'T-Shirts', description:'Bold graphic print on 100% organic cotton.', imageURL:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', badge:'NEW' },
          { id:'4', name:'Washed Basic Tee', price:24.99, category:'T-Shirts', description:'Vintage-washed comfort tee for everyday wear.', imageURL:'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80' },
          { id:'5', name:'Drop Shoulder Tee', price:34.99, category:'T-Shirts', description:'Relaxed drop shoulder silhouette.', imageURL:'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400&q=80' },
          { id:'6', name:'Retro Runner', price:89.99, category:'Sneakers', description:'Old-school runner vibes with modern cushioning.', imageURL:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', badge:'HOT' },
          { id:'7', name:'Low-Pro Court', price:74.99, category:'Sneakers', description:'Clean low profile court sneaker.', imageURL:'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&q=80' },
          { id:'8', name:'Chunky Platform', price:109.99, category:'Sneakers', description:'Statement platform sneaker, 5cm sole.', imageURL:'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80', badge:'NEW' },
          { id:'9', name:'5-Panel Cap', price:22.99, category:'Accessories', description:'Structured 5-panel cap in washed twill.', imageURL:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
          { id:'10', name:'Crossbody Sling', price:39.99, category:'Accessories', description:'Compact sling bag for city carry.', imageURL:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
          { id:'11', name:'Beanie Classic', price:18.99, category:'Accessories', description:'Ribbed knit beanie with fold-over cuff.', imageURL:'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&q=80' },
          { id:'12', name:'Chain Necklace', price:28.99, category:'Accessories', description:'Chunky curb chain in silver finish.', imageURL:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80' },
        ];
      }

      // Update counts
      updateCounts();
      renderProducts();
    }

    function updateCounts() {
      const cats = ['Hoodies','T-Shirts','Sneakers','Accessories'];
      document.getElementById('count-all').textContent = window.allProducts.length;
      cats.forEach(c => {
        const el = document.getElementById('count-' + c);
        if (el) el.textContent = window.allProducts.filter(p => p.category === c).length;
      });
    }

    window.renderProducts = function() {
      const cat = window.activeCat || 'all';
      const maxPrice = parseInt(document.getElementById('price-range').value);
      const search = document.getElementById('search-input').value.toLowerCase();
      const sort = document.getElementById('sort-select').value;

      let filtered = window.allProducts.filter(p => {
        const matchCat = cat === 'all' || p.category === cat;
        const matchPrice = p.price <= maxPrice;
        const matchSearch = p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search);
        return matchCat && matchPrice && matchSearch;
      });

      if (sort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
      else if (sort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
      else if (sort === 'name-asc') filtered.sort((a,b) => a.name.localeCompare(b.name));

      document.getElementById('results-count').textContent = filtered.length;
      const grid = document.getElementById('products-grid');
      grid.innerHTML = '';

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="state-msg">
            <div class="icon">🔍</div>
            <h3>NO PRODUCTS FOUND</h3>
            <p>Try adjusting your filters or search term.</p>
          </div>`;
        return;
      }

      filtered.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = (i * 0.06) + 's';
        card.innerHTML = `
          <div class="product-img-wrap">
            <img src="${p.imageURL}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400/1c1c1c/888?text=No+Image'"/>
            ${p.badge ? `<div class="product-badge ${p.badge==='NEW'?'new':''}">${p.badge}</div>` : ''}
            <div class="product-overlay">
              <button class="add-btn" onclick="addToCart('${p.id}','${p.name.replace(/'/g,"\\'")}',${p.price},'${p.imageURL}', this)">
                ADD TO CART
              </button>
            </div>
          </div>
          <div class="product-info">
            <div class="product-name">${p.name}</div>
            <div class="product-desc">${p.description}</div>
            <div class="product-bottom">
              <div class="product-price">$${p.price.toFixed(2)}</div>
              <div class="product-cat">${p.category}</div>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });

      // Re-attach cursor hover
      document.querySelectorAll('.product-card, button, a').forEach(el => {
        el.addEventListener('mouseenter', () => document.getElementById('cursor').classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.getElementById('cursor').classList.remove('hovering'));
      });
    };

    window.filterCat = function(btn, cat) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.activeCat = cat;
      renderProducts();
    };

    window.updatePrice = function(val) {
      document.getElementById('price-val').textContent = '$' + val;
      renderProducts();
    };

    window.addToCart = function(id, name, price, imageURL, btn) {
      let cart = JSON.parse(localStorage.getItem('ut_cart') || '[]');
      const existing = cart.find(i => i.id === id);
      if (existing) { existing.qty += 1; }
      else { cart.push({ id, name, price, imageURL, qty: 1 }); }
      localStorage.setItem('ut_cart', JSON.stringify(cart));

      const total = cart.reduce((s,i) => s + i.qty, 0);
      document.getElementById('cart-count').textContent = total;

      btn.textContent = '✓ ADDED';
      btn.classList.add('added');
      setTimeout(() => { btn.textContent = 'ADD TO CART'; btn.classList.remove('added'); }, 1500);

      showToast('✓ ' + name.toUpperCase() + ' ADDED');
    };

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    }

    // Handle URL params
    const params = new URLSearchParams(location.search);
    const catParam = params.get('cat');
    if (catParam) {
      const catMap = { hoodies:'Hoodies', tshirts:'T-Shirts', sneakers:'Sneakers', accessories:'Accessories' };
      const mappedCat = catMap[catParam] || 'all';
      window.activeCat = mappedCat;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === mappedCat || (mappedCat==='all' && b.dataset.cat==='all'));
      });
    }

    // Cart count
    const cart = JSON.parse(localStorage.getItem('ut_cart') || '[]');
    document.getElementById('cart-count').textContent = cart.reduce((s,i) => s + i.qty, 0);

    loadProducts();
  
    const cursor = document.getElementById('cursor');
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

