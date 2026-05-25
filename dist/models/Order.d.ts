import { TOrder } from "../interface/orderInterface";
export declare const Order: import("mongoose").Model<TOrder, {}, {}, {}, import("mongoose").Document<unknown, {}, TOrder, {}, {}> & TOrder & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>;
