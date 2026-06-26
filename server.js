const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const smtpConfigured = process.env.SMTP_PASS && !process.env.SMTP_PASS.includes('INGRESA');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function buildWelcomeEmailHtml(email) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#F5EDE0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5EDE0;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(44,24,16,0.12);">
        <tr><td style="background:linear-gradient(135deg,#2C1810,#7A4A2E);padding:30px 40px;text-align:center;">
          <div style="font-size:40px;color:#C9A96E;">&#x1F9ED;</div>
          <h1 style="margin:0;font-size:26px;color:#C9A96E;">ADVENTOUR</h1>
          <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.7);letter-spacing:3px;">Bienvenido a la comunidad</p>
        </td></tr>
        <tr><td style="padding:35px 40px;">
          <p style="font-size:16px;color:#5C4033;">Hola <strong>${email}</strong>,</p>
          <p style="font-size:16px;color:#5C4033;">&iexcl;Gracias por suscribirte a <strong>Adventour</strong>!</p>
          <p style="font-size:15px;color:#5C4033;">Descubre los destinos m&aacute;s incre&iacute;bles de Colombia. Desde ahora recibir&aacute;s info sobre:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;border-radius:12px;border:1px solid #E8DCC8;">
            <tr><td style="padding:16px 28px;">
              <p style="margin:5px 0;font-size:14px;color:#2C1810;">&#x1F3D6;&#xFE0F; <strong>Cartagena</strong> &mdash; Ciudad amurallada y playas del Caribe</p>
              <p style="margin:5px 0;font-size:14px;color:#2C1810;">&#x26FA; <strong>San Andr&eacute;s</strong> &mdash; Mar de 7 colores y arena blanca</p>
              <p style="margin:5px 0;font-size:14px;color:#2C1810;">&#x1F33F; <strong>Eje Cafetero</strong> &mdash; Monta&ntilde;as verdes y caf&eacute; de clase mundial</p>
              <p style="margin:5px 0;font-size:14px;color:#2C1810;">&#x1F3F0; <strong>Santa Marta</strong> &mdash; Tayrona, Ciudad Perdida y naturaleza</p>
              <p style="margin:5px 0;font-size:14px;color:#2C1810;">&#x1F4C5; <strong>Bogot&aacute;</strong> &mdash; Museo del Oro, Monserrate y cultura</p>
              <p style="margin:5px 0;font-size:14px;color:#2C1810;">&#x1F3AA; <strong>Guatap&eacute;</strong> &mdash; El Pe&ntilde;&oacute;n y calles llenas de color</p>
              <p style="margin:5px 0;font-size:14px;color:#2C1810;">&#x26EA; <strong>Zipaquir&aacute;</strong> &mdash; Catedral de Sal y Museo Monumental 180</p>
              <p style="margin:5px 0;font-size:14px;color:#2C1810;">&#x1F3F8; <strong>San Agust&iacute;n</strong> &mdash; Estatuas precolombinas Patrimonio UNESCO</p>
            </td></tr>
          </table>
          <p style="font-size:15px;color:#5C4033;margin-top:18px;">Prep&aacute;rate para vivir experiencias inolvidables con nosotros.</p>
        </td></tr>
        <tr><td style="padding:0 40px 25px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF6EE;border-radius:12px;border:1px solid #E8DCC8;">
            <tr><td style="padding:18px 25px;text-align:center;">
              <p style="margin:0 0 10px;font-size:14px;color:#5C4033;">&iquest;Quieres explorar nuestros destinos?</p>
              <a href="https://migueartun.github.io/Adventour" style="display:inline-block;background:#7A4A2E;color:#FFF8F0;text-decoration:none;padding:12px 32px;border-radius:50px;font-weight:600;font-size:14px;">&#x1F310; Ver p&aacute;gina de turismo</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background-color:#2C1810;padding:30px 40px;text-align:center;">
          <p style="margin:0 0 4px;font-size:14px;color:rgba(255,255,255,0.5);">Atentamente,</p>
          <p style="margin:0 0 10px;font-size:16px;color:#C9A96E;font-weight:700;">Equipo Adventour</p>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);">&copy; 2026 Adventour &mdash; Todos los derechos reservados</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildEmailHtml({ nombre, email, destino, mensaje, fecha }) {
  const date = new Date(fecha).toLocaleString('es-CO', {
    timeZone: 'America/Bogota', dateStyle: 'long', timeStyle: 'short'
  });
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F5EDE0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5EDE0;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(44,24,16,0.12);">
        <tr>
          <td style="background:linear-gradient(135deg,#2C1810 0%,#7A4A2E 100%);padding:30px 40px;text-align:center;">
            <div style="font-size:40px;color:#C9A96E;margin-bottom:6px;">&#x1F9ED;</div>
            <h1 style="margin:0;font-size:26px;font-weight:700;color:#C9A96E;letter-spacing:1px;">ADVENTOUR</h1>
            <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.7);letter-spacing:3px;text-transform:uppercase;">Nueva solicitud de contacto</p>
          </td>
        </tr>
        <tr><td style="padding:35px 40px 20px;">
          <p style="font-size:15px;color:#5C4033;margin:0 0 20px;line-height:1.6;">
            Se ha recibido una nueva solicitud a trav&eacute;s del formulario de contacto de <strong>Adventour</strong>.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;border-radius:12px;border:1px solid #E8DCC8;">
            <tr><td style="padding:25px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;border-bottom:1px solid #E8DCC8;">
                  <span style="font-size:12px;color:#8B7355;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Nombre</span>
                  <p style="margin:4px 0 0;font-size:16px;color:#2C1810;font-weight:600;">${nombre}</p>
                </td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E8DCC8;">
                  <span style="font-size:12px;color:#8B7355;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Correo electr&oacute;nico</span>
                  <p style="margin:4px 0 0;font-size:16px;color:#2C1810;"><a href="mailto:${email}" style="color:#7A4A2E;text-decoration:none;">${email}</a></p>
                </td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #E8DCC8;">
                  <span style="font-size:12px;color:#8B7355;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Destino de inter&eacute;s</span>
                  <p style="margin:4px 0 0;font-size:16px;color:#2C1810;font-weight:600;">${destino}</p>
                </td></tr>
                <tr><td style="padding:8px 0;">
                  <span style="font-size:12px;color:#8B7355;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Mensaje</span>
                  <p style="margin:8px 0 0;font-size:15px;color:#2C1810;line-height:1.6;font-style:italic;">&ldquo;${mensaje}&rdquo;</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 40px 25px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF6EE;border-radius:12px;border:1px solid #E8DCC8;">
            <tr><td style="padding:18px 25px;text-align:center;">
              <span style="font-size:12px;color:#8B7355;text-transform:uppercase;letter-spacing:1px;">Recibido el</span>
              <p style="margin:4px 0 0;font-size:14px;color:#7A4A2E;font-weight:600;">${date}</p>
            </td></tr>
          </table>
        </td></tr>
        <tr>
          <td style="background-color:#2C1810;padding:30px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.5);">
              &copy; 2026 Adventour &mdash; Todos los derechos reservados
            </p>
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);">
              Cra 45 # 12-34 &bull; Bogot&aacute;, Colombia &bull; +57 (601) 234 5678
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

