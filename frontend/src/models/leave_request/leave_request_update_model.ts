import Status from "../status.ts"
import AbsenceReason from "../absence_reason.ts";

export default class LeaveRequestUpdateModel {
    id: string
    employeeId: string
    absenceReason: AbsenceReason
    start: Date
    end: Date
    shortName: string
    comment: string | null
    status: Status

    constructor(model: LeaveRequestUpdateModel) {
        this.id = model.id
        this.employeeId = model.employeeId
        this.absenceReason = model.absenceReason
        this.start = model.start
        this.end = model.end
        this.shortName = model.shortName
        this.comment = model.comment
        this.status = model.status
    }
}