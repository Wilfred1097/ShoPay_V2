import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Button, Table, Modal, Form, Tab, Tabs, Row, Container, Col, Card, InputGroup } from 'react-bootstrap';
import { productSchema } from '../validations/userController';

function AdminPage() {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [userData, setUserData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [values, setValues] = useState({
    product_name: '',
    product_description: '',
    product_photo: '',
    product_qty: 0,
  });

  const [updateProductData, setUpdateProductData] = useState({
    product_name: '',
    product_description: '',
    product_photo: '',
    product_price: 0,
    product_qty: 0,
  });

  // Function to handle the "Update" button click
  const handleUpdateClick = (product) => {
    // Set the selected product ID
    setSelectedProductId(product.product_id);
  
    // Populate the update form with the selected product data
    setUpdateProductData({
      product_name: product.product_name,
      product_description: product.product_description,
      product_photo: product.product_photo,
      product_price: product.product_price,
      product_qty: product.product_qty,
    });
  
    handleShow(); // Show the modal
  };

  // Create a new function to handle the update operation
  const handleUpdate = async () => {
    try {
      const tableName = 'product'; // Specify the table name
      const primaryKey = selectedProductId; // Specify the primary key (product_id in this case)
  
      // Your update data (updateProductData)
      const updateData = {
        product_name: updateProductData.product_name,
        product_description: updateProductData.product_description,
        product_price: updateProductData.product_price,
        product_qty: updateProductData.product_qty,
      };
  
      // Your update API endpoint
      const response = await axios.put(`http://localhost:3000/update/${tableName}/${primaryKey}`, updateData);
  
      if (response && response.data && response.data.Status === `${tableName} record updated successfully`) {
        alert(response.data.Status);
  
        // Close the modal
        handleClose();
  
        setTimeout(() => {
          window.location.reload();
        }, 1000);
  
      } else {
        console.error('Unexpected response structure:', response);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      await productSchema.validate(values, { abortEarly: false });
      const response = await axios.post('http://localhost:3000/add_product', values);
  
      if (response && response.data && response.data.Status === 'Product added successfully') {
        alert(response.data.Status);
  
        setValues({
          product_name: '',
          product_description: '',
          product_photo: '',
          product_price: 0,
          product_qty: 0,
        });
  

        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else if (response && response.data && response.data.Status === 'Product name already exists') {
        alert(response.data.Status);
      } else {
        console.error('Unexpected response structure:', response);
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        alert(Object.values(validationErrors).join('\n'));
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };
  
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch('http://localhost:3000/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.Status === 'Success') {
          console.log('Logout Successfully');
          navigate('/');
        } else {
          console.error('Logout failed');
        }
      })
      .catch((error) => {
        console.error('Error during logout:', error);
      });
  };

  const handleDelete = async (itemId, itemType) => {
    try {
      const response = await axios.delete(`http://localhost:3000/delete/${itemType}/${itemId}`);
      
      if (response && response.data && response.data.Status === 'Item deleted successfully') {
        alert(response.data.Status);
  
        if (itemType === 'user') {
          const updatedUserData = userData.filter(user => user.id !== itemId);
          setUserData(updatedUserData);
        } else if (itemType === 'product') {
          const updatedProductData = productData.filter(product => product.product_id !== itemId);
          setProductData(updatedProductData);
        }
      } else {
        console.error('Unexpected response structure:', response);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  useEffect(() => {
    fetch('http://localhost:3000/data')
      .then((response) => response.json())
      .then((responseData) => {
        setUserData(responseData);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:3000/product')
      .then((response) => response.json())
      .then((responseData) => {
        setProductData(responseData);
      })
      .catch((error) => {
        console.error('Error fetching product data:', error);
      });
  }, []);

  return (
    <>
      <Navbar bg="success" variant="dark" expand="lg" fixed="top" className="p-3">
        <Navbar.Brand><strong>Admin Panel</strong></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Button variant="success" onClick={handleLogout}>Logout</Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Tabs defaultActiveKey="user" id="uncontrolled-tab-example" className="mt-5 pl-5 pt-5">
        <Tab eventKey="user" title="Manage User"  className='pt-1'>
          <div className="container-fluid p-4 pt-0"><br /><br />
              <h2>Registered User</h2>
              <Table striped="columns" bordered hover responsive variant="success">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Birthdate</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.map((user, index) => (
                    <tr key={index}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.username}</td>
                      <td>{user.birthdate}</td>
                      <td>{user.role}</td>
                      <td>{user.email}</td>
                      <td>
                        <Button variant="danger"  onClick={() => handleDelete(user.id, 'user')}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
        </Tab>
        <Tab eventKey="product" title="Manage Product" className='pt-4'>
        <div className="container-fluid p-4">
          <h2>Product List</h2>
          <Table striped="columns" bordered hover responsive  variant="success">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Product Description</th>
                <th>Price</th>
                <th>Product QTY</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {productData.map((product, index) => (
                <tr key={index}>
                  <td>{product.product_id}</td>
                  <td>{product.product_name}</td>
                  <td>{product.product_description}</td>
                  <td>{product.product_price}</td>
                  <td>{product.product_qty}</td>
                  <td>
                    <Button variant="success" onClick={() => handleUpdateClick(product)}>Update</Button>
                    <Button variant="danger" onClick={() => handleDelete(product.product_id, 'product')}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        </Tab>
        <Tab eventKey="addproduct" title="Add Product">
          <Container className="mt-2 pt-5">
          <Row className="justify-content-md-center">
          <Col md={6}>
            <Card>
              <Card.Body>
              <h1>Add Product</h1>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className='mt-0'>
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter product name"
                      onChange={(e) => setValues({ ...values, product_name: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className='mt-2'>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      placeholder="Enter product description"
                      onChange={(e) => setValues({ ...values, product_description: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className='mt-2'>
                    <Form.Label>Product Photo</Form.Label>
                    <Form.Control
                      type="text"
                      name="text"
                      placeholder="Enter product photo url"
                      onChange={(e) => setValues({ ...values, product_photo: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className='mt-2'>
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      placeholder="Enter price"
                      onChange={(e) => setValues({ ...values, product_price: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className='mt-2'>
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      placeholder="Enter quantity"
                      onChange={(e) => setValues({ ...values, product_qty: e.target.value })}
                    />
                  </Form.Group>

                  <Button variant="success" type="submit" className='mt-3'>
                    Add Product
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        </Container>
        </Tab>
      </Tabs>

{/* Update Product Modal */}
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Update Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form >
            <Form.Group className='mt-0'>
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={updateProductData.product_name}
                onChange={(e) => setUpdateProductData({ ...updateProductData, product_name: e.target.value })}
              />
            </Form.Group>

            <Form.Group className='mt-2'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={updateProductData.product_description}
                onChange={(e) => setUpdateProductData({ ...updateProductData, product_description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className='mt-2'>
              <Form.Label>Product Image</Form.Label>
              <Form.Control
                type="text"
                name="image"
                value={updateProductData.product_photo}
                onChange={(e) => setUpdateProductData({ ...updateProductData, product_photo: e.target.value })}
              />
            </Form.Group>

            <Form.Group className='mt-2'>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={updateProductData.product_price}
                placeholder="Enter price"
                onChange={(e) => setUpdateProductData({ ...updateProductData, product_price: e.target.value })}
              />
            </Form.Group>

            <Form.Group className='mt-2'>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={updateProductData.product_qty}
                onChange={(e) => setUpdateProductData({ ...updateProductData, product_qty: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>Update</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AdminPage;
