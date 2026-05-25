import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interface/errorInterface";
declare const handleCastError: (err: mongoose.Error.CastError) => TGenericErrorResponse;
export default handleCastError;
