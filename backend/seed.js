require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Category = require('./models/Category');
const Product = require('./models/Product');
const connectDB = require('./config/db');

connectDB();

const seed = async () => {
  try {
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);

    const admin = await User.create({
      fullName: 'Admin User',
      phoneNumber: '+911234567890',
      email: 'admin@electrofix.com',
      password: 'admin123',
      role: 'admin',
      securityQuestions: [
        { question: 'What is your favorite food?', answer: 'Biryani' },
        { question: 'What city were you born in?', answer: 'Bengaluru' },
        { question: 'What was your childhood nickname?', answer: 'Admin' },
      ],
    });
    console.log(`Admin created: ${admin.email} / admin123`);

    const customer = await User.create({
      fullName: 'John Customer',
      phoneNumber: '+919876543210',
      email: 'john@example.com',
      password: 'customer123',
      role: 'customer',
      securityQuestions: [
        { question: 'What is your favorite food?', answer: 'Pizza' },
        { question: 'What city were you born in?', answer: 'Mumbai' },
        { question: 'What was your childhood nickname?', answer: 'Johnny' },
      ],
    });
    console.log(`Customer created: ${customer.email} / customer123`);

    await Customer.create({ userId: customer._id });

    const categories = await Category.insertMany([
      { categoryName: 'Phones', categoryImage: 'https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80&w=400' },
      { categoryName: 'Laptops', categoryImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=400' },
      { categoryName: 'Tablets', categoryImage: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&q=80&w=400' },
      { categoryName: 'Accessories', categoryImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' },
    ]);

    const products = [
      {
        productId: 'IP16P-256-NT',
        title: 'iPhone 16 Pro Max',
        description: 'Brand new iPhone 16 Pro Max with A18 Pro chip, 48MP camera, and titanium design.',
        category: categories[0]._id,
        stock: 5,
        price: 1499,
        discount: 10,
        images: ['https://images.unsplash.com/photo-1725791131641-2c5d7a5e9d7a?auto=format&fit=crop&q=80&w=600'],
        specifications: { Storage: '256GB', Color: 'Natural Titanium', Condition: 'Excellent' },
      },
      {
        productId: 'GPX6-128-BK',
        title: 'Google Pixel 6',
        description: 'Refurbished Google Pixel 6 with Tensor chip, 50MP camera, and amazing AI features.',
        category: categories[0]._id,
        stock: 6,
        price: 499,
        discount: 15,
        images: ['https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&q=80&w=600'],
        specifications: { Storage: '128GB', Color: 'Stormy Black', Condition: 'Good' },
      },
      {
        productId: 'ACC-AIRPODS-P2',
        title: 'Apple AirPods Pro 2',
        description: 'Premium wireless earbuds with Active Noise Cancellation and Adaptive Audio.',
        category: categories[3]._id,
        stock: 25,
        price: 249,
        discount: 5,
        images: ['https://images.unsplash.com/photo-1606841837239-c5a1a424a2c9?auto=format&fit=crop&q=80&w=600'],
        specifications: { Type: 'Wireless Earbuds', Battery: '6 hours', Chip: 'H2' },
      },
      {
        productId: 'ACC-SAMSUNG-BU2',
        title: 'Samsung Galaxy Buds2 Pro',
        description: 'Hi-fi sound with intelligent ANC and 360 Audio. Comfortable fit for all-day wear.',
        category: categories[3]._id,
        stock: 20,
        price: 189,
        discount: 10,
        images: ['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&q=80&w=600'],
        specifications: { Type: 'Wireless Earbuds', Battery: '5 hours', Color: 'Graphite' },
      },
      {
        productId: 'ACC-LAPTOP-STAND',
        title: 'Adjustable Laptop Stand',
        description: 'Ergonomic aluminum laptop stand with adjustable height and angle. Compatible with all laptops.',
        category: categories[3]._id,
        stock: 35,
        price: 49,
        discount: 0,
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600'],
        specifications: { Material: 'Aluminum', Height: 'Adjustable', Compatibility: 'All laptops' },
      },
      {
        productId: 'ACC-WIRELESS-MOUSE',
        title: 'Logitech MX Master 3S',
        description: 'Premium wireless mouse with 8K DPI, quiet clicks, and ergonomic design.',
        category: categories[3]._id,
        stock: 18,
        price: 99,
        discount: 0,
        images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600'],
        specifications: { Type: 'Wireless Mouse', DPI: '8000', Battery: '70 days' },
      },
      {
        productId: 'MBP16-M4-MAX',
        title: 'MacBook Pro 16" M4 Max',
        description: 'Top-of-the-line MacBook Pro with M4 Max chip, 36GB RAM, and 1TB SSD.',
        category: categories[1]._id,
        stock: 3,
        price: 3499,
        discount: 5,
        images: ['https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&q=80&w=600'],
        specifications: { Chip: 'M4 Max', RAM: '36GB', Storage: '1TB' },
      },
      {
        productId: 'IP14P-128-SG',
        title: 'iPhone 14 Pro Max',
        description: 'Premium refurbished iPhone 14 Pro Max in Space Gray. Features A16 Bionic chip, 48MP camera system, and ProMotion display.',
        category: categories[0]._id,
        stock: 15,
        price: 1099,
        discount: 25,
        images: ['https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80&w=600'],
        specifications: { Storage: '128GB', Color: 'Space Gray', Condition: 'Excellent' },
      },
      {
        productId: 'IP14P-256-GD',
        title: 'iPhone 14 Pro Max',
        description: 'Premium refurbished iPhone 14 Pro Max in Gold with 256GB storage.',
        category: categories[0]._id,
        stock: 10,
        price: 1199,
        discount: 20,
        images: ['https://images.unsplash.com/photo-1550009158-9efff6c0e561?auto=format&fit=crop&q=80&w=600'],
        specifications: { Storage: '256GB', Color: 'Gold', Condition: 'Like New' },
      },
      {
        productId: 'MBP16-M2-16',
        title: 'MacBook Pro 16" M2',
        description: 'Refurbished MacBook Pro 16-inch with M2 Pro chip, 16GB RAM, 512GB SSD. Space Gray.',
        category: categories[1]._id,
        stock: 8,
        price: 1999,
        discount: 15,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600'],
        specifications: { Chip: 'M2 Pro', RAM: '16GB', Storage: '512GB' },
      },
      {
        productId: 'MBP14-M3-18',
        title: 'MacBook Pro 14" M3',
        description: 'Refurbished MacBook Pro 14-inch with M3 chip, 18GB RAM, 1TB SSD. Silver.',
        category: categories[1]._id,
        stock: 5,
        price: 1799,
        discount: 10,
        images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600'],
        specifications: { Chip: 'M3', RAM: '18GB', Storage: '1TB' },
      },
      {
        productId: 'IPAD-AIR-5',
        title: 'iPad Air 5 M1',
        description: 'Refurbished iPad Air 5th generation with M1 chip, 64GB, Wi-Fi. Space Gray.',
        category: categories[2]._id,
        stock: 12,
        price: 599,
        discount: 20,
        images: ['https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&q=80&w=600'],
        specifications: { Chip: 'M1', Storage: '64GB', Connectivity: 'Wi-Fi' },
      },
      {
        productId: 'ACC-MAG-15W',
        title: 'MagSafe Charger 15W',
        description: 'Apple MagSafe wireless charger. Fast 15W charging for iPhone 12 and later.',
        category: categories[3]._id,
        stock: 50,
        price: 39,
        discount: 0,
        images: ['https://images.unsplash.com/photo-1622445262465-2481c8573326?auto=format&fit=crop&q=80&w=600'],
        specifications: { Type: 'Wireless', Power: '15W' },
      },
      {
        productId: 'ACC-TG-IP14',
        title: 'Tempered Glass Screen Protector',
        description: 'Premium tempered glass screen protector for iPhone 14 series. 9H hardness, oleophobic coating.',
        category: categories[3]._id,
        stock: 100,
        price: 19,
        discount: 0,
        images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=600'],
        specifications: { Compatible: 'iPhone 14 Series', Hardness: '9H' },
      },
      {
        productId: 'GS22U-256-PB',
        title: 'Galaxy S22 Ultra',
        description: 'Refurbished Samsung Galaxy S22 Ultra, 256GB, Phantom Black with S Pen.',
        category: categories[0]._id,
        stock: 7,
        price: 899,
        discount: 30,
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=600'],
        specifications: { Storage: '256GB', Color: 'Phantom Black', Condition: 'Excellent' },
      },
    ];

    await Product.insertMany(products);
    console.log(`${products.length} products seeded`);

    console.log('\n--- Seed Complete ---');
    console.log('Admin: admin@electrofix.com / admin123');
    console.log('Customer: john@example.com / customer123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
