
/* ── DEFAULT PRODUCTS ── */
const DEFAULT_PRODUCTS=[
  {id:1,name:"Cashew",emoji:"🥜",price:1196,desc:"Creamy, buttery whole cashews from Kerala's finest farms. Rich in healthy fats and magnesium.",arLink:"https://giri2005.github.io/AR-Images/cashew.html",img:"images/cashew.webp"},
  {id:2,name:"Almond",emoji:"🫘",price:1396,desc:"California-grade premium almonds, packed with Vitamin E and a satisfying crunch.",arLink:"https://giri2005.github.io/AR-Images/almond.html",img:"images/almond.png"},
  {id:3,name:"Pistachio",emoji:"🌿",price:1796,desc:"Hand-selected Iranian pistachios with a rich, nutty flavour and emerald-green kernels.",arLink:"https://giri2005.github.io/AR-Images/pistachio.html",img:"images/pistachio.webp"}
];

/* ── STORAGE ── */
function getProducts(){
  const s=localStorage.getItem('nn_products');
  if(s){
    try{
      return JSON.parse(s);
    }catch(e){
      return DEFAULT_PRODUCTS;
    }
  }
  localStorage.setItem('nn_products',JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}
function saveProducts(p){localStorage.setItem('nn_products',JSON.stringify(p));}
function getCart(){return JSON.parse(localStorage.getItem('nn_cart')||'[]');}
function saveCart(c){localStorage.setItem('nn_cart',JSON.stringify(c));updateBadge();}
function getOrders(){return JSON.parse(localStorage.getItem('nn_orders')||'[]');}
function saveOrders(o){localStorage.setItem('nn_orders',JSON.stringify(o));}
function addOrder(order){const orders=getOrders();orders.unshift(order);saveOrders(orders);}
function setOrderDelivered(orderId){const orders=getOrders();const order=orders.find(o=>o.id===orderId);if(!order||order.status==='Delivered')return;order.status='Delivered';saveOrders(orders);showToast('✅ Order marked delivered.');if(document.body.id==='admin') renderAdmin('overview',0);}
function getCustomers(){return JSON.parse(localStorage.getItem('nn_customers')||'[]');}
function saveCustomers(c){localStorage.setItem('nn_customers',JSON.stringify(c));}
function addCustomer(customer){const customers=getCustomers();customers.push(customer);saveCustomers(customers);}
function getSession(){return JSON.parse(localStorage.getItem('nn_session')||'null');}
function saveSession(s){localStorage.setItem('nn_session',JSON.stringify(s));}
function clearSession(){localStorage.removeItem('nn_session');}

/* ── BADGE ── */
function updateBadge(){
  const badge=document.getElementById('cart-badge');
  if(!badge) return;
  badge.textContent=getCart().reduce((s,i)=>s+i.qty,0);
}

/* ── LOGIN ── */
let loginRole='customer';
function setLoginTab(role){
  loginRole=role;
  document.querySelectorAll('.login-tab').forEach((t,i)=>t.classList.toggle('active',(i===0&&role==='customer')||(i===1&&role==='admin')));
  const userInput=document.getElementById('login-user');
  const loginHint=document.getElementById('login-hint');
  if(userInput){
    userInput.placeholder=role==='admin'?'Username':'Email';
    userInput.type=role==='admin'?'text':'email';
  }
  if(loginHint){
    loginHint.textContent=role==='admin'?'Admin login: username "admin" and password "1234".':'Customer login with registered email and password.';
  }
  const err=document.getElementById('login-error');
  if(err) err.classList.remove('show');
}
function doLogin(){
  const userInput=document.getElementById('login-user');
  const passInput=document.getElementById('login-pass');
  const err=document.getElementById('login-error');
  if(!userInput||!passInput||!err) return;
  const u=userInput.value.trim();
  const p=passInput.value.trim();
  if(!u||!p){err.textContent='Please fill in all fields.';err.classList.add('show');return;}
  if(loginRole==='admin'){
    if(u==='admin'&&p==='1234'){saveSession({role:'admin',name:'Admin'});err.classList.remove('show');updateNavAuth();showPage('admin');}
    else{err.textContent='Invalid admin credentials.';err.classList.add('show');}
  } else {
    const customers=getCustomers();
    const customer=customers.find(c=>c.email===u&&c.password===p);
    if(customer){saveSession({role:'customer',name:customer.name,email:customer.email});err.classList.remove('show');updateNavAuth();showPage('shop');showToast('👋 Welcome, '+customer.name+'!');}
    else{err.textContent='Invalid customer credentials.';err.classList.add('show');}
  }
}
function logout(){
  clearSession();updateNavAuth();showPage('shop');showToast('👋 Logged out.');
}
function updateNavAuth(){
  const s=getSession();
  const loginLink=document.getElementById('nl-login');
  const profileLink=document.getElementById('nl-profile');
  const userInfo=document.getElementById('nav-user-info');
  if(loginLink) loginLink.style.display=s?'none':'';
  if(profileLink) profileLink.style.display=(s&&s.role==='customer')?'':'none';
  if(userInfo) userInfo.style.display=s?'flex':'none';
  if(s && document.getElementById('nav-username')){
    document.getElementById('nav-username').textContent=s.name;
  }
}

/* ── NAVIGATION ── */
function showPage(pg){
  const map={shop:'shop.html',about:'about.html',contact:'contact.html',cart:'cart.html',login:'login.html',register:'register.html',profile:'profile.html',admin:'admin.html',checkout:'checkout.html'};
  const target=map[pg];
  if(target) window.location.href=target;
}
function clearAllData(){
  if(confirm('Are you sure you want to clear all data? This will remove all products, customers, orders, and cart items.')){
    localStorage.clear();
    location.reload();
  }
}
function scrollToCollections(){
  const target=document.getElementById('shop-grid');
  if(!target) return;
  target.scrollIntoView({behavior:'smooth', block:'start'});
  setTimeout(()=>window.scrollBy(0, -86), 100);
}
function initMobileNav(){
  const navbar=document.getElementById('navbar');
  if(!navbar) return;
  const navLinks=navbar.querySelector('.nav-links');
  if(!navLinks) return;
  if(navLinks.querySelector('.nav-toggle')) return;
  navbar.classList.add('mobile-nav');
  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.className='nav-toggle';
  toggle.setAttribute('aria-label','Toggle navigation');
  toggle.innerHTML='☰';
  navbar.insertBefore(toggle, navLinks);
  toggle.addEventListener('click',()=>navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a,button').forEach(el=>{
    el.addEventListener('click',()=>navLinks.classList.remove('open'));
  });
}

