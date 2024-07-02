import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'

export default class EmployeesController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, auth }: HttpContext) {
    await bouncer.with('EmployeePolicy').authorize('view')
    const user = await auth.authenticate()
    return await Employee.findManyBy('partner_id', user.id)
  }

  /**
   * Show individual record
   */
  async show({ bouncer, params }: HttpContext) {
    await bouncer.with('EmployeePolicy').authorize('view')
    return await Employee.findOrFail(params.id)
  }

  /**
   * Handle form submission for the creation action
   */
  async store({ bouncer, auth, request }: HttpContext) {
    await bouncer.with('EmployeePolicy').authorize('create')

    const user = await auth.authenticate()
    const employee = new Employee()
    employee.fill({ ...request.all(), partner_id: user.id })
    await employee.save()

    return employee
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, params, request, response }: HttpContext) {
    if (params.id !== request.all().id) {
      return response.badRequest('Cannot change the project ID')
    }

    await bouncer.with('EmployeePolicy').authorize('edit', await Employee.find(params.id))

    const employee = await Employee.findOrFail(params.id)
    employee.merge(request.all())
    await employee.save()

    return employee
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, response, params }: HttpContext) {
    await bouncer.with('EmployeePolicy').authorize('delete')

    const employee = await Employee.find(params.id)
    await employee?.delete()

    return response.noContent()
  }
}
