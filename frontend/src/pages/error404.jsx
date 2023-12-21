import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} className="text-center">
          <h1>404 - Not Found</h1>
          <p>The page you are looking for might be in another castle.</p>
          <Link to="/">
            <Button variant="primary">Go Home</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;