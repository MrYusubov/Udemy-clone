import { NextResponse } from 'next/server';
import prisma, { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email və şifrə tələb olunur.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Email və ya şifrə yanlışdır.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Email və ya şifrə yanlışdır.' }, { status: 401 });
    }

    const token = generateToken(user);

    return NextResponse.json(
      { message: 'Uğurla daxil oldunuz.', token },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Server xətası.' }, { status: 500 });
  }
}
