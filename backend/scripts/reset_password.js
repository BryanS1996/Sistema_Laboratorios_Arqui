require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://lab:lab@postgres:5432/labdb'
});

async function resetPassword() {
    try {
        const email = 'docente1@uce.edu.ec';
        const newPassword = 'docente123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        console.log(`Resetting password for ${email}...`);

        const res = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
            [hash, email]
        );

        if (res.rowCount === 0) {
            console.log('User not found!');
        } else {
            console.log('Password updated successfully for:', res.rows[0].email);
            // Also explicitly set role to professor just in case
            await pool.query("UPDATE users SET role='professor' WHERE email=$1", [email]);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

resetPassword();
