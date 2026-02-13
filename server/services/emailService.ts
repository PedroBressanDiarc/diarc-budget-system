import sgMail from '@sendgrid/mail';

// Configurar SendGrid com API Key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('⚠️  SENDGRID_API_KEY não configurada. Emails não serão enviados.');
}

interface QuotationEmailData {
  supplierName: string;
  supplierEmail: string;
  requisitionId: number;
  requisitionDescription: string;
  quotationUrl: string;
  expiresAt: Date;
  itemsCount: number;
}

/**
 * Envia email de convite para cotação ao fornecedor
 */
export async function sendQuotationInviteEmail(data: QuotationEmailData): Promise<boolean> {
  // Se não tiver API Key, apenas loga no console (modo desenvolvimento)
  if (!SENDGRID_API_KEY) {
    console.log(`\n=== EMAIL DE COTAÇÃO (MODO SIMULADO) ===`);
    console.log(`Para: ${data.supplierEmail}`);
    console.log(`Fornecedor: ${data.supplierName}`);
    console.log(`Requisição: #${data.requisitionId} - ${data.requisitionDescription}`);
    console.log(`Link: ${data.quotationUrl}`);
    console.log(`Expira em: ${data.expiresAt.toLocaleDateString('pt-BR')}`);
    console.log(`=========================================\n`);
    return true;
  }

  try {
    const emailHtml = generateQuotationEmailTemplate(data);
    
    await sgMail.send({
      to: data.supplierEmail,
      from: {
        email: 'compras@diarc.com.br',
        name: 'Sistema de Compras Diarc'
      },
      replyTo: 'compras@diarc.com.br',
      subject: `Solicitação de Cotação - Requisição #${data.requisitionId}`,
      html: emailHtml,
      // Texto alternativo para clientes que não suportam HTML
      text: `
Olá ${data.supplierName},

Você foi convidado a enviar uma cotação para a Requisição #${data.requisitionId}.

Descrição: ${data.requisitionDescription}
Quantidade de itens: ${data.itemsCount}

Acesse o link abaixo para preencher sua cotação:
${data.quotationUrl}

Este link é válido até ${data.expiresAt.toLocaleDateString('pt-BR')} às ${data.expiresAt.toLocaleTimeString('pt-BR')}.

Caso tenha dúvidas, entre em contato através do email compras@diarc.com.br.

Atenciosamente,
Sistema de Compras Diarc
      `.trim(),
      // Categorias para organização no SendGrid
      categories: ['quotation-invite'],
      // Custom args para rastreamento
      customArgs: {
        requisitionId: data.requisitionId.toString(),
        supplierEmail: data.supplierEmail,
      },
    });

    console.log(`✅ Email enviado para ${data.supplierEmail} (Requisição #${data.requisitionId})`);
    return true;
  } catch (error: any) {
    console.error(`❌ Erro ao enviar email para ${data.supplierEmail}:`, error.message);
    
    // Se falhar, loga no console como fallback
    console.log(`\n=== EMAIL DE COTAÇÃO (FALLBACK - ERRO NO ENVIO) ===`);
    console.log(`Para: ${data.supplierEmail}`);
    console.log(`Link: ${data.quotationUrl}`);
    console.log(`====================================================\n`);
    
    return false;
  }
}

/**
 * Gera template HTML profissional para email de cotação
 */
function generateQuotationEmailTemplate(data: QuotationEmailData): string {
  const expirationDate = data.expiresAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitação de Cotação</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0066cc 0%, #004999 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Solicitação de Cotação
              </h1>
              <p style="margin: 10px 0 0 0; color: #e6f2ff; font-size: 16px;">
                Requisição #${data.requisitionId}
              </p>
            </td>
          </tr>
          
          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                Olá <strong>${data.supplierName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                Você foi convidado a enviar uma cotação para a seguinte requisição de compra:
              </p>
              
              <!-- Card de Informações -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                      <strong style="color: #333333;">Descrição:</strong><br>
                      ${data.requisitionDescription}
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666666;">
                      <strong style="color: #333333;">Quantidade de itens:</strong> ${data.itemsCount}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                Para preencher sua cotação, clique no botão abaixo:
              </p>
              
              <!-- Botão CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.quotationUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #0066cc; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,102,204,0.3);">
                      Preencher Cotação
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alerta de Expiração -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin: 30px 0;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">
                      ⏰ <strong>Atenção:</strong> Este link é válido até <strong>${expirationDate}</strong>.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 10px 0; font-size: 14px; color: #666666; line-height: 1.6;">
                Se você não conseguir clicar no botão acima, copie e cole o link abaixo no seu navegador:
              </p>
              
              <p style="margin: 0; padding: 15px; background-color: #f8f9fa; border-radius: 4px; font-size: 13px; color: #0066cc; word-break: break-all; font-family: monospace;">
                ${data.quotationUrl}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                Caso tenha dúvidas, entre em contato:
              </p>
              <p style="margin: 0; font-size: 14px; color: #0066cc;">
                <a href="mailto:compras@diarc.com.br" style="color: #0066cc; text-decoration: none;">
                  compras@diarc.com.br
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                © ${new Date().getFullYear()} Diarc - Sistema de Compras<br>
                Este é um email automático, por favor não responda.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Envia email de notificação ao comprador quando fornecedor submete cotação
 */
export async function sendQuotationSubmittedNotification(
  buyerEmail: string,
  supplierName: string,
  requisitionId: number
): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.log(`📧 Notificação: ${supplierName} enviou cotação para requisição #${requisitionId}`);
    return true;
  }

  try {
    await sgMail.send({
      to: buyerEmail,
      from: {
        email: 'compras@diarc.com.br',
        name: 'Sistema de Compras Diarc'
      },
      subject: `Nova Cotação Recebida - Requisição #${requisitionId}`,
      html: `
        <h2>Nova Cotação Recebida</h2>
        <p>O fornecedor <strong>${supplierName}</strong> enviou uma cotação para a Requisição #${requisitionId}.</p>
        <p><a href="${process.env.BASE_URL || 'http://localhost:5000'}/compras/${requisitionId}">Clique aqui para visualizar</a></p>
      `,
      categories: ['quotation-submitted'],
    });

    return true;
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return false;
  }
}