/* ── SHOP ── */
function renderShop(){
  const grid=document.getElementById('products-grid');
  if(!grid) return;
  const welcomeMessage=document.getElementById('welcome-message');
  const session=getSession();
  if(welcomeMessage){
    if(session && session.role==='customer'){
      welcomeMessage.textContent='Welcome back, '+session.name+'! Check the latest products below.';
      welcomeMessage.style.display='block';
    } else {
      welcomeMessage.style.display='none';
    }
  }
  const prods=getProducts();
  const empty=document.getElementById('empty-shop');
  const count=document.getElementById('prod-count');
  if(count) count.textContent=prods.length+' Products';
  if(!prods.length){grid.innerHTML='';if(empty) empty.style.display='block';return;}
  if(empty) empty.style.display='none';
  grid.innerHTML=prods.map(p=>`
    <div class="product-card">
      <div class="product-img-wrap">
        ${p.img?`<img src="${p.img}" alt="${p.name}" onerror="this.parentElement.innerHTML='<div class=product-img-placeholder>${p.emoji||'🥜'}</div>'">`:`<div class="product-img-placeholder">${p.emoji||'🥜'}</div>`}
        <div class="ar-badge">📲 AR</div>
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <p class="product-desc">${p.desc||''}</p>
        <div class="product-price">₹${p.price}<span style="font-size:0.72rem;color:#a0b0a8;font-weight:400">/kg</span></div>
        <div class="qty-selector">
          <label>Select Weight</label>
          <div class="qty-options" id="qo-${p.id}">
            <button class="qty-opt selected" type="button" onclick="selQty(${p.id},this,'250g',${p.price})">250g<small>₹${Math.round(p.price/4)}</small></button>
            <button class="qty-opt" type="button" onclick="selQty(${p.id},this,'500g',${p.price})">500g<small>₹${Math.round(p.price/2)}</small></button>
            <button class="qty-opt" type="button" onclick="selQty(${p.id},this,'1kg',${p.price})">1 kg<small>₹${p.price}</small></button>
          </div>
        </div>
        <div class="product-actions">
          <button class="btn-add-cart" type="button" onclick="addToCart(${p.id})">🛒 Add to Cart</button>
          <a class="btn-ar" href="${p.arLink||'#'}" target="_blank" rel="noopener"><span>📲 View in AR</span></a>
        </div>
      </div>
    </div>`).join('');
}

