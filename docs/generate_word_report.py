import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

doc = docx.Document()

# Configuración de márgenes
for section in doc.sections:
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)

# Paleta de Colores VOX
COLOR_PRIMARY = RGBColor(255, 106, 0)     # VOX Orange #FF6A00
COLOR_DARK = RGBColor(22, 26, 31)         # VOX Dark #161A1F
COLOR_MUTED = RGBColor(100, 110, 125)     # Slate Muted #646E7D
COLOR_SUCCESS = RGBColor(39, 174, 96)     # Verde Éxito #27AE60
COLOR_WHITE = RGBColor(255, 255, 255)

def set_cell_background(cell, fill_hex):
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

# 1. Banner Principal de Título
header_table = doc.add_table(rows=1, cols=1)
header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
header_cell = header_table.cell(0, 0)
set_cell_background(header_cell, '161A1F')
set_cell_margins(header_cell, top=200, bottom=200, left=250, right=250)

h_p = header_cell.paragraphs[0]
h_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
h_run1 = h_p.add_run('VOX BUSINESS DEVELOPER\n')
h_run1.font.name = 'Segoe UI'
h_run1.font.size = Pt(20)
h_run1.font.bold = True
h_run1.font.color.rgb = COLOR_WHITE

h_run2 = h_p.add_run('INFORME TÉCNICO DE ACTUALIZACIÓN & GUÍA DE CLAVES API')
h_run2.font.name = 'Segoe UI'
h_run2.font.size = Pt(13)
h_run2.font.bold = True
h_run2.font.color.rgb = COLOR_PRIMARY

doc.add_paragraph() # Espacio

# Metadatos del Documento
meta_p = doc.add_paragraph()
meta_p.paragraph_format.space_after = Pt(12)
r = meta_p.add_run('Proyecto: ')
r.font.bold = True
r.font.color.rgb = COLOR_DARK
meta_p.add_run('voxiabusinessdeveloper/voxbusinessdeveloper   |   ')
r2 = meta_p.add_run('Rama: ')
r2.font.bold = True
r2.font.color.rgb = COLOR_DARK
meta_p.add_run('main   |   ')
r3 = meta_p.add_run('Estado: ')
r3.font.bold = True
r3.font.color.rgb = COLOR_DARK
r3_val = meta_p.add_run('Desplegado y Validado')
r3_val.font.bold = True
r3_val.font.color.rgb = COLOR_SUCCESS

# Sección 1: Resumen Ejecutivo
h1 = doc.add_heading('1. Resumen de la Última Actualización', level=1)
h1.runs[0].font.name = 'Segoe UI'
h1.runs[0].font.color.rgb = COLOR_DARK

p1 = doc.add_paragraph()
p1.add_run('Se corrigieron y optimizaron directamente en la rama ').font.size = Pt(10.5)
p1.add_run('main').bold = True
p1.add_run(' los módulos de captura de clientes potenciales, la pasarela de creación de créditos y el registro de pagos, garantizando que el sistema no presente falsos positivos y proteja la integridad de los datos.')

points = [
    ('Procesamiento Seguro de Leads (/api/leads)', 'Si la inserción en Supabase falla o no hay conexión, el servidor retorna código 502 Bad Gateway y bajo ninguna circunstancia devuelve éxito falso. Los correos de notificación solo se envían tras asegurar el registro en la base de datos.'),
    ('Correo Electrónico Estrictamente Obligatorio', 'Se definió la obligatoriedad del campo de correo electrónico con validación de sintaxis regex. Envíos incompletos se rechazan con código 400 Bad Request.'),
    ('Anti-Spam Inteligente y sin Fricción', 'Se eliminó la validación casera de tokens. El formulario funciona de inmediato y está blindado con Honeypot invisible + Rate Limiting por IP (máximo 5 solicitudes/minuto). No requiere que los usuarios resuelvan molestos captchas.'),
    ('Creación de Créditos Web (admin/dashboard.js)', 'Al generar un crédito a plazos, el sistema exige confirmación positiva de Supabase. Si la inserción falla, muestra el error, no guarda nada ficticio localmente y mantiene el formulario abierto e intacto.'),
    ('Registro de Pagos Blindado (admin/dashboard.js)', 'Se validan tanto la inserción en el historial de pagos como la actualización del estado del crédito antes de marcar visualmente el pago como confirmado en la interfaz.'),
    ('Experiencia de Usuario en Formularios (script.js y servicio.js)', 'Los formularios de la landing page y servicios solo cambian a la tarjeta de éxito tras confirmación efectiva del servidor; ante cualquier error, informan al visitante y le permiten reintentar o pulsar el botón de WhatsApp directo.')
]

