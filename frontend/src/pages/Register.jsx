import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { registrationSchema } from '../validations/userController';
import { Form, Button, Container, Row, Col, Card, Navbar, Nav } from 'react-bootstrap';

function Register() {
  const [values, setValues] = useState({
    name: '',
    username: '',
    email: '',
    birthdate: '',
    address: '',
    profile: '',
    role: 'user',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await registrationSchema.validate(values, { abortEarly: false });
      const response = await axios.post('http://localhost:3000/register', values);

      if (response && response.data && response.data.Status === 'Success') {
        navigate('/login');
      } else if (response && response.data && response.data.Status === "Email already exists") {
        alert(response.data.Status);
      } else if (response && response.data && response.data.Status === "Username already exists") {
        alert(response.data.Status);
      } else {
        console.error('Unexpected response structure:', response);
      }
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        alert(error.errors);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <>
    <Navbar bg="success" variant="dark" expand="lg" fixed="top" className='p-3'>
      <Navbar.Brand href="/"><strong>ShoPay</strong></Navbar.Brand>
    </Navbar>

      <Container className="mt-5 pt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h1>Registration</h1>
              <Form onSubmit={handleSubmit}>
                <Form.Group className='mt-3'>
                  <Form.Label>Complete Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter complete name"
                    onChange={(e) => setValues({ ...values, name: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className='mt-2'>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    onChange={(e) => setValues({ ...values, username: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className='mt-2'>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className='mt-2'>
                  <Form.Label>Birthdate</Form.Label>
                  <Form.Control
                    type="date"
                    name="birthdate"
                    placeholder="Birthdate"
                    onChange={(e) => setValues({ ...values, birthdate: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className='mt-2'>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    placeholder="Address"
                    onChange={(e) => setValues({ ...values, address: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className='mt-2'>
                  <Form.Label>Profile Photo</Form.Label>
                  <Form.Control
                    type="url"
                    name="profile"
                    placeholder="Profile Photo"
                    onChange={(e) => setValues({ ...values, profile: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className='mt-2'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    onChange={(e) => setValues({ ...values, password: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className='mt-2'>
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    onChange={(e) => setValues({ ...values, confirmPassword: e.target.value })}
                  />
                </Form.Group>

                <Button variant="success" type="submit" className='mt-3'>
                  Register
                </Button>
              </Form>
              <div className="mt-3">
                <p>
                  Already have an account? <a href="/login">Login here</a>.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </>
  );
}

export default Register;
