import amqp from 'amqplib';
export class RabbitMQ {
  settings: amqp.Options.Connect;
  amqp: typeof amqp;
  constructor() {
    this.settings = {
      protocol: 'amqp',
      port: 5672,
      vhost: '/',
      hostname: 'localhost',
      username: 'admin123',
      password: 'jobs-agent-admin123',
    };
    this.amqp = amqp;
  }
  async connection() {
    try {
      await this.amqp.connect(this.settings);
    } catch (error) {
      console.log(error);
    }
  }
}
