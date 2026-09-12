import { readFile } from "node:fs/promises";
import path from "node:path";

import { validateMessageMedia } from "./validation/media.validation.js";
import { AppError } from "@utils/app-error.js";

const fixturesPath = path.resolve(process.cwd(), "src/tests/fixtures/media");

interface TestMediaFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

async function createTestFile(filename: string, mimetype: string): Promise<TestMediaFile> {
  const filePath = path.join(fixturesPath, filename);
  const buffer = await readFile(filePath);

  return {
    originalname: filename,
    mimetype,
    buffer,
    size: buffer.length,
  };
}

async function expectValidationError(name: string, file: TestMediaFile | undefined): Promise<void> {
  try {
    await validateMessageMedia(file as Express.Multer.File);

    throw new Error(`${name}: Expected validation to fail, but it passed.`);
  } catch (error) {
    if (error instanceof AppError) {
      console.log(`✅ ${name}`);
      return;
    }

    throw error;
  }
}

async function runMediaValidationTests(): Promise<void> {
  console.log("======================================");
  console.log(" MBK Media Validation Tests");
  console.log("======================================");

  try {
    // ======================================
    // 1. VALID IMAGE
    // ======================================

    const validJpg = await createTestFile("1766845291118.jpg", "image/jpeg");

    const jpgResult = await validateMessageMedia(validJpg as Express.Multer.File);

    if (jpgResult.resourceType !== "image") {
      throw new Error("Valid JPG should be detected as image.");
    }

    console.log("✅ Valid JPG");

    // ======================================
    // 2. VALID PNG
    // ======================================

    const validPng = await createTestFile("file_0000000022ac81f4a34c501c352c0ff8.png", "image/png");

    const pngResult = await validateMessageMedia(validPng as Express.Multer.File);

    if (pngResult.resourceType !== "image") {
      throw new Error("Valid PNG should be detected as image.");
    }

    console.log("✅ Valid PNG");

    // ======================================
    // 3. VALID JPEG
    // ======================================

    const validJpeg = await createTestFile(
      "Screenshot_16-2-2026_134336_as1.ftcdn.net.jpeg",
      "image/jpeg",
    );

    const jpegResult = await validateMessageMedia(validJpeg as Express.Multer.File);

    if (jpegResult.resourceType !== "image") {
      throw new Error("Valid JPEG should be detected as image.");
    }

    console.log("✅ Valid JPEG");

    // ======================================
    // 4. VALID VIDEO
    // ======================================

    const validMp4 = await createTestFile("0045fb22164b9e01cd3ab89da558c99a.mp4", "video/mp4");

    const mp4Result = await validateMessageMedia(validMp4 as Express.Multer.File);

    if (mp4Result.resourceType !== "video") {
      throw new Error("Valid MP4 should be detected as video.");
    }

    console.log("✅ Valid MP4");

    // ======================================
    // 5. WRONG MIME TYPE
    // ======================================

    const wrongMime = await createTestFile("1766845291118.jpg", "image/png");

    await expectValidationError("Wrong MIME type", wrongMime);

    // ======================================
    // 6. WRONG EXTENSION
    // ======================================

    const pngBuffer = await readFile(
      path.join(fixturesPath, "file_0000000022ac81f4a34c501c352c0ff8.png"),
    );

    const wrongExtension: TestMediaFile = {
      originalname: "wrong-extension.jpg",
      mimetype: "image/png",
      buffer: pngBuffer,
      size: pngBuffer.length,
    };

    await expectValidationError("Wrong file extension", wrongExtension);

    // ======================================
    // 7. INVALID FILE CONTENT
    // ======================================

    const invalidFile: TestMediaFile = {
      originalname: "invalid.txt",
      mimetype: "text/plain",
      buffer: Buffer.from("This is not a valid image or video."),
      size: Buffer.byteLength("This is not a valid image or video."),
    };

    await expectValidationError("Invalid file content", invalidFile);

    // ======================================
    // 8. EMPTY FILE
    // ======================================

    const emptyFile: TestMediaFile = {
      originalname: "empty.jpg",
      mimetype: "image/jpeg",
      buffer: Buffer.alloc(0),
      size: 0,
    };

    await expectValidationError("Empty file", emptyFile);

    // ======================================
    // 9. MISSING FILE
    // ======================================

    await expectValidationError("Missing file", undefined);

    // ======================================
    // 10. OVERSIZED IMAGE
    // ======================================

    const imageBuffer = await readFile(path.join(fixturesPath, "1766845291118.jpg"));

    const oversizedImageBuffer = Buffer.concat([
      imageBuffer,
      Buffer.alloc(10 * 1024 * 1024 + 1 - imageBuffer.length),
    ]);

    const oversizedImage: TestMediaFile = {
      originalname: "oversized.jpg",
      mimetype: "image/jpeg",
      buffer: oversizedImageBuffer,
      size: oversizedImageBuffer.length,
    };

    await expectValidationError("Oversized image", oversizedImage);

    // ======================================
    // SUCCESS
    // ======================================

    console.log("");
    console.log("======================================");
    console.log("✅ ALL MEDIA VALIDATION TESTS PASSED");
    console.log("======================================");
  } catch (error) {
    console.error("");
    console.error("======================================");
    console.error("❌ MEDIA VALIDATION TEST FAILED");
    console.error("======================================");
    console.error(error);

    process.exitCode = 1;
  }
}

await runMediaValidationTests();