/* ── QTY SELECTOR ── */
const selQtyMap={};
function selQty(pid,btn,label,base){
  const container=document.getElementById('qo-'+pid);
  if(!container) return;
  container.querySelectorAll('.qty-opt').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  const prices={'250g':Math.round(base/4),'500g':Math.round(base/2),'1kg':base};
  selQtyMap[pid]={label,price:prices[label]};
}
function getSelQty(pid,base){return selQtyMap[pid]||{label:'250g',price:Math.round(base/4)};}

/* ── CART FUNCTIONS ── */
function addToCart(pid){
  const s=getSession();
  if(!s){showToast('⚠️ Please login to add items.');window.location.href='login.html';return;}
  const prods=getProducts();
  const p=prods.find(x=>x.id===pid);if(!p) return;
  const qty=getSelQty(pid,p.price);
  const cart=getCart();
  const key=pid+'_'+qty.label;
  const ex=cart.find(i=>i.key===key);
  if(ex){ex.qty++;} else {cart.push({key,id:pid,name:p.name,img:p.img||'',emoji:p.emoji||'🥜',qtyLabel:qty.label,unitPrice:qty.price,qty:1});}
  saveCart(cart);
  showToast((p.emoji||'🥜')+' '+p.name+' ('+qty.label+') added!');
}
function removeFromCart(key){
  saveCart(getCart().filter(i=>i.key!==key));renderCart();
}
function changeQty(key,d){
  const cart=getCart();
  const item=cart.find(i=>i.key===key);
  if(item){item.qty=Math.max(1,item.qty+d);}
  saveCart(cart);renderCart();
}

/* ── RENDER CART ── */
function renderCart(){
  const cartContainer=document.getElementById('cart-content');
  if(!cartContainer) return;
  const cart=getCart();
  const products=getProducts();
  const label=document.getElementById('cart-item-label');
  if(label) label.textContent=cart.reduce((s,i)=>s+i.qty,0)+' items';
  if(!cart.length){
    cartContainer.innerHTML=`<div class="cart-empty-state"><div class="empty-icon">🛒</div><p style="margin-bottom:20px">Your cart is empty!</p><a class="btn-success" href="shop.html">Browse Products</a></div>`;
    return;
  }
  const sub=cart.reduce((s,i)=>s+i.unitPrice*i.qty,0);
  const tax=Math.round(sub*0.05);
  const tot=sub+tax;
  cartContainer.innerHTML=`
    <div class="cart-items-list">
      ${cart.map(item=>`
        <div class="cart-item">
          <div class="cart-item-img-wrap">${item.img||products.find(p=>p.id===item.id)?.img?`<img class="cart-item-img" src="${item.img||products.find(p=>p.id===item.id)?.img}" alt="${item.name}" onerror="this.outerHTML='<div class=cart-item-emoji>${item.emoji}</div>'">`:`<div class="cart-item-emoji">${item.emoji}</div>`}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-detail">${item.qtyLabel} · ₹${item.unitPrice} each</div>
          </div>
          <div class="cart-qty-ctrl">
            <button class="q-btn" type="button" onclick="changeQty('${item.key}',-1)">−</button>
            <span class="q-val">${item.qty}</span>
            <button class="q-btn" type="button" onclick="changeQty('${item.key}',1)">+</button>
          </div>
          <div class="cart-item-price">₹${item.unitPrice*item.qty}</div>
          <button class="cart-item-remove" type="button" onclick="removeFromCart('${item.key}')">🗑</button>
        </div>`).join('')}
    </div>
    <div class="cart-summary-box">
      <div class="sum-row"><span>Subtotal</span><span>₹${sub}</span></div>
      <div class="sum-row"><span>GST (5%)</span><span>₹${tax}</span></div>
      <div class="sum-row"><span>Delivery</span><span style="color:var(--sage)">FREE</span></div>
      <div class="sum-row total"><span>Total</span><span>₹${tot}</span></div>
      <button class="btn-checkout-go" type="button" onclick="showPage('checkout')">Proceed to Checkout →</button>
    </div>`;
}

