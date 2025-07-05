-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "CatererMenuType" AS ENUM ('SMALL_QTY_REFRESHMENT', 'SMALL_QTY_BUFFET');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('BELOW_500', 'BETWEEN_500_AND_2000', 'BETWEEN_2000_AND_4000', 'ABOVE_4000');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "name" TEXT NOT NULL,
    "activated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Caterer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Caterer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatererMenu" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CatererMenuType" NOT NULL,
    "notes" TEXT,
    "pricePerPerson" DOUBLE PRECISION NOT NULL,
    "minimumOrder" INTEGER NOT NULL,
    "maxFriedItems" INTEGER NOT NULL,
    "catererID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatererMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatererMenuSection" (
    "id" TEXT NOT NULL,
    "menuID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "selectionLimit" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatererMenuSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatererMenuSectionItem" (
    "id" TEXT NOT NULL,
    "sectionID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "vegetarian" BOOLEAN NOT NULL,
    "fried" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatererMenuSectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatererMenuDiscount" (
    "id" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "discount" INTEGER NOT NULL,
    "catererMenuID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatererMenuDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestrictedArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestrictedArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CatererMenuToRestrictedArea" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CatererMenuToRestrictedArea_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Caterer_name_key" ON "Caterer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CatererMenu_code_key" ON "CatererMenu"("code");

-- CreateIndex
CREATE INDEX "_CatererMenuToRestrictedArea_B_index" ON "_CatererMenuToRestrictedArea"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatererMenu" ADD CONSTRAINT "CatererMenu_catererID_fkey" FOREIGN KEY ("catererID") REFERENCES "Caterer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatererMenuSection" ADD CONSTRAINT "CatererMenuSection_menuID_fkey" FOREIGN KEY ("menuID") REFERENCES "CatererMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatererMenuSectionItem" ADD CONSTRAINT "CatererMenuSectionItem_sectionID_fkey" FOREIGN KEY ("sectionID") REFERENCES "CatererMenuSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatererMenuDiscount" ADD CONSTRAINT "CatererMenuDiscount_catererMenuID_fkey" FOREIGN KEY ("catererMenuID") REFERENCES "CatererMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CatererMenuToRestrictedArea" ADD CONSTRAINT "_CatererMenuToRestrictedArea_A_fkey" FOREIGN KEY ("A") REFERENCES "CatererMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CatererMenuToRestrictedArea" ADD CONSTRAINT "_CatererMenuToRestrictedArea_B_fkey" FOREIGN KEY ("B") REFERENCES "RestrictedArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
