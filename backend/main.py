import firebase_admin
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field, ValidationError, EmailStr
from firebase_admin import firestore, credentials, auth
from geopy.distance import geodesic
from typing import List, Dict, Optional
import pandas as pd
import math
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import secrets
import string


# Initialize Firebase (Replace with your actual credentials path)
cred = credentials.Certificate("cctv-locator-police-hackathon-firebase-adminsdk-w7zln-e12925260e.json")
firebase_admin.initialize_app(cred)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Data Models
class UserDetails(BaseModel):
    email: EmailStr
    officer_id: Optional[str] = None
    name: Optional[str] = None
    phone_number: Optional[str] = None
    rank: Optional[str] = None

class User(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    role: str = Field(..., description="User's role (e.g., 'admin', 'user')")

class UserResponse(BaseModel):
    uid: str = Field(..., description="Firebase Authentication User ID")
    email: EmailStr = Field(..., description="User's email address")
    role: str = Field(..., description="User's role (e.g., 'admin', 'user')")
    temporary_password: str = Field(..., description="Temporary password for the user")

class CameraInfo(BaseModel):
    id: str
    location: Optional[str] = None
    private_govt: Optional[str] = None
    owner_name: Optional[str] = None
    contact_no: Optional[str] = None
    latitude: str
    longitude: str
    coverage: Optional[str] = None
    backup: Optional[str] = None
    connected_network: Optional[str] = None
    status: Optional[str] = "Pending"

class CameraUpdate(BaseModel):
    location: Optional[str] = Field(None)
    private_govt: Optional[str] = Field(None)
    owner_name: Optional[str] = Field(None)
    contact_no: Optional[str] = Field(None)
    latitude: Optional[str] = Field(None)
    longitude: Optional[str] = Field(None)
    coverage: Optional[str] = Field(None)
    backup: Optional[str] = Field(None)
    connected_network: Optional[str] = Field(None)
    status: Optional[str] = Field(None)

class OnGroundCreateCamera(BaseModel):
    location: Optional[str] = None
    private_govt: Optional[str] = None
    owner_name: Optional[str] = None
    contact_no: Optional[str] = None
    latitude: str
    longitude: str
    coverage: Optional[str] = None
    backup: Optional[str] = None
    connected_network: Optional[str] = None
    status: str = "Pending"
    description: str = "New Camera Created"

class CreateCamera(BaseModel):
    location: Optional[str] = None
    private_govt: Optional[str] = None
    owner_name: Optional[str] = None
    contact_no: Optional[str] = None
    latitude: str
    longitude: str
    coverage: Optional[str] = None
    backup: Optional[str] = None
    connected_network: Optional[str] = None
    status: Optional[str] = None

class TicketInfo(BaseModel):
    id: str
    description: str
    status: str = "Pending"
    reported_by: str
    reported_at: datetime = Field(default_factory=datetime.utcnow)

class Ticket(BaseModel):
    id: Optional[str] = None
    camera_id: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    status: str = "Pending"
    reported_by: Optional[str] = None
    reported_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
class TicketInput(BaseModel):
    camera_id: Optional[str]
    location: Optional[str]
    description: Optional[str]
    reported_by: Optional[str]

class CameraTicketCreate(BaseModel):
    camera: CameraInfo
    ticket: TicketInfo

class NearbyCameraInfo(CameraInfo):
    camera_id: str
    distance: float = Field(..., description="Distance from user in kilometers")
    
class UserLocation(BaseModel):
    latitude: float
    longitude: float
    radius_meters: int = Field(500, gt=0, description="Radius in meters (must be positive)")
    status_filter: Optional[str] = None
    ownership_filter: Optional[str] = None
    

class UserUpdate(BaseModel):
    officer_id: str
    name: str
    phone_number: Optional[str] = None 
    rank: str

def generate_password(length=12):
  characters = string.ascii_letters + string.digits + string.punctuation
  password = ''.join(secrets.choice(characters) for _ in range(length))
  return password


#endpoint to display user information
@app.get("/users/{uid}", response_model=UserDetails)
async def read_user(uid: str):
    try:
        db = firestore.client()
        user_ref = db.collection("users").document(uid)
        
        # Get the user document from Firestore
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get the user data from the document
        user_data = user_doc.to_dict()
        
        return UserDetails(**user_data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user: {str(e)}")
    
#Endpoint to create new authenticated user and corresponding collection document
@app.post("/users", response_model=UserResponse)
async def create_user(user_data: User):
    try:
        # Generate a temporary password
        temporary_password = generate_password()
        
        # Create the user in Firebase Authentication
        user_record = auth.create_user(
            email=user_data.email,
            password=temporary_password,
        )
        
        # Get the UID generated by Firebase
        uid = user_record.uid
        
        # Create a dictionary with user data including the UID
        user_dict = user_data.dict()
        user_dict['uid'] = uid
        
        # Store the user data in Firestore
        db = firestore.client()
        db.collection("users").document(uid).set(user_dict)
        
        # Return the user data along with the temporary password
        return UserResponse(
            uid=uid,
            email=user_data.email,
            role=user_data.role,
            temporary_password=temporary_password
        )
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="Email already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")
    
@app.put("/users/{uid}", response_model=UserUpdate)
async def update_user(uid: str, user_update: UserUpdate):
    try:
        db = firestore.client()
        user_ref = db.collection("users").document(uid)
        
        # Check if the user exists
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update the user document in Firestore
        user_ref.update({
            "officer_id": user_update.officer_id,
            "name": user_update.name,
            "phone_number": user_update.phone_number,
            "rank": user_update.rank
        })
        
        # # Update email in Firebase Authentication
        # auth.update_user(uid, 
        #                  email=user_update.email)
        
        return user_update
    except auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="User not found in authentication")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")

