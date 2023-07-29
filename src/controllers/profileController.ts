import { Request, Response } from "express";
// model importation
import { getProfileByEmail, updateProfile, getProfiles, deleteProfile } from "../models/Profile";
//importing field validations
import { profileValidation } from "../validations/authValidations";


class ProfileController {

    updateUserProfile = async (req: Request, res: Response) => {
        try {
            // data validations
            console.log("testing user update profile route")
            const { email } = req.params;
            const { error } = profileValidation(req.body);
            if (error)
                return res.status(400).json({
                    error: true,
                    message: error.details[0].message,
                })
            // check if the user exists
            // if the user profile's exists update the profile
            const checkExistance = await getProfileByEmail(email);
            if (!checkExistance)
                return res.status(400).json({
                    error: true,
                    message: "user account not created"
                })
            const updatedProfile = await updateProfile(email, { ...req.body, active: true });
            if (!updatedProfile) return res.status(400).json({ status: false, message: 'Profile update failed' })
            return res.status(200).json({
                error: false,
                message: "user profile updated"
            })
        } catch (err) {
            console.log(err)
        }
    }

    getUserProfile = async (req: Request, res: Response) => {
        const { email } = req.params;
        if (!email) return res.status(400).json({ error: true, message: "email required to get user information" })

        try {
            const data = await getProfileByEmail(req.body.email)

            if (!data)
                return res.status(400).json({
                    error: true,
                    message: "user profile information not created"
                })

            // return the user information 
            return res.status(200).json({
                error: false,
                data
            })
        } catch (err) {
            console.log(err)
        }

    }

    deleteUserProfile = async (req: Request, res: Response) => {
        const { email } = req.params;
        try {
            if (!email) return res.status(400).json({ error: true, message: "email required to get user information" })
            const deleted = deleteProfile(email)

            if (!deleted)
                return res.status(400).json({
                    error: true,
                    message: "user profile not deleted"
                })

            // return the user information 
            return res.status(200).json({
                error: false,
                message: "user's profile deleted"
            })
        } catch (error) {
            console.log(error)
        }

    }
    getUsersProfile = async (req: Request, res: Response) => {
        const data = await getProfiles();
        return res.status(200).json(data)
    }
}

export default new ProfileController();