import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const courses = await prisma.course.findMany({
    include: {
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ courses });
}
