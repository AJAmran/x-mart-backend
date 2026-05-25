import { TBranch } from "../interface/branchInterface";
export declare const Branch: import("mongoose").Model<TBranch, {}, {}, {}, import("mongoose").Document<unknown, {}, TBranch, {}, {}> & TBranch & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>;
