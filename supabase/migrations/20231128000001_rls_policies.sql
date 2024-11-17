-- RLS Policies for multi-tenant security

-- Organizations policies
CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (id IN (
        SELECT organization_id FROM users
        WHERE auth.uid() = id
    ));

-- Users policies
CREATE POLICY "Users can view members of their organization"
    ON users FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE auth.uid() = id
    ));

CREATE POLICY "Organization admins can manage their users"
    ON users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth.uid() = id
            AND organization_id = users.organization_id
            AND role = 'admin'
        )
    );

-- Inventory policies
CREATE POLICY "Users can view their organization's inventory"
    ON inventory_items FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE auth.uid() = id
    ));

CREATE POLICY "Managers and admins can manage inventory"
    ON inventory_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth.uid() = id
            AND organization_id = inventory_items.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- Similar policies for inventory transactions
CREATE POLICY "Users can view their organization's transactions"
    ON inventory_transactions FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE auth.uid() = id
    ));

CREATE POLICY "Users can create transactions"
    ON inventory_transactions FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM users
        WHERE auth.uid() = id
    ));

-- Volunteer policies
CREATE POLICY "Users can view their organization's volunteers"
    ON volunteers FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE auth.uid() = id
    ));

CREATE POLICY "Managers and admins can manage volunteers"
    ON volunteers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth.uid() = id
            AND organization_id = volunteers.organization_id
            AND role IN ('admin', 'manager')
        )
    );

-- Client policies
CREATE POLICY "Users can view their organization's clients"
    ON clients FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE auth.uid() = id
    ));

CREATE POLICY "Users can create and update clients"
    ON clients FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE auth.uid() = id
    ));

-- Client visits policies
CREATE POLICY "Users can view their organization's client visits"
    ON client_visits FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE auth.uid() = id
    ));

CREATE POLICY "Users can create client visits"
    ON client_visits FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM users
        WHERE auth.uid() = id
    ));
