import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Authentication
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized or insufficient permissions' }, { status: 401 });
        }

        // 2. Parse form data
        const formData = await request.formData();
        const files = formData.getAll('file') as File[];
        const folder = formData.get('folder') as string || 'thrifting_ecommerce';

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        // 3. Upload files to Cloudinary
        const uploadPromises = files.map(async (file) => {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            return uploadImageToCloudinary(buffer, folder);
        });

        const results = await Promise.all(uploadPromises);

        // 4. Return URLs
        const urls = results.map((res) => res.url);

        return NextResponse.json({
            success: true,
            urls,
            results
        });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json(
            { error: 'Failed to upload image(s)' },
            { status: 500 }
        );
    }
}