@app.delete("/users/{uid}")
async def delete_user(uid: str):
    try:
        db = firestore.client()
        user_ref = db.collection("users").document(uid)
        
        # Check if the user exists in Firestore
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found in Firestore")
        
        # Delete the user document from Firestore
        user_ref.delete()
        
        # Delete the user from Firebase Authentication
        auth.delete_user(uid)
        
        return {"message": f"User with UID {uid} has been deleted from both Firestore and Authentication."}
    except auth.UserNotFoundError:
        raise HTTPException(status_code=404, detail="User not found in authentication")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")

# Updated Endpoint to upload and process Excel file (Admin only)
@app.post("/upload_camera_data")
async def upload_camera_data(file: UploadFile = File(...)):
    # Check if file is an Excel file
    if not file.filename.endswith('.xlsx') and not file.filename.endswith('.xls'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid file type. Please upload an Excel file.")

    try:
        df = pd.read_excel(file.file)
        db = firestore.client()

        batch = db.batch()  # Initialize a batch operation
        batch_size = 500     # Number of operations to include in each batch
        operations_count = 0

        for _, row in df.iterrows():
            if pd.isna(row["Latitude"]) or pd.isna(row["Longitude"]):
                continue  # Skip this row if latitude or longitude is missing

            camera_data = {
                "location": row["Location"],
                "private_govt": row["Private/Govt"],
                "owner_name": row["Owner Name"],
                "contact_no": row["Contact No"],
                "status": row["Working or not"],
                "latitude": str(row["Latitude"]),
                "longitude": str(row["Longitude"]),
                "coverage": row["Coverage"],
                "backup": row["Backup"],
                "connected_network": row["Connected to network"],
            }

            doc_ref = db.collection("camera_info").document()
            batch.set(doc_ref, camera_data)
            operations_count += 1

            if operations_count == batch_size:
                batch.commit()  # Commit the batch when it reaches the desired size
                batch = db.batch()  # Start a new batch
                operations_count = 0

        if operations_count > 0:
            batch.commit()  # Commit any remaining operations in the last batch

        return {"message": "Camera data uploaded and processed successfully!"}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Error processing file: {e}")


# Create (Add a new camera)
@app.post("/cameras", response_model=CameraInfo)
async def create_camera(camera_info: CreateCamera):
    db = firestore.client()
    doc_ref = db.collection("camera_info").document()
    
    # Create a dictionary from the CreateCamera model
    camera_data = camera_info.dict()
    
    # Add the id and ensure status is set
    camera_data["id"] = doc_ref.id
    if "status" not in camera_data or camera_data["status"] is None:
        camera_data["status"] = "Pending"
    
    # Set the data in Firestore
    doc_ref.set(camera_data)
    
    # Create and return a CameraInfo object
    return CameraInfo(**camera_data)


# Read (Get camera details by ID)
@app.get("/cameras/{camera_id}", response_model=CameraInfo)
async def read_camera(camera_id: str):
    db = firestore.client()
    doc_ref = db.collection("camera_info").document(camera_id)
    doc = doc_ref.get()
    if doc.exists:
        camera_data = doc.to_dict()
        camera_data["id"] = camera_id 
        return CameraInfo(**camera_data)
    else:
        raise HTTPException(status_code=404, detail="Camera not found")


@app.put("/cameras/{camera_id}", response_model=CameraInfo)
async def update_camera(camera_id: str, camera_update: CameraUpdate):
    db = firestore.client()
    doc_ref = db.collection("camera_info").document(camera_id)
    doc = doc_ref.get()
    if doc.exists:
        current_data = doc.to_dict()
        update_data = camera_update.dict(exclude_none=True)
        
        # Update fields that are present in update_data
        for key, value in update_data.items():
            if value != "string" or current_data.get(key) == "string":
                current_data[key] = value
        
        # Ensure the 'id' field is set correctly
        current_data['id'] = camera_id
        
        # Update the document in Firestore
        doc_ref.set(current_data)
        
        # Return the updated CameraInfo
        return CameraInfo(**current_data)
    else:
        raise HTTPException(status_code=404, detail="Camera not found")

# Delete (Remove a camera)
@app.delete("/cameras/{camera_id}")
async def delete_camera(camera_id: str):
    db = firestore.client()
    doc_ref = db.collection("camera_info").document(camera_id)
    doc = doc_ref.get()
    if doc.exists:
        doc_ref.delete()
        return {"message": "Camera deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Camera not found")


def validate_coordinates(lat: float, lon: float) -> None:
    if not (-90 <= lat <= 90):
        raise ValueError(f"Latitude must be in the [-90; 90] range. Got {lat}")
    if not (-180 <= lon <= 180):
        raise ValueError(f"Longitude must be in the [-180; 180] range. Got {lon}")

# Endpoint to fetch nearby cameras
@app.post("/nearby_cameras", response_model=List[NearbyCameraInfo])
async def get_nearby_cameras(user_location: UserLocation):
    radius_km = user_location.radius_meters / 1000

    try:
        db = firestore.client()
        cameras_ref = db.collection("camera_info")

        user_lat, user_lon = user_location.latitude, user_location.longitude

        try:
            validate_coordinates(user_lat, user_lon)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

        lat_diff = radius_km / 111.1  # Approximate 1 degree latitude = 111.1 km
        lon_diff = radius_km / (111.1 * math.cos(math.radians(user_lat)))

        query = cameras_ref.where("latitude", ">=", str(user_lat - lat_diff)) \
                           .where("latitude", "<=", str(user_lat + lat_diff)) \
                           .where("longitude", ">=", str(user_lon - lon_diff)) \
                           .where("longitude", "<=", str(user_lon + lon_diff))

        filtered_cameras = query.stream()

        nearby_cameras = []
        for camera in filtered_cameras:
            camera_data = camera.to_dict()
            camera_data["id"] = camera.id

            try:
                camera_lat = float(camera_data.get("latitude", ""))
                camera_lon = float(camera_data.get("longitude", ""))
                validate_coordinates(camera_lat, camera_lon)
            except (ValueError, TypeError):
                continue
            
            camera_location = (camera_lat, camera_lon)
            user_location_tuple = (user_lat, user_lon)
            distance = geodesic(camera_location, user_location_tuple).km
            
            if distance <= radius_km:
                # Apply status filter
                if user_location.status_filter:
                    status = str(camera_data.get("status", "")).lower()
                    if user_location.status_filter.lower() == "working":
                        if not any(keyword in status for keyword in ["working", "yes", "-do-", "active"]) or "not working" in status:
                            continue
                    elif user_location.status_filter.lower() == "not working":
                        if any(keyword in status for keyword in ["working", "yes", "-do-", "active"]) and "not working" not in status:
                            continue

                # Apply ownership filter (unchanged)
                if user_location.ownership_filter:
                    private_govt = str(camera_data.get("private_govt", "")).lower()
                    if user_location.ownership_filter.lower() == "government":
                        if not any(keyword in private_govt for keyword in ["govt.", "govt", "government"]):
                            continue
                    elif user_location.ownership_filter.lower() == "private":
                        if any(keyword in private_govt for keyword in ["govt.", "govt", "government"]):
                            continue

                nearby_cameras.append(NearbyCameraInfo(**camera_data, distance=distance, camera_id=camera.id))
                
        nearby_cameras_sorted = sorted(nearby_cameras, key=lambda camera: (camera.distance, camera.status != "Working"))
        return nearby_cameras_sorted

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"An error occurred while fetching nearby cameras: {str(e)}")