app.post('/api/contact', async (req, res) => {
  const { nombre, email, destino, mensaje, fecha } = req.body;
  console.log('Nuevo contacto:', { nombre, email, destino, mensaje });

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
  }

  if (!smtpConfigured) {
    console.log('Contacto recibido (SMTP no configurado):', { nombre, email, destino });
    return res.json({ success: true, message: 'Mensaje recibido correctamente' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const html = buildEmailHtml({ nombre, email, destino, mensaje, fecha });

    await transporter.sendMail({
      from: `"Adventour" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.SMTP_TO || process.env.SMTP_USER,
      replyTo: email,
      subject: `Nuevo contacto — ${nombre} está interesado en ${destino || 'varios destinos'}`,
      html
    });

    res.json({ success: true, message: 'Mensaje recibido y enviado correctamente' });
  } catch (err) {
    console.error('Error al enviar email:', err.message);
    res.status(500).json({ success: false, message: 'Error al enviar el mensaje. Intenta de nuevo.' });
  }
});

// Almacén simple de suscriptores (en producción usa BD)
const subscribers = new Set();

app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Correo inválido' });
  }

  if (subscribers.has(email)) {
    return res.json({ success: false, message: 'Ya estás suscrito' });
  }
  subscribers.add(email);
  console.log('Nuevo suscriptor:', email);

  if (smtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });

      await transporter.sendMail({
        from: `"Adventour" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: '¡Bienvenido a Adventour! Descubre Colombia con nosotros',
        html: buildWelcomeEmailHtml(email)
      });
    } catch (err) {
      console.error('Error al enviar bienvenida:', err.message);
    }
  }

  res.json({ success: true, message: '¡Gracias por suscribirte! Revisa tu correo para más información.' });
});

app.listen(PORT, () => {
  console.log(`Adventour corriendo en http://localhost:${PORT}`);
  if (smtpConfigured) {
    console.log(`Correo SMTP configurado → ${process.env.SMTP_TO}`);
  } else {
    console.log('SMTP no configurado. Edita .env con tus credenciales de Gmail (app password) para activar el envío de correos.');
  }
});