/* ── PAYMENT ── */
let selPayment='';
function selectPayment(r){
  if(!r) return;
  selPayment=r.value;
  document.querySelectorAll('.payment-opt').forEach(o=>o.classList.remove('selected'));
  const opt=r.closest('.payment-opt');
  if(opt) opt.classList.add('selected');
}

/* ── CHECKOUT ── */
function renderCheckout(){
  const paySection=document.getElementById('pay-section');
  const orderConfirmed=document.getElementById('order-confirmed');
  const printBtns=document.getElementById('print-btns');
  if(paySection) paySection.style.display='';
  if(orderConfirmed) {orderConfirmed.classList.remove('show');orderConfirmed.style.display='none';}
  if(printBtns) printBtns.style.display='';
  if(!getCart().length){ window.location.href='cart.html'; return; }
  document.querySelectorAll('.payment-opt').forEach(o=>{ o.classList.remove('selected'); const input=o.querySelector('input'); if(input) input.checked=false; });
  selPayment='';
  buildInvoice();
}

function buildInvoice(){
  const invoiceCard=document.getElementById('invoice-card');
  if(!invoiceCard) return;
  const cart=getCart();
  const products=getProducts();
  const now=new Date();
  const d=now.toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'});
  const t=now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  const inv='NN'+Date.now().toString().slice(-7);
  const sub=cart.reduce((s,i)=>s+i.unitPrice*i.qty,0);
  const tax=Math.round(sub*0.05);
  const tot=sub+tax;
  const pmIcon=selPayment==='Cash on Delivery (CoD)'?'💵':selPayment==='UPI'?'📱':'🏦';
  const pmHtml=selPayment
    ?`<div class="inv-pay-method"><span style="font-size:1.3rem">${pmIcon}</span><div><div class="pm-label">Payment Method</div><div class="pm-val">${selPayment}</div></div></div>`
    :`<div class="inv-pay-method"><div><div class="pm-label">Payment Method</div><div class="pm-val" style="color:var(--sage)">Select payment method above</div></div></div>`;
  invoiceCard.innerHTML=`
    <div class="invoice-head">
      <div class="inv-shop-brand">
        <img src="images/logo.png" alt="Nuts & Naturals" class="inv-logo">
        <div class="inv-shop-name">Nuts & Naturals</div>
      </div>
      <div class="inv-meta-col">
        <div class="inv-title">INVOICE</div>
        <p>No: <strong style="color:var(--amber)">${inv}</strong><br>Date: ${d}<br>Time: ${t}</p>
      </div>
    </div>
    <div class="invoice-body">
      <table class="inv-table">
        <thead><tr><th>Product</th><th>Weight</th><th>Unit Price</th><th>Qty</th><th>Amount</th></tr></thead>
        <tbody>${cart.map(i=>`<tr><td><div class="inv-item-cell">${i.img||products.find(p=>p.id===i.id)?.img?`<img class="inv-item-img" src="${i.img||products.find(p=>p.id===i.id)?.img}" alt="${i.name}" onerror="this.outerHTML='<span class=inv-item-emoji>${i.emoji}</span>'">`:`<span class="inv-item-emoji">${i.emoji}</span>`}<span>${i.name}</span></div></td><td>${i.qtyLabel}</td><td>₹${i.unitPrice}</td><td>${i.qty}</td><td>₹${i.unitPrice*i.qty}</td></tr>`).join('')}</tbody>
      </table>
      <div class="inv-divider"></div>
      <div class="inv-totals">
        <div class="inv-t-row"><span>Subtotal</span><span>₹${sub}</span></div>
        <div class="inv-t-row"><span>GST (5%)</span><span>₹${tax}</span></div>
        <div class="inv-t-row"><span>Delivery</span><span>₹0 (FREE)</span></div>
        <div class="inv-t-row grand"><span>Grand Total</span><span>₹${tot}</span></div>
      </div>
      ${pmHtml}
    </div>
    <div class="invoice-foot">
      <p>Thank you for shopping with <strong>Nuts & Naturals</strong>! Freshness guaranteed.</p>
      <p>Computer-generated invoice. No signature required.</p>
    </div>`;
}

