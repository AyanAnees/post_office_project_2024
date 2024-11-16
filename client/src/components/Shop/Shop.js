import React, { useState, useEffect } from 'react';
import "./Shop.css";
import { SERVER_URL } from "../../App";

function Shop() {
  const [products, setProducts] = useState([]);

  const [productQuantities, setProductQuantities] = useState({});
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const customerID = localStorage.getItem("Customer_ID");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/shop`);
        const data = await response.json();
        setProducts(data);

        // quantity of each item to 0
        const initialQuantities = {};
        data.forEach(product => {
          initialQuantities[product.Product_ID] = 0;
        });
        setProductQuantities(initialQuantities);

      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [customerID]);

  const addToCart = (product) => {
    setProductQuantities(prevQuantities => ({
      ...prevQuantities,
      [product.Product_ID]: (prevQuantities[product.Product_ID] || 0) + 1
    }));
    setTotalQuantity(prevTotal => prevTotal + 1);
    setTotalAmount(prevTotal => prevTotal + parseFloat(product.Product_Price));
  };

  const clearCart = () => {
    const clearedQuantities = {};
    Object.keys(productQuantities).forEach(id => {
      clearedQuantities[id] = 0;
    });
    setProductQuantities(clearedQuantities);
    setTotalQuantity(0);
    setTotalAmount(0);
  };

  const handleQuantityChange = (productID, newQuantity, productPrice) => {
    newQuantity = parseInt(newQuantity) || 0; // if not num, set it 0
    setProductQuantities(prevQuantities => ({
      ...prevQuantities,
      [productID]: newQuantity
    }));

    // udpate quantity and amount
    const updatedTotalQuantity = Object.entries(productQuantities).reduce(
      (acc, [id, qty]) => acc + (id === productID.toString() ? newQuantity : qty),
      0
    );

    const updatedTotalAmount = Object.entries(productQuantities).reduce(
      (acc, [id, qty]) => acc + (id === productID.toString() ? newQuantity * productPrice : qty * (products.find(p => p.Product_ID === parseInt(id))?.Product_Price || 0)),
      0
    );

    setTotalQuantity(updatedTotalQuantity);
    setTotalAmount(updatedTotalAmount);
  };

  return (
    <div className="Shop">
      <ProductList products={products} addToCart={addToCart} />
      <Cart
        products={products}
        productQuantities={productQuantities}
        totalQuantity={totalQuantity}
        totalAmount={totalAmount}
        clearCart={clearCart}
        handleQuantityChange={handleQuantityChange}
        customerID={customerID}

      />
    </div>
  );
}

const ProductList = ({ products, addToCart }) => {
  return (
    <div className="product-list">
      {products.map(product => (
        <div key={product.Product_ID} className="product-box">
          <img
            src={`data:image/jpeg;base64,${product.Product_Image}`}
            alt={product.Product_Name}
            className="product_image"
          />
          <p>{product.Product_Name}</p>
          <p>{`$${parseFloat(product.Product_Price).toFixed(2)}`}</p>
          <button onClick={() => addToCart(product)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
};


const Cart = ({ products, productQuantities, totalQuantity, totalAmount, clearCart, handleQuantityChange, customerID }) => {
  const handleCheckout = async () => {
    //check shoping cart empty or not
    const cart = products
      .filter(product => productQuantities[product.Product_ID] > 0)
      .map(product => ({
        Product_ID: product.Product_ID,
        Quantity: productQuantities[product.Product_ID],
      }));
  
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
  
    try {
      const response = await fetch(`${SERVER_URL}/api/shop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerID, cart, totalAmount })
      });
  
      if (response.ok) {
        alert("Checkout successful!");
        clearCart();
      } else {
        alert("Checkout failed.");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };
  

  return (
    <div className="cart">
      <h2 className='h_shoppingCart'>Shopping Cart</h2>
      <ul>
        {products.map(product => {
          const quantity = productQuantities[product.Product_ID];
          return quantity > 0 ? (
            <div key={product.Product_ID} className='list'>
              <span>{product.Product_Name}</span> - 
              <span>${parseFloat(product.Product_Price).toFixed(2)}</span> - 
              <button className='count_button' onClick={() => handleQuantityChange(product.Product_ID, quantity - 1, product.Product_Price)}>-</button>
              <input
                className='cart_input'
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => handleQuantityChange(product.Product_ID, e.target.value, product.Product_Price)}
              />
              <button className='count_button' onClick={() => handleQuantityChange(product.Product_ID, quantity + 1, product.Product_Price)}>+</button>
            </div>
          ) : null;
        })}
      </ul>
      <h3>Total Quantity: {totalQuantity}</h3>
      <h3>Total Amount: ${totalAmount.toFixed(2)}</h3>
      <button onClick={handleCheckout} className='cart_button'>Checkout</button>
      <button onClick={clearCart} className='cart_button'>Clear Cart</button>
    </div>
  );
};

export default Shop;
