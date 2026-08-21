-- ============================================================
-- Project : Real Estate Due Diligence Agent
-- File    : 14_seed_data.sql
-- Purpose : Insert Master Data
-- ============================================================

-- ==========================
-- Roles
-- ==========================

INSERT INTO roles (role_name, description)
VALUES
('Administrator', 'System Administrator'),
('Buyer', 'Property Buyer'),
('Real Estate Agent', 'Licensed Property Agent'),
('Legal Reviewer', 'Legal Due Diligence Officer'),
('Financial Institution', 'Bank / Financial Organization');

-- ==========================
-- Property Types
-- ==========================

INSERT INTO property_types (type_name, description)
VALUES
('Residential', 'Residential Property'),
('Commercial', 'Commercial Property'),
('Industrial', 'Industrial Property'),
('Agricultural', 'Agricultural Land'),
('Apartment', 'Apartment Building'),
('Villa', 'Independent Villa'),
('Office', 'Office Space'),
('Warehouse', 'Storage Warehouse');

-- ==========================
-- Risk Categories
-- ==========================

INSERT INTO risk_categories (category_name, description)
VALUES
('Legal', 'Legal ownership verification'),
('Tax', 'Property tax verification'),
('Environmental', 'Environmental risk'),
('Flood', 'Flood zone assessment'),
('Structural', 'Building structural condition'),
('Financial', 'Financial and valuation risk');

-- ==========================
-- API Providers
-- ==========================

INSERT INTO api_providers
(provider_name, base_url, authentication_type)
VALUES
('Government Land Records',
'https://api.landrecords.gov',
'API_KEY'),

('Municipal Tax Department',
'https://api.municipaltax.gov',
'API_KEY'),

('Environmental Agency',
'https://api.environment.gov',
'API_KEY'),

('Flood Zone Authority',
'https://api.floodzone.gov',
'API_KEY');