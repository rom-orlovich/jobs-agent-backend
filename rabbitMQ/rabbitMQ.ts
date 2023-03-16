import amqp from 'amqplib';
import { GenericRecord } from '../lib/types';
export class RabbitMQ {
  settings: amqp.Options.Connect;
  amqp: typeof amqp;
  connection: amqp.Connection | null;

  channel: null | amqp.Channel;

  constructor() {
    this.settings = {
      protocol: 'amqp',
      port: 5672,
      vhost: '/',
      hostname: process.env.RABBIT_MQ_HOST || 'localhost',
      username: process.env.RABBITMQ_DEFAULT_USER,
      password: process.env.RABBITMQ_DEFAULT_PASS,
    };
    this.amqp = amqp;
    this.connection = null;
    this.channel = null;
  }
  async connect() {
    this.connection = await this.amqp.connect(this.settings);
  }

  async createChannel() {
    if (this.connection) {
      this.channel = await this.connection.createChannel();
      this.channel.prefetch(1);
    }
  }

  /**
   *
   * @param queueName The name of queue to assert
   * @returns The asserted queue.
   */
  async assertQueue(queueName: string) {
    if (!this.channel) return;
    const queue = await this.channel?.assertQueue(queueName, { durable: true });
    return queue;
  }

  /**
   * @param {string} queueName Queue name where the message will send.
   * @param {D} content The queue's object message.
   */
  sendMessage<D extends GenericRecord<any>>(queueName: string, content: D) {
    this.channel?.sendToQueue(queueName, Buffer.from(JSON.stringify(content)), {
      persistent: true,
    });
  }

  /**
   * @param {string} queueName Queue name where the message will consume.
   * @param {(msg: amqp.ConsumeMessage | null)} cb A callback to execute when the message is consumed.
   */
  async consumeMessage(queueName: string, cb: (msg: amqp.ConsumeMessage | null) => void) {
    const res = await this.channel?.consume(queueName, cb, { noAck: false });
    return res;
  }
}
