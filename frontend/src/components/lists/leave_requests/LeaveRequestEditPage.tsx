import {useNavigate, useParams} from "react-router-dom"
import {useEffect, useState} from "react"
import http_common from "../../../common/http_common.ts"
import DefaultSpinner from "../../common/DefaultSpinner.tsx"
import {toast} from "react-toastify"
import {toastOptions} from "../../common/toast_options.ts"
import validationSchema from "./validations/schemas.ts"
import {ErrorMessage, Field, Form, Formik, FormikHelpers} from "formik"
import LeaveRequestUpdateModel from "../../../models/leave_request/leave_request_update_model.ts"

export default function LeaveRequestEditPage() {
    const {id} = useParams()
    const [request, setRequest] = useState<LeaveRequestUpdateModel | null>()
    const navigate = useNavigate()

    useEffect(() => {
        http_common.get('auth/check')
            .then(response => {
                if (response.data.position !== 'EMPLOYEE') {
                    toast.error('You are not authorized to view this page', toastOptions)
                    navigate(-1)
                }
            })
            .catch(() => {
                toast.error('You are not authorized to view this page', toastOptions)
                navigate(-1)
            })

        http_common.get(`leave-requests/${id}`)
            .then(({data}) => setRequest(new LeaveRequestUpdateModel(data)))
            .catch(() => {
                toast.error('Some error happened', toastOptions)
                navigate(-1)
            })
    }, [])

    const handleSubmit = (
        values: LeaveRequestUpdateModel,
        {setSubmitting}: FormikHelpers<LeaveRequestUpdateModel>,
    ) => {
        http_common.put(`leave-requests/${id}`, values)
            .then(() => {
                toast.success('Leave request updated successfully', toastOptions)
                navigate('/leave-requests')
            })
            .catch(() => {
                toast.error('Some error happened', toastOptions)
            })
            .finally(() => setSubmitting(false))
    }

    return request ? (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Update Leave Request</h1>
            <Formik
                initialValues={request}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}>
                {({isSubmitting}) => (
                    <Form className="bg-white p-4 rounded shadow">
                        <div className="mb-4">
                            <label className="block text-gray-700">Absence Reason</label>
                            <Field name="absenceReason" as="select" className="mt-1 block w-full">
                                <option value="SICKNESS">Sickness</option>
                                <option value="VACATION">Vacation</option>
                                <option value="PERSONAL">Personal</option>
                                <option value="TRAINING">Training</option>
                                <option value="MATERNITY_LEAVE">Maternity leave</option>
                                <option value="OTHER">Other</option>
                            </Field>
                            <ErrorMessage name="absenceReason" component="div" className="text-red-600"/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Start Date</label>
                            <Field name="start" type="date" className="mt-1 block w-full"/>
                            <ErrorMessage name="start" component="div" className="text-red-600"/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">End Date</label>
                            <Field name="end" type="date" className="mt-1 block w-full"/>
                            <ErrorMessage name="end" component="div" className="text-red-600"/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Short Name</label>
                            <Field name="shortName" type="text" className="mt-1 block w-full"/>
                            <ErrorMessage name="shortName" component="div" className="text-red-600"/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Comment</label>
                            <Field as="textarea" name="comment" type="text" className="mt-1 block w-full"/>
                            <ErrorMessage name="comment" component="div" className="text-red-600"/>
                        </div>
                        <button type="submit" disabled={isSubmitting}
                                className="bg-blue-500 text-white py-2 px-4 rounded disabled:bg-blue-300">
                            Update
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    ) : <DefaultSpinner/>
}
