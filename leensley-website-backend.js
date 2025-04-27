const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'leensley-enterprises-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database simulation (in a real app, use MongoDB, MySQL, etc.)
const DB_FILE = path.join(__dirname, 'db.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    const initialData = {
        users: [],
        products: [
            {
                id: 1,
                name: 'High-Yield Rice Seeds',
                category: 'agricultural',
                price: 1200,
                image: '/images/rice-seeds.jpg',
                description: 'Premium quality rice seeds with high germination rate'
            },
            {
                id: 2,
                name: 'Smart Irrigation Controller',
                category: 'farming-tools',
                price: 4500,
                image: '/images/irrigation-controller.jpg',
                description: 'Automated irrigation controller with weather monitoring'
            },
            {
                id: 3,
                name: 'Portable Bluetooth Speaker',
                category: 'electronics',
                price: 2800,
                image: '/images/bluetooth-speaker.jpg',
                description: 'Waterproof speaker with 24-hour battery life'
            },
            {
                id: 4,
                name: 'Stainless Steel Cookware Set',
                category: 'utensils',
                price: 6500,
                image: '/images/cookware-set.jpg',
                description: 'Premium 12-piece cookware set with non-stick coating'
            },
            {
                id: 5,
                name: 'Men\'s Casual Button-down Shirt',
                category: 'clothing',
                price: 1800,
                image: '/images/casual-shirt.jpg',
                description: 'Cotton casual shirt, perfect for everyday wear'
            },
            {
                id: 6,
                name: 'Modern Tractor',
                category: 'farming-tools',
                price: 250000,
                image: '/images/tractor.jpg',
                description: 'Fuel-efficient tractor with advanced features'
            },
            {
                id: 7,
                name: 'LED Smart TV',
                category: 'electronics',
                price: 35000,
                image: '/images/smart-tv.jpg',
                description: '43-inch Smart TV with Full HD resolution'
            },
            {
                id: 8,
                name: 'Premium Fertilizer Pack',
                category: 'agricultural',
                price: 3200,
                image: '/images/fertilizer.jpg',
                description: 'Balanced NPK fertilizer for multiple crops'
            }
        ],
        contacts: [],
        cart: {}
    };
    
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Database helper functions
function readDatabase() {
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
}

function writeDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    return res.status(401).json({ message: 'Not authorized' });
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API routes
// Get all products
app.get('/api/products', (req, res) => {
    const db = readDatabase();
    res.json(db.products);
});

// Get products by category
app.get('/api/products/category/:category', (req, res) => {
    const category = req.params.category;
    const db = readDatabase();
    const filteredProducts = db.products.filter(product => product.category === category);
    res.json(filteredProducts);
});

// Get a single product
app.get('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const db = readDatabase();
    const product = db.products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
});

// Register user
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const db = readDatabase();
        
        // Check if email already exists
        const existingUser = db.users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const newUser = {
            id: db.users.length + 1,
            name,
            email,
            phone,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        
        db.users.push(newUser);
        writeDatabase(db);
        
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const db = readDatabase();
        
        // Find user
        const user = db.users.find(user => user.email === email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        // Set session
        req.session.userId = user.id;
        req.session.userName = user.name;
        
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Logout user
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const db = readDatabase();
        
        // Add contact message
        const newContact = {
            id: db.contacts.length + 1,
            name,
            email,
            subject,
            message,
            createdAt: new Date().toISOString()
        };
        
        db.contacts.push(newContact);
        writeDatabase(db);
        
        // In a real application, you would also send an email notification
        // For example, using nodemailer or a similar library
        
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ message: 'Server error while sending message' });
    }
});

// Protected routes - requires authentication
// Get user profile
app.get('/api/profile', isAuthenticated, (req, res) => {
    const db = readDatabase();
    const user = db.users.find(user => user.id === req.session.userId);
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// Shopping cart routes
// Add to cart
app.post('/api/cart', isAuthenticated, (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.session.userId;
        
        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }
        
        const db = readDatabase();
        
        // Check if product exists
        const product = db.products.find(p => p.id === parseInt(productId));
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Initialize cart for user if it doesn't exist
        if (!db.cart[userId]) {
            db.cart[userId] = [];
        }
        
        // Check if product is already in cart
        const existingItemIndex = db.cart[userId].findIndex(item => item.productId === parseInt(productId));
        
        if (existingItemIndex !== -1) {
            // Update quantity if product already in cart
            db.cart[userId][existingItemIndex].quantity += parseInt(quantity);
        } else {
            // Add new item to cart
            db.cart[userId].push({
                productId: parseInt(productId),
                quantity: parseInt(quantity),
                addedAt: new Date().toISOString()
            });
        }
        
        writeDatabase(db);
        
        res.status(201).json({ message: 'Item added to cart' });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Server error while adding to cart' });
    }
});

// Get cart items
app.get('/api/cart', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const db = readDatabase();
    
    if (!db.cart[userId]) {
        return res.json([]);
    }
    
    // Get full product details for each cart item
    const cartWithDetails = db.cart[userId].map(item => {
        const product = db.products.find(p => p.id === item.productId);
        return {
            ...item,
            product
        };
    });
    
    res.json(cartWithDetails);
});

// Remove from cart
app.delete('/api/cart/:productId', isAuthenticated, (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const userId = req.session.userId;
        
        const db = readDatabase();
        
        if (!db.cart[userId]) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        // Remove product from cart
        db.cart[userId] = db.cart[userId].filter(item => item.productId !== productId);
        writeDatabase(db);
        
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Server error while removing from cart' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the website`);
});

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, sending alerts, etc.
});

module.exports = app;
