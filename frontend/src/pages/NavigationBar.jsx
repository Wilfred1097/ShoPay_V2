import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';


const CustomNavbar = () => {
  const navigate = useNavigate();
  const [cookies, , removeCookie] = useCookies(['token']);
  const isTokenPresent = !!cookies.token;

  const handleLogout = () => {
    removeCookie('token');
    navigate('/');
  };

  return (
    <>
    <Navbar bg="success" variant="dark" expand="lg" fixed="top" className="p-2">
      <Navbar.Brand href="/"><strong>ShoPay</strong></Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto d-flex align-items-center">
          {isTokenPresent ? (
            <>
              <Nav.Link href="/profile" className="mr-3">Profile</Nav.Link>
              <Nav.Link href="/cart" className="mr-3">Cart</Nav.Link>
              <Button variant="light" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Button variant="light" href="/login">Login</Button>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>

</>

  );
};

export default CustomNavbar;
