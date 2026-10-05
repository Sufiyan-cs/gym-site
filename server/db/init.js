const { initDb, exec, run, queryOne } = require('./connection');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const schemaPath = path.join(__dirname, 'schema.sql');

async function initialize() {
    console.log('Initializing database...');
    await initDb();
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    exec(schema);

    // ALTER TABLE to add new columns if they don't exist
    try { run("ALTER TABLE users ADD COLUMN weight TEXT;"); } catch (e) {}
    try { run("ALTER TABLE users ADD COLUMN height TEXT;"); } catch (e) {}
    try { run("ALTER TABLE users ADD COLUMN goal TEXT;"); } catch (e) {}
    try { run("ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0;"); } catch (e) {}
    try { run("ALTER TABLE users ADD COLUMN social_links TEXT;"); } catch (e) {}
    try { run("ALTER TABLE users ADD COLUMN target_weight TEXT;"); } catch (e) {}
    try { run("ALTER TABLE users ADD COLUMN preferred_slot TEXT;"); } catch (e) {}
    try { run("ALTER TABLE users ADD COLUMN custom_split TEXT;"); } catch (e) {}
    
    console.log('Seeding initial data...');
    
    const seedAdmins = () => {
        const defaultPassword = bcrypt.hashSync('admin123', 10);
        run(`
          INSERT OR IGNORE INTO users (name, phone, password_hash, role)
          VALUES (?, ?, ?, ?)
        `, ['Azhar Mohammed', '9591739969', defaultPassword, 'admin']);
        run(`
          INSERT OR IGNORE INTO users (name, phone, password_hash, role)
          VALUES (?, ?, ?, ?)
        `, ['Syed Tabrez', '9999999999', defaultPassword, 'admin']);
    };
    
    seedAdmins();
    
    const countSupp = queryOne("SELECT COUNT(*) as count FROM supplements");
    if (countSupp && countSupp.count === 0) {
        run(`
            INSERT INTO supplements (name, description, price, in_stock)
            VALUES (?, ?, ?, ?)
        `, ['Whey Protein Isolate', 'Premium 100% Whey Isolate 2kg', 6500, 1]);
        run(`
            INSERT INTO supplements (name, description, price, in_stock)
            VALUES (?, ?, ?, ?)
        `, ['Creatine Monohydrate', 'Micronized Creatine 250g', 1200, 1]);
        run(`
            INSERT INTO supplements (name, description, price, in_stock)
            VALUES (?, ?, ?, ?)
        `, ['Pre-Workout Blend', 'Explosive energy formula', 2200, 1]);
    }
    
    const countPt = queryOne("SELECT COUNT(*) as count FROM pt_packages");
    if (countPt && countPt.count === 0) {
        run(`
            INSERT INTO pt_packages (name, sessions, price, description)
            VALUES (?, ?, ?, ?)
        `, ['Bronze PT', 12, 5000, '12 sessions per month']);
        run(`
            INSERT INTO pt_packages (name, sessions, price, description)
            VALUES (?, ?, ?, ?)
        `, ['Silver PT', 24, 9000, '24 sessions across 2 months']);
        run(`
            INSERT INTO pt_packages (name, sessions, price, description)
            VALUES (?, ?, ?, ?)
        `, ['Gold PT', 36, 12000, '36 sessions across 3 months']);
    }
    
    console.log('Database initialization complete.');
}

initialize().catch(err => {
    console.error(err);
    process.exit(1);
});
