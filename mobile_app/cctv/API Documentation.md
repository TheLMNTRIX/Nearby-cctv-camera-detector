# FastAPI CCTV Camera Management API Documentation

This document outlines the API endpoints for managing CCTV cameras, tickets, and related operations, along with JavaScript examples for frontend integration.

## Table of Contents

1. [Setup](#setup)
2. [Data Models](#data-models)
3. [Endpoints](#endpoints)
  - [Upload Camera Data](#upload-camera-data)
  - [Create Camera](#create-camera)
  - [Read Camera](#read-camera)
  - [Update Camera](#update-camera)
  - [Delete Camera](#delete-camera)
  - [Get Nearby Cameras](#get-nearby-cameras)
  - [Report Issue](#report-issue)
  - [On-Ground Create Camera](#on-ground-create-camera)
  - [List Tickets](#list-tickets)
  - [Update Ticket](#update-ticket)
  - [Close Ticket](#close-ticket)

## Setup

Ensure that your frontend application is configured to make requests to the correct base URL where your FastAPI server is hosted. For the examples below, we'll assume the base URL is `http://localhost:8000`.

## Data Models

The API uses several models for data validation. Refer to these when constructing request bodies in your frontend application.

## Endpoints

### Upload Camera Data

Upload and process camera data from an Excel file.

- **URL:** `/upload_camera_data`
- **Method:** POST
- **Request Body:** FormData with Excel file

```javascript
async function uploadCameraData(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:8000/upload_camera_data', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error uploading camera data:', error);
  }
}
```

### Create Camera

Add a new camera to the system.

- **URL:** `/cameras`
- **Method:** POST
- **Request Body:** JSON object matching `CreateCamera` model

```javascript
async function createCamera(cameraData) {
  try {
    const response = await fetch('http://localhost:8000/cameras', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cameraData),
    });
    const data = await response.json();
    console.log('New camera created:', data);
  } catch (error) {
    console.error('Error creating camera:', error);
  }
}
```

### Read Camera

Retrieve camera details by ID.

- **URL:** `/cameras/{camera_id}`
- **Method:** GET

```javascript
async function getCameraDetails(cameraId) {
  try {
    const response = await fetch(`http://localhost:8000/cameras/${cameraId}`);
    const data = await response.json();
    console.log('Camera details:', data);
  } catch (error) {
    console.error('Error fetching camera details:', error);
  }
}
```

### Update Camera

Update camera information.

- **URL:** `/cameras/{camera_id}`
- **Method:** PUT
- **Request Body:** JSON object matching `CameraUpdate` model

```javascript
async function updateCamera(cameraId, updateData) {
  try {
    const response = await fetch(`http://localhost:8000/cameras/${cameraId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    console.log('Updated camera:', data);
  } catch (error) {
    console.error('Error updating camera:', error);
  }
}
```

### Delete Camera

Remove a camera from the system.

- **URL:** `/cameras/{camera_id}`
- **Method:** DELETE

```javascript
async function deleteCamera(cameraId) {
  try {
    const response = await fetch(`http://localhost:8000/cameras/${cameraId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error deleting camera:', error);
  }
}
```

### Get Nearby Cameras

Fetch cameras within a specified radius of the user's location.

- **URL:** `/nearby_cameras`
- **Method:** GET
- **Query Parameter:** `radius_meters` (integer, default: 500)

```javascript
async function getNearbyCameras(radiusMeters = 500) {
  try {
    const response = await fetch(`http://localhost:8000/nearby_cameras?radius_meters=${radiusMeters}`);
    const data = await response.json();
    console.log('Nearby cameras:', data);
  } catch (error) {
    console.error('Error fetching nearby cameras:', error);
  }
}
```

### Report Issue

Report an issue with a camera.

- **URL:** `/report`
- **Method:** POST
- **Request Body:** JSON object matching `Ticket` model

```javascript
async function reportIssue(ticketData) {
  try {
    const response = await fetch('http://localhost:8000/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });
    const data = await response.json();
    console.log('Reported issue:', data);
  } catch (error) {
    console.error('Error reporting issue:', error);
  }
}
```

### On-Ground Create Camera

Create a new camera and associated ticket by on-ground personnel.

- **URL:** `/OnGroundCreateCamera`
- **Method:** POST
- **Request Body:** JSON object matching `OnGroundCreateCamera` model

```javascript
async function onGroundCreateCamera(cameraData) {
  try {
    const response = await fetch('http://localhost:8000/OnGroundCreateCamera', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cameraData),
    });
    const data = await response.json();
    console.log('Created camera and ticket:', data);
  } catch (error) {
    console.error('Error creating camera and ticket:', error);
  }
}
```

### List Tickets

Retrieve a list of all tickets.

- **URL:** `/tickets`
- **Method:** GET

```javascript
async function listTickets() {
  try {
    const response = await fetch('http://localhost:8000/tickets');
    const data = await response.json();
    console.log('All tickets:', data);
  } catch (error) {
    console.error('Error fetching tickets:', error);
  }
}
```

### Update Ticket

Update the status of a ticket.

- **URL:** `/tickets/{ticket_id}`
- **Method:** PUT
- **Query Parameter:** `status` (string)

```javascript
async function updateTicket(ticketId, newStatus) {
  try {
    const response = await fetch(`http://localhost:8000/tickets/${ticketId}?status=${newStatus}`, {
      method: 'PUT',
    });
    const data = await response.json();
    console.log('Updated ticket:', data);
  } catch (error) {
    console.error('Error updating ticket:', error);
  }
}
```

### Close Ticket

Close a specific ticket.

- **URL:** `/tickets/{ticket_id}/close`
- **Method:** PUT

```javascript
async function closeTicket(ticketId) {
  try {
    const response = await fetch(`http://localhost:8000/tickets/${ticketId}/close`, {
      method: 'PUT',
    });
    const data = await response.json();
    console.log('Closed ticket:', data);
  } catch (error) {
    console.error('Error closing ticket:', error);
  }
}
```

These JavaScript examples use the Fetch API, which is widely supported in modern browsers. If you need to support older browsers, consider using a library like Axios or adding a polyfill for the Fetch API.

Remember to handle errors appropriately in your frontend application and provide user feedback as needed.
