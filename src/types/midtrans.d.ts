declare module 'midtrans-client' {
  export class CoreApi {
    constructor(options: {
      isProduction: boolean
      serverKey: string
      clientKey: string
    })
    
    charge(parameter: any): Promise<any>
    transaction: {
      status(orderId: string): Promise<any>
    }
  }
  
  export class Snap {
    constructor(options: {
      isProduction: boolean
      serverKey: string
      clientKey: string
    })
    
    createTransaction(parameter: any): Promise<{ token: string }>
  }
}
