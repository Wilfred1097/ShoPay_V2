import React, { useState, useEffect } from 'react';
import CustomNavbar from './NavigationBar';
import { Card, Image, Container, Row, Col } from 'react-bootstrap';

function Profile() {
  const [profileData, setProfileData] = useState({
    profilePicture: '',
    name: '',
    username: '',
    address: '',
    email: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData({
            profilePicture: data.profilePicture,
            name: data.name,
            username: data.username,
            address: data.address,
            email: data.email,
          });
        } else {
          console.error('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div>
        <CustomNavbar />
      </div>

      <Container className='mt-3 pt-5'>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card>
              <Image src="https://imgs.search.brave.com/vLn6KdkCH165e6pVh4THQoZHkkBAdTiQ5SGn7g5qx2Q/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTQw/NjE5NzczMC9waG90/by9wb3J0cmFpdC1v/Zi1hLXlvdW5nLWhh/bmRzb21lLWluZGlh/bi1tYW4uanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPUNuY05V/VGJ3Nm16R3Nib2pr/czJWdDBrVjg1Tl9w/UWFJM3phU2tCUUpG/VGM9" alt="Profile" fluid />
              <Card.Body>
                <Card.Title>Name: {profileData.name}</Card.Title>
                <Card.Subtitle className="mb-2">Username: {profileData.username}</Card.Subtitle>
                <Card.Subtitle className="mb-2">Address: {profileData.address}</Card.Subtitle>
                <Card.Subtitle className="mb-2">Email: {profileData.email}</Card.Subtitle>
              </Card.Body>
            </Card>
          </Col>
        </Row><br />
      </Container>
    </>
  );
}

export default Profile;
