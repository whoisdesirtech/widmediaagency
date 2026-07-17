-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "homeJurisdiction" TEXT NOT NULL DEFAULT 'Florida, United States',
    "communicationTools" TEXT NOT NULL DEFAULT '[]',
    "responseTimeDefault" TEXT NOT NULL DEFAULT '24 business hours',
    "urgentResponseTime" TEXT NOT NULL DEFAULT '2-4 hours',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'contractor',
    "agencyId" TEXT,
    "contractorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'United States',
    "status" TEXT NOT NULL DEFAULT 'invited',
    "taxFormType" TEXT,
    "taxFormUrl" TEXT,
    "insuranceProofUrl" TEXT,
    "licensingProofUrl" TEXT,
    "agencyId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MasterAgreement" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clauses" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MasterAgreement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Addendum" (
    "id" TEXT NOT NULL,
    "roleType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fields" TEXT NOT NULL DEFAULT '[]',
    "content" TEXT NOT NULL DEFAULT '',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Addendum_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SOW" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "rateType" TEXT NOT NULL,
    "paymentSchedule" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "specialEquipment" TEXT NOT NULL DEFAULT '',
    "software" TEXT NOT NULL DEFAULT '',
    "deliverables" TEXT NOT NULL DEFAULT '[]',
    "attachedAddendumIds" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SOW_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssembledContract" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "sowId" TEXT,
    "addendumIds" TEXT NOT NULL DEFAULT '[]',
    "mergedContent" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AssembledContract_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Signature" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "signerRole" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerEmail" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Signature_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MasterAgreement" ADD CONSTRAINT "MasterAgreement_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SOW" ADD CONSTRAINT "SOW_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssembledContract" ADD CONSTRAINT "AssembledContract_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssembledContract" ADD CONSTRAINT "AssembledContract_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "MasterAgreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssembledContract" ADD CONSTRAINT "AssembledContract_sowId_fkey" FOREIGN KEY ("sowId") REFERENCES "SOW"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "AssembledContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
