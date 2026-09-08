BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nom] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'CITOYEN',
    [actif] BIT NOT NULL CONSTRAINT [User_actif_df] DEFAULT 1,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Reclamation] (
    [id] INT NOT NULL IDENTITY(1,1),
    [numeroClassement] INT NOT NULL,
    [numeroBureauOrdre] NVARCHAR(1000),
    [dateBureauOrdre] DATETIME2,
    [dateReception] DATETIME2,
    [departement] NVARCHAR(1000),
    [service] NVARCHAR(1000),
    [misEnCause] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Reclamation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [userId] INT,
    [statut] NVARCHAR(1000) NOT NULL CONSTRAINT [Reclamation_statut_df] DEFAULT 'EN_ATTENTE',
    [description] NVARCHAR(1000) NOT NULL CONSTRAINT [Reclamation_description_df] DEFAULT 'Sans description',
    [titre] NVARCHAR(1000) NOT NULL CONSTRAINT [Reclamation_titre_df] DEFAULT 'Sans titre',
    CONSTRAINT [Reclamation_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Reclamation_numeroClassement_key] UNIQUE NONCLUSTERED ([numeroClassement])
);

-- CreateTable
CREATE TABLE [dbo].[FichierJoint] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nomFichier] NVARCHAR(1000) NOT NULL,
    [chemin] NVARCHAR(1000) NOT NULL,
    [typeMime] NVARCHAR(1000),
    [taille] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FichierJoint_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [reclamationId] INT NOT NULL,
    CONSTRAINT [FichierJoint_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[HistoriqueReclamation] (
    [id] INT NOT NULL IDENTITY(1,1),
    [reclamationId] INT NOT NULL,
    [userId] INT,
    [ancienStatut] NVARCHAR(1000),
    [nouveauStatut] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [HistoriqueReclamation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [HistoriqueReclamation_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Reclamation] ADD CONSTRAINT [Reclamation_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FichierJoint] ADD CONSTRAINT [FichierJoint_reclamationId_fkey] FOREIGN KEY ([reclamationId]) REFERENCES [dbo].[Reclamation]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[HistoriqueReclamation] ADD CONSTRAINT [HistoriqueReclamation_reclamationId_fkey] FOREIGN KEY ([reclamationId]) REFERENCES [dbo].[Reclamation]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[HistoriqueReclamation] ADD CONSTRAINT [HistoriqueReclamation_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

