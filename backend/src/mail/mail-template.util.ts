import * as fs from 'fs';
import * as path from 'path';

const templatesDir = path.join(__dirname, 'templates');

function replaceVars(html: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value ?? ''),
    html,
  );
}

function readTemplate(relativePath: string): string {
  const filePath = path.join(templatesDir, relativePath);
  return fs.readFileSync(filePath, 'utf8');
}

export function renderFragment(
  fragmentName: string,
  vars: Record<string, string>,
): string {
  return replaceVars(readTemplate(`fragments/${fragmentName}.html`), vars);
}

export function renderEmail(
  fragmentName: string,
  vars: Record<string, string>,
): string {
  const bodyContent = renderFragment(fragmentName, vars);
  const ctaSection =
    vars.ctaLabel && vars.ctaUrl
      ? `<div style="text-align:center;margin-top:28px">
           <a href="${vars.ctaUrl}" style="display:inline-block;background:#00b5b8;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">${vars.ctaLabel}</a>
         </div>`
      : '';

  return replaceVars(readTemplate('base.html'), {
    title: vars.title ?? 'Vill Shop',
    preheader: vars.preheader ?? vars.headline ?? 'Vill Shop notification',
    eyebrow: vars.eyebrow ?? 'Vill Shop',
    headline: vars.headline ?? '',
    bodyContent,
    ctaSection,
    year: String(new Date().getFullYear()),
    supportEmail: process.env.ADMIN_EMAIL ?? process.env.EMAIL_FROM_ADDRESS ?? 'support@villshop.com',
  });
}

export function buildOrderItemsRows(
  items: Array<{
    productName: string;
    variantName?: string | null;
    quantity: number;
    priceDisplay: number | string;
    currency: string;
  }>,
): string {
  return items
    .map(
      (item) => `<tr>
        <td style="padding:12px;border-bottom:1px solid #eef2f7;color:#334155;font-size:14px">${item.productName}${item.variantName ? ` <span style="color:#64748b">(${item.variantName})</span>` : ''}</td>
        <td style="padding:12px;border-bottom:1px solid #eef2f7;text-align:center;color:#334155;font-size:14px">${item.quantity}</td>
        <td style="padding:12px;border-bottom:1px solid #eef2f7;text-align:right;color:#334155;font-size:14px">${item.currency} ${Number(item.priceDisplay).toFixed(2)}</td>
      </tr>`,
    )
    .join('');
}

export function formatMoney(amount: number | string, currency: string): string {
  return `${currency} ${Number(amount).toFixed(2)}`;
}