function createOrderRecord(){
  const cart=getCart();
  if(!cart.length) return null;
  const sub=cart.reduce((s,i)=>s+i.unitPrice*i.qty,0);
  const tax=Math.round(sub*0.05);
  const tot=sub+tax;
  const now=new Date();
  const date=now.toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'});
  const time=now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  const session=getSession();
  const order={
    id:'ORD'+Date.now().toString().slice(-6),
    customerEmail:session?.email||'Guest',
    date:`${date} ${time}`,
    payment:selPayment||'Not selected',
    total:tot,
    status:'Pending',
    items:cart.map(i=>({name:i.name,qtyLabel:i.qtyLabel,qty:i.qty,unitPrice:i.unitPrice,amount:i.unitPrice*i.qty}))
  };
  addOrder(order);
  return order;
}

function doPrint(){
  if(!selPayment){showToast('⚠️ Please select a payment method!'); const pay=document.getElementById('pay-section'); if(pay) pay.scrollIntoView({behavior:'smooth'}); return; }
  buildInvoice();
  createOrderRecord();
  setTimeout(()=>{
    window.print();
    setTimeout(()=>{
      const pay=document.getElementById('pay-section'); if(pay) pay.style.display='none';
      const printBtns=document.getElementById('print-btns'); if(printBtns) printBtns.style.display='none';
      const c=document.getElementById('order-confirmed');
      if(c){ c.style.display='block'; c.classList.add('show'); }
    },600);
  },200);
}

function clearCartGoHome(){
  saveCart([]);
  showPage('shop');
}

