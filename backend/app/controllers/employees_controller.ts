import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'
import Pagination from '#types/pagination'
import bucket from '../files/bucket.js'
import { cuid } from '@adonisjs/core/helpers'
import * as fs from 'node:fs'
import { Request } from '@adonisjs/http-server'
import sharp from 'sharp'

sharp.cache(false)

export default class EmployeesController {
  private static async uploadAvatar(request: Request, employee: Employee) {
    if (!request.file('avatar')) {
      // set a default picture
      employee.pictureUrl = null
      return
    }

    const avatar = request.file('avatar', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'svg', 'jfif', 'webp', 'avif'],
    })

    if (!avatar) {
      if (!employee.pictureUrl) {
        employee.pictureUrl = null
      }
      return { error: 'No file was uploaded' }
    }
    if (!avatar.isValid) {
      if (!employee.pictureUrl) {
        employee.pictureUrl = null
      }
      return avatar.errors
    }

    // create tmp directory if it doesn't exist
    if (!fs.existsSync('./tmp')) {
      await fs.promises.mkdir('./tmp')
      await fs.promises.mkdir('./tmp/compressed')
    }

    const fileName = `${cuid()}.${avatar.extname}`
    await avatar.move('./tmp', { name: fileName })
    await sharp(`./tmp/${fileName}`)
      .resize(128, 128)
      .jpeg({ quality: 90 })
      .toFile(`./tmp/compressed/${fileName}`)

    const [file] = await bucket.upload(`./tmp/compressed/${fileName}`, {
      destination: `avatars/${fileName}`,
      metadata: {
        contentType: avatar.headers['content-type'],
      },
    })
    // await file.makePublic()
    employee.pictureUrl = file.publicUrl()

    // remove the temporary file from the filesystem
    await fs.promises.unlink(`./tmp/compressed/${fileName}`)
    await fs.promises.unlink(`./tmp/${fileName}`)
  }

  private static async deleteAvatar(request: Request, employee: Employee, deleteAvatar = false) {
    if (!employee.pictureUrl) return

    const shouldDelete =
      deleteAvatar ||
      request.all()['delete_avatar'] === 'true' ||
      request.file('avatar')
    if (!shouldDelete) return

    const filename = 'avatars/' + employee.pictureUrl.split('/').pop()!
    await bucket.file(filename).delete()
    employee.pictureUrl = undefined
  }

  /**
   * Display a list of resource
   */
  async index({ auth, bouncer, request }: HttpContext) {
    await bouncer.with('EmployeePolicy').authorize('view')
    const user = await auth.authenticate()

    // paginated results
    const { page, limit, order } = request.qs()
    const pg = new Pagination({ page, limit, order })
    const employees = await Employee.query()
      .where('partner_id', user.id)
      .orderBy(pg.column, pg.direction)
      .preload('projects')
      .paginate(pg.page, pg.limit)

    return employees.toJSON()
  }

  /**
   * Show individual record
   */
  async show({ bouncer, params, response }: HttpContext) {
    await bouncer.with('EmployeePolicy').authorize('view')
    try {
      return await Employee.query().where('id', params.id).preload('projects').firstOrFail()
    } catch (error) {
      return response.notFound()
    }
  }

  /**
   * Handle form submission for the creation action
   */
  async store({ bouncer, auth, request }: HttpContext) {
    await bouncer.with('EmployeePolicy').authorize('create')

    const user = await auth.authenticate()
    const employee = new Employee()
    employee.fill({ ...request.all(), partnerId: user.id })
    await EmployeesController.uploadAvatar(request, employee)
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
    await EmployeesController.deleteAvatar(request, employee)
    await EmployeesController.uploadAvatar(request, employee)
    await employee.save()

    return employee
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, request, response, params }: HttpContext) {
    await bouncer.with('EmployeePolicy').authorize('delete')

    let employee: Employee | null
    try {
      employee = await Employee.find(params.id)
    } catch (error) {
      return response.notFound()
    }
    if (!employee) {
      return response.notFound()
    }

    await EmployeesController.deleteAvatar(request, employee, true)
    await employee.delete()

    return response.noContent()
  }
}
