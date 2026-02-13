const aws = require('aws-sdk');

/**
 * Configuración de Backblaze B2 Compatible con S3
 * 
 * Usa aws-sdk con endpoints compatibles con S3 para conectarse a Backblaze B2
 * 
 * ⚠️  SEGURIDAD: Falla rápidamente si faltan las credenciales
 */

let b2S3 = null;
let bucketName = null;

function initializeB2() {
    // Verificar si las credenciales de B2 están configuradas
    const hasCredentials =
        process.env.B2_KEY_ID &&
        process.env.B2_APPLICATION_KEY &&
        process.env.B2_BUCKET_NAME;

    if (!hasCredentials) {
        console.warn('⚠️  Credenciales de Backblaze B2 no configuradas - las cargas de archivos estarán deshabilitadas');
        console.warn('   Establece B2_KEY_ID, B2_APPLICATION_KEY y B2_BUCKET_NAME en .env para habilitar');
        return;
    }

    try {
        // Configurar cliente S3 para Backblaze B2
        b2S3 = new aws.S3({
            endpoint: `https://s3.${process.env.B2_REGION || 'us-west-004'}.backblazeb2.com`,
            accessKeyId: process.env.B2_KEY_ID,
            secretAccessKey: process.env.B2_APPLICATION_KEY,
            s3ForcePathStyle: true,
            signatureVersion: 'v4'
        });

        bucketName = process.env.B2_BUCKET_NAME;

        console.log('✅ Backblaze B2 inicializado exitosamente');
        console.log(`   Bucket: ${bucketName}`);
    } catch (error) {
        console.error('❌ Error al inicializar Backblaze B2:', error.message);
        b2S3 = null;
        bucketName = null;
    }
}

// NOTA: Backblaze B2 deshabilitado - no se usa en este proyecto
// Si se necesita en el futuro, descomentar la siguiente línea:
// initializeB2();

/**
 * Verificar si B2 está disponible
 */
function isB2Available() {
    return b2S3 !== null;
}

/**
 * Obtener cliente B2 (lanza error si no está configurado)
 */
function getB2Client() {
    if (!b2S3) {
        throw new Error('Backblaze B2 no está configurado. Por favor establece B2_KEY_ID, B2_APPLICATION_KEY y B2_BUCKET_NAME en .env');
    }
    return b2S3;
}

/**
 * Obtener nombre del bucket (lanza error si no está configurado)
 */
function getBucketName() {
    if (!bucketName) {
        throw new Error('El nombre del bucket de Backblaze B2 no está configurado');
    }
    return bucketName;
}

// Exportar con destructuring seguro
module.exports = {
    b2S3,           // Puede ser null si no está configurado
    bucketName,     // Puede ser null si no está configurado
    isB2Available,  // Verificar antes de usar
    getB2Client,    // Lanza error si no está configurado
    getBucketName   // Lanza error si no está configurado
};
