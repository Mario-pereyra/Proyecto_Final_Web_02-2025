const userRepository = require("../repositories/userRepository");
const authRepository = require("../repositories/authRepository");
const nodemailer = require("../utils/nodemailer");
const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un usuario con este email",
      });
    }

    // Crear usuario
    const newUser = await userRepository.createUser(fullName, email, password);

    // Generar y guardar token de verificación

    const verificationToken = generateVerificationToken();
    await authRepository.saveVerificationToken(newUser.id, verificationToken);

    // Enviar código de verificación por email ANTES de la respuesta
    const emailEnviado = await nodemailer.enviarCodigoVerificacion(
      newUser.full_name,
      newUser.email,
      verificationToken
    );

    if (!emailEnviado) {
      // Si falla el email, eliminar el usuario creado
      await userRepository.deleteUser(newUser.id);
      return res.status(500).json({
        success: false,
        message:
          "Error al enviar el código de verificación. Por favor, intenta nuevamente.",
      });
    }

    console.log(`Código de verificación enviado a ${newUser.email}`);

    // Enviar respuesta de éxito
    res.status(201).json({
      success: true,
      message: `Usuario registrado exitosamente. Por favor, verifica tu email. Se te ha enviado un código de verificación para activar tu cuenta.`,
      data: {
        userId: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        verificationToken: verificationToken,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validaciones
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email y contraseña son obligatorios" });
  }

  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "El formato del email no es válido" });
  }

  try {
    // Obtener usuario por email
    const user = await userRepository.getUserByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales inválidas" });
    }

    // Verificar contraseña (usando el campo password de la BD)
    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales inválidas" });
    }

    // Verificar si el usuario está activo
    if (user.status !== "activo") {
      // Generar token incluso para cuenta inactiva (sesión parcial)
      const sessionToken = generateVerificationToken();
      
      return res.status(403).json({
        success: false,
        statusCode: "CUENTA_INACTIVA",
        message: "Tu cuenta no está activa. Por favor verifica tu email.",
        data: {
          email: user.email,
          status: user.status,
          user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            role: user.role,
            status: user.status,
          },
          token: sessionToken,
        }
      });
    }

    // Generar token de sesión simple (en producción usar JWT)
    const sessionToken = generateVerificationToken();

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        token: sessionToken, // En producción esto debería ser un JWT válido
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

const verifyEmail = async (req, res) => {
  const { email, token } = req.body;

  // Validaciones
  if (!email || !token) {
    return res.status(400).json({
      success: false,
      message: "Email y token son obligatorios",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "El formato del email no es válido",
    });
  }

  try {
    // Verificar token
    const tokenData = await authRepository.verifyToken(token);

    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }

    // Verificar que el token pertenezca al usuario correcto
    if (tokenData.email !== email) {
      return res.status(400).json({
        success: false,
        message: "El token no corresponde a este email",
      });
    }

    // Marcar token como usado
    await authRepository.markTokenAsUsed(tokenData.id);

    // Activar usuario
    const activatedUser = await authRepository.activateUser(tokenData.user_id);

    res.status(200).json({
      success: true,
      message: "Email verificado exitosamente. Tu cuenta ha sido activada.",
      data: {
        user: {
          id: activatedUser.id,
          fullName: activatedUser.full_name,
          email: activatedUser.email,
          role: activatedUser.role,
          status: activatedUser.status,
        },
      },
    });
  } catch (error) {
    console.error("Error en verificación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  // Validaciones
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email es obligatorio",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "El formato del email no es válido",
    });
  }

  try {
    // Obtener usuario por email
    const user = await userRepository.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No existe un usuario con este email",
      });
    }

    // Invalidar tokens anteriores
    await authRepository.invalidateUserTokens(user.id);

    // Generar nuevo token
    const newToken = generateVerificationToken();
    await authRepository.saveVerificationToken(user.id, newToken);

    res.status(200).json({
      success: true,
      message: "Se ha enviado un nuevo código de verificación a tu email",
      data: {
        verificationToken: newToken, // En desarrollo, en producción esto debería enviarse por email
      },
    });
  } catch (error) {
    console.error("Error al reenviar código:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
// Función para generar token de 5 dígitos (según estructura de la BD)
const generateVerificationToken = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Función para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para validar contraseña
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationCode,
  generateVerificationToken, // Exportado para testing o uso interno
};
