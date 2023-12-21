// ProductDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomNavbar from './NavigationBar';
import { Card, Image, Container, Row, Col, Button } from 'react-bootstrap';

function ProductDetails() {
  // Extract the product ID from the URL params
  const { id } = useParams();
  const [productDetails, setProductDetails] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Fetch product details based on the product_id
    fetch(`http://localhost:3000/product/${id}`)
      .then((response) => response.json())
      .then((responseData) => {
        setProductDetails(responseData);
      })
      .catch((error) => {
        console.error('Error fetching product details:', error);
      });
  }, [id]);

  const addToCart = async () => {
    try {
        const response = await fetch('http://localhost:3000/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ productId: parseInt(id, 10) }),
        });

        const data = await response.json();

        if (response.status === 401) {
            // Handle 405 (Method Not Allowed) - Show an alert
            alert('You must log in first.');
        } else {
            // Handle other response statuses
            setStatus(data.status);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        setStatus('Error adding to cart');
    }
};


  if (!productDetails) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        <CustomNavbar />
      </div>

      <Container className='mt-3 pt-5'>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card>
              <Image src={productDetails.product_photo} alt="Profile" fluid />
              <Card.Body>
                <Card.Title>{productDetails.product_name}</Card.Title>
                <Card.Subtitle className="mb-2">{productDetails.product_description}</Card.Subtitle>
                <Card.Subtitle className="mb-2">Available Quantity: {productDetails.product_qty}</Card.Subtitle>
                <Button variant='secondary' onClick={addToCart}>Add To Cart</Button>
                <p>{status}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row><br />
      </Container>
    </>
  );
}

export default ProductDetails;
