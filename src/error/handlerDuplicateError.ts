import {
  TErrorSources,
  TGenericErrorResponse,
} from "../interface/errorInterface";

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/"([^"]*)"/);

  const extractedMessage = match && match[1];

  const errorSources: TErrorSources = [
    {
      path: "",
      message: `${extractedMessage} is already exists`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: "Resource Already Exists",
    errorSources,
  };
};

export default handleDuplicateError;