# Endpoint to report a camera issue
@app.post("/report", response_model=Ticket)
async def report_issue(ticket_input: TicketInput):
    db = firestore.client()
    doc_ref = db.collection("tickets").document()
    
    ticket_data = ticket_input.dict()
    ticket_data['id'] = doc_ref.id
    ticket_data['status'] = "Pending"
    ticket_data['reported_at'] = datetime.utcnow()
    
    doc_ref.set(ticket_data)
    
    return Ticket(**ticket_data)

#endpoint for on ground personnelto create ticket
@app.post("/OnGroundCreateCamera", response_model=CameraTicketCreate)
async def create_camera_and_ticket(data: OnGroundCreateCamera):
    db = firestore.client()
    
    # Create camera (excluding description)
    camera_data = data.dict(exclude={'description'})
    camera_ref = db.collection("camera_info").document()
    camera_data['id'] = camera_ref.id
    camera_ref.set(camera_data)
    
    # Create corresponding ticket
    ticket_data = {
        'id': db.collection("tickets").document().id,
        'camera_id': camera_ref.id,
        'location': data.location,
        'description': data.description,
        'status': "Pending",
        'reported_by': "On-ground Personnel",  # You might want to add this field to OnGroundCreateCamera
        'reported_at': datetime.utcnow()
    }
    db.collection("tickets").document(ticket_data['id']).set(ticket_data)
    
    return CameraTicketCreate(
        camera=CameraInfo(**camera_data),
        ticket=TicketInfo(**ticket_data)
    )

