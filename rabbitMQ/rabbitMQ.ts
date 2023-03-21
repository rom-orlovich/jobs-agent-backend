import amqp from 'amqplib';
import { RABBITMQ_MESSAGE_ACK_TIMEOUT } from '../lib/contestants';
import { GenericRecord } from '../lib/types';
export class RabbitMQ {
  settings: amqp.Options.Connect;
  amqp: typeof amqp;
  connection: amqp.Connection | null;

  channel: null | amqp.Channel;
  static MESSAGE_ACK_TIMEOUT = RABBITMQ_MESSAGE_ACK_TIMEOUT;
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
   * @param {string} messageCreatedTimeStr The time when the message was created.
   * @returns {boolean} If the message timeout was expired.
   */
  static isMessageTimeoutExpire(messageCreatedTimeStr: string): boolean {
    const curTime = new Date().getTime();
    const messageCreatedTime = Number(messageCreatedTimeStr);
    console.log('timeout', RabbitMQ.MESSAGE_ACK_TIMEOUT);
    const isTimeoutExpire = RabbitMQ.MESSAGE_ACK_TIMEOUT >= curTime - messageCreatedTime;

    return isTimeoutExpire;
  }

  /**
   * @param {string} queueName Queue name where the message will send.
   * @param {D} content The queue's object message.
   */
  sendMessage<D extends GenericRecord<any>>(queueName: string, content: D) {
    this.channel?.sendToQueue(queueName, Buffer.from(JSON.stringify(content)), {
      persistent: true,
      expiration: String(RabbitMQ.MESSAGE_ACK_TIMEOUT),
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
