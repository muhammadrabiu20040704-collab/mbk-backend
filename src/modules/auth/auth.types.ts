import { CountryCode } from "libphonenumber-js";

export interface RegisterInput {
  fullName: string;
  username: string;
  country: CountryCode;
  phoneNumber: string;
  password: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}
