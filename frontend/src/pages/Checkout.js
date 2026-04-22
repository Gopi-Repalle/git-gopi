import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi'];

export default function Checkout() {
  const { cart, cartSubtotal, cartShipping, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    name: user?.name || '', phone: user?.phone || '',
    addressLine1: '', addressLine2: '', city: '', state: 'Telangana', pincode: ''
  });
  const [payMethod, setPayMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=address, 2=payment

  const handleAddress = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        items: cart.map(item => ({ product: item._id, quantity: item.qty })),
        shippingAddress: address,
        payment: { method: payMethod }
      };

      if (payMethod === 'razorpay') {
        // Create Razorpay order
        const rzpRes = await API.post('/payment/razorpay/create-order', { amount: cartTotal });
        const { orderId: rzpOrderId, amount, key } = rzpRes.data;

        const options = {
          key,
          amount,
          currency: 'INR',
          name: 'FarmSpice',
          description: 'Pure Chilli Powder',
          order_id: rzpOrderId,
          handler: async (response) => {
            // Verify payment
            await API.post('/payment/razorpay/verify', response);
            orderPayload.payment.transactionId = response.razorpay_payment_id;
            const order = await API.post('/orders', orderPayload);
            clearCart();
            navigate(`/order-success/${order.data.orderId}`);
          },
          prefill: { name: address.name, contact: address.phone },
          theme: { color: '#C0392B' }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
        return;
      }

      // COD or other
      const order = await API.post('/orders', orderPayload);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-success/${order.data.orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order placement failed');
    } finally {
      setLoading(false);
    }
  };

  const addressValid = address.name && address.phone && address.addressLine1 && address.city && address.state && address.pincode;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {payMethod === 'razorpay' && (
        <script src="https://checkout.razorpay.com/v1/checkout.js" />
      )}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Steps */}
        <div className="flex items-center gap-4 mb-6 text-sm font-semibold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs ${step >= 1 ? 'bg-red-600' : 'bg-gray-300'}`}>1</span>
            DELIVERY ADDRESS
          </div>
          <div className="flex-1 border-t border-dashed border-gray-300" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs ${step >= 2 ? 'bg-red-600' : 'bg-gray-300'}`}>2</span>
            PAYMENT
          </div>
          <div className="flex-1 border-t border-dashed border-gray-300" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs ${step >= 3 ? 'bg-red-600' : 'bg-gray-300'}`}>3</span>
            CONFIRM
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Address */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Delivery Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input name="name" className="input" value={address.name} onChange={handleAddress} required />
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input name="phone" className="input" value={address.phone} onChange={handleAddress} required />
                </div>
                <div className="col-span-2">
                  <label className="label">Address Line 1 *</label>
                  <input name="addressLine1" className="input" placeholder="House No, Street Name" value={address.addressLine1} onChange={handleAddress} required />
                </div>
                <div className="col-span-2">
                  <label className="label">Address Line 2</label>
                  <input name="addressLine2" className="input" placeholder="Landmark, Area (optional)" value={address.addressLine2} onChange={handleAddress} />
                </div>
                <div>
                  <label className="label">City *</label>
                  <input name="city" className="input" placeholder="Hyderabad" value={address.city} onChange={handleAddress} required />
                </div>
                <div>
                  <label className="label">Pincode *</label>
                  <input name="pincode" className="input" placeholder="500001" value={address.pincode} onChange={handleAddress} required maxLength={6} />
                </div>
                <div className="col-span-2">
                  <label className="label">State *</label>
                  <select name="state" className="input" value={address.state} onChange={handleAddress}>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {step === 1 && (
                <button
                  onClick={() => { if (addressValid) setStep(2); else toast.error('Please fill all required fields'); }}
                  className="btn-primary mt-4"
                >
                  CONTINUE TO PAYMENT
                </button>
              )}
            </div>

            {/* Payment */}
            {step >= 2 && (
              <div className="card p-5">
                <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                    { id: 'razorpay', label: 'Pay Online (UPI / Card / NetBanking)', icon: '💳', desc: 'Secure payment via Razorpay' },
                  ].map(m => (
                    <label key={m.id} className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${payMethod === m.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="text-red-600" />
                      <span className="text-xl">{m.icon}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{m.label}</p>
                        <p className="text-xs text-gray-500">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-primary mt-4 py-3 w-full text-sm font-bold"
                >
                  {loading ? 'Placing Order...' : payMethod === 'razorpay' ? 'PAY NOW' : 'PLACE ORDER'}
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">🔒 Your information is 100% secure</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="card p-5 h-fit">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item._id} className="flex gap-2 text-sm">
                  <img src={item.images?.[0] || ''} alt={item.name} className="w-12 h-12 object-cover rounded-sm bg-gray-100" onError={e => e.target.style.display='none'} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-xs leading-tight">{item.name}</p>
                    <p className="text-gray-400 text-xs">Qty: {item.qty}</p>
                  </div>
                  <span className="font-semibold text-xs">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span className={cartShipping === 0 ? 'text-green-600 font-medium' : ''}>{cartShipping === 0 ? 'FREE' : `₹${cartShipping}`}</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2"><span>Total</span><span>₹{cartTotal}</span></div>
            </div>
            <div className="mt-3 p-2 bg-green-50 rounded-sm text-xs text-green-700">
              ✅ You will save ₹{cart.reduce((s, i) => s + ((i.originalPrice || i.price) - i.price) * i.qty, 0)} on this order
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
