-- Insert initial service categories
INSERT INTO service_categories (name, icon, description) VALUES
('Home Cleaning & Maintenance', '🧹', 'House cleaning, bathroom, kitchen, sofa, carpet, water tank cleaning, lawn & gardening, pest control'),
('Repair & Installation', '🔧', 'AC, washing machine, microwave, chimney, RO, mixer repair. CCTV, refrigerator, fan, light, geyser installation'),
('Vehicle Services', '🚗', 'Taxi/car rental, driver on demand'),
('Personal & Family Care', '👶', 'Child care, nursing/medical attendant, pet care, tutors'),
('Infra & Home Improvement', '🏗️', 'Mason, painter, plumber, carpenter, interior designer, modular kitchen, contractor support'),
('Food & Tiffin', '🍱', 'Tiffin and home-cooked meal services'),
('Event & Planner', '🎉', 'Wedding and event planners');

-- Insert services for Home Cleaning & Maintenance
INSERT INTO services (category_id, name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km) 
SELECT 
    id,
    name,
    description,
    base_price,
    min_price,
    max_price,
    is_fixed_location,
    min_radius_km,
    max_radius_km
FROM (VALUES
    ('House Cleaning', 'Complete house cleaning service', 500.00, 300.00, 2000.00, false, 5.0, 50.0),
    ('Bathroom Cleaning', 'Deep bathroom cleaning', 300.00, 200.00, 800.00, false, 5.0, 50.0),
    ('Kitchen Cleaning', 'Kitchen deep cleaning', 400.00, 250.00, 1000.00, false, 5.0, 50.0),
    ('Sofa Cleaning', 'Sofa and upholstery cleaning', 600.00, 400.00, 1500.00, false, 5.0, 50.0),
    ('Carpet Cleaning', 'Carpet and rug cleaning', 500.00, 300.00, 1200.00, false, 5.0, 50.0),
    ('Water Tank Cleaning', 'Water tank cleaning and sanitization', 800.00, 500.00, 2000.00, false, 5.0, 50.0),
    ('Lawn & Gardening', 'Lawn mowing and garden maintenance', 400.00, 250.00, 1000.00, false, 5.0, 50.0),
    ('Pest Control', 'Pest control and fumigation', 600.00, 400.00, 1500.00, false, 5.0, 50.0)
) AS v(name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km)
CROSS JOIN (SELECT id FROM service_categories WHERE name = 'Home Cleaning & Maintenance' LIMIT 1) cat;

-- Insert services for Repair & Installation
INSERT INTO services (category_id, name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km) 
SELECT 
    cat.id,
    v.name,
    v.description,
    v.base_price,
    v.min_price,
    v.max_price,
    v.is_fixed_location,
    v.min_radius_km,
    v.max_radius_km
FROM (VALUES
    ('AC Repair', 'Air conditioner repair and service', 500.00, 300.00, 2000.00, false, 5.0, 50.0),
    ('Washing Machine Repair', 'Washing machine repair', 400.00, 250.00, 1500.00, false, 5.0, 50.0),
    ('Microwave Repair', 'Microwave oven repair', 300.00, 200.00, 1000.00, false, 5.0, 50.0),
    ('Chimney Repair', 'Kitchen chimney repair and cleaning', 500.00, 300.00, 1500.00, false, 5.0, 50.0),
    ('RO Repair', 'RO water purifier repair', 400.00, 250.00, 1200.00, false, 5.0, 50.0),
    ('Mixer Repair', 'Mixer grinder repair', 200.00, 150.00, 600.00, false, 5.0, 50.0),
    ('CCTV Installation', 'CCTV camera installation', 1500.00, 1000.00, 5000.00, false, 5.0, 50.0),
    ('Refrigerator Installation', 'Refrigerator installation', 300.00, 200.00, 800.00, false, 5.0, 50.0),
    ('Fan Installation', 'Ceiling fan installation', 400.00, 250.00, 1000.00, false, 5.0, 50.0),
    ('Light Installation', 'Light fixture installation', 300.00, 200.00, 800.00, false, 5.0, 50.0),
    ('Geyser Installation', 'Water geyser installation', 600.00, 400.00, 1500.00, false, 5.0, 50.0)
) AS v(name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km)
CROSS JOIN (SELECT id FROM service_categories WHERE name = 'Repair & Installation' LIMIT 1) cat;

-- Insert services for Vehicle Services
INSERT INTO services (category_id, name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km) 
SELECT 
    cat.id,
    v.name,
    v.description,
    v.base_price,
    v.min_price,
    v.max_price,
    v.is_fixed_location,
    v.min_radius_km,
    v.max_radius_km
FROM (VALUES
    ('Taxi/Car Rental', 'Taxi and car rental service', 500.00, 300.00, 5000.00, false, 10.0, 100.0),
    ('Driver on Demand', 'Professional driver service', 800.00, 500.00, 2000.00, false, 10.0, 100.0)
) AS v(name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km)
CROSS JOIN (SELECT id FROM service_categories WHERE name = 'Vehicle Services' LIMIT 1) cat;

