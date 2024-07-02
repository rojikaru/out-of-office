import type { HttpContext } from '@adonisjs/core/http'
import ApprovalRequest from '#models/approval_request'
import Status from '#types/status'

export default class ApprovalRequestsController {
  /**
   * Display a list of resource
   */
  async index({ auth, bouncer, request }: HttpContext) {
    await bouncer.with('ApprovalRequestPolicy').authorize('open')

    const user = await auth.authenticate()
    const { page, limit } = request.qs() as { page: number; limit: number }
    const requests = await ApprovalRequest.query()
      .where('approver_id', user.id)
      .paginate(page ?? 1, limit ?? 10)

    return requests.toJSON()
  }

  /**
   * Handle form submission for the creation action
   */
  async store({ bouncer, request }: HttpContext) {
    await bouncer.with('ApprovalRequestPolicy').authorize('create')

    const approvalRequest = new ApprovalRequest()
    approvalRequest.fill({ ...request.all(), status: Status.NEW })
    await approvalRequest.save()

    return approvalRequest
  }

  /**
   * Show individual record
   */
  async show({ bouncer, params }: HttpContext) {
    await bouncer.with('ApprovalRequestPolicy').authorize('open')
    return await ApprovalRequest.findOrFail(params.id)
  }

  /**
   * Approve the request
   */
  async approve({ bouncer, params }: HttpContext) {
    await bouncer.with('ApprovalRequestPolicy').authorize('approve')

    const req = await ApprovalRequest.findOrFail(params.id)
    req.merge({ status: Status.APPROVED })
    await req.save()

    return req
  }

  /**
   * Reject the request
   */
  async reject({ bouncer, params }: HttpContext) {
    await bouncer.with('ApprovalRequestPolicy').authorize('reject')

    const req = await ApprovalRequest.findOrFail(params.id)
    req.merge({ status: Status.REJECTED })
    await req.save()

    return req
  }
}