/* ── ADMIN ── */
function adminTab(tab,idx){
  document.querySelectorAll('.sidebar-link').forEach((l,i)=>l.classList.toggle('active',i===idx));
  renderAdmin(tab,idx);
}
function renderAdmin(tab,idx=0){
  const prods=getProducts();
  const main=document.getElementById('admin-main');
  if(!main) return;
  if(tab==='overview'){
    const orders=getOrders();
    const orderCount=orders.length;
    const totalSales=orders.reduce((s,o)=>s+o.total,0);
    main.innerHTML=`
      <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;margin-bottom:24px">Dashboard Overview</h2>
      <div class="admin-stats">
        <div class="stat-card"><div class="stat-val">${prods.length}</div><div class="stat-label">Products</div></div>
        <div class="stat-card"><div class="stat-val">${orderCount}</div><div class="stat-label">Orders</div></div>
        <div class="stat-card"><div class="stat-val">₹${totalSales.toLocaleString()}</div><div class="stat-label">Total Sales</div></div>
      </div>
      <div class="admin-panel">
        <h3>Recent Orders</h3>
        ${orders.length?`<div class="orders-table">
          <div class="orders-row orders-head"><span>Order</span><span>Date</span><span>Items</span><span>Total</span><span>Status</span><span>Action</span></div>
          ${orders.map(o=>`<div class="orders-row">
            <span>${o.id}</span>
            <span>${o.date}</span>
            <span>${o.items.length}</span>
            <span>₹${o.total}</span>
            <span><span class="order-status ${o.status==='Delivered'?'status-delivered':'status-pending'}">${o.status}</span></span>
            <span class="orders-action"><button class="btn-success ${o.status==='Delivered'?'delivered':''}" type="button" onclick="setOrderDelivered('${o.id}')" ${o.status==='Delivered'?'disabled':''}>${o.status==='Delivered'?'Delivered':'Mark Delivered'}</button></span>
          </div>`).join('')}
        </div>`:'<p style="color:var(--sage);margin:0;padding:16px 0">No orders yet. Orders will appear here once customers checkout.</p>'}
      </div>
      <div class="admin-panel">
        <h3>Quick Overview</h3>
        <div class="admin-prod-grid">${prods.map(p=>adminCardHTML(p)).join('')}</div>
      </div>`;
  } else if(tab==='products'){
    main.innerHTML=`
      <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;margin-bottom:24px">All Products</h2>
      <div class="admin-prod-grid">${prods.length?prods.map(p=>adminCardHTML(p)).join(''):'<p style="color:var(--sage)">No products yet.</p>'}</div>`;
  } else if(tab==='add'){
    renderProdForm(null);
  } else if(tab==='customers'){
    const customers=getCustomers();
    main.innerHTML=`
      <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;margin-bottom:24px">Registered Customers</h2>
      <div class="admin-panel">
        <h3>Customer List</h3>
        ${customers.length?`<div class="customers-table">
          <div class="customers-row customers-head"><span>Name</span><span>Email</span><span>Registered</span></div>
          ${customers.map(c=>`<div class="customers-row"><span>${c.name}</span><span>${c.email}</span><span>${new Date().toLocaleDateString()}</span></div>`).join('')}
        </div>`:'<p style="color:var(--sage);margin:0;padding:16px 0">No customers registered yet.</p>'}
      </div>`;
  } else if(tab==='orders'){
    const orders=getOrders();
    const customers=getCustomers();
    main.innerHTML=`
      <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;margin-bottom:24px">Order Management</h2>
      <div class="admin-panel">
        <h3>Filter Orders</h3>
        <div class="form-grid">
          <div class="form-group"><label>Customer</label><select id="filter-customer"><option value="">All Customers</option>${customers.map(c=>`<option value="${c.email}">${c.name}</option>`).join('')}</select></div>
          <div class="form-group"><label>Month</label><select id="filter-month"><option value="">All Months</option>${Array.from({length:12},(_,i)=>`<option value="${i+1}">${new Date(0,i).toLocaleString('default',{month:'long'})}</option>`).join('')}</select></div>
          <div class="form-group"><label>Day</label><input type="date" id="filter-day"></div>
        </div>
        <button class="btn-primary" type="button" onclick="filterOrders()">Apply Filter</button>
      </div>
      <div class="admin-panel">
        <h3>Orders</h3>
        <div id="orders-list">${renderOrdersList(orders)}</div>
      </div>`;
  } else if(tab==='analytics'){
    main.innerHTML=`
      <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;margin-bottom:24px">Analytics</h2>
      <div class="admin-panel">
        <h3>Revenue Overview</h3>
        <canvas id="revenue-chart" width="400" height="200"></canvas>
      </div>`;
    setTimeout(renderRevenueChart,100);
  }
}
function adminCardHTML(p){
  return `<div class="admin-prod-card">
    ${p.img?`<img class="admin-prod-img" src="${p.img}" alt="${p.name}" onerror="this.outerHTML='<div class=admin-prod-placeholder>${p.emoji||'🥜'}</div>'">`:`<div class="admin-prod-placeholder">${p.emoji||'🥜'}</div>`}
    <div class="admin-prod-body">
      <div class="admin-prod-name">${p.name}</div>
      <div class="admin-prod-price">₹${p.price}/kg</div>
      <div class="admin-prod-actions">
        <button class="btn-edit" type="button" onclick="startEdit(${p.id})">✏️ Edit</button>
        <button class="btn-danger" type="button" onclick="delProd(${p.id})">🗑 Del</button>
      </div>
    </div>
  </div>`;
}
function renderProdForm(ep){
  const main=document.getElementById('admin-main');
  if(!main) return;
  main.innerHTML=`
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;margin-bottom:24px">${ep?'Edit':'Add New'} Product</h2>
    <div class="admin-panel">
      <h3>${ep?'✏️ Update':'➕ Create'} Product</h3>
      <div class="form-grid">
        <div class="form-group"><label>Product Name *</label><input type="text" id="f-name" placeholder="e.g. Cashew" value="${ep?ep.name:''}"></div>
        <div class="form-group"><label>Price per kg (₹) *</label><input type="number" id="f-price" placeholder="e.g. 1196" value="${ep?ep.price:''}"></div>
        <div class="form-group form-full"><label>Product Image</label><input type="file" id="f-img-file" accept="image/*"></div>
        <div class="form-group"><label>AR Link</label><input type="url" id="f-ar" placeholder="https://ar.example.com/product" value="${ep?ep.arLink:''}"></div>
        <div class="form-group form-full"><label>Description</label><textarea id="f-desc" placeholder="Short product description…">${ep?ep.desc:''}</textarea></div>
      </div>
      <div style="display:flex;gap:12px;margin-top:12px">
        <button class="btn-success" type="button" onclick="saveProd(${ep?ep.id:'null'})">${ep?'💾 Update':'➕ Add Product'}</button>
        ${ep?`<button class="btn-danger" type="button" onclick="adminTab('products',1)">Cancel</button>`:''}
      </div>
    </div>`;
}
function startEdit(id){
  const p=getProducts().find(x=>x.id===id);
  if(!p) return;
  document.querySelectorAll('.sidebar-link').forEach((l,i)=>l.classList.toggle('active',i===2));
  renderProdForm(p);
}
function readFileAsDataURL(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(reader.error);
    reader.readAsDataURL(file);
  });
}
function saveProd(eid){
  const name=document.getElementById('f-name')?.value.trim();
  const price=parseInt(document.getElementById('f-price')?.value,10);
  const fileInput=document.getElementById('f-img-file');
  const file=fileInput?.files?.[0]||null;
  const ar=document.getElementById('f-ar')?.value.trim()||'#';
  const desc=document.getElementById('f-desc')?.value.trim();
  if(!name||!price||isNaN(price)){showToast('⚠️ Name and Price are required.');return;}
  const prods=getProducts();
  const currentImg=(eid!==null&&eid!==undefined&&eid!=='null')?prods.find(p=>p.id===eid)?.img||'':'';
  const saveProduct=(img)=>{
    if(eid!==null&&eid!==undefined&&eid!=='null'){
      const idx=prods.findIndex(p=>p.id===eid);
      if(idx>-1) prods[idx]={...prods[idx],name,price,img,arLink:ar,desc};
      showToast('✅ Product updated!');
    } else {
      const newId=prods.length?Math.max(...prods.map(p=>p.id))+1:1;
      prods.push({id:newId,name,price,img,emoji:'🥜',arLink:ar,desc});
      showToast('✅ Product added!');
    }
    saveProducts(prods);
    adminTab('products',1);
  };
  if(file){
    readFileAsDataURL(file).then(dataUrl=>saveProduct(dataUrl)).catch(()=>showToast('⚠️ Failed to read the image file.'));
  } else {
    saveProduct(currentImg);
  }
}
function delProd(id){
  if(!confirm('Delete this product?')) return;
  saveProducts(getProducts().filter(p=>p.id!==id));
  renderAdmin('products',1);
  showToast('🗑 Product deleted.');
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

function renderProfile(){
  const s=getSession();
  if(!s||s.role!=='customer'){window.location.href='login.html';return;}
  const customers=getCustomers();
  const customer=customers.find(c=>c.email===s.email);
  if(!customer){logout();return;}
  document.getElementById('profile-name').textContent=customer.name;
  document.getElementById('profile-email').textContent=customer.email;
  document.getElementById('profile-registered').textContent=new Date(customer.registered).toLocaleDateString();
  const orders=getOrders().filter(o=>o.customerEmail===s.email);
  const ordersDiv=document.getElementById('profile-orders');
  if(orders.length){
    ordersDiv.innerHTML='<div class="orders-table"><div class="orders-row orders-head"><span>Order ID</span><span>Date</span><span>Total</span><span>Status</span></div>'+
      orders.map(o=>`<div class="orders-row"><span>${o.id}</span><span>${o.date}</span><span>₹${o.total}</span><span><span class="order-status ${o.status==='Delivered'?'status-delivered':'status-pending'}">${o.status}</span></span></div>`).join('')+'</div>';
  }else{
    ordersDiv.innerHTML='<p style="color:var(--sage);margin:0;padding:16px 0">No orders yet.</p>';
  }
}

function initChangePasswordForm(){
  const form=document.getElementById('change-password-form');
  if(!form) return;
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const currentPass=document.getElementById('current-password').value;
    const newPass=document.getElementById('new-password').value;
    const confirmPass=document.getElementById('confirm-password').value;
    const s=getSession();
    if(!s) return;
    const customers=getCustomers();
    const customer=customers.find(c=>c.email===s.email);
    if(!customer) return;
    if(customer.password!==currentPass){
      showToast('❌ Current password is incorrect.');
      return;
    }
    if(newPass.length<6){
      showToast('❌ New password must be at least 6 characters.');
      return;
    }
    if(newPass!==confirmPass){
      showToast('❌ New passwords do not match.');
      return;
    }
    customer.password=newPass;
    saveCustomers(customers);
    showToast('✅ Password updated successfully.');
    form.reset();
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded',()=>{
  updateBadge();
  updateNavAuth();
  const page=document.body.id;
  if(page==='login') setLoginTab('customer');
  if(page==='register') initRegisterForm();
  if(page==='profile'){ renderProfile(); initChangePasswordForm(); }
  if(page==='shop') renderShop();
  if(page==='cart') renderCart();
  if(page==='checkout') renderCheckout();
  if(page==='contact') initContactForm();
  initMobileNav();
  if(page==='admin'){
    const s=getSession();
    if(!s||s.role!=='admin'){window.location.href='login.html';return;}
    renderAdmin('overview',0);
  }
});

