const nodemailer = require("nodemailer");

// Configura el transporter de Mailtrap (usa tus credenciales)
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "3d83f207de93c6",
    pass: "ff926f89cde5c8",
  },
});

exports.enviarCodigoVerificacion = async (nombre, email, codigo) => {
  try {
    const info = await transporter.sendMail({
      from: '"Impulsa.me" <no-reply@impulsa.me>',
      to: `${nombre} <${email}>`,
      subject: "Tu código de verificación - Impulsa.me",
      text: `Hola ${nombre},

Gracias por registrarte en Impulsa.me. 

Tu código de verificación es: ${codigo}

Este código expira en 2 minutos. Úsalo en la sección "Verificar mi cuenta" para completar tu registro.

Si no solicitaste este código, ignora este mensaje.

--
El equipo de Impulsa.me`,
    });

    console.log(`✅ Código enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar:", error);
    return false;
  }
}


module.exports = {
  enviarCodigoVerificacion,
};