import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginSchema } from '../validations/userController';
import { Form, Button, Container, Row, Col, Card, Navbar, Nav } from 'react-bootstrap';

function Login() {
  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await loginSchema.validate(values, { abortEarly: false });

      const response = await axios.post('http://localhost:3000/login', values);

      if (response.data.Status === 'Success') {
        console.log("Login Successfully");
        const userRole = response.data.Role;

        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'user') {
          navigate('/');
        } else {
          alert("Invalid user role");
        }
      } else {
        alert(response.data.Error);
      }
    } catch (error) {
      alert(error.errors);
    }
  };

  return (
    <>
      <Navbar bg="success" variant="dark" expand="lg" fixed="top" className='p-3'>
      <Navbar.Brand href="/"><strong>ShoPay</strong></Navbar.Brand>
    </Navbar>

    <Container className='pt-5 mx-auto m-5'>
      <Row className='justify-content-md-center'>
        <Col md={6}>
          <Card>
            <Card.Body>
              <h1>Login</h1>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId='formBasicEmail' className='mt-3'>
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type='email'
                    name='email'
                    placeholder='Enter email'
                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                  />
                </Form.Group>

                <Form.Group controlId='formBasicPassword' className='mt-2'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type='password'
                    name='password'
                    placeholder='Password'
                    onChange={(e) => setValues({ ...values, password: e.target.value })}
                  />
                </Form.Group>

                <Button variant='success' type='submit' className='mt-3'>
                  Login
                </Button>
              </Form>
              <div className='mt-3'>
                <p>
                  Don't have an account? <a href='/register'>Register here</a>.
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

export default Login;
