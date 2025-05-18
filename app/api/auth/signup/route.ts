import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  age: z.string().transform(Number).pipe(z.number().min(18).max(100)),
  gender: z.enum(["male", "female", "other"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        age: validatedData.age,
        gender: validatedData.gender,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
