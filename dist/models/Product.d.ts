import { TProduct } from "../interface/productInterface";
export declare const Product: import("mongoose").Model<TProduct, {}, {}, {}, import("mongoose").Document<unknown, {}, TProduct, {}, {}> & TProduct & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>;
