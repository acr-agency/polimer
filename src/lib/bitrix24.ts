// lib/bitrix24.ts

export const BITRIX_CONFIG = {
  // Вебхук URL из PHP примера (замени звездочки на реальный ключ)
  webhookUrl: process.env.BITRIX24_WEBHOOK_URL,
  responsibleUserId: 21,
  sourceId: 'WEB', // Код источника "Веб-сайт"
  sourceDescription: 'Веб-сайт 73полимер.рф',
  formId: 'popup_form_main',
};

// ID пользовательских полей (из ТЗ)
export const UF_FIELDS = {
  message: 'UF_CRM_1780074067', // Сообщение
  agreement: 'UF_CRM_1780074405', // Чек-бокс согласие
  formId: 'UF_CRM_XXXXXXXXXX', // ID формы (НУЖНО УТОЧНИТЬ У КЛИЕНТА!)
};

