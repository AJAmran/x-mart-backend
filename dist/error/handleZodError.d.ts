import { ZodError } from "zod";
import { TGenericErrorResponse } from "../interface/errorInterface";
declare const handleZodError: (err: ZodError) => TGenericErrorResponse;
export default handleZodError;