for title, desc in points:
    bp = doc.add_paragraph(style='List Bullet')
    bp.paragraph_format.space_after = Pt(4)
    run_t = bp.add_run(f'{title}: ')
    run_t.bold = True
    run_t.font.name = 'Segoe UI'
    run_t.font.color.rgb = COLOR_DARK
    run_d = bp.add_run(desc)
    run_d.font.name = 'Segoe UI'
    run_d.font.size = Pt(10)

doc.add_paragraph()

# Sección 2: Estado de las Claves API y Variables de Entorno
h2 = doc.add_heading('2. Estado de Claves API y Variables de Entorno', level=1)
h2.runs[0].font.name = 'Segoe UI'
h2.runs[0].font.color.rgb = COLOR_DARK

p2 = doc.add_paragraph()
p2.add_run('Dado que ya cuentas con ').font.size = Pt(10.5)
p2.add_run('SUPABASE_URL').bold = True
p2.add_run(' y ').font.size = Pt(10.5)
p2.add_run('SUPABASE_SERVICE_ROLE_KEY').bold = True
p2.add_run(' en línea, el núcleo del sistema se encuentra 100% operativo. La siguiente tabla resume las credenciales configuradas y las variables opcionales:')

# Tabla de Variables
table = doc.add_table(rows=1, cols=4)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
hdr_cells = table.rows[0].cells
headers = ['Variable de Entorno', 'Estado Actual', 'Propósito / Servicio', '¿Es Obligatoria?']

for i, h in enumerate(headers):
    hdr_cells[i].text = h
    set_cell_background(hdr_cells[i], '161A1F')
    set_cell_margins(hdr_cells[i], top=120, bottom=120, left=100, right=100)
    hdr_cells[i].paragraphs[0].runs[0].font.bold = True
    hdr_cells[i].paragraphs[0].runs[0].font.color.rgb = COLOR_WHITE
    hdr_cells[i].paragraphs[0].runs[0].font.size = Pt(9.5)

rows_data = [
    ('SUPABASE_URL', 'EN LÍNEA (Configurada)', 'Dirección del proyecto Supabase.', 'SÍ (Activo)'),
    ('SUPABASE_SERVICE_ROLE_KEY', 'EN LÍNEA (Configurada)', 'Llave maestra para inserción de leads y administración de créditos.', 'SÍ (Activo)'),
    ('RESEND_API_KEY', 'Opcional / Pendiente', 'Envío de correos estilizados en HTML para nuevos leads.', 'NO (Fallback a FormSubmit)'),
    ('NOTIFICATION_EMAIL', 'Opcional (Por defecto lista)', 'Correo receptor de prospectos (vox.iabusinessdeveloper@gmail.com).', 'NO (Tiene valor por defecto)'),
    ('TURNSTILE_SECRET_KEY', 'Opcional (No configurada)', 'Clave secreta de Cloudflare Turnstile si a futuro se desea activar.', 'NO (No es requerida)'),
    ('RECAPTCHA_SECRET_KEY', 'Opcional (No configurada)', 'Clave secreta de Google reCAPTCHA alternativa.', 'NO (No es requerida)'),
    ('REQUIRE_ANTISPAM_VERIFICATION', 'Desactivada (Recomendado)', 'Forzar rechazo de envíos si no hay captcha de proveedor.', 'NO (Mantener en false)')
]

for var_name, estado, prop, oblig in rows_data:
    row = table.add_row()
    cells = row.cells
    for i, txt in enumerate([var_name, estado, prop, oblig]):
        cells[i].text = txt
        set_cell_margins(cells[i], top=100, bottom=100, left=100, right=100)
        p = cells[i].paragraphs[0]
        p.runs[0].font.size = Pt(9)
        p.runs[0].font.name = 'Segoe UI'
        if i == 0:
            p.runs[0].font.bold = True
            set_cell_background(cells[i], 'F8F9FA')
        elif i == 1 and 'EN LÍNEA' in txt:
            p.runs[0].font.bold = True
            p.runs[0].font.color.rgb = COLOR_SUCCESS
            set_cell_background(cells[i], 'E8F8F0')
        elif i == 1 and 'Opcional' in txt:
            p.runs[0].font.color.rgb = COLOR_MUTED
            set_cell_background(cells[i], 'FDFEFE')
        elif i == 3 and 'SÍ' in txt:
            p.runs[0].font.bold = True
            p.runs[0].font.color.rgb = COLOR_DARK

