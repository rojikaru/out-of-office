import {useEffect, useState} from "react"
import http_common from "../../../common/http_common.ts"
import {Link, useNavigate} from "react-router-dom"
import LeaveRequestModel from "../../../models/leave_request/leave_request_model.ts"
import DefaultSpinner from "../../common/DefaultSpinner.tsx"
import {Button} from "flowbite-react"
import {toast} from "react-toastify"
import {toastOptions} from "../../common/toast_options.ts"
import './css/leave_requests.css'
import {FaEdit, FaTrash} from "react-icons/fa";
import AuthHandler from "../../common/auth_handler.ts";

export default function LeaveRequestsPage() {
    const [requests, setRequests] = useState<LeaveRequestModel[] | null>()
    const auth = localStorage.getItem('auth')
    const navigate = useNavigate()

    useEffect(() => {
        if (!auth) {
            toast.error('Some error happened', toastOptions)
            navigate(-1)
        }

        http_common.get('leave-requests')
            .then(({data}) => setRequests(data.data))
            .catch(({response}) => AuthHandler(response, navigate))
    }, [])

    const handleDelete = (id: string) => {
        http_common.delete(`leave-requests/${id}`)
            .then(() => {
                toast.success('Leave request deleted successfully')
                setRequests(requests?.filter((request) => request.id !== id))
            })
            .catch(() => {
                toast.error('Some error happened', toastOptions)
                window.location.reload()
            })
    }

    return requests ? (
        requests.length > 0 ? (
            <div className="leave-requests">
                <h1>Leave Requests</h1>
                <table>
                    <thead>
                    <tr>
                        <th>Short name</th>
                        <th>Employee</th>
                        <th>Absence Reason</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {requests.map((request) => (
                        <tr key={request.id}>
                            <td>
                                <Link to={`/leave-requests/${request.id}`} className="text-blue-600">
                                    {request.shortName}
                                </Link>
                            </td>
                            <td>{request.employee.fullName}</td>
                            <td>{request.absenceReason}</td>
                            <td>{new Date(request.start).toLocaleDateString()}</td>
                            <td>{new Date(request.end).toLocaleDateString()}</td>
                            <td>{request.status}</td>
                            <td className="flex justify-center">
                                <Button href={`leave-requests/${request.id}/edit`}
                                      className="mr-2 bg-blue-400">
                                    <FaEdit/>
                                </Button>
                                <Button pill onClick={() => handleDelete(request.id)}
                                        className="bg-blue-400">
                                    <FaTrash/>
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <Link to="/leave-requests/create"
                      className="mt-4 inline-block text-white bg-blue-500 px-4 py-2 rounded">
                    Create New Request
                </Link>
            </div>
        ) : (
            <div className="m-8">
                <h2 className="font-bold text-4xl mb-5" role="alert">
                    No leave requests found
                </h2>
                <Button href="/leave-requests/create" className="btn btn-primary inline-flex">
                    Add a new leave request
                </Button>
            </div>
        )
    ) : <DefaultSpinner/>
}
