import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { HiSearch, HiTrash, HiOutlineUserAdd } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function POS() {
  const { user } = useAuth();
  const searchInputRef = useRef(null);

  // Cart & POS State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  
  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Searching for product by name
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        try {
          const res = await API.get('/products', { params: { search: searchTerm, limit: 10 } });
          if (res.data.success) {
            setSearchResults(res.data.data);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Searching for customer
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (customerSearch.length >= 2) {
        try {
          const res = await API.get('/customers', { params: { search: customerSearch, limit: 5 } });
          if (res.data.success) {
            setCustomerResults(res.data.data);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setCustomerResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [customerSearch]);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    try {
      const res = await API.get(`/products/barcode/${searchTerm}`);
      if (res.data.success && res.data.data) {
        addToCart(res.data.data);
        setSearchTerm('');
        setShowDropdown(false);
      } else {
        toast.error('Product not found');
      }
    } catch (err) {
      toast.error('Product not found');
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product === product._id);
      if (existing) {
        return prev.map(item => 
          item.product === product._id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        return [...prev, {
          product: product._id,
          productName: product.name,
          productBarcode: product.barcode,
          price: product.price,
          quantity: 1,
          discount: 0,
          subtotal: product.price
        }];
      }
    });
    setSearchTerm('');
    setShowDropdown(false);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(item => 
      item.product === productId 
        ? { ...item, quantity: newQty, subtotal: newQty * item.price - item.discount }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setAmountPaid('');
    setPaymentMethod('cash');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
  const taxRate = 0.05; // Example 5% tax
  const taxAmount = (subtotal - totalDiscount) * taxRate;
  const totalAmount = subtotal - totalDiscount + taxAmount;
  const change = paymentMethod === 'cash' && amountPaid >= totalAmount ? amountPaid - totalAmount : 0;

  const handleQuickAmount = (val) => {
    if (val === 'exact') {
      setAmountPaid(totalAmount.toFixed(2));
    } else {
      setAmountPaid(prev => (Number(prev) || 0) + val);
    }
  };

  const completeSale = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (paymentMethod === 'cash' && Number(amountPaid) < totalAmount) {
      return toast.error('Amount paid is less than total');
    }

    const payload = {
      cashier: user?._id,
      customer: selectedCustomer?._id,
      items: cart,
      subtotal,
      discountAmount: totalDiscount,
      taxAmount,
      totalAmount,
      paymentMethod,
      amountPaid: paymentMethod === 'cash' ? Number(amountPaid) : totalAmount,
      change
    };

    try {
      const res = await API.post('/sales', payload);
      if (res.data.success) {
        toast.success('Sale completed!');
        setReceiptData({ ...payload, invoiceNumber: res.data.data?.invoiceNumber || Math.floor(Math.random() * 100000), date: new Date() });
        setShowReceipt(true);
        clearCart();
      }
    } catch (err) {
      toast.error('Failed to complete sale');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-100 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
      {/* LEFT COLUMN - Cart & Search */}
      <div className="w-full md:w-[60%] flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Search Header */}
        <div className="p-4 bg-indigo-600 flex items-center relative">
          <form onSubmit={handleBarcodeSubmit} className="w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white sm:text-sm"
              placeholder="Scan barcode or type product name... (Press Enter)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          
          {/* Search Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 top-full left-4 right-4 mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map(product => (
                <div 
                  key={product._id} 
                  className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex justify-between border-b last:border-0"
                  onClick={() => addToCart(product)}
                >
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.barcode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600">${product.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Stock: {product.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cart.map((item, idx) => (
                <tr key={item.product}>
                  <td className="px-3 py-3 text-sm text-gray-900">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs text-gray-500">{item.productBarcode}</div>
                  </td>
                  <td className="px-3 py-3 text-sm text-center text-gray-500">${item.price.toFixed(2)}</td>
                  <td className="px-3 py-3 text-sm text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => updateQuantity(item.product, item.quantity - 1)} className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200">-</button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.product, parseInt(e.target.value) || 1)}
                        className="w-12 text-center border rounded py-1"
                        min="1"
                      />
                      <button onClick={() => updateQuantity(item.product, item.quantity + 1)} className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200">+</button>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-right font-medium text-gray-900">${item.subtotal.toFixed(2)}</td>
                  <td className="px-3 py-3 text-sm text-center">
                    <button onClick={() => removeFromCart(item.product)} className="text-red-500 hover:text-red-700 p-1"><HiTrash size={18} /></button>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-3 py-8 text-center text-gray-400">Cart is empty. Scan items to add.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT COLUMN - Summary & Payment */}
      <div className="w-full md:w-[40%] flex flex-col gap-4">
        
        {/* Customer Section */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Customer</h3>
            {selectedCustomer && (
              <button onClick={() => setSelectedCustomer(null)} className="text-xs text-red-500 hover:underline">Remove</button>
            )}
          </div>
          
          {selectedCustomer ? (
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-indigo-900">{selectedCustomer.name}</p>
                <p className="text-xs text-indigo-600">{selectedCustomer.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-semibold text-indigo-500">Points</span>
                <p className="font-bold text-indigo-700">{selectedCustomer.loyaltyPoints || 0}</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search customer by name/phone..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              {customerResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                  {customerResults.map(c => (
                    <div 
                      key={c._id} 
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                      onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); setCustomerResults([]); }}
                    >
                      {c.name} - {c.phone}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Order Summary</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600"><span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Discount:</span> <span>-${totalDiscount.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax (5%):</span> <span>${taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t">
              <span>Total:</span> <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Section */}
          <div className="mt-auto">
            <div className="flex space-x-2 mb-4">
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 py-2 rounded-lg font-semibold ${paymentMethod === 'cash' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >Cash</button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-2 rounded-lg font-semibold ${paymentMethod === 'card' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >Card</button>
            </div>

            {paymentMethod === 'cash' && (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Amount Paid</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold">$</span>
                  <input 
                    type="number" 
                    value={amountPaid} 
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full pl-8 pr-3 py-3 text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <button onClick={() => handleQuickAmount('exact')} className="bg-gray-100 py-1 rounded text-sm font-medium hover:bg-gray-200">Exact</button>
                  <button onClick={() => handleQuickAmount(10)} className="bg-gray-100 py-1 rounded text-sm font-medium hover:bg-gray-200">+10</button>
                  <button onClick={() => handleQuickAmount(20)} className="bg-gray-100 py-1 rounded text-sm font-medium hover:bg-gray-200">+20</button>
                  <button onClick={() => handleQuickAmount(50)} className="bg-gray-100 py-1 rounded text-sm font-medium hover:bg-gray-200">+50</button>
                </div>
                {Number(amountPaid) >= totalAmount && (
                  <div className="mt-4 bg-green-50 p-3 rounded-lg flex justify-between items-center border border-green-200">
                    <span className="font-semibold text-green-800">Change:</span>
                    <span className="text-xl font-bold text-green-700">${change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3 mt-4">
              <button onClick={clearCart} className="px-4 py-4 rounded-lg border-2 border-red-500 text-red-600 font-bold hover:bg-red-50">
                Cancel
              </button>
              <button onClick={completeSale} className="flex-1 py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-md transition-colors">
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal (Printable) */}
      <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="Sale Complete" size="md">
        {receiptData && (
          <div className="flex flex-col items-center">
            {/* Printable Area */}
            <div id="receipt-print-area" className="w-full bg-white p-6 shadow-sm border mb-4 text-sm font-mono text-gray-800">
              <div className="text-center mb-4 border-b pb-4 border-dashed border-gray-400">
                <h2 className="text-xl font-bold uppercase">Supermarket MS</h2>
                <p>123 Main Street</p>
                <p>Tel: (555) 123-4567</p>
                <div className="mt-2 text-left flex justify-between">
                  <span>Date: {new Date(receiptData.date).toLocaleString()}</span>
                  <span>Inv#: {receiptData.invoiceNumber}</span>
                </div>
                <div className="text-left mt-1">
                  Cashier: {user?.name || 'Admin'}
                </div>
              </div>
              
              <table className="w-full mb-4 border-b pb-4 border-dashed border-gray-400">
                <thead>
                  <tr className="text-left border-b border-gray-300">
                    <th className="pb-1">Item</th>
                    <th className="pb-1 text-center">Qty</th>
                    <th className="pb-1 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-1">{item.productName}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="space-y-1 mb-4 border-b pb-4 border-dashed border-gray-400 text-right">
                <div className="flex justify-between"><span>Subtotal:</span> <span>${receiptData.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax:</span> <span>${receiptData.taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-300">
                  <span>TOTAL:</span> <span>${receiptData.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-1 text-right border-b pb-4 border-dashed border-gray-400">
                <div className="flex justify-between"><span>Paid ({receiptData.paymentMethod.toUpperCase()}):</span> <span>${receiptData.amountPaid.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Change:</span> <span>${receiptData.change.toFixed(2)}</span></div>
              </div>

              <div className="text-center mt-4 font-bold">
                Thank you for your purchase!
              </div>
            </div>
            
            {/* Print specific styles injected here to hide UI during print */}
            <style>{`
              @media print {
                body * { visibility: hidden; }
                #receipt-print-area, #receipt-print-area * { visibility: visible; }
                #receipt-print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
              }
            `}</style>
            
            <div className="flex w-full space-x-3">
              <button onClick={() => setShowReceipt(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Close</button>
              <button onClick={handlePrintReceipt} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Print Receipt</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