doc.add_paragraph()

# Sección 3: Aclaración sobre el Anti-Spam
h3 = doc.add_heading('3. Aclaración: ¿Es obligatorio configurar el Anti-Spam?', level=1)
h3.runs[0].font.name = 'Segoe UI'
h3.runs[0].font.color.rgb = COLOR_DARK

info_table = doc.add_table(rows=1, cols=1)
info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
info_cell = info_table.cell(0, 0)
set_cell_background(info_cell, 'FFF5EB')
set_cell_margins(info_cell, top=140, bottom=140, left=180, right=180)

ip = info_cell.paragraphs[0]
ir1 = ip.add_run('RESPUESTA: NO ES OBLIGATORIO (NO ES "A JURO").\n\n')
ir1.font.bold = True
ir1.font.size = Pt(11)
ir1.font.color.rgb = COLOR_PRIMARY

ir2 = ip.add_run('Tu página web funciona al 100% de inmediato sin necesidad de contratar ni configurar proveedores de captcha externos. El sistema protege tus formularios de forma transparente mediante:\n\n'
'• Honeypot Invisible: Campo trampa oculto que los bots llenan pero los clientes humanos no ven.\n'
'• Rate Limiting por IP: Máximo 5 solicitudes por minuto por usuario para evitar ataques de spam masivo.\n'
'• Sanitización y Validación de Correo: Limpia caracteres maliciosos y verifica formato de email.\n\n'
'Solo si en el futuro deseas agregar Cloudflare Turnstile o Google reCAPTCHA, bastará con añadir la variable correspondiente en Vercel sin tocar el código fuente.')
ir2.font.size = Pt(9.5)
ir2.font.color.rgb = COLOR_DARK

doc.add_paragraph()

# Sección 4: Archivos Modificados
h4 = doc.add_heading('4. Archivos Modificados y Validados en el Repositorio', level=1)
h4.runs[0].font.name = 'Segoe UI'
h4.runs[0].font.color.rgb = COLOR_DARK

files_list = [
    ('api/leads.js', 'Serverless Function para procesamiento de leads, rate limiting, validación estricta de correo e inserción obligatoria en Supabase.'),
    ('admin/dashboard.js', 'Lógica del CRM; verificación de respuestas de Supabase antes de crear créditos o confirmar pagos.'),
    ('assets/js/lead-service.js', 'Servicio cliente de leads con soporte de captchas reales y propagación de errores hacia la interfaz.'),
    ('script.js', 'Manejador del formulario principal de la landing page con feedback de error y protección.'),
    ('servicio.js', 'Manejador de los modales de contacto por servicio individual.'),
    ('.gitignore', 'Protección de seguridad para archivos .env y credenciales locales.')
]

for fname, fdesc in files_list:
    fp = doc.add_paragraph(style='List Bullet')
    fp.paragraph_format.space_after = Pt(3)
    r_fn = fp.add_run(f'{fname}: ')
    r_fn.bold = True
    r_fn.font.name = 'Consolas'
    r_fn.font.size = Pt(9.5)
    r_fn.font.color.rgb = COLOR_PRIMARY
    r_fd = fp.add_run(fdesc)
    r_fd.font.name = 'Segoe UI'
    r_fd.font.size = Pt(9.5)

# Guardar en raíz del workspace y en carpeta docs
output_path1 = r'c:\Users\USUARIO\Desktop\Pagina web VOX\Actualizacion_Produccion_VOX.docx'
output_path2 = r'c:\Users\USUARIO\Desktop\Pagina web VOX\docs\Actualizacion_Produccion_VOX.docx'

os.makedirs(os.path.dirname(output_path2), exist_ok=True)
doc.save(output_path1)
doc.save(output_path2)
print(f'Documentos Word generados con exito en:\n- {output_path1}\n- {output_path2}')