@app.get("/tickets", response_model=List[Ticket])
async def list_tickets():
    db = firestore.client()
    tickets = []
    for doc in db.collection("tickets").stream():
        ticket_data = doc.to_dict()
        ticket_data['id'] = doc.id
        try:
            # Attempt to create a Ticket object
            ticket = Ticket(**ticket_data)
            tickets.append(ticket)
        except ValidationError:
            # If validation fails, skip this ticket
            print(f"Skipping invalid ticket with ID: {doc.id}")
            continue
    
    if not tickets:
        raise HTTPException(status_code=404, detail="No valid tickets found")
    
    return tickets

@app.put("/tickets/{ticket_id}", response_model=Ticket)
async def update_ticket(ticket_id: str, status: str):
    db = firestore.client()
    ticket_ref = db.collection("tickets").document(ticket_id)
    ticket_doc = ticket_ref.get()
    
    if not ticket_doc.exists:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket_data = ticket_doc.to_dict()
    ticket_data['status'] = status
    ticket_ref.update({'status': status})
    
    # If the ticket is for a camera, update the camera status
    if ticket_data.get('camera_id'):
        camera_ref = db.collection("camera_info").document(ticket_data['camera_id'])
        camera_doc = camera_ref.get()
        
        if camera_doc.exists:
            if status == "Rejected":
                camera_ref.delete()
            # else:
            #     camera_ref.update({'status': status})
    
    return Ticket(**ticket_data)

@app.put("/tickets/{ticket_id}/close", response_model=Ticket)
async def close_ticket(ticket_id: str):
    db = firestore.client()
    ticket_ref = db.collection("tickets").document(ticket_id)
    ticket_doc = ticket_ref.get()
    
    if not ticket_doc.exists:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket_data = ticket_doc.to_dict()
    current_status = ticket_data.get('status')
    
    if current_status not in ["Rejected", "Approved"]:
        raise HTTPException(status_code=400, detail="Pending tickets cannot be closed until a decision is made")
    
    ticket_data['status'] = "Closed"
    ticket_ref.update({'status': "Closed"})
    
    return Ticket(**ticket_data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)