import {useNavigate} from "react-router-dom"
import http_common from "../../../common/http_common.ts"
import {ErrorMessage, Field, Form, Formik, FormikHelpers} from "formik"
import {initialValues, defaultPic} from "./validations/initial_values.ts"
import validationSchema from "./validations/schemas.ts"
import EmployeeCreateModel from "../../../models/employee/employee_create_model.ts"
import {useEffect} from "react";
import {toast} from "react-toastify";
import {toastOptions} from "../../common/toast_options.ts";

export default function EmployeeCreatePage() {
    const navigate = useNavigate()

    const onSubmit = (
        values: EmployeeCreateModel,
        {setSubmitting}: FormikHelpers<EmployeeCreateModel>
    ) => {
        http_common.post('employees', values, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(() => {
                navigate('/employees')
            })
            .catch(() => setSubmitting(false))
    }

    useEffect(() => {
        http_common.get('auth/check')
            .then(response => {
                if (response.data.position === 'EMPLOYEE') {
                    toast.error('You are not authorized to view this page', toastOptions)
                    navigate(-1)
                }
            })
            .catch(() => {
                toast.error('You are not authorized to view this page', toastOptions)
                navigate(-1)
            })
    }, [])

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create an employee</h1>
            <Formik initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}>
                {({isSubmitting, values, setFieldValue }) => (
                    <Form className="bg-white p-6 rounded-lg shadow-md">
                        <div className="mb-4">
                            <label className="block text-gray-700">Full Name</label>
                            <Field name="fullName" className="form-input mt-1 block w-full"/>
                            <ErrorMessage name="fullName" component="div" className="text-red-500 text-sm"/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email</label>
                            <Field name="email" type="email" className="form-input mt-1 block w-full"/>
                            <ErrorMessage name="email" component="div" className="text-red-500 text-sm"/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Password</label>
                            <Field name="password" type="password" className="form-input mt-1 block w-full"/>
                            <ErrorMessage name="password" component="div" className="text-red-500 text-sm"/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Subdivision</label>
                            <Field name="subdivision" as="select" className="form-input mt-1 block w-full">
                            <option value="HR">HR</option>
                                <option value="IT">IT</option>
                                <option value="FINANCE">Finance</option>
                                <option value="MARKETING">Marketing</option>
                                <option value="SALES">Sales</option>
                                <option value="SUPPORT">Support</option>
                                <option value="RELATIONS">Relations</option>
                                <option selected value="INDETERMINATE">Indeterminate</option>
                            </Field>
                            <ErrorMessage name="subdivision" component="div" className="text-red-500 text-sm"/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Status</label>
                            <Field name="status" as="select" className="form-select mt-1 block w-full">
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </Field>
                            <ErrorMessage name="status" component="div" className="text-red-500 text-sm"/>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Days Off</label>
                            <Field name="daysOff" type="number" className="form-input mt-1 block w-full"/>
                            <ErrorMessage name="daysOff" component="div" className="text-red-500 text-sm"/>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="image">Photo</label>
                            <div className="flex justify-between mt-2 p-0">
                                <img className="h-10 w-10 mr-3 object-fit rounded-full inline-block"
                                     alt="Current category"
                                     src={
                                         values.avatar instanceof File
                                             ? URL.createObjectURL(values.avatar)
                                             : defaultPic
                                     }/>
                                <span className="sr-only">Choose a category photo</span>
                                <input className="file w-5/6" aria-describedby="file_input_help" id="image" name="image"
                                       type="file" onChange={e => {
                                    const files = e.target.files
                                    if (!files || !(files instanceof FileList)) return
                                    const file = files[0]
                                    setFieldValue("avatar", file)
                                        .catch(console.error)
                                }}/>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG,
                                JPG or GIF</p>
                            <ErrorMessage name="image" component="div" className="error-message"/>
                        </div>
                        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded"
                                disabled={isSubmitting}>
                            Submit
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}