function renderOrdersList(orders){
  return orders.length?`<div class="orders-table">
    <div class="orders-row orders-head"><span>Order</span><span>Customer</span><span>Date</span><span>Items</span><span>Total</span><span>Status</span><span>Action</span></div>
    ${orders.map(o=>`<div class="orders-row">
      <span>${o.id}</span>
      <span>${o.customer||'N/A'}</span>
      <span>${o.date}</span>
      <span>${o.items.length}</span>
      <span>₹${o.total}</span>
      <span><span class="order-status ${o.status==='Delivered'?'status-delivered':'status-pending'}">${o.status}</span></span>
      <span class="orders-action"><button class="btn-success ${o.status==='Delivered'?'delivered':''}" type="button" onclick="setOrderDelivered('${o.id}')" ${o.status==='Delivered'?'disabled':''}>${o.status==='Delivered'?'Delivered':'Mark Delivered'}</button></span>
    </div>`).join('')}
  </div>`:'<p style="color:var(--sage);margin:0;padding:16px 0">No orders found.</p>';
}

function filterOrders(){
  const customer=document.getElementById('filter-customer').value;
  const month=document.getElementById('filter-month').value;
  const day=document.getElementById('filter-day').value;
  let orders=getOrders();
  if(customer) orders=orders.filter(o=>o.customerEmail===customer);
  if(month) orders=orders.filter(o=>{
    const d=new Date(o.date);
    return d.getMonth()+1==month;
  });
  if(day) orders=orders.filter(o=>o.date.startsWith(day));
  document.getElementById('orders-list').innerHTML=renderOrdersList(orders);
}

