import { USER_ROLE } from "../constants/userConstant";

export type TRegisterUser = {
    name: string;
    email: string;
    mobileNumber: string;
    password: string;
    role: keyof typeof USER_ROLE;
  };
  