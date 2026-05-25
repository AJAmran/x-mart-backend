import { TCart } from "../interface/cartInterface";
export declare const Cart: import("mongoose").Model<TCart, {}, {}, {}, import("mongoose").Document<unknown, {}, TCart, {}, {}> & TCart & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>;
