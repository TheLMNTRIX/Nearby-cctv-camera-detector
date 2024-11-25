import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CameraIcon, MenuIcon, Ticket, TicketIcon } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Link } from "react-router-dom"
import MapsGoogle from "@/components/MapsGoogle"

async function handleCreateCamera({ cameraLocation, cameraPrivateGovt, cameraOwner, cameraContactNo, cameraLatitude, cameraLongitude, cameraCoverage, cameraBackup, cameraConnected, cameraStatus, setIsCreateDialogOpen }) {
    const jsonData = {
        location: cameraLocation,
        private_govt: cameraPrivateGovt,
        owner_name: cameraOwner,
        contact_no: cameraContactNo,
        latitude: cameraLatitude,
        longitude: cameraLongitude,
        coverage: cameraCoverage,
        backup: cameraBackup,
        connected_network: cameraConnected,
        status: cameraStatus,
    };
    console.log(jsonData)
    try {
        const response = await fetch("http://10.70.13.203:8080/cameras", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonData),
        });
        const createdCamera = await response.json();
        console.log(createdCamera);
        setIsCreateDialogOpen(false)
        if (!response.ok) throw new Error("Failed to create camera");

    } catch (error) {
        console.error("Failed to create camera:", error);
    }
    // handleClear({ cameraLocation, cameraPrivateGovt, cameraOwner, cameraContactNo, cameraLatitude, cameraLongitude, cameraCoverage, cameraBackup, cameraConnected, cameraStatus });
}

function UserInputField({ label, value, setFunction }) {
    return (
        <>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                    {label}
                </Label>
                <Input id="name" value={value} onChange={(e) => { setFunction(e.target.value); console.log(value) }} className="col-span-3" />
            </div>
        </>
    )
}

function UserInputRadioButton({ label, option1, option2, value, setFunction }) {
    return (
        <>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                    {label}
                </Label>
                <RadioGroup value={value} onValueChange={setFunction}>
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={option1} id="option-one" />
                            <Label htmlFor="option-one">{option1}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={option2} id="option-two" />
                            <Label htmlFor="option-two">{option2}</Label>
                        </div>
                    </div>
                </RadioGroup>
            </div>
        </>
    );
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://10.70.13.203:8080/upload_camera_data', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('File uploaded successfully');
        } else {
            console.error('File upload failed');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};


const Home = () => {
    const [cameraLocation, setCameraLocation] = useState("");
    const [cameraPrivateGovt, setCameraPrivateGovt] = useState("");
    const [cameraOwner, setCameraOwner] = useState("");
    const [cameraContactNo, setCameraContactNo] = useState("");
    const [cameraLatitude, setCameraLatitude] = useState("");
    const [cameraLongitude, setCameraLongitude] = useState("");
    const [cameraCoverage, setCameraCoverage] = useState("");
    const [cameraBackup, setCameraBackup] = useState("");
    const [cameraConnected, setCameraConnected] = useState("");
    const [cameraStatus, setCameraStatus] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    function handleClear() {
        setCameraLocation("");
        setCameraPrivateGovt("");
        setCameraOwner("");
        setCameraContactNo("");
        setCameraLatitude("");
        setCameraLongitude("");
        setCameraCoverage("");
        setCameraBackup("");
        setCameraConnected("");
        setCameraStatus("");
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden w-64 overflow-y-auto bg-gray-800 md:block">
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center justify-center">
                        <span className="text-2xl font-bold text-white">SurveilMap</span>
                    </div>
                    <nav className="flex-1 px-2 py-4">
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant='outlined' className="w-full bg-back border-2 text-white">
                                    <CameraIcon className="mr-2 h-4 w-4" /> Create Camera
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Create Camera</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <UserInputField label={"Location"} value={cameraLocation} setFunction={setCameraLocation} />
                                    <UserInputField label={"Private/Govt"} value={cameraPrivateGovt} setFunction={setCameraPrivateGovt} />
                                    <UserInputField label={"Owner Name"} value={cameraOwner} setFunction={setCameraOwner} />
                                    <UserInputField label={"Contact No"} value={cameraContactNo} setFunction={setCameraContactNo} />
                                    <UserInputField label={"Latitude"} value={cameraLatitude} setFunction={setCameraLatitude} />
                                    <UserInputField label={"Longitude"} value={cameraLongitude} setFunction={setCameraLongitude} />
                                    <UserInputField label={"Backup"} value={cameraBackup} setFunction={setCameraBackup} />
                                    <UserInputField label={"Coverage"} value={cameraCoverage} setFunction={setCameraCoverage} />
                                    <UserInputRadioButton label={"Connected Network"} option1={"Yes"} option2={"No"} value={cameraConnected} setFunction={setCameraConnected} />
                                    <UserInputRadioButton label={"Status"} option1={"Working"} option2={"Not Working"} value={cameraStatus} setFunction={setCameraStatus} />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        onClick={() => {
                                            handleCreateCamera(
                                                {
                                                    cameraLocation,
                                                    cameraPrivateGovt,
                                                    cameraOwner,
                                                    cameraContactNo,
                                                    cameraLatitude,
                                                    cameraLongitude,
                                                    cameraCoverage,
                                                    cameraBackup,
                                                    cameraConnected,
                                                    cameraStatus,
                                                    setIsCreateDialogOpen
                                                }
                                            )
                                                ;
                                            handleClear()
                                        }
                                        }
                                    >
                                        Save changes
                                    </Button>
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        id="file-upload"
                                        style={{ display: 'none' }} // Hidden input field
                                        onChange={handleFileUpload} // Function to handle file change
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => document.getElementById('file-upload').click()} // Trigger the hidden input click
                                    >
                                        Upload Excel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Link to={'/tickets'}>
                            <Button variant='outlined' className="w-full bg-back border-2 text-white mt-2">
                                <TicketIcon className="mr-2 h-4 w-4" /> Tickets
                            </Button>
                        </Link>
                    </nav>
                </div>
            </aside >

            {/* Main Content */}
            < div className="flex flex-1 flex-col overflow-hidden" >
                {/* Top bar */}
                < header className="flex h-16 items-center justify-start border-b bg-white px-6" >
                    <Button variant="ghost" size="icon" className="md:hidden pr-4">
                        <MenuIcon className="h-6 w-6" />
                    </Button>
                    <div className="flex justify-center align-bottom pt-5">
                        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h1>
                    </div>
                </header >

                {/* Dashboard content */}
                < main className="flex-1 overflow-y-auto bg-gray-100 p-6" >
                    <MapsGoogle />
                </main >
            </div >
        </div >
    )
}
export default Home