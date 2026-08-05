import { User } from "../users/user.model.js";
import { RegisterInput, LoginInput } from "./auth.types.js";
import { AppError } from "../../utils/app-error.js";
import bcrypt from "bcrypt";
import { normalizePhoneNumber } from "../../shared/phone/phone.util.js";
import { jwtService } from "../../shared/jwt/jwt.service.js";

export class AuthService {
  async register(data: RegisterInput) {
    const { fullName, username, password, country } = data;

    const normalizedPhoneNumber = normalizePhoneNumber(data.phoneNumber, data.country);

    const existingUserByPhone = await User.findOne({
      phoneNumber: normalizedPhoneNumber,
    });

    if (existingUserByPhone) {
      throw new AppError("Phone number already exists", 409);
    }

    const existingUserByUsername = await User.findOne({
      username,
    });

    if (existingUserByUsername) {
      throw new AppError("Username already exists", 409);
    }

    const user = new User({
      fullName,
      username,
      phoneNumber: normalizedPhoneNumber,
      password,
      country,
    });

    await user.save();

    return {
      id: user._id.toString(),
      fullName: user.fullName,
      username: user.username,
      phoneNumber: user.phoneNumber,
    };
  }

  async login(data: LoginInput) {
    const { identifier, password } = data;

    let normalizedPhoneNumber: string | null;

    try {
      normalizedPhoneNumber = normalizePhoneNumber(identifier, "NG");
    } catch {
      normalizedPhoneNumber = null;
    }
    const user = normalizedPhoneNumber
      ? await User.findOne({
          phoneNumber: normalizedPhoneNumber,
        })
      : await User.findOne({
          username: identifier.toLowerCase(),
        });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }
    const accessToken = jwtService.generateAccessToken({
      sub: user._id.toString(),
      username: user.username,
    });
    return {
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        username: user.username,
        phoneNumber: user.phoneNumber,
      },
      accessToken,
    };
  }
}
export const authService = new AuthService();
