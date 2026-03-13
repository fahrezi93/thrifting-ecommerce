import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Semua kolom (Nama, Email, dan Kata Sandi) wajib diisi' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: 'Kata sandi harus terdiri dari minimal 6 karakter' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { message: 'Email sudah terdaftar. Silakan gunakan email lain atau Sign in.' },
                { status: 400 }
            )
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create the user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER', // default role
            }
        })

        return NextResponse.json(
            { message: 'Pendaftaran berhasil', user: { id: user.id, email: user.email, name: user.name } },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { message: 'Terjadi kesalahan saat memproses pendaftaran', error: error.message },
            { status: 500 }
        )
    }
}
