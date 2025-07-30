import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationServiceService {
    private transporter : nodemailer.Transporter;

    constructor(){
        this.transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "kaylin.roob18@ethereal.email",
                pass: "VvRsbhfraF2kcvRSzQ",
            }
        ,});
    }

    async sendMailRescheduled(to: string, rescheduledTime: string) {
    const sent = await this.transporter.sendMail({
        from: 'schedula@fakemail.com',
        to: to,
        subject: `Regarding the Rescheduling of Your Appointment`,
        text: 
        `Dear Patient,

        We regret to inform you that your upcoming appointment has been rescheduled due to unforeseen circumstances. We sincerely apologize for any inconvenience this may cause.

        Your new appointment time is:
        Time: ${rescheduledTime}

        If this new time is not suitable, please contact us through your patient portal or at our clinic reception to arrange an alternative.

        Thank you for your understanding and cooperation.

        Best regards,
        Schedula Team`
    });
    return sent;
    }

    async sendMailConfirmed(to: string, confirmedTime: string) {
    const sent = await this.transporter.sendMail({
        from: 'schedula@fakemail.com',
        to: to,
        subject: 'Your Appointment is Confirmed',
        text:
        `Dear Patient,

        We are pleased to inform you that your appointment has been successfully confirmed.

        Your scheduled appointment time is:
        Time: ${confirmedTime}

        Should you need to make any changes or if you are unable to attend, please let us know through your patient portal or contact our clinic reception in advance.

        Thank you for choosing Schedula. We look forward to serving you.

        Best regards,
        Schedula Team`
    });
    return sent;
    }

}
