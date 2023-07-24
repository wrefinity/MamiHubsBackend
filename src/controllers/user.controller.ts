import { userLoginValidation, userRegistrationValidation } from "../validations/authValidations";
import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import { GeneralUtils } from "../utils/general";


export default class UserController{
    constructor(private userService: UserService, private general: GeneralUtils){}

    public async createUser(req: Request, res:Response){
        const service = new UserService();
        const general = new GeneralUtils();
        // Data Validation
        const { error } = userRegistrationValidation(req.body)
        if(error){
            return res.status(400).json({
                status: false,
                message: error.details[0].message.toUpperCase(),
            })
        }
        // Check if user exists
        const user = await service.getOneUser('login',req.body.email);
        if(user){
            return res.status(400).json({
                status: false,
                message: 'User already exists',
            })
        }

        // create user
        const newUser = await this.userService.createUser({firstName: req.body.firstName, lastName: req.body.lastName, login: req.body.email,password: req.body.password})

        if(!newUser){
            return res.status(500).json({
                status: false,
                message: 'Something went wrong while creating user',
            })
        }

        // Generate otp
        const otp = general.generateOtp()

        // send otp to email
        const message = '<h2>Hi '+req.body.first_name+' kindly confirm your account by using this otp '+otp
        await general.sendEmail(req.body.email, 'Confirm Account', message);

        return res.status(200).json({
            status: true,
            message: 'User created successfully',
            data: newUser
        })

    }

    async loginUser(req: Request, res: Response){
        // Data Validation
        const { error } = userLoginValidation(req.body)
        if(error){
            return res.status(400).json({
                status: false,
                message: error.details[0].message.toUpperCase()
            })
        }


        // Check if user exists
        const user = await this.userService.getOneUser('login',req.body.email);
        if(!user){
            return res.status(401).json({
                status: false,
                message: 'Incorrect credentials',
            })
        }else{
            user.matchPassword(req.body.password).then(isMatch => {
                if(isMatch){
                    return res.status(200).json({
                        status: true,
                        message: "Login successful",
                        user,
                        token: this.general.generateBearerToken(user._id)
                    })
                }else{
                    return res.status(401).json({
                        status: false,
                        message: "Incorrect credentials"
                    })
                }
            }).catch((err) => {
                return res.status(500).json({
                    status: false,
                    message: "Server error occured"
                })
            })
        }
    }

}