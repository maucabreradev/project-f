export class NotificationHub {
  // TODO: implement Durable Object for real-time notifications
  constructor(state: any, env: any) {}

  async fetch(request: Request): Promise<Response> {
    return new Response("Not implemented", { status: 501 });
  }
}

export { NotificationHub as default };