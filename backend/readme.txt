# CCTV Locator API

This project is a FastAPI-based API for managing CCTV camera information, user authentication, and related functionalities.

## Features

- User management (create, read, update, delete)
- Camera information management
- Ticket system for reporting issues
- Nearby camera locator
- Excel file upload for bulk camera data import

## Prerequisites

- Python 3.7+
- pip (Python package manager)

## Installation

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up Firebase:
   - Create a Firebase project and download the service account key JSON file.
   - Rename the JSON file to `cctv-locator-police-hackathon-firebase-adminsdk-w7zln-e12925260e.json` and place it in the project root directory.

## Running the Application

To run the application using uvicorn, use the following command:

```
uvicorn main:app --host 10.70.13.203 --port 8080 --workers 5
```

- `--host 10.70.13.203`: Specifies the local IP address to bind to.
- `--port 8080`: Specifies the port number to run the server on.
- `--workers 5`: Specifies the number of worker processes to run.

**Note**: Make sure to replace `10.70.13.203` with the appropriate local IP address if it changes.

## API Documentation

Once the server is running, you can access the automatic API documentation:

- Swagger UI: `http://10.70.13.203:8080/docs`
- ReDoc: `http://10.70.13.203:8080/redoc`

## Main Endpoints

- `/users`: User management
- `/cameras`: Camera information management
- `/nearby_cameras`: Find nearby cameras
- `/report`: Report camera issues
- `/tickets`: Manage tickets

For detailed information about each endpoint and how to use them, please refer to the API documentation.

## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE).