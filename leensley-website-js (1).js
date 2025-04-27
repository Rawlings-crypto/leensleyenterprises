document.addEventListener('DOMContentLoaded', () => {
    // Toggle mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('.overlay');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            overlay.style.display = navMenu.classList.contains('active') ? 'block' : 'none';
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            navMenu.classList.remove('active');
            overlay.style.display = 'none';
        });
    }

    // Modal functionality
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    const closeBtns = document.querySelectorAll('.close-modal');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // Open modals
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'block';
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.style.display = 'block';
        });
    }

    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    // Switch between login and register
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'block';
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const contactForm = document.getElementById('contactForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Login successful!');
                    loginModal.style.display = 'none';
                    // Redirect or update UI based on login success
                    window.location.reload();
                } else {
                    alert(`Login failed: ${data.message}`);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred during login. Please try again.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const phone = document.getElementById('registerPhone').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, phone, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Registration successful! Please login.');
                    registerModal.style.display = 'none';
                    loginModal.style.display = 'block';
                } else {
                    alert(`Registration failed: ${data.message}`);
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('An error occurred during registration. Please try again.');
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, subject, message }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Message sent successfully!');
                    contactForm.reset();
                } else {
                    alert(`Failed to send message: ${data.message}`);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                alert('An error occurred while sending your message. Please try again.');
            }
        });
    }

    // Load featured products
    loadFeaturedProducts();

    // Category buttons functionality
    const categoryButtons = document.querySelectorAll('.view-products');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            fetchProductsByCategory(category);
        });
    });
});

// Products data (would normally come from the backend)
const products = [
    {
        id: 1,
        name: 'High-Yield Rice Seeds',
        category: 'agricultural',
        price: 1200,
        image: '/api/placeholder/300/200',
        description: 'Premium quality rice seeds with high germination rate'
    },
    {
        id: 2,
        name: 'Smart Irrigation Controller',
        category: 'farming-tools',
        price: 4500,
        image: '/api/placeholder/300/200',
        description: 'Automated irrigation controller with weather monitoring'
    },
    {
        id: 3,
        name: 'Portable Bluetooth Speaker',
        category: 'electronics',
        price: 2800,
        image: '/api/placeholder/300/200',
        description: 'Waterproof speaker with 24-hour battery life'
    },
    {
        id: 4,
        name: 'Stainless Steel Cookware Set',
        category: 'utensils',
        price: 6500,
        image: '/api/placeholder/300/200',
        description: 'Premium 12-piece cookware set with non-stick coating'
    },
    {
        id: 5,
        name: 'Men\'s Casual Button-down Shirt',
        category: 'clothing',
        price: 1800,
        image: '/api/placeholder/300/200',
        description: 'Cotton casual shirt, perfect for everyday wear'
    },
    {
        id: 6,
        name: 'Modern Tractor',
        category: 'farming-tools',
        price: 250000,
        image: '/api/placeholder/300/200',
        description: 'Fuel-efficient tractor with advanced features'
    },
    {
        id: 7,
        name: 'LED Smart TV',
        category: 'electronics',
        price: 35000,
        image: '/api/placeholder/300/200',
        description: '43-inch Smart TV with Full HD resolution'
    },
    {
        id: 8,
        name: 'Premium Fertilizer Pack',
        category: 'agricultural',
        price: 3200,
        image: '/api/placeholder/300/200',
        description: 'Balanced NPK fertilizer for multiple crops'
    }
];

// Function to load featured products
function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featured-products-container');
    if (!featuredContainer) return;

    // Get random products to feature
    const featuredProducts = getRandomProducts(products, 4);
    
    featuredContainer.innerHTML = '';
    
    featuredProducts.forEach(product => {
        const productCard = createProductCard(product);
        featuredContainer.appendChild(productCard);
    });
}

// Function to fetch products by category
function fetchProductsByCategory(category) {
    // In a real app, this would be an API call
    const filteredProducts = products.filter(product => product.category === category);
    displayProducts(filteredProducts);
}

// Function to display products
function displayProducts(products) {
    const container = document.getElementById('featured-products-container');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products found in this category.</p>';
        return;
    }
    
    // Create and append product cards
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Function to create a product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const img = document.createElement('div');
    img.className = 'product-img';
    img.style.backgroundImage = `url(${product.image})`;
    
    const info = document.createElement('div');
    info.className = 'product-info';
    
    const name = document.createElement('h3');
    name.textContent = product.name;
    
    const description = document.createElement('p');
    description.textContent = product.description;
    
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = `KSh ${product.price.toLocaleString()}`;
    
    const button = document.createElement('button');
    button.className = 'add-to-cart';
    button.textContent = 'Add to Cart';
    button.addEventListener('click', () => {
        alert(`${product.name} added to cart!`);
    });
    
    info.appendChild(name);
    info.appendChild(description);
    info.appendChild(price);
    info.appendChild(button);
    
    card.appendChild(img);
    card.appendChild(info);
    
    return card;
}

// Function to get random products
function getRandomProducts(products, count) {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const href = this.getAttribute('href');
        if (href === '#login' || href === '#register') return;
        
        const targetElement = document.querySelector(href);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
            
            // Close the mobile menu if it's open
            const navMenu = document.querySelector('.nav-menu');
            const overlay = document.querySelector('.overlay');
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                overlay.style.display = 'none';
            }
        }
    });
});
