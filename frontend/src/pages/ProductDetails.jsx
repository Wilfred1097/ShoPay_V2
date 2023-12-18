// ProductDetails.js
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import CustomNavbar from './NavigationBar';
import { Card, Image, Container, Row, Col, Button } from 'react-bootstrap';


function ProductDetails() {
  // Extract the product ID from the URL params
  const { id } = useParams();
  const [productDetails, setProductDetails] = useState(null);

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

  if (!productDetails) {
    return <div>Loading...</div>;
  }

  // Fetch the product details using the product ID (you might want to use useEffect here)
  // For now, let's just display the product ID
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
                <Button variant='secondary'>Add To Cart</Button>
                <Button variant='success'>Buy Now</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row><br />
      </Container>
    </>
    
  );
}

export default ProductDetails;