import { TRegisterUser } from "../interface/authInterface";
import { User } from "../models/User";



const registerUser = async(payload: TRegisterUser) => {
    // check if the user is exist
    const user = await User.isUserExistsByEmail(payload.email);

    if(user){
        throw new Error("User already exists");
    }
}