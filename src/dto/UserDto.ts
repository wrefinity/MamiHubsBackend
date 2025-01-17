
export interface CreateUserDto{
    fullName: string;
    login: string;
    password: string;
    type?: string;
    profileID: object;
    createdBy?: object;
}

export interface CreateNewUserDto{
    firstName: string;
    lastName: string;
    login: string;
    password: string;
    type?: string;
    createdBy?: object;
}