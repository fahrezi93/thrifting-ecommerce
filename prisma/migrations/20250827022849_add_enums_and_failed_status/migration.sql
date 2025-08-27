-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR');

-- CreateEnum
CREATE TYPE "ProductSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "size" TYPE "ProductSize" USING ("size"::text::"ProductSize");
ALTER TABLE "Product" ALTER COLUMN "condition" TYPE "ProductCondition" USING ("condition"::text::"ProductCondition");

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING ("status"::text::"OrderStatus");
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PaymentStatus" USING ("status"::text::"PaymentStatus");
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
