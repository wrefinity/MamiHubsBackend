import { userRegistrationValidation, profileValidation } from "../validations/authValidations";
import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import { GeneralUtils } from "../utils/general";


class UserController{
    constructor(private userService: UserService, private general: GeneralUtils){}



    async createUser(req: Request, res:Response){
        // Data Validation
        const { error } = userRegistrationValidation(req.body)
        if(error){
            return res.status(400).json({
                status: false,
                message: error.details[0].message.toUpperCase(),
            })
        }

        // Check if user exists
        const user = await this.userService.getOneUser('login',req.body.email);
        if(user){
            return res.status(400).json({
                status: false,
                message: 'User already exists',
            })
        }

        // create user
        const newUser = await this.userService.createUser({first_name: req.body.first_name,last_name: req.body.last_name,login: req.body.email,password: req.body.password})

        if(!newUser){
            return res.status(500).json({
                status: false,
                message: 'Something went wrong while creating user',
            })
        }

        // Generate otp
        const otp = this.general.generateOtp()

        // send otp to email
        const message = '<h2>Hi '+req.body.first_name+' kindly confirm your account by using this otp '+otp
        await this.general.sendEmail(req.body.email, 'Confirm Account', message);

        return res.status(200).json({
            status: true,
            message: 'User created successfully',
            data: newUser
        })

    }
}

module.exports = UserController;