-- Sample Data for Testing

-- Create a test organization
INSERT INTO organizations (id, name, address, phone, email, website)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Community Food Bank of Silicon Valley',
    '750 Curtner Ave, San Jose, CA 95125',
    '(408) 555-0123',
    'info@cfbsv.org',
    'www.cfbsv.org'
);

-- Create test users with different roles
INSERT INTO users (id, organization_id, email, first_name, last_name, role) 
VALUES
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'admin@cfbsv.org', 'John', 'Admin', 'admin'),
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'manager@cfbsv.org', 'Sarah', 'Manager', 'manager'),
    ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'volunteer@cfbsv.org', 'Mike', 'Volunteer', 'volunteer');

-- Create inventory categories
INSERT INTO inventory_categories (id, organization_id, name, description)
VALUES
    ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Canned Goods', 'Non-perishable canned foods'),
    ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Fresh Produce', 'Fresh fruits and vegetables'),
    ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'Dairy', 'Milk, cheese, and other dairy products');

-- Create inventory items
INSERT INTO inventory_items (id, organization_id, category_id, name, description, sku, unit_type, minimum_stock)
VALUES
    ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Canned Soup', 'Vegetable soup', 'SOUP001', 'can', 100),
    ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Canned Beans', 'Black beans', 'BEAN001', 'can', 150),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Apples', 'Fresh apples', 'APPL001', 'pound', 50);

-- Create inventory transactions
INSERT INTO inventory_transactions (organization_id, item_id, transaction_type, quantity, user_id, notes)
VALUES
    ('11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 'donation_in', 200, '22222222-2222-2222-2222-222222222222', 'Initial stock'),
    ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'donation_in', 300, '22222222-2222-2222-2222-222222222222', 'Initial stock'),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'donation_in', 100, '22222222-2222-2222-2222-222222222222', 'Initial stock');

-- Create volunteers
INSERT INTO volunteers (id, organization_id, user_id, phone, emergency_contact_name, emergency_contact_phone, skills)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '(408) 555-0789', 'Jane Emergency', '(408) 555-9999', ARRAY['food handling', 'customer service']);

-- Create test clients
INSERT INTO clients (id, organization_id, first_name, last_name, phone, email, household_size)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Alice', 'Johnson', '(408) 555-1111', 'alice@email.com', 3),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Bob', 'Smith', '(408) 555-2222', 'bob@email.com', 2);

-- Create client visits
INSERT INTO client_visits (id, client_id, organization_id, served_by, notes)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Monthly food pickup');

-- Create client visit items
INSERT INTO client_visit_items (visit_id, item_id, quantity)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '88888888-8888-8888-8888-888888888888', 2),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '99999999-9999-9999-9999-999999999999', 3);
