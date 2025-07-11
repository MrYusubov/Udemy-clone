import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const entries = Object.fromEntries(formData.entries());
    
    const fields = {};
    const files = {};
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files[key] = value;
      } else {
        fields[key] = value;
      }
    }

    if (!fields.title || !fields.description || !fields.categoryId || !files.image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const imageBuffer = await files.image.arrayBuffer();
    const imageUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'course-covers' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(Buffer.from(imageBuffer));
    });

    const course = await prisma.course.create({
      data: {
        title: fields.title,
        description: fields.description,
        image: imageUpload.public_id,
        duration: fields.duration || '',
        price: fields.price ? parseFloat(fields.price) : 0,
        categoryId: parseInt(fields.categoryId),
        userId: user.id,
      },
    });

    const topicCount = Object.keys(fields).filter(k => k.startsWith('topics[')).length / 2;
    for (let i = 0; i < topicCount; i++) {
      const title = fields[`topics[${i}][title]`];
      const videoFile = files[`topics[${i}][video]`];
      
      if (!title || !videoFile) continue;

      const videoBuffer = await videoFile.arrayBuffer();
      const videoUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'course-videos', resource_type: 'video' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(Buffer.from(videoBuffer));
      });

      await prisma.topic.create({
        data: {
          title,
          video: videoUpload.public_id,
          courseId: course.id,
        },
      });
    }

    return NextResponse.json({ 
      message: 'Course created successfully',
      courseId: course.id
    });

  } catch (err) {
    console.error('[COURSE CREATE ERROR]', err);
    return NextResponse.json({ 
      error: err.message || 'Something went wrong' 
    }, { status: 500 });
  }
}