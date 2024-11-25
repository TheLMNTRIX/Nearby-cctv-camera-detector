import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const Tickets = () => {
    const [tickets, setTickets] = useState([])
    const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertDescription, setAlertDescription] = useState("");

    const cards = [
        { title: "Total Users", content: "1,234" },
        { title: "Revenue", content: "$45,678" },
        { title: "Active Projects", content: "23" },
        { title: "Completed Tasks", content: "789" },
        { title: "Pending Approvals", content: "12" },
        { title: "System Status", content: "Operational" },
    ]

    async function fetchTickets() {
        try {
            const response = await fetch('http://10.70.13.203:8080/tickets'); // Replace with your API endpoint
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setTickets(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleCardClick = async (ticket_camera_id, ticket_id) => {
        // Fetch details for the selected ticket from another API using ticket.camera_id
        try {
            const response = await fetch(`http://10.70.13.203:8080/cameras/${ticket_camera_id}`); // Replace with your details API endpoint
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const updatedData = {
                ...data, // Spread the existing data properties
                id: ticket_id // Replace id with the ticket's id
            };
            setSelectedTicket(updatedData);
            setIsTicketDialogOpen(true); // Open the dialog
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = async (status, ticket_id) => {
        // Consolidated function for accepting or rejecting the ticket
        try {
            const response = await fetch(`http://10.70.13.203:8080/tickets/${ticket_id}?status=${status}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Body can be omitted if the server does not expect a body
                body: JSON.stringify({
                    id: ticket_id // Optionally include the ticket ID in the body if required
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            console.log("Status updated:", result); // Handle the response as needed
            setAlertTitle(status === "Accepted" ? "Ticket Accepted" : "Ticket Rejected");
            setAlertDescription(`The ticket has been ${status.toLowerCase()}.`);
            setAlertVisible(true);

            setIsTicketDialogOpen(false); // Close the dialog after the operation
            fetchTickets();
            setTimeout(() => {
                setAlertVisible(false);
            }, 3000);
        } catch (error) {
            console.error("Error updating ticket status:", error);
        }
    }

    useEffect(() => {
        fetchTickets();
    }, [])

    return (
        <>
            <div className="min-h-screen bg-gray-100">
                {/* Top bar */}
                <div className="bg-white shadow">
                    <div className="container mx-auto px-4 py-3 flex items-center">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to={'/'}>
                                <ArrowLeft className="h-6 w-6" />
                                <span className="sr-only">Go back</span>
                            </Link>
                        </Button>
                        <h1 className="text-xl font-semibold ml-4">Tickets</h1>
                    </div>
                </div>
                {/* Cards grid */}
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col gap-6">
                        {tickets
                            .filter(ticket => ticket.status === "Pending") // Filter to include only pending tickets
                            .map((ticket) => (
                                <Card key={ticket.id} onClick={() => handleCardClick(ticket.camera_id, ticket.id)}>
                                    <CardHeader>
                                        <CardTitle className={"text-lg"}>{ticket.description || "Untitled"}</CardTitle> {/* Use description as the title */}
                                    </CardHeader>
                                    <CardContent>
                                        <p><strong>ID:</strong> {ticket.id}</p>
                                        <p><strong>Camera ID:</strong> {ticket.camera_id}</p>
                                        <p><strong>Location:</strong> {ticket.location}</p>
                                        <p><strong>Status:</strong> {ticket.status}</p>
                                        <p><strong>Reported By:</strong> {ticket.reported_by}</p>
                                        <p><strong>Reported At:</strong> {new Date(ticket.reported_at).toLocaleString()}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Camera Details</DialogTitle> {/* Title reflecting the content */}
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    {selectedTicket ? (
                                        <div>
                                            <p><strong>Location:</strong> {selectedTicket.location}</p>
                                            <p><strong>Private/Govt:</strong> {selectedTicket.private_govt}</p>
                                            <p><strong>Owner Name:</strong> {selectedTicket.owner_name}</p>
                                            <p><strong>Contact No:</strong> {selectedTicket.contact_no}</p>
                                            <p><strong>Latitude:</strong> {selectedTicket.latitude}</p>
                                            <p><strong>Longitude:</strong> {selectedTicket.longitude}</p>
                                            <p><strong>Coverage:</strong> {selectedTicket.coverage}</p>
                                            <p><strong>Backup:</strong> {selectedTicket.backup}</p>
                                            <p><strong>Connected Network:</strong> {selectedTicket.connected_network}</p>
                                            <p><strong>Status:</strong> {selectedTicket.status}</p>
                                        </div>
                                    ) : (
                                        <p>Loading details...</p>
                                    )}
                                </div>
                                {/* Buttons for Accept and Reject */}
                                <div className="flex justify-end mt-4">
                                    <button
                                        className="mr-2 bg-green-500 text-white px-4 py-2 rounded"
                                        onClick={() => handleStatusChange("Accepted", selectedTicket.id)}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-4 py-2 rounded"
                                        onClick={() => handleStatusChange("Rejected", selectedTicket.id)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                {alertVisible && (
                    <div className=" fixed top-0 right-0 m-4">
                        <Alert className={"bg-slate-700 text-white border-r-8"}>
                            <AlertTitle className={"text-lg"}>{alertTitle}</AlertTitle>
                            <AlertDescription className={"text-lg"}>{alertDescription}</AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
        </>
    )
}


export default Tickets