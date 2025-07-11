import { NextResponse } from 'next/server';
import prisma, { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Bütün xanaları doldurun.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu email ilə artıq qeydiyyat olunub.' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(newUser);

    return NextResponse.json({ message: 'Qeydiyyat uğurla tamamlandı.', token }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: error.message || 'Server xətası.' }, { status: 500 });
  }
}
