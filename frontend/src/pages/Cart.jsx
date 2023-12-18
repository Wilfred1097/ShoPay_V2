import React, { useEffect, useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import CustomNavbar from './NavigationBar';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await fetch('http://localhost:3000/cart', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error fetching cart data');
        }

        const data = await response.json();
        setLoading(false);
        
        // Assuming data is in the format { data: [...cartItems] }
        if (data && data.data) {
          setCartItems(data.data);
          console.log(data);
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const handleCheckout = async (item) => {
    try {
        const response = await fetch('http://localhost:3000/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies (which should include the authentication token)
            body: JSON.stringify({ cartId: item.cart_id, productName: item.product_name }),
        });
  
      if (!response.ok) {
        const errorData = await response.json(); // Try to parse the error response
        throw new Error(`Error initiating checkout: ${response.status} - ${errorData.message}`);
      }
  
      // Handle success, e.g., show a success message or update the UI
      console.log('Checkout successful');
      setTimeout(() => {
        window.location.reload();
      }, 100);
  
      // After successful checkout, you may want to update the cart in the frontend
      // For example, remove the item from the cartItems state
      setCartItems((prevItems) => prevItems.filter((cartItem) => cartItem.cart_id !== item.cart_id));
    } catch (error) {
      console.error('Error initiating checkout:', error.message);
    }
  };
  
  
  

  return (
    <>
        <div>
        <CustomNavbar />
      </div>

      <Container className='mt-5 m-5'>
        <h1>Your Cart</h1>
        {loading ? (
            <p>Loading...</p>
        ) : Array.isArray(cartItems) && cartItems.length > 0 ? (
            cartItems.map(item => (
              <Card key={item.product_name} style={{ marginBottom: '10px' }}>
                <Card.Body>
                  <Card.Title>{item.product_name}</Card.Title>
                  <Card.Text>{item.product_description}</Card.Text>
                  <Card.Text>${item.product_price}</Card.Text>
                  <Card.Text>Quantity: {item.quantity}</Card.Text>
                  <Button variant='primary' onClick={() => handleCheckout(item)}>Checkout</Button>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>No items in the cart</p>
          )}
    </Container>
    </>
    
  );
};

export default CartPage;
