import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: (process.env.R2_PUBLIC_URL || '').trim(),
  credentials: {
    accessKeyId: (process.env.R2_ACCESS_KEY_ID || '').trim(),
    secretAccessKey: (process.env.R2_SECRET_ACCESS_KEY || '').trim(),
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status:  });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const bucketName = (process.env.R2_BUCKET_NAME || 'crackers-images').trim();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    let publicDevUrl = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    if (publicDevUrl.endsWith('/')) {
        publicDevUrl = publicDevUrl.slice(0, -1);
    }
    
    const publicUrl = `${publicDevUrl}/${fileName}`;

    return NextResponse.json({ 
      url: publicUrl,
      fileName: fileName
    }, { status:  });

  } catch (e: any) {
    console.error("Upload Error:", e);
    return NextResponse.json({ error: 'Server error', details: e?.message || String(e) }, { status:  });
  }
}
