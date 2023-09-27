import SES from "aws-sdk/clients/ses";

interface iSendEmail {
  name: string;
  email: string;
  template: string;
}

export default class SendEmail {
  private client: SES;

  constructor() {
    this.client = new SES({
      region: "us-east-1",
    });
  }

  async run({ name, email, template }: iSendEmail) {
    await this.client
      .sendTemplatedEmail({
        Destination: {
          ToAddresses: [email],
        },
        Source: "lucas@iserra.app",
        Template: `${template}`,
        TemplateData: `{ "name":"${name}" }`,
      })
      .promise();
  }
}
