CREATE DATABASE Thesis;
GO
USE Thesis;
GO

CREATE TABLE Roles (
    RoleId INT PRIMARY KEY IDENTITY(1,1),
	RoleName NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Patients (
	PatientId INT PRIMARY KEY IDENTITY (1,1),
	FirstName NVARCHAR(50) NOT NULL,
	LastName NVARCHAR(50) NOT NULL,
	ContactNo NVARCHAR(20),
	Email NVARCHAR(100),
	BirthDate DATE NOT NULL,
	PatientSex CHAR(1),

	CONSTRAINT CHK_Patient_Sex
		CHECK (PatientSex IN ('M', 'F', 'O'))
);

CREATE TABLE Users (
	UserId INT PRIMARY KEY IDENTITY (1,1),
	Username NVARCHAR(100) NOT NULL UNIQUE,
	UserPassword NVARCHAR(100) NOT NULL,
	Email NVARCHAR(100),
	ContactNo NVARCHAR(100),
	RoleId INT NOT NULL,
	IsActive BIT NOT NULL DEFAULT 1,

	CONSTRAINT FK_User_Role
		FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

CREATE TABLE Doctors (
	DoctorId INT PRIMARY KEY IDENTITY(1,1),
	UserId INT NOT NULL,
	FirstName NVARCHAR(50),
	LastName NVARCHAR(50),
	Specialty NVARCHAR(50),
	LicenseNo NVARCHAR(50),

	CONSTRAINT FK_DoctorUser
		FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

CREATE TABLE Staff (
	StaffId INT PRIMARY KEY IDENTITY (1,1),
	UserId INT NOT NULL,
	FirstName NVARCHAR(50),
	LastName NVARCHAR(50),

	CONSTRAINT FK_StaffUser
		FOREIGN KEY (UserId) REFERENCES Users(UserId),
	CONSTRAINT UQ_Staff_User UNIQUE (UserId)
);

CREATE TABLE Appointments (
	AppointmentId INT PRIMARY KEY IDENTITY (1,1),
	PatientId INT NOT NULL,
	DoctorId INT NOT NULL,
	AppointmentDateTime DATETIME2 NOT NULL,
	AppointmentStatus NVARCHAR(50) NOT NULL
		CHECK (AppointmentStatus IN('Booked', 'CheckedIn', 'Cancelled', 'NoShow', 'Completed')),
	Notes NVARCHAR(255),

	CONSTRAINT FK_Appointment_Patient
		FOREIGN KEY (PatientId) REFERENCES Patients(PatientId),

	CONSTRAINT FK_Appointment_Doctor
		FOREIGN KEY (DoctorId) REFERENCES Doctors(DoctorId)
);

CREATE TABLE Consultations (
	ConsultationId INT PRIMARY KEY IDENTITY (1,1),
	PatientId INT NOT NULL,
	DoctorId INT NOT NULL,
	AppointmentId INT,
	ConsultationDate DATETIME2 NOT NULL,
	Notes NVARCHAR(MAX), -- This is Clinical Notes, Apparently
	Diagnosis NVARCHAR(255),
	Treatment NVARCHAR(MAX),

	CONSTRAINT FK_Consultation_Patient
		FOREIGN KEY (PatientId) REFERENCES Patients(PatientId),

	CONSTRAINT FK_Consultation_Doctor
		FOREIGN KEY (DoctorId) REFERENCES Doctors(DoctorId),

	CONSTRAINT FK_Consultation_Appointment
        FOREIGN KEY (AppointmentId) REFERENCES Appointments(AppointmentId)
);

CREATE TABLE QueueEntries (
	QueueEntryId INT PRIMARY KEY IDENTITY (1,1),
	PatientId INT NOT NULL,
	AppointmentId INT,
	CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
	Status NVARCHAR(50) NOT NULL CHECK (Status IN('Waiting', 'InProgress', 'Done', 'Skipped')),
	DoctorId INT, -- will be null until assigned a doctor, or whichever they're supposed to see
	ConsultationId INT, -- filled once the consultation happens

	CONSTRAINT FK_Queue_Patient
		FOREIGN KEY (PatientId) REFERENCES Patients(PatientId),

	CONSTRAINT FK_Queue_Doctor
		FOREIGN KEY (DoctorId) REFERENCES Doctors(DoctorId),

	CONSTRAINT FK_Queue_Consultation
		FOREIGN KEY (ConsultationId) REFERENCES Consultations(ConsultationId),

	CONSTRAINT FK_Queue_Appointment
        FOREIGN KEY (AppointmentId) REFERENCES Appointments(AppointmentId)
);

CREATE TABLE Payments (
	PaymentId INT PRIMARY KEY IDENTITY(1,1), -- ID for the payment, good for receipts
	PatientId INT NOT NULL, -- which patient was treated
	ConsultationId INT NOT NULL, -- what consultation did it happen
	AppointmentId INT NULL, -- if that consultation happened to have a appointment behind it
	Amount DECIMAL(10,2) NOT NULL,
	PaymentMethod NVARCHAR(50) NOT NULL
		CHECK (PaymentMethod IN ('Cash','Card','Insurance','Online')),
	PaymentReason NVARCHAR(100) NOT NULL, -- e.g. consultation fee, lab test, deposit
	PaymentDate DATETIME2 DEFAULT SYSDATETIME(),
	RecordedByUserId INT NOT NULL,

	CONSTRAINT FK_Payment_Patient
		FOREIGN KEY (PatientId) REFERENCES Patients(PatientId),

	CONSTRAINT FK_Payment_Consultation
		FOREIGN KEY (ConsultationId) REFERENCES Consultations(ConsultationId),

	CONSTRAINT FK_Payment_Appointment
		FOREIGN KEY (AppointmentId) REFERENCES Appointments(AppointmentId),

	CONSTRAINT FK_Payment_User
		FOREIGN KEY (RecordedByUserId) REFERENCES Users(UserId)
);

CREATE TABLE LabOrders(
	LabOrderId INT PRIMARY KEY IDENTITY(1,1),
	ConsultationId INT NOT NULL,
	PatientId INT NOT NULL,
	OrderedByUserId INT NOT NULL,
	OrderDate DATE NOT NULL DEFAULT GETDATE(),
	Notes NVARCHAR(MAX),

	CONSTRAINT FK_LabOrders_Consultations
		FOREIGN KEY (ConsultationId) REFERENCES Consultations(ConsultationId),

	CONSTRAINT FK_LabOrders_Patients
		FOREIGN KEY (PatientId) REFERENCES Patients(PatientId),

	CONSTRAINT FK_LabOrders_Users
		FOREIGN KEY (OrderedByUserId) REFERENCES Users(UserId)
);

CREATE TABLE LabResults(
	LabResultId INT PRIMARY KEY IDENTITY(1,1),
	LabOrderId INT NOT NULL,
	TestName VARCHAR(150) NOT NULL,
	ResultValue NVARCHAR(100) NOT NULL,
	Unit NVARCHAR(50),
	ReferenceRange NVARCHAR(100),
    DateReported DATE,
    Notes NVARCHAR(MAX),

    CONSTRAINT FK_LabResultDetails_LabOrders
        FOREIGN KEY (LabOrderId) REFERENCES LabOrders(LabOrderId)
);

CREATE TABLE Suppliers (
    SupplierId INT PRIMARY KEY IDENTITY(1,1),
    SupplierName NVARCHAR(150) NOT NULL,
    ContactNo NVARCHAR(100),
    Email NVARCHAR(100),
    Address NVARCHAR(MAX)
);

CREATE TABLE InventoryItems (
    ItemId INT PRIMARY KEY IDENTITY(1,1),
    ItemName NVARCHAR(150) NOT NULL,
    ItemCategory NVARCHAR(100) NOT NULL,   -- e.g., Medicine, Vaccine, Supply
    ItemDescription NVARCHAR(MAX),
    Unit NVARCHAR(50) NOT NULL,            -- e.g., pcs, vials, boxes
    ReorderLevel INT NOT NULL DEFAULT 0,   -- alert when total stock < this
    SupplierID INT,                        -- optional FK
    DateAdded DATE NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_InventoryItems_Supplier
        FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierId)
);

CREATE TABLE InventoryBatches (
    BatchId INT PRIMARY KEY IDENTITY(1,1),
    ItemId INT NOT NULL,
    BatchNumber NVARCHAR(100),             -- lot number from supplier (optional)
    QuantityInStock INT NOT NULL,
    ExpirationDate DATE NOT NULL,
    DateReceived DATE NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_InventoryBatches_Items
        FOREIGN KEY (ItemId) REFERENCES InventoryItems(ItemId)
);

CREATE TABLE InventoryTransactions (
    TransactionId INT PRIMARY KEY IDENTITY(1,1),
    BatchId INT NOT NULL,
    QuantityChange INT NOT NULL,             -- positive = restock, negative = usage
    TransactionType NVARCHAR(50) NOT NULL,   -- e.g., 'Restock', 'Usage', 'Adjustment', 'Expired'
    ReferenceId INT,                         -- e.g., ConsultationID if used for a patient
    PerformedByUserId INT,
    TransactionDate DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_InventoryTransactions_Batches
        FOREIGN KEY (BatchId) REFERENCES InventoryBatches(BatchId),

    CONSTRAINT FK_InventoryTransactions_Users
        FOREIGN KEY (PerformedByUserId) REFERENCES Users(UserId)
);

CREATE TABLE ConsultationInventory (
    ConsultationInventoryId INT PRIMARY KEY IDENTITY(1,1),
    ConsultationId INT NOT NULL,
    BatchId INT NOT NULL,               -- instead of ItemID
    QuantityUsed INT NOT NULL,
    Notes NVARCHAR(MAX),

    CONSTRAINT FK_ConsultationInventory_Consultations
        FOREIGN KEY (ConsultationId) REFERENCES Consultations(ConsultationId),

    CONSTRAINT FK_ConsultationInventory_Batches
        FOREIGN KEY (BatchId) REFERENCES InventoryBatches(BatchId)
);

SELECT * FROM ConsultationInventory;