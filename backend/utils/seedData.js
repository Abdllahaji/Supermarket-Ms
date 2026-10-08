const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Location = require('../models/Location');
const Discount = require('../models/Discount');
const Sale = require('../models/Sale');
const PriceHistory = require('../models/PriceHistory');

const seedDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/supermarket_ms');
    console.log(`Connected to MongoDB: ${conn.connection.host}`);

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Customer.deleteMany();
    await Location.deleteMany();
    await Discount.deleteMany();
    await Sale.deleteMany();
    await PriceHistory.deleteMany();

    console.log('Previous data cleared.');

    // 1. Seed Users
    const admin = await User.create({
      name: 'Supermarket Admin',
      email: 'admin@supermarket.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 555-0199',
      status: 'active'
    });

    const manager = await User.create({
      name: 'Store Manager',
      email: 'manager@supermarket.com',
      password: 'admin123',
      role: 'manager',
      phone: '+1 555-0188',
      status: 'active'
    });

    const cashier1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@supermarket.com',
      password: 'cashier123',
      role: 'cashier',
      phone: '+1 555-0144',
      status: 'active'
    });

    const cashier2 = await User.create({
      name: 'Alex Rivera',
      email: 'alex@supermarket.com',
      password: 'cashier123',
      role: 'cashier',
      phone: '+1 555-0155',
      status: 'active'
    });

    console.log('Seeded Users.');

    // 2. Seed Locations
    const locA1 = await Location.create({
      branch: 'Main Downtown Branch',
      section: 'Fresh Produce',
      shelf: 'Shelf A-1',
      aisle: 'Aisle 1',
      description: 'Refrigerated fruits & vegetables display'
    });

    const locB2 = await Location.create({
      branch: 'Main Downtown Branch',
      section: 'Dairy & Eggs',
      shelf: 'Shelf B-2',
      aisle: 'Aisle 2',
      description: 'Chilled dairy section'
    });

    const locC3 = await Location.create({
      branch: 'Main Downtown Branch',
      section: 'Bakery',
      shelf: 'Shelf C-1',
      aisle: 'Aisle 3',
      description: 'Fresh artisanal bread stand'
    });

    const locD4 = await Location.create({
      branch: 'Main Downtown Branch',
      section: 'Beverages',
      shelf: 'Shelf D-4',
      aisle: 'Aisle 4',
      description: 'Juices, soda, and water rack'
    });

    const locE5 = await Location.create({
      branch: 'Main Downtown Branch',
      section: 'Snacks & Confectionery',
      shelf: 'Shelf E-3',
      aisle: 'Aisle 5',
      description: 'Chips, chocolate, and cookies aisle'
    });

    console.log('Seeded Locations.');

    // 3. Seed Customers
    const cust1 = await Customer.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 555-1234',
      address: '742 Evergreen Terrace',
      loyaltyPoints: 120,
      totalPurchases: 1250.50
    });

    const cust2 = await Customer.create({
      name: 'Emma Watson',
      email: 'emma.w@example.com',
      phone: '+1 555-5678',
      address: '10 Downing St',
      loyaltyPoints: 45,
      totalPurchases: 450.00
    });

    const cust3 = await Customer.create({
      name: 'Michael Brown',
      email: 'mbrown@example.com',
      phone: '+1 555-9012',
      address: '221B Baker St',
      loyaltyPoints: 80,
      totalPurchases: 820.75
    });

    console.log('Seeded Customers.');

    // 4. Seed Products
    const productsData = [
      { name: 'Organic Bananas (1kg)', barcode: '89010010001', category: 'Fruits & Vegetables', description: 'Fresh organic ripe bananas', quantity: 85, minStock: 20, price: 2.49, costPrice: 1.50, location: locA1._id },
      { name: 'Red Apples Gala (1kg)', barcode: '89010010002', category: 'Fruits & Vegetables', description: 'Crisp and sweet gala apples', quantity: 60, minStock: 15, price: 3.99, costPrice: 2.20, location: locA1._id },
      { name: 'Whole Milk 1L', barcode: '89010020001', category: 'Dairy & Eggs', description: 'Pasteurized whole cow milk', quantity: 40, minStock: 15, price: 1.89, costPrice: 1.20, location: locB2._id },
      { name: 'Cheddar Cheese 250g', barcode: '89010020002', category: 'Dairy & Eggs', description: 'Aged sharp cheddar cheese', quantity: 25, minStock: 10, price: 4.50, costPrice: 3.10, location: locB2._id },
      { name: 'Free-Range Eggs (Dozen)', barcode: '89010020003', category: 'Dairy & Eggs', description: 'Grade A large free-range eggs', quantity: 8, minStock: 10, price: 3.75, costPrice: 2.50, location: locB2._id }, // Low stock
      { name: 'Whole Wheat Bread 500g', barcode: '89010030001', category: 'Bakery', description: 'Freshly baked whole wheat sliced bread', quantity: 30, minStock: 10, price: 2.20, costPrice: 1.10, location: locC3._id },
      { name: 'Croissants 4-Pack', barcode: '89010030002', category: 'Bakery', description: 'Butter flaky croissants', quantity: 5, minStock: 10, price: 4.99, costPrice: 2.80, location: locC3._id }, // Low stock
      { name: 'Orange Juice 100% 1.5L', barcode: '89010040001', category: 'Beverages', description: 'Freshly squeezed orange juice no pulp', quantity: 50, minStock: 15, price: 3.49, costPrice: 2.00, location: locD4._id },
      { name: 'Sparkling Mineral Water 1L', barcode: '89010040002', category: 'Beverages', description: 'Naturally carbonated mineral water', quantity: 120, minStock: 25, price: 1.25, costPrice: 0.60, location: locD4._id },
      { name: 'Coca-Cola Can 330ml (6-Pack)', barcode: '89010040003', category: 'Beverages', description: 'Classic Coca-Cola soda 6-pack', quantity: 45, minStock: 12, price: 5.99, costPrice: 4.00, location: locD4._id },
      { name: 'Sea Salt Potato Chips 150g', barcode: '89010050001', category: 'Snacks', description: 'Crispy kettle-cooked potato chips', quantity: 70, minStock: 15, price: 2.79, costPrice: 1.40, location: locE5._id },
      { name: 'Dark Chocolate Bar 85% 100g', barcode: '89010050002', category: 'Snacks', description: 'Swiss premium dark chocolate', quantity: 3, minStock: 10, price: 3.20, costPrice: 1.80, location: locE5._id }, // Low stock
      { name: 'Chicken Breast Fillet 1kg', barcode: '89010060001', category: 'Meat & Seafood', description: 'Fresh skinless boneless chicken breast', quantity: 22, minStock: 10, price: 8.99, costPrice: 6.00, location: locA1._id },
      { name: 'Atlantic Salmon Fillet 500g', barcode: '89010060002', category: 'Meat & Seafood', description: 'Fresh wild-caught salmon fillet', quantity: 14, minStock: 8, price: 12.50, costPrice: 9.00, location: locA1._id },
      { name: 'Laundry Detergent Liquid 2L', barcode: '89010070001', category: 'Household', description: 'Concentrated clean scent detergent', quantity: 18, minStock: 5, price: 11.99, costPrice: 7.50, location: locE5._id }
    ];

    const createdProducts = await Product.create(productsData);
    console.log(`Seeded ${createdProducts.length} Products.`);

    // 5. Seed Discounts
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    await Discount.create([
      {
        name: 'Summer Beverages Sale',
        type: 'percentage',
        value: 15,
        startDate: prevMonth,
        endDate: nextMonth,
        categories: ['Beverages'],
        minPurchase: 10,
        status: 'active'
      },
      {
        name: 'Fresh Fruits Special',
        type: 'fixed',
        value: 1.00,
        startDate: prevMonth,
        endDate: nextMonth,
        products: [createdProducts[0]._id, createdProducts[1]._id],
        minPurchase: 5,
        status: 'active'
      },
      {
        name: 'Snack Madness Weekend',
        type: 'percentage',
        value: 20,
        startDate: prevMonth,
        endDate: nextMonth,
        categories: ['Snacks'],
        minPurchase: 0,
        status: 'active'
      }
    ]);

    console.log('Seeded Discounts.');

    // 6. Seed Sample Sales History
    const sampleSales = [
      {
        invoiceNumber: 'INV-20241001-0001',
        cashier: cashier1._id,
        customer: cust1._id,
        items: [
          { product: createdProducts[0]._id, productName: createdProducts[0].name, productBarcode: createdProducts[0].barcode, price: 2.49, quantity: 2, discount: 0, subtotal: 4.98 },
          { product: createdProducts[2]._id, productName: createdProducts[2].name, productBarcode: createdProducts[2].barcode, price: 1.89, quantity: 3, discount: 0, subtotal: 5.67 }
        ],
        subtotal: 10.65,
        discountAmount: 0,
        taxAmount: 0.53,
        totalAmount: 11.18,
        paymentMethod: 'cash',
        amountPaid: 15.00,
        change: 3.82,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        invoiceNumber: 'INV-20241002-0002',
        cashier: cashier2._id,
        customer: cust2._id,
        items: [
          { product: createdProducts[12]._id, productName: createdProducts[12].name, productBarcode: createdProducts[12].barcode, price: 8.99, quantity: 1, discount: 0, subtotal: 8.99 },
          { product: createdProducts[7]._id, productName: createdProducts[7].name, productBarcode: createdProducts[7].barcode, price: 3.49, quantity: 2, discount: 0.52, subtotal: 6.46 }
        ],
        subtotal: 15.97,
        discountAmount: 0.52,
        taxAmount: 0.77,
        totalAmount: 16.22,
        paymentMethod: 'card',
        amountPaid: 16.22,
        change: 0,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        invoiceNumber: 'INV-20241003-0003',
        cashier: cashier1._id,
        customer: cust3._id,
        items: [
          { product: createdProducts[13]._id, productName: createdProducts[13].name, productBarcode: createdProducts[13].barcode, price: 12.50, quantity: 2, discount: 0, subtotal: 25.00 },
          { product: createdProducts[9]._id, productName: createdProducts[9].name, productBarcode: createdProducts[9].barcode, price: 5.99, quantity: 1, discount: 0, subtotal: 5.99 }
        ],
        subtotal: 30.99,
        discountAmount: 0,
        taxAmount: 1.55,
        totalAmount: 32.54,
        paymentMethod: 'cash',
        amountPaid: 40.00,
        change: 7.46,
        createdAt: new Date()
      }
    ];

    await Sale.create(sampleSales);
    console.log('Seeded Sample Sales.');

    console.log('\n========================================');
    console.log('🎉 Supermarket MS Database Seeded Successfully!');
    console.log('========================================');
    console.log('Admin Login:   admin@supermarket.com   / admin123');
    console.log('Manager Login: manager@supermarket.com / admin123');
    console.log('Cashier Login: sarah@supermarket.com   / cashier123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
