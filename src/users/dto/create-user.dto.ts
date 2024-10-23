import { IsEmail, IsString } from "class-validator"

export class CreateUserDto {

    @IsString()
    public name

    @IsEmail()
    public email
}
