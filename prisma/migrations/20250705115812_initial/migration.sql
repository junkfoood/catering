-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "CatererMenuType" AS ENUM ('SMALL_QTY_REFRESHMENT', 'SMALL_QTY_BUFFET', 'PACKED_MEALS', 'TEA_RECEPTION', 'BUFFET_1', 'ETHNIC_FOOD_MALAY', 'ETHNIC_FOOD_INDIAN', 'BUFFET_2', 'BBQ_BUFFET', 'THEME_BUFFET');

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
    "imageFile" TEXT,
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
    "minimumOrderForFreeDelivery" INTEGER,
    "deliveryFee" INTEGER,
    "maxFriedItems" INTEGER NOT NULL,
    "restrictedAreas" TEXT[],
    "discount_below_500" DOUBLE PRECISION NOT NULL,
    "discount_500_2000" DOUBLE PRECISION NOT NULL,
    "discount_2000_4000" DOUBLE PRECISION NOT NULL,
    "discount_above_4000" DOUBLE PRECISION NOT NULL,
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