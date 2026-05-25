import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interface/errorInterface";
declare const handleValidationError: (err: mongoose.Error.ValidationError) => TGenericErrorResponse;
export default handleValidationError;