function renderRevenueChart(){
  const canvas=document.getElementById('revenue-chart');
  if(!canvas) return;
  const orders=getOrders();
  const monthly={};
  orders.forEach(o=>{
    const d=new Date(o.date);
    const key=`${d.getFullYear()}-${d.getMonth()+1}`;
    monthly[key]=(monthly[key]||0)+o.total;
  });
  const labels=Object.keys(monthly).sort();
  const data=labels.map(k=>monthly[k]);
  new Chart(canvas,{
    type:'line',
    data:{
      labels:labels.map(k=>k.replace('-','/')),
      datasets:[{label:'Revenue (₹)',data:data,borderColor:'var(--amber)',backgroundColor:'rgba(212,160,64,0.1)'}]
    },
    options:{responsive:true}
  });
}

function initRegisterForm(){
  const form=document.getElementById('register-form');
  if(!form) return;
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const name=document.getElementById('reg-name');
    const email=document.getElementById('reg-email');
    const pass=document.getElementById('reg-pass');
    const err=document.getElementById('register-error');
    if(!name||!email||!pass||!err) return;
    const n=name.value.trim();
    const e=email.value.trim();
    const p=pass.value.trim();
    if(!n||!e||!p){err.textContent='Please fill in all fields.';err.classList.add('show');return;}
    if(p.length<6){err.textContent='Password must be at least 6 characters.';err.classList.add('show');return;}
    const customers=getCustomers();
    if(customers.find(c=>c.email===e)){err.textContent='Email already registered.';err.classList.add('show');return;}
    addCustomer({name:n,email:e,password:p,registered:new Date().toISOString()});
    err.classList.remove('show');
    showToast('✅ Registration successful! Please login.');
    setTimeout(()=>showPage('login'),2000);
  });
}
