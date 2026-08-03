import { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { AppError } from "../../utils/app-error.js";

export const normalizePhoneNumber = (
  phoneNumber: string,
  defaultCountry: CountryCode = "NG",
): string => {
  const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, defaultCountry);

  if (!parsedPhoneNumber) {
    throw new AppError("Invalid phone number.", 400);
  }

  if (!parsedPhoneNumber.isValid()) {
    throw new AppError("Invalid phone number.", 400);
  }

  return parsedPhoneNumber.format("E.164");
};
