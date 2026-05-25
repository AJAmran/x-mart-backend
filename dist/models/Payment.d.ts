import { TPayment } from "../interface/paymentInterface";
export declare const Payment: import("mongoose").Model<TPayment, {}, {}, {}, import("mongoose").Document<unknown, {}, TPayment, {}, {}> & TPayment & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
