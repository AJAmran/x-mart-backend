import { TCartItem } from "../interface/cartInterface";
export declare const CartService: {
    getCartByUserId: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../interface/cartInterface").TCart, {}, {}> & import("../interface/cartInterface").TCart & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    createOrUpdateCart: (userId: string, items: TCartItem[]) => Promise<import("mongoose").Document<unknown, {}, import("../interface/cartInterface").TCart, {}, {}> & import("../interface/cartInterface").TCart & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    deleteCart: (userId: string) => Promise<import("mongoose").Document<unknown, {}, import("../interface/cartInterface").TCart, {}, {}> & import("../interface/cartInterface").TCart & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
};
