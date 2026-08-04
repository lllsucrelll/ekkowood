-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "totpEnabledAt" TIMESTAMP(3),
ADD COLUMN     "totpSecret" TEXT;

-- CreateTable
CREATE TABLE "AdminTwoFactorChallenge" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminTwoFactorChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminTwoFactorChallenge_token_key" ON "AdminTwoFactorChallenge"("token");

-- CreateIndex
CREATE INDEX "AdminTwoFactorChallenge_adminUserId_idx" ON "AdminTwoFactorChallenge"("adminUserId");

-- AddForeignKey
ALTER TABLE "AdminTwoFactorChallenge" ADD CONSTRAINT "AdminTwoFactorChallenge_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