-- Insert services for Personal & Family Care
INSERT INTO services (category_id, name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km) 
SELECT 
    cat.id,
    v.name,
    v.description,
    v.base_price,
    v.min_price,
    v.max_price,
    v.is_fixed_location,
    v.min_radius_km,
    v.max_radius_km
FROM (VALUES
    ('Child Care', 'Professional child care service', 1000.00, 600.00, 3000.00, false, 5.0, 50.0),
    ('Nursing/Medical Attendant', 'Medical attendant service', 1200.00, 800.00, 4000.00, false, 5.0, 50.0),
    ('Pet Care', 'Pet care and grooming', 500.00, 300.00, 1500.00, false, 5.0, 50.0),
    ('Home Tutor', 'Home tutoring service', 800.00, 500.00, 2000.00, false, 5.0, 50.0),
    ('Online Tutor', 'Online tutoring service', 600.00, 400.00, 1500.00, true, 0.0, 0.0)
) AS v(name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km)
CROSS JOIN (SELECT id FROM service_categories WHERE name = 'Personal & Family Care' LIMIT 1) cat;

-- Insert services for Infra & Home Improvement
INSERT INTO services (category_id, name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km) 
SELECT 
    cat.id,
    v.name,
    v.description,
    v.base_price,
    v.min_price,
    v.max_price,
    v.is_fixed_location,
    v.min_radius_km,
    v.max_radius_km
FROM (VALUES
    ('Mason', 'Masonry work', 800.00, 500.00, 3000.00, false, 5.0, 50.0),
    ('Painter', 'Painting service', 600.00, 400.00, 2000.00, false, 5.0, 50.0),
    ('Plumber', 'Plumbing service', 500.00, 300.00, 1500.00, false, 5.0, 50.0),
    ('Carpenter', 'Carpentry work', 700.00, 450.00, 2500.00, false, 5.0, 50.0),
    ('Interior Designer', 'Interior design consultation', 2000.00, 1000.00, 10000.00, false, 10.0, 100.0),
    ('Modular Kitchen', 'Modular kitchen installation', 5000.00, 3000.00, 50000.00, false, 10.0, 100.0),
    ('Contractor Support', 'General contractor services', 1000.00, 600.00, 5000.00, false, 10.0, 100.0)
) AS v(name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km)
CROSS JOIN (SELECT id FROM service_categories WHERE name = 'Infra & Home Improvement' LIMIT 1) cat;

-- Insert services for Food & Tiffin
INSERT INTO services (category_id, name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km) 
SELECT 
    cat.id,
    v.name,
    v.description,
    v.base_price,
    v.min_price,
    v.max_price,
    v.is_fixed_location,
    v.min_radius_km,
    v.max_radius_km
FROM (VALUES
    ('Tiffin Service', 'Daily tiffin service', 1500.00, 1000.00, 3000.00, false, 5.0, 50.0),
    ('Home-Cooked Meals', 'Home-cooked meal delivery', 200.00, 100.00, 500.00, false, 5.0, 50.0)
) AS v(name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km)
CROSS JOIN (SELECT id FROM service_categories WHERE name = 'Food & Tiffin' LIMIT 1) cat;

-- Insert services for Event & Planner
INSERT INTO services (category_id, name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km) 
SELECT 
    cat.id,
    v.name,
    v.description,
    v.base_price,
    v.min_price,
    v.max_price,
    v.is_fixed_location,
    v.min_radius_km,
    v.max_radius_km
FROM (VALUES
    ('Wedding Planner', 'Wedding planning service', 50000.00, 20000.00, 500000.00, false, 10.0, 100.0),
    ('Event Planner', 'Event planning service', 20000.00, 10000.00, 200000.00, false, 10.0, 100.0)
) AS v(name, description, base_price, min_price, max_price, is_fixed_location, min_radius_km, max_radius_km)
CROSS JOIN (SELECT id FROM service_categories WHERE name = 'Event & Planner' LIMIT 1) cat;

-- Insert some default cities
INSERT INTO cities (name, state, country, is_active) VALUES
('Mumbai', 'Maharashtra', 'India', true),
('Delhi', 'Delhi', 'India', true),
('Bangalore', 'Karnataka', 'India', true),
('Hyderabad', 'Telangana', 'India', true),
('Chennai', 'Tamil Nadu', 'India', true),
('Pune', 'Maharashtra', 'India', true),
('Kolkata', 'West Bengal', 'India', true),
('Ahmedabad', 'Gujarat', 'India', true);

-- Insert default admin settings
INSERT INTO admin_settings (key, value, description) VALUES
('cashback_percentage', '{"value": 5}', 'Default cashback percentage on bookings'),
('reward_points_per_booking', '{"value": 10}', 'Reward points per completed booking'),
('referral_reward', '{"user": 100, "provider": 200}', 'Referral reward amounts'),
('min_wallet_balance', '{"value": 0}', 'Minimum wallet balance'),
('max_wallet_balance', '{"value": 50000}', 'Maximum wallet balance'),
('provider_commission', '{"value": 15}', 'Platform commission percentage'),
('low_rating_threshold', '{"value": 2}', 'Rating threshold for suspension'),
('suspension_days', '{"value": 7}', 'Days of suspension for low ratings');

