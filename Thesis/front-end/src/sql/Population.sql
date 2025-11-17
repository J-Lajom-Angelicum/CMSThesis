USE Thesis;
GO
-- This script populates the Patients table with sample data.
-- birthdate format: 'YYYY-MM-DD'
-- patientsex values: 'M' for Male, 'F' for Female, 'O' for Other
INSERT INTO dbo.Patients (FirstName, LastName, BirthDate, PatientSex)
VALUES
 ('Flordiliza', 'Mangalile', '1964-03-15', 'F'),
 ('Sean Axel', 'Liwanag', '2006-07-22', 'M'),
 ('Hilarrie', 'Fischer', '2019-11-05', 'F'),
 ('Reynaldo Rodriguez', 'Mendoza', '1957-01-30', 'M'),
 ('Joeanne Milleiene', 'Maximiano', '1996-06-12', 'F'),
 ('Dexter John', 'Dolleton', '1990-09-25', 'M'),
 ('Rossana', 'Tayag', '1957-04-18', 'F'),
 ('Raymundo', 'Tayag', '1955-12-03', 'M'),
 ('Wendy', 'Borull', '1994-08-14', 'F'),
 ('Lorraine', 'Goyo', '2009-02-27', 'M'),
 ('Roshel', 'Pajarillo', '2020-05-09', 'F'),
 ('Conan Mikhael', 'Lajom', '2011-10-21', 'M'),
 ('Joaquin', 'Gutierrez', '2010-10-19', 'M'),
 ('Kyrie Eleison', 'Puno', '2025-03-11', 'M'),
 ('Lincoln Ian West', 'Andaya', '2025-01-11', 'M'),
 ('Kyliope', 'Reyes', '2020-04-22', 'M'),
 ('Mercedes', 'Gallardo', '1962-09-05', 'M'),
 ('Noah Elijah', 'Tan', '2020-05-15', 'M'),
 ('Kensa Calluna', 'Mangalindan', '2019-01-23', 'F'),
 ('Anastacia', 'Cortez', '2023-08-11', 'M');

 GO
 SELECT * FROM DBO.Patients;
GO