import amqp from 'amqplib';
import { GenericRecord } from '../lib/types';
export class RabbitMQ {
  settings: amqp.Options.Connect;
  amqp: typeof amqp;
  connection: amqp.Connection | null;
  queues: GenericRecord<amqp.Replies.AssertQueue>;
  channel: null | amqp.Channel;
  constructor() {
    this.settings = {
      protocol: 'amqp',
      port: 5672,
      vhost: '/',
      hostname: 'localhost',
      username: 'admin123',
      password: 'jobs-agent-admin',
    };
    this.amqp = amqp;
    this.connection = null;
    this.channel = null;
    this.queues = {};
  }
  async connect() {
    try {
      this.connection = await this.amqp.connect(this.settings);
    } catch (error) {
      console.log(error);
    }
  }
  async createChannel() {
    if (this.connection) {
      this.channel = await this.connection.createChannel();
      this.channel.prefetch(1);
    }
  }
  async assertQueue(queueName: string) {
    if (!this.channel) return;
    const queue = await this.channel?.assertQueue(queueName, { durable: true });
    this.queues[queueName] = queue;
    return this.queues[queueName];
  }
  sendMessage<D>(queueName: string, content: D) {
    this.channel?.sendToQueue(queueName, Buffer.from(JSON.stringify(content)), {
      persistent: true,
    });
  }
  async consumeMessage(queueName: string, cb: (msg: amqp.ConsumeMessage | null) => void) {
    const r = await this.channel?.consume(queueName, cb, { noAck: false });
    return r;
  }
}
