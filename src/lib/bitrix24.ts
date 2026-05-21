// lib/bitrix24.ts

// Конфигурация Bitrix24
export const BITRIX_CONFIG = {
  webhookUrl: 'https://dev-polimert.bitrix24.ru/rest/13/femtik6i81rklqfz/', // Замени на реальный webhook
  responsibleUserId: 21,
  sourceId: 'WEB',
  sourceDescription: 'Веб-сайт 73полимер.рф',
  formId: 'popup_form_main', // ID формы, согласуй с клиентом
};

// ID пользовательских полей из ТЗ
export const UF_FIELDS = {
  message: 'UF_CRM_1779108607', // Сообщение
  agreement: 'UF_CRM_1779108695', // Чек-бокс согласие
  formId: 'UF_CRM_XXXXXXXXXX', // ID формы (нужно уточнить у клиента)
};

// Вспомогательные функции для работы с телефоном
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